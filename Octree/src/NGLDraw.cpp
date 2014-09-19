#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>
#include <ngl/Random.h>
const static float INCREMENT=0.01;
const static float ZOOM=0.5;
NGLDraw::NGLDraw()
{

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
  ngl::Vec3 from(0,0,35);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,1,0);
  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(45,(float)720.0/576.0,0.5,150);
  // now to load the shader and set the values
  // grab an instance of shader manager
  // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["nglDiffuseShader"]->use();
  shader->setShaderParam4f("Colour",1,1,0,1);
  shader->setShaderParam3f("lightPos",1,1,1);
  shader->setShaderParam4f("lightDiffuse",1,1,1,1);

  glEnable(GL_DEPTH_TEST); // for removal of hidden surfaces

  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  prim->createSphere("sphere",1.0,20);
  prim->createLineGrid("wall", 1, 1, 5);

   // create the default particle inital position
  m_scene=new Scene(&m_transformStack,m_cam);
  m_scene->addNewWall(ngl::Vec3(-10,0,0), 20, ngl::Vec3(1.0, 0.0, 0.0),true);
  m_scene->addNewWall(ngl::Vec3(10,0,0), 20, ngl::Vec3(-1.0, 0.0, 0.0),true);
  m_scene->addNewWall(ngl::Vec3(0,10,0), 20, ngl::Vec3(0.0, -1.0, 0.0),true);
  m_scene->addNewWall(ngl::Vec3(0,-10,0), 20, ngl::Vec3(0.0, 1.0, 0.0),true);
  m_scene->addNewWall(ngl::Vec3(0,0,10), 20, ngl::Vec3(0.0, 0.0, -1.0),false);
  m_scene->addNewWall(ngl::Vec3(0,0,-10), 20, ngl::Vec3(0.0, 0.0, 1.0),true);



  m_animate=true;



}

NGLDraw::~NGLDraw()
{
  std::cout<<"Shutting down NGL, removing VAO's and Shaders\n";
}

void NGLDraw::resize(int _w, int _h)
{
  glViewport(0,0,_w,_h);
  // now set the camera size values as the screen size has changed
  m_cam->setShape(45,(float)_w/_h,0.05,350);
}

void NGLDraw::keyEvent(const SDLKey &_key)
{
	switch(_key)
	{
		case SDLK_SPACE : addParticles(); break;

	}
}

void NGLDraw::draw()
{
  // clear the screen and depth buffer
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);


  // grab an instance of the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // clear the screen and depth buffer
  shader->use("nglDiffuseShader");

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
  m_scene->draw(m_mouseGlobalTX);
}

void NGLDraw::addParticles()
{
    m_scene->clearParticles();

    // initial box [-1.0, 1.0]
    // evenly create 1000 particles inside the box
    ngl::Random *rng=ngl::Random::instance();
    ngl::Vec3 dir(0.0f,0.0f,0.0f);
    ngl::Vec3 emitterPos;

    for(float i=-9.5;i<10; i+=1)
    {
        emitterPos.m_x = i;
        for(float j=-9.5;j<10; j+=1)
        {
            emitterPos.m_y = j;
            for(float k=-9.5;k<10; k+=1)
            {
                emitterPos.m_z = k;
                dir=rng->getRandomVec3();
                dir *=0.1;
                m_scene->addParticle(emitterPos, dir, rng->getRandomColour(), 0.3); // emitterPos, initialSpeed, colour, radius,
            }
        }
    }
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


void NGLDraw::timerEvent()
{
	m_scene->update();

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
