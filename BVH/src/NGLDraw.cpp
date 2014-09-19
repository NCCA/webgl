#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>
#include <string>
#include <boost/format.hpp>

const static float INCREMENT=0.1;
const static float ZOOM=0.5;
const static int sMaxAnim=80;

const static char *files[sMaxAnim]=
{
"/bvh/Male1_A10_LieToCrouch.bvh",
"/bvh/Male1_A11_CrawlForward.bvh",
"/bvh/Male1_A12_CrawlBackward.bvh",
"/bvh/Male1_A13_Skipping.bvh",
"/bvh/Male1_A14_StandToSkip.bvh",
"/bvh/Male1_A15_SkipToStand_Take_001.bvh",
"/bvh/Male1_A1_Stand.bvh",
"/bvh/Male1_A2_Sway.bvh",
"/bvh/Male1_A3_SwingArms.bvh",
"/bvh/Male1_A4_LookAround.bvh",
"/bvh/Male1_A5_PickUpBox.bvh",
"/bvh/Male1_A6_LiftBox.bvh",
"/bvh/Male1_A7_Crouch.bvh",
"/bvh/Male1_A8_CrouchToLie.bvh",
"/bvh/Male1_A9_LieDown.bvh",
"/bvh/Male1_B10_WalkTurnLeft45.bvh",
"/bvh/Male1_B11_WalkTurnLeft135.bvh",
"/bvh/Male1_B12_WalkTurnRight90.bvh",
"/bvh/Male1_B13_WalkTurnRight45.bvh",
"/bvh/Male1_B14_WalkTurnRight135.bvh",
"/bvh/Male1_B15_WalkTurnAround.bvh",
"/bvh/Male1_B16_WalkTrunChange.bvh",
"/bvh/Male1_B17_Walk2Hop2Walk.bvh",
"/bvh/Male1_B18_Walk2Leap2Walk.bvh",
"/bvh/Male1_B19_WalkToPickUpBox_Working.bvh",
"/bvh/Male1_B1_StandToWalk.bvh",
"/bvh/Male1_B20_WalkWithBox.bvh",
"/bvh/Male1_B21_PutDownBoxToWalk.bvh",
"/bvh/Male1_B22_SideStepLeft.bvh",
"/bvh/Male1_B23_SideStepRight.bvh",
"/bvh/Male1_B24_WalkToCrouch.bvh",
"/bvh/Male1_B25_CrouchToWalk.bvh",
"/bvh/Male1_B26_WalkToSkip.bvh",
"/bvh/Male1_B27_SkipToWalk.bvh",
"/bvh/Male1_B2_WalkToStand.bvh",
"/bvh/Male1_B3_Walk.bvh",
"/bvh/Male1_B4_StandToWalkBack.bvh",
"/bvh/Male1_B5_WalkBackToStand.bvh",
"/bvh/Male1_B6_WalkBackwards.bvh",
"/bvh/Male1_B7_WalkBackTurnForward.bvh",
"/bvh/Male1_B8_WalkBackToForward.bvh",
"/bvh/Male1_B9_WalkToTurnLeft90.bvh",
"/bvh/Male1_C01_StandToRun.bvh",
"/bvh/Male1_C02_RunToStand.bvh",
"/bvh/Male1_C03_Run.bvh",
"/bvh/Male1_C04_RunToWalk.bvh",
"/bvh/Male1_C05_WalkToRun.bvh",
"/bvh/Male1_C06_StandToRunBack.bvh",
"/bvh/Male1_C07_RunBack.bvh",
"/bvh/Male1_C08_RunBackToStand.bvh",
"/bvh/Male1_C09_RunBackTurnRunForward.bvh",
"/bvh/Male1_C10_RunBackStopRunForward.bvh",
"/bvh/Male1_C11_RunTurnLeft90.bvh",
"/bvh/Male1_C12_RunTurnLeft45.bvh",
"/bvh/Male1_C13_RunTurnLeft135.bvh",
"/bvh/Male1_C14_RunTurnRight90.bvh",
"/bvh/Male1_C15_RunTurnRight45.bvh",
"/bvh/Male1_C16_RunTurnRight135.bvh",
"/bvh/Male1_C17_RunTurnAround.bvh",
"/bvh/Male1_C18_RunTurnChangeDirection.bvh",
"/bvh/Male1_C19_Run2Hop2Walk.bvh",
"/bvh/Male1_C20_Run2Jump2Walk.bvh",
"/bvh/Male1_C21_RunToPickupBox.bvh",
"/bvh/Male1_C22_RunWithBox.bvh",
"/bvh/Male1_C23_PutDownBoxToRun.bvh",
"/bvh/Male1_C24_QuickSideStepLeft.bvh",
"/bvh/Male1_C25_QuickSideStepRight.bvh",
"/bvh/Male1_C26_RunToCrouch.bvh",
"/bvh/Male1_C27_CrouchToRun.bvh",
"/bvh/Slip_down_IceSlip.bvh",
"/bvh/Take 001.bvh",
"/bvh/Take 003.bvh",
"/bvh/Take 004.bvh",
"/bvh/Take 005.bvh",
"/bvh/Take 006.bvh",
"/bvh/Take 007.bvh",
"/bvh/Take 008.bvh",
"/bvh/Take 009.bvh",
"/bvh/test.bvh",
"/bvh/walk_turn_180.bvh"};


