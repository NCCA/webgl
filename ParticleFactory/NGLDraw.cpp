#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>

const static float INCREMENT=0.01;
const static float ZOOM=0.05;
NGLDraw::NGLDraw()
{
  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  m_emitterPos.set(0,0,0);

  glColorMask (GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
  glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glEnable(GL_DEPTH_TEST);


  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background
  // enable depth testing for drawing
  glEnable(GL_DEPTH_TEST);
  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(20,20,35);
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
  // we are creating a shader called Phong
  shader->createShaderProgram("Phong");
  // now we are going to create empty shaders for Frag and Vert
  shader->attachShader("PhongVertex",ngl::VERTEX);
  shader->attachShader("PhongFragment",ngl::FRAGMENT);
  // attach the source
  shader->loadShaderSource("PhongVertex","/shaders/PhongVertex.glsl");
  shader->loadShaderSource("PhongFragment","/shaders/PhongFragment.glsl");
  // compile the shaders
  shader->compileShader("PhongVertex");
  shader->compileShader("PhongFragment");
  // add them to the program
  shader->attachShaderToProgram("Phong","PhongVertex");
  shader->attachShaderToProgram("Phong","PhongFragment");
  // now bind the shader attributes for most NGL primitives we use the following
  // layout attribute 0 is the vertex data (x,y,z)
  shader->bindAttribute("Phong",0,"inVert");
  // attribute 1 is the UV data u,v (if present)
  shader->bindAttribute("Phong",1,"inUV");
  // attribute 2 are the normals x,y,z
  shader->bindAttribute("Phong",2,"inNormal");

  // now we have associated this data we can link the shader
  shader->linkProgramObject("Phong");
  // and make it active ready to load values
  (*shader)["Phong"]->use();

  // now pass the modelView and projection values to the shader
  // the shader will use the currently active material and light0 so set them
  ngl::Light light(ngl::Vec3(0,0,1),ngl::Colour(1,1,1,1),ngl::Colour(1,1,1,1),ngl::POINTLIGHT);
  // now create our light this is done after the camera so we can pass the
  // transpose of the projection matrix to the light to do correct eye space
  // transformations
  ngl::Mat4 iv=m_cam->getViewMatrix();
  iv=iv.inverse();
  iv.transpose();
  light.setTransform(iv);
  light.enable();
  // load these values to the shader as well
  light.loadToShader("light");
  glEnable(GL_DEPTH_TEST); // for removal of hidden surfaces

  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  prim->createSphere("sphere",1.0,20);

  prim->createTorus("torus",0.2,0.8,20,20);
  // create the default particle inital position
  m_emitter=new Emitter(m_emitterPos,400,m_cam);


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

void NGLDraw::draw()
{
  // clear the screen and depth buffer
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

  // grab an instance of the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // clear the screen and depth buffer
  shader->use("Phong");

  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  // Rotation based on the mouse position for our global transform
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
  m_emitter->setGlobalTransform(m_mouseGlobalTX);
  m_emitter->draw();
}


void NGLDraw::addParticles( int _type)
{
switch(_type)
{
  case 0 : m_emitter->addParticle(SPHERE); break;
  case 1 : m_emitter->addParticle(TEAPOT); break;
  case 2 : m_emitter->addParticle(TORUS); break;
  case 3 : m_emitter->addParticle(TROLL); break;

}

}

void NGLDraw::timerEvent( )
{
	m_emitter->update();
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

void NGLDraw::updateEmitterPos(float _dx, float _dy, float _dz)
{
  m_emitterPos.m_x+=_dx;
  m_emitterPos.m_y+=_dy;
  m_emitterPos.m_z+=_dz;
  m_emitter->setPos(m_emitterPos);
}



void NGLDraw::keyEvent(const SDLKey &_key)
{
	switch(_key)
	{
		case SDLK_1 : addParticles(0); break;
		case SDLK_2 : addParticles(1); break;
		case SDLK_3 : addParticles(2); break;
		case SDLK_4 : addParticles(3); break;
		case SDLK_z : m_emitter->updateEmitAngle(30); break;
		case SDLK_x : m_emitter->updateEmitAngle(90); break;
		case SDLK_c : m_emitter->updateEmitAngle(200); break;
		case SDLK_v : m_emitter->updateEmitAngle(360); break;
		case SDLK_SPACE : m_emitter->clearParticles(); break;
		case SDLK_r : m_emitter->removeParticle(); break;
		case SDLK_LEFT : updateEmitterPos(-1,0,0); break;
		case SDLK_RIGHT : updateEmitterPos(1,0,0); break;
		case SDLK_UP : updateEmitterPos(0,1,0); break;
		case SDLK_DOWN : updateEmitterPos(0,-1,0); break;
		case SDLK_i : updateEmitterPos(0,0,-1); break;
		case SDLK_o : updateEmitterPos(0,0,1); break;
	}

}


//----------------------------------------------------------------------------------------------------------------------
//void NGLDraw::wheelEvent(const SDL_MouseWheelEvent &_event)
//{

//  // check the diff of the wheel position (0 means no change)
//  if(_event.y > 0)
//  {
//    m_modelPos.m_z+=ZOOM;
//    this->draw();
//  }
//  else if(_event.y <0 )
//  {
//    m_modelPos.m_z-=ZOOM;
//    this->draw();
//  }

//  // check the diff of the wheel position (0 means no change)
//  if(_event.x > 0)
//  {
//    m_modelPos.m_x-=ZOOM;
//    this->draw();
//  }
//  else if(_event.x <0 )
//  {
//    m_modelPos.m_x+=ZOOM;
//    this->draw();
//  }
//}
//----------------------------------------------------------------------------------------------------------------------
