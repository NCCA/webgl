#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>

const static float INCREMENT=0.01;
const static float ZOOM=0.05;
NGLDraw::NGLDraw()
{
 	m_showBBox=true;
	m_showBSphere=true;

  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  glColorMask (GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
  glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glEnable(GL_DEPTH_TEST);

  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background

  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(0,4,4);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,1,0);
  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(45,(float)720.0/576.0,0.05,350);
  // now to load the shader and set the values
  // grab an instance of shader manager
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // load a frag and vert shaders

  shader->createShaderProgram("TextureShader");

  shader->attachShader("TextureVertex",ngl::VERTEX);
  shader->attachShader("TextureFragment",ngl::FRAGMENT);
  shader->loadShaderSource("TextureVertex","/shaders/TextureVertex.glsl");
  shader->loadShaderSource("TextureFragment","/shaders/TextureFragment.glsl");

  shader->compileShader("TextureVertex");
  shader->compileShader("TextureFragment");
  shader->attachShaderToProgram("TextureShader","TextureVertex");
  shader->attachShaderToProgram("TextureShader","TextureFragment");

  // link the shader no attributes are bound
  shader->linkProgramObject("TextureShader");
  (*shader)["TextureShader"]->use();



  (*shader)["nglColourShader"]->use();

  shader->setShaderParam4f("Colour",1.0,1.0,1.0,1.0);

  // first we create a mesh from an obj passing in the obj file and texture
  m_mesh = new ngl::Obj("/models/Helix.obj","/textures/helix_base.png");

  // now we need to create this as a VAO so we can draw it
  m_mesh->createVAO();
  m_mesh->calcBoundingSphere();
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  prim->createSphere("sphere",1.0,20);
  // as re-size is not explicitly called we need to do this.


}

NGLDraw::~NGLDraw()
{
  std::cout<<"Shutting down NGL, removing VAO's and Shaders\n";
  delete m_light;
  delete m_cam;
}

void NGLDraw::resize(int _w, int _h)
{
  glViewport(0,0,_w,_h);
  // now set the camera size values as the screen size has changed
  m_cam->setShape(45,(float)_w/_h,0.05,350);
}

void NGLDraw::draw()
{
  // clear the screen and depth buffer
   glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
   ngl::Mat4 rotX;
   ngl::Mat4 rotY;
   // create the rotation matrices
   rotX.rotateX(m_spinXFace);
   rotY.rotateY(m_spinYFace);
   // multiply the rotations
   m_mouseGlobalTX=rotY*rotX;
   // add the translations
   m_mouseGlobalTX.m_m[3][0] = m_modelPos.m_x;
   m_mouseGlobalTX.m_m[3][1] = m_modelPos.m_y;
   m_mouseGlobalTX.m_m[3][2] = m_modelPos.m_z;

	ngl::ShaderLib *shader=ngl::ShaderLib::instance();
	(*shader)["TextureShader"]->use();
	loadMatricesToShader();
	// draw the mesh
	m_mesh->draw();
	// draw the mesh bounding box
	(*shader)["nglColourShader"]->use();
/*
  if(m_showBBox==true)
  {
    loadMatricesToShader();
    shader->setShaderParam4f("Colour",0,0,1,1);
    m_mesh->drawBBox();
  }
  if(m_showBSphere==true)
  {
    ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
    shader->setShaderParam4f("Colour",1,1,1,1);
    m_transformStack.pushTransform();
      glPolygonMode(GL_FRONT_AND_BACK,GL_LINE);
        m_transformStack.setPosition(m_mesh->getSphereCenter());
        m_transformStack.setScale(m_mesh->getSphereRadius(),m_mesh->getSphereRadius(),m_mesh->getSphereRadius());
        loadMatricesToShader();
        prim->draw("sphere");
      glPolygonMode(GL_FRONT_AND_BACK,GL_FILL);
    m_transformStack.popTransform();
  }
*/
}


void NGLDraw::loadMatricesToShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();

  ngl::Mat4 MVP=m_transformStack.getCurrentTransform().getMatrix()
      *m_mouseGlobalTX*m_cam->getVPMatrix();

  shader->setShaderParamFromMat4("MVP",MVP);
}

//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::mouseMoveEvent (const SDL_MouseMotionEvent &_event)
{

  if(m_rotate && _event.state &SDL_BUTTON_LMASK)
  {
    int diffx=_event.x-m_origX;
    int diffy=_event.y-m_origY;
    m_spinXFace += (float) 0.5f * diffy;
    m_spinYFace += (float) 0.5f * diffx;
    m_origX = _event.x;
    m_origY = _event.y;

    this->draw();

  }
  // right mouse translate code
  else if(m_translate && _event.state &SDL_BUTTON_RMASK)
  {
    int diffX = (int)(_event.x - m_origXPos);
    int diffY = (int)(_event.y - m_origYPos);
    m_origXPos=_event.x;
    m_origYPos=_event.y;
    m_modelPos.m_x += INCREMENT * diffX;
    m_modelPos.m_y -= INCREMENT * diffY;
    this->draw();
  }
}


//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::mousePressEvent (const SDL_MouseButtonEvent &_event)
{
  // this method is called when the mouse button is pressed in this case we
  // store the value where the maouse was clicked (x,y) and set the Rotate flag to true
  if(_event.button == SDL_BUTTON_LEFT)
  {
    m_origX = _event.x;
    m_origY = _event.y;
    m_rotate =true;
  }
  // right mouse translate mode
  else if(_event.button == SDL_BUTTON_RIGHT)
  {
    m_origXPos = _event.x;
    m_origYPos = _event.y;
    m_translate=true;
  }
}

//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::mouseReleaseEvent (const SDL_MouseButtonEvent &_event)
{
  // this event is called when the mouse button is released
  // we then set Rotate to false
  if (_event.button == SDL_BUTTON_LEFT)
  {

    m_rotate=false;
  }
  // right mouse translate mode
  if (_event.button == SDL_BUTTON_RIGHT)
  {
    m_translate=false;
  }
}




void NGLDraw::keyEvent(const SDLKey &_key)
{
  switch (_key)
  {
    default : break;
  }
}

//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::wheelEvent(float _delta)
{

  // check the diff of the wheel position (0 means no change)
  if(_delta > 0)
  {
    m_modelPos.m_z+=ZOOM;
  }
  else if(_delta <0 )
  {
    m_modelPos.m_z-=ZOOM;
  }


}