NGLDraw::NGLDraw()
{
  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  m_currAnim=0;
  glColorMask (GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
  glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glEnable(GL_DEPTH_TEST);
  m_trace=false;

  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background
  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(0,25,80);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,1,0);
  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(45,(float)720.0/576.0,0.05,1500);

// nglDiffuseShader
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["nglDiffuseShader"]->use();
  shader->setShaderParam4f("Colour",1,1,0,1);
  shader->setShaderParam3f("lightPos",1,1,1);
  shader->setShaderParam4f("lightDiffuse",1,1,1,1);


  glEnable(GL_DEPTH_TEST); // for removal of hidden surfaces


  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  prim->createCylinder("cylinder",0.15,2.0, 16, 16);

  prim->createSphere("sphere",0.25,16);
  prim->createLineGrid("wall", 1, 1, 40);

   // create the default particle inital position
  m_scene=new Scene(&m_transformStack,m_cam);
  m_scene->addNewWall(ngl::Vec3(0,0,0), 200, ngl::Vec3(0.0, 1.0, 0.0),true);

  for(int i=0; i<sMaxAnim; ++i)
  {
    setBvhFileName(files[i]);
    std::cerr<<"loading "<<files[i]<<"\n";
    Bvh *character = new Bvh(files[i], m_scene);
    m_scene->addCharacter(character);
   }

  m_text=new ngl::Text("/font/arial.ttf",14);
  glViewport(0,0,720,576);
  m_text->setScreenSize(720,576);
}

NGLDraw::~NGLDraw()
{
  std::cout<<"Shutting down NGL, removing VAO's and Shaders\n";
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

  std::string text;
  text=boost::str(boost::format("number of characters %d") % m_scene->getNumCharacters()  );

  m_text->setColour(1,1,1);
  m_text->renderText(10,10,text);
  text=boost::str(boost::format("Current Animation is %d") % m_currAnim  );

  m_text->renderText(10,30,text);

  m_text->renderText(10,50,"r to replay; p to pause and continue; -> forward; <- backward");
  text=boost::str(boost::format("frame: %d") % m_scene->getCurrentFrameNumber()  );

  m_text->renderText(10,70,text);
  text=boost::str(boost::format("Filename is %s") % files[m_currAnim]  );
  m_text->renderText(10,90,text);

  // Rotation based on the mouse position for our global
  // transform
  ngl::Transformation trans;
  trans.setRotation(m_spinXFace,m_spinYFace,0);
  trans.setPosition(m_modelPos.m_x, m_modelPos.m_y, m_modelPos.m_z);
  ngl::Mat4 tmp = trans.getMatrix(); // very important step, otherwise ngl::transform won't compute the matrix
  // set this in the TX stack
  m_transformStack.setGlobal(trans);

  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  shader->use("nglDiffuseShader");
  // clear the screen and depth buffer
  if(!m_trace)
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

  m_scene->draw();

}



//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::mouseMoveEvent (const SDL_MouseMotionEvent &_event)
{

  if(m_rotate && _event.state &SDL_BUTTON_LMASK)
  {
    int diffx=_event.x-m_origX;
    int diffy=_event.y-m_origY;
    //m_spinXFace += (float) 0.5f * diffy;
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
  // this method is called every time the main window recives a key event.
  // we then switch on the key value and set the camera in the GLWindow
  // find which key and do appropriate event
  switch (_key)
  {
  SDLK_SPACE : clearCharacters(); break;
  case SDLK_r : replay(); break;
  case SDLK_p : flipAnimationStatus(); break;
  case SDLK_RIGHT : forwardAnimation();break;
  case SDLK_LEFT : backwardAnimation();break;
  case SDLK_UP :
    if(++m_currAnim >= sMaxAnim-1 )
      m_currAnim=sMaxAnim-1;
    replay();
    m_scene->setActiveAnimation(m_currAnim);
  break;
  case SDLK_DOWN :
    if(--m_currAnim <= 0 )
      m_currAnim=0;
    replay();
    m_scene->setActiveAnimation(m_currAnim);
  break;
  case SDLK_j : m_scene->toggleDrawJoints(); break;
  case SDLK_b : m_scene->toggleDrawBones(); break;
  case SDLK_t : m_trace^=true; break;
  default : break;
  }
}

void NGLDraw::timerEvent()
{
  m_scene->update();
}

void NGLDraw::flipAnimationStatus()
{
    m_scene->pauseAnimationAndContinue();
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
