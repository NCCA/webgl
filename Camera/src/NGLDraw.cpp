#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>

const static float INCREMENT=0.01;
const static float ZOOM=0.05;
NGLDraw::NGLDraw()
{
  // Now set the initial GLWindow attributes to default values
  // Roate is false
  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  // now set the inital camera values
  m_cameraIndex=0;
  m_moveMode=MOVEEYE;
  m_drawHelp=true;
  m_fov=65.0;
  m_aspect=1024.0/768.0;
  m_rotation=0;
  m_lights[0]=true;
  m_lights[1]=true;
  m_lights[2]=true;
  glColorMask (GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
  glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glEnable(GL_DEPTH_TEST);

  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background

  createCameras();
  // create an instance of the VBO primitive
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  // create a plane
  prim->createLineGrid("plane",20,20,30);
  prim->createSphere("sphere",1.0,150);

  // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();

  shader->createShaderProgram("Phong");

  shader->attachShader("PhongVertex",ngl::VERTEX);
  shader->attachShader("PhongFragment",ngl::FRAGMENT);
  shader->loadShaderSource("PhongVertex","/shaders/PhongVertex.glsl");
  shader->loadShaderSource("PhongFragment","/shaders/PhongFragment.glsl");

  shader->compileShader("PhongVertex");
  shader->compileShader("PhongFragment");
  shader->attachShaderToProgram("Phong","PhongVertex");
  shader->attachShaderToProgram("Phong","PhongFragment");
  // now bind the shader attributes for most NGL primitives we use the following
  // layout attribute 0 is the vertex data (x,y,z)
  shader->bindAttribute("Phong",0,"inVert");
  // attribute 1 is the UV data u,v (if present)
  shader->bindAttribute("Phong",1,"inUV");
  // attribute 2 are the normals x,y,z
  shader->bindAttribute("Phong",2,"inNormal");



  shader->linkProgramObject("Phong");
  (*shader)["Phong"]->use();

  // now pass the modelView and projection values to the shader
  shader->setShaderParam1i("Normalize",1);

  // now set the material and light values
  ngl::Material m(ngl::COPPER);
  m.loadToShader("material");


  shader->createShaderProgram("Colour");

  shader->attachShader("ColourVertex",ngl::VERTEX);
  shader->attachShader("ColourFragment",ngl::FRAGMENT);
  shader->loadShaderSource("ColourVertex","/shaders/Colour.vs");
  shader->loadShaderSource("ColourFragment","/shaders/Colour.fs");

  shader->compileShader("ColourVertex");
  shader->compileShader("ColourFragment");
  shader->attachShaderToProgram("Colour","ColourVertex");
  shader->attachShaderToProgram("Colour","ColourFragment");

  shader->bindAttribute("Colour",0,"inVert");
  shader->linkProgramObject("Colour");
  (*shader)["Colour"]->use();
  shader->setShaderParam4f("Colour",1,1,1,1);
  // now bind the shader attributes for most NGL primitives we use the following
  // layout attribute 0 is the vertex data (x,y,z)
  shader->bindAttribute("Phong",0,"inVert");
m_text = new ngl::Text("/font/arial.ttf",25);
m_text->setScreenSize(720,576);
m_text->setColour(1.0,0.0,0.0);



}


void NGLDraw::createCameras()
{
  // create a load of cameras
  ngl::Camera cam;
  ngl::Camera Tcam;
  ngl::Camera Scam;
  ngl::Camera Fcam;
  // set the different vectors for the camera positions
  ngl::Vec3 eye(0.0f,5.0f,8.0f);
  ngl::Vec3 look=0.0f;
  ngl::Vec3 up(0,1,0);

  ngl::Vec3 topEye(0.0f,8.0f,0.0f);
  ngl::Vec3 topLook=0.0f;
  ngl::Vec3 topUp(0.0f,0.0f,1.0f);

  ngl::Vec3 sideEye(8.0f,0.0f,0.0f);
  ngl::Vec3 sideLook=0.0f;
  ngl::Vec3 sideUp(0.0f,1.0f,0.0f);

  ngl::Vec3 frontEye(5.0f,2.0f,8.0f);
  ngl::Vec3 frontLook(0.0f,0.0f,0.0f);
  ngl::Vec3 frontUp(0.0f,1.0f,0.0f);
  // finally set the cameras shape and position
  cam.set(eye,look,up);
  cam.setShape(m_fov,m_aspect, 0.2f,150.0f);
  m_cameras.push_back(cam);
  Tcam.set(topEye,topLook,topUp);
  Tcam.setShape(m_fov,m_aspect, 0.5f,150.0f);
  m_cameras.push_back(Tcam);
  Scam.set(sideEye,sideLook,sideUp);
  Scam.setShape(m_fov,m_aspect, 0.5f,150.0f);
  m_cameras.push_back(Scam);
  Fcam.set(frontEye,frontLook,frontUp);
  Fcam.setShape(m_fov,m_aspect, 0.5f,150.0f);
  m_cameras.push_back(Fcam);
}




NGLDraw::~NGLDraw()
{
  std::cout<<"Shutting down NGL, removing VAO's and Shaders\n";
}

void NGLDraw::resize(int _w, int _h)
{
  glViewport(0,0,_w,_h);
}

void NGLDraw::draw()
{
  // grab an instance of the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // clear the screen and depth buffer
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  // Rotation based on the mouse position for our global
  // transform

  ngl::Transformation trans;
  // Rotation based on the mouse position for our global
  // transform
  ngl::Mat4 rotX;
  ngl::Mat4 rotY;
  // create the rotation matrices
  rotX.rotateX(m_spinXFace);
  rotY.rotateY(m_spinYFace);
  // multiply the rotations
  m_mouseGlobalTX=rotY*rotX;
  // now set this value in the shader for the current Camera, we do all 3 elements as they
  // can all change per frame
  shader->use("Phong");
  ngl::Mat4 lt=m_cameras[m_cameraIndex].getViewMatrix();
  lt.transpose();

  ngl::Light L1(ngl::Vec3(-2,0,0),ngl::Colour(0.6,0.6,0.6,1),ngl::DIRECTIONALLIGHT);
  ngl::Light L2(ngl::Vec3(2,0,0),ngl::Colour(0.6,0.6,0.6,1),ngl::DIRECTIONALLIGHT);
  ngl::Light L3(ngl::Vec3(0,2,0),ngl::Colour(0.6 ,0.6,0.6,1),ngl::POINTLIGHT);
  L1.setSpecColour(ngl::Colour(1,1,1));
  L2.setSpecColour(ngl::Colour(1,1,1));
  L3.setSpecColour(ngl::Colour(1,1,1));
  L1.disable();
  L2.disable();
  L3.disable();
  if( m_lights[0] == true)
  {
    L1.setTransform(lt);
    L1.enable();
  }
  L1.loadToShader("light[0]");

  if( m_lights[1] == true)
  {
    L2.setTransform(lt);
    L2.enable();
  }
  L2.loadToShader("light[1]");

  if( m_lights[2] == true)
  {
    L3.setTransform(lt);

    L3.enable();
  }
  L3.loadToShader("light[2]");

  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  m_transformStack.setRotation(0,m_rotation,0);
  loadMatricesToShader();
  prim->draw("teapot");

  // activate the shader
  shader->use("Phong");
  // push a transform
    ngl::Mat4 tp;
  m_transformStack.pushTransform();
  {

    // translate into position
    m_transformStack.setPosition(-1.8,0.1,0);
    // rotate object
    m_transformStack.setRotation(m_rotation,m_rotation,m_rotation);
    // pass values to the shader
    loadMatricesToShader();
    // draw
    tp=m_transformStack.getCurrentTransform().getMatrix();

    prim->draw("cube");
  }
  m_transformStack.popTransform();
  // now we draw the football
  m_transformStack.pushTransform();
  {
    // set the transforms for pos and scale
    m_transformStack.setPosition(1.5,0,0);
    m_transformStack.setScale(0.5,0.5,0.5);
    m_transformStack.setRotation(m_rotation,m_rotation,m_rotation);
    loadMatricesToShader();
    // draw the football
    prim->draw("football");
  }
  m_transformStack.popTransform();
  // now we are going to draw the help

  // now we are going to draw the grid in wireframe mode
//  glPolygonMode(GL_FRONT_AND_BACK,GL_LINE);
  // load the colour  shader and set the values,
  shader->use("Colour");
  // now push the tx stack it helps to use { } to block off the transforms
  m_transformStack.pushTransform();
  {
    // translate the grid down by -0.5 so it is at the base level of the objects
    m_transformStack.setPosition(0,-0.5,0);
    ngl::Mat4 MVP;
    MVP=
        m_transformStack.getCurrAndGlobal().getMatrix() * m_mouseGlobalTX *
        m_cameras[m_cameraIndex].getViewMatrix() *
        m_cameras[m_cameraIndex].getProjectionMatrix();

    shader->setShaderParamFromMat4("MVP",MVP);

    // now we pass this modelling transform to the shader ModelMatrix
    // finally draw the plane
    prim->draw("plane");
  }
  m_transformStack.popTransform();
 std::string mode;
   switch ( m_moveMode)
   {
     case MOVEEYE : mode="Move Eye"; break;
     case MOVELOOK : mode="Move Look"; break;
     case MOVEBOTH : mode="Move Both"; break;
     case MOVESLIDE : mode="Move Slide"; break;
   }

   char text[100];
   sprintf(text,"Active Camera %d current mode=%s",m_cameraIndex,mode.c_str());
   m_text->renderText(500,18,text );
   sprintf(text,"FOV = %f ",m_fov);
   m_text->renderText(500,18*2,text );
   m_text->renderText(500,18*3,"ModelView Matrix" );
   m_text->setColour(ngl::Colour(1,1,0));

   ngl::Mat4 m=tp*m_cameras[m_cameraIndex].getViewMatrix();
   sprintf(text,"[ %+0.4f %+0.4f %+0.4f %+0.4f]",m.openGL()[0],m.openGL()[4],m.openGL()[8],m.openGL()[12]);
   m_text->renderText(500,18*4,text );
   sprintf(text,"[ %+0.4f %+0.4f %+0.4f %+0.4f]",m.openGL()[1],m.openGL()[5],m.openGL()[9],m.openGL()[13]);
   m_text->renderText(500,18*5,text );
   sprintf(text,"[ %+0.4f %+0.4f %+0.4f %+0.4f]",m.openGL()[2],m.openGL()[6],m.openGL()[10],m.openGL()[14]);
   m_text->renderText(500,18*6,text );
   sprintf(text,"[ %+0.4f %+0.4f %+0.4f %+0.4f]",m.openGL()[3],m.openGL()[7],m.openGL()[11],m.openGL()[15]);
   m_text->renderText(500,18*7,text );

   m_text->setColour(1,1,1);
   m_text->renderText(500,18*8,"Projection Matrix" );
   // now we use the QString sprintf
   m_text->setColour(1,1,0);
   m=m_cameras[m_cameraIndex].getProjectionMatrix();
   sprintf(text,"[ %+0.4f %+0.4f %+0.4f %+0.4f]",m.openGL()[0],m.openGL()[4],m.openGL()[8],m.openGL()[12]);
   m_text->renderText(500,18*9,text );
   sprintf(text,"[ %+0.4f %+0.4f %+0.4f %+0.4f]",m.openGL()[1],m.openGL()[5],m.openGL()[9],m.openGL()[13]);
   m_text->renderText(500,18*10,text );
   sprintf(text,"[ %+0.4f %+0.4f %+0.4f %+0.4f]",m.openGL()[2],m.openGL()[6],m.openGL()[10],m.openGL()[14]);
   m_text->renderText(500,18*11,text );
   sprintf(text,"[ %+0.4f %+0.4f %+0.4f %+0.4f]",m.openGL()[3],m.openGL()[7],m.openGL()[11],m.openGL()[15]);
   m_text->renderText(500,18*12,text );
   m_text->setColour(ngl::Colour(0,0,0));

   sprintf(text,"Light 0 = %s Light 1 %s Light 2 %s",m_lights[0] ? "On" : "Off",m_lights[1] ? "On" : "Off",m_lights[2] ? "On" : "Off");
   m_text->renderText(500,18*13,text );

  
  
  
}


void NGLDraw::loadMatricesToShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();

  ngl::Mat4 MV;
  ngl::Mat4 MVP;
  ngl::Mat3 normalMatrix;
  ngl::Mat4 M;
  M=m_transformStack.getCurrentTransform().getMatrix()*m_mouseGlobalTX;
  MV= M* m_cameras[m_cameraIndex].getViewMatrix();
  MVP=  MV*m_cameras[m_cameraIndex].getProjectionMatrix();
  normalMatrix=MV;
  normalMatrix.inverse();
  shader->setShaderParamFromMat4("MV",MV);
  shader->setShaderParamFromMat4("MVP",MVP);
  shader->setShaderParamFromMat3("normalMatrix",normalMatrix);
  shader->setShaderParamFromMat4("M",M);
  shader->setShaderParam3f("viewerPos",m_cameras[m_cameraIndex].getEye().m_x,m_cameras[m_cameraIndex].getEye().m_y,m_cameras[m_cameraIndex].getEye().m_z);

}

void NGLDraw::keyEvent(const SDLKey &_key)
{
 const static float keyIncrement=0.1;
  // this method is called every time the main window recives a key event.
  // we then switch on the key value and set the camera in the GLWindow
  // find which key and do appropriate event
  switch (_key)
  {
  case SDLK_1 : { m_cameraIndex=0; break; }
  case SDLK_2 : { m_cameraIndex=1; break; }
  case SDLK_3 : { m_cameraIndex=2; break; }
  case SDLK_4 : { m_cameraIndex=3; break; }

  case SDLK_e : { m_moveMode=MOVEEYE; break; }
  case SDLK_l : { m_moveMode=MOVELOOK; break; }
  case SDLK_b : { m_moveMode=MOVEBOTH; break; }
  case SDLK_s : { m_moveMode=MOVESLIDE; break; }
  case SDLK_h : { m_drawHelp^=true; break; }
  case SDLK_k : { ++m_fov; setCameraShape(); break; }
  case SDLK_j :{ --m_fov; setCameraShape(); break; }
  case SDLK_r : { m_cameras[m_cameraIndex].roll(3);  break; }
  case SDLK_p : { m_cameras[m_cameraIndex].pitch(3); break; }
  case SDLK_y : { m_cameras[m_cameraIndex].yaw(3);   break; }
  case SDLK_z : { m_lights[0]^=true; break; }
  case SDLK_x : { m_lights[1]^=true; break; }
  case SDLK_c : { m_lights[2]^=true; break; }

  case SDLK_LEFT :
  {
    switch (m_moveMode)
    {
      case MOVEEYE :   { m_cameras[m_cameraIndex].moveEye(keyIncrement,0,0);  break;}
      case MOVELOOK :  { m_cameras[m_cameraIndex].moveLook(keyIncrement,0,0); break;}
      case MOVEBOTH :  { m_cameras[m_cameraIndex].moveBoth(keyIncrement,0,0); break;}
      case MOVESLIDE : { m_cameras[m_cameraIndex].slide(keyIncrement,0,0);    break;}
    }
  break;
  } // end move left
  case SDLK_RIGHT :
  {
    switch (m_moveMode)
    {
      case MOVEEYE :   { m_cameras[m_cameraIndex].moveEye(-keyIncrement,0,0);  break;}
      case MOVELOOK :  { m_cameras[m_cameraIndex].moveLook(-keyIncrement,0,0); break;}
      case MOVEBOTH :  { m_cameras[m_cameraIndex].moveBoth(-keyIncrement,0,0); break;}
      case MOVESLIDE : { m_cameras[m_cameraIndex].slide(-keyIncrement,0,0);    break;}
    }
  break;
  } // end move right
  case SDLK_UP :
  {
    switch (m_moveMode)
    {
      case MOVEEYE :   { m_cameras[m_cameraIndex].moveEye(0,keyIncrement,0);  break;}
      case MOVELOOK :  { m_cameras[m_cameraIndex].moveLook(0,keyIncrement,0); break;}
      case MOVEBOTH :  { m_cameras[m_cameraIndex].moveBoth(0,keyIncrement,0); break;}
      case MOVESLIDE : { m_cameras[m_cameraIndex].slide(0,keyIncrement,0);    break;}
    }
  break;
  } // end move up
  case SDLK_DOWN :
  {
    switch (m_moveMode)
    {
      case MOVEEYE :   { m_cameras[m_cameraIndex].moveEye(0,-keyIncrement,0);  break;}
      case MOVELOOK :  { m_cameras[m_cameraIndex].moveLook(0,-keyIncrement,0); break;}
      case MOVEBOTH :  { m_cameras[m_cameraIndex].moveBoth(0,-keyIncrement,0); break;}
      case MOVESLIDE : { m_cameras[m_cameraIndex].slide(0,-keyIncrement,0);    break;}
    }
  break;
  } // end move down
  case SDLK_o:
  {
    switch (m_moveMode)
    {
      case MOVEEYE :   { m_cameras[m_cameraIndex].moveEye(0,0,keyIncrement);  break;}
      case MOVELOOK :  { m_cameras[m_cameraIndex].moveLook(0,0,keyIncrement); break;}
      case MOVEBOTH :  { m_cameras[m_cameraIndex].moveBoth(0,0,keyIncrement); break;}
      case MOVESLIDE : { m_cameras[m_cameraIndex].slide(0,0,keyIncrement);    break;}
    }
  break;
  } // end move out
  case SDLK_i :
  {
    switch (m_moveMode)
    {
      case MOVEEYE :   { m_cameras[m_cameraIndex].moveEye(0,0,-keyIncrement);  break;}
      case MOVELOOK :  { m_cameras[m_cameraIndex].moveLook(0,0,-keyIncrement); break;}
      case MOVEBOTH :  { m_cameras[m_cameraIndex].moveBoth(0,0,-keyIncrement); break;}
      case MOVESLIDE : { m_cameras[m_cameraIndex].slide(0,0,-keyIncrement);    break;}
    }
  break;
  } // end move in
  default : break;
  }

}

void NGLDraw::timerEvent()
{

	++m_rotation;
}

void NGLDraw::setCameraShape()
{
  int cameraSize=m_cameras.size();
  for(int i=0; i<cameraSize; ++i)
  {
    m_cameras[i].setShape(m_fov,m_aspect, 0.2f,150.0f);
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
