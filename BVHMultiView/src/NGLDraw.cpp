#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>

const static float INCREMENT=0.01;
const static float ZOOM=0.1;
//----------------------------------------------------------------------------------------------------------------------
/// @brief the offset for full window mode mouse data
//----------------------------------------------------------------------------------------------------------------------
const static int FULLOFFSET=4;
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
  for(int i=0; i<5; ++i)
  {
    m_panelMouseInfo[i].m_spinXFace=0;
    m_panelMouseInfo[i].m_spinYFace=0;
    m_panelMouseInfo[i].m_rotate=false;
  }

  // now we need to set the scales for the ortho windos
  m_panelMouseInfo[FRONT].m_modelPos.set(0,0,1);
  m_panelMouseInfo[SIDE].m_modelPos.set(0,0,1);
  m_panelMouseInfo[TOP].m_modelPos.set(0,0,1);


  // mouse rotation values set to 0
  m_activeWindow=ALL;
  m_mouseX=0;
  m_mouseY=0;
  m_width=720;
  m_height=576;



  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  m_currAnim=0;
  glColorMask (GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
  glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glEnable(GL_DEPTH_TEST);

  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background
  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(0,25,100);
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
  m_scene=new Scene(&m_transformStack,&m_view,&m_projection);
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

  prim->createLineGrid("grid",40,40,40);

}

NGLDraw::~NGLDraw()
{
  std::cout<<"Shutting down NGL, removing VAO's and Shaders\n";
}

void NGLDraw::resize(int _w, int _h)
{
  glViewport(0,0,_w,_h);
  m_width=720;
  m_height=576;


}


void NGLDraw::frameActive()
{
  int win = (int)getActiveQuadrant();
  if(m_activeWindow != ALL)
  {
    win= FULLOFFSET;
  }
  m_panelMouseInfo[win].m_modelPos.set(0,0,1);
}

void NGLDraw::loadMatricesToShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();

  ngl::Mat4 MV;
  ngl::Mat4 MVP;
  ngl::Mat3 normalMatrix;
  ngl::Mat4 M;
  M=m_transformStack.getCurrAndGlobal().getMatrix();
  MV=  m_transformStack.getCurrAndGlobal().getMatrix()*m_view;
  MVP= M*m_view*m_projection;
  normalMatrix=MV;
  normalMatrix.inverse();
  shader->setShaderParamFromMat4("MVP",MVP);
  shader->setShaderParamFromMat3("normalMatrix",normalMatrix);
 }

const static float orth=10.0;
void NGLDraw::top(MODE _m)
{
  // grab an instance of the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["nglDiffuseShader"]->use();

  // Rotation based on the mouse position for our global transform
  ngl::Transformation trans;
  int win=FULLOFFSET;
  if(_m == PANEL)
  {
    win=TOP;
  }



  // first draw a top  persp // front //side
  ngl::Vec3 from(0,1,0);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,0,-1);
  m_transformStack.pushTransform();
  {
    /// a top view (left upper)
    m_view=ngl::lookAt(from,to,up);
    m_projection=ngl::ortho(-orth,orth,-orth,orth, 0.1f, 500.0f);
    // x,y w/h
    if(_m==PANEL)
    {
      glViewport (0,m_height/2, m_width/2, m_height/2);
    }
    else
    {
      glViewport(0,0,m_width,m_height);
    }
      // draw
    // in this case set to an identity
    ngl::Vec3 p=m_panelMouseInfo[win].m_modelPos;
    m_transformStack.setGlobal(trans);
    m_transformStack.setPosition(p.m_x,0,-p.m_y);
    m_transformStack.setScale(p.m_z,p.m_z,p.m_z);

    loadMatricesToShader();
    m_scene->draw();

//    prim->draw("troll");
//    m_transformStack.addPosition(0,-1,0);
    //loadMatricesToShader();
    //prim->draw("grid");
  }
  m_transformStack.popTransform();

}

void NGLDraw::side(MODE _m)
{
  // grab an instance of the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["nglDiffuseShader"]->use();

  // Rotation based on the mouse position for our global transform
  ngl::Transformation trans;
  int win=FULLOFFSET;
  if(_m == PANEL)
  {
    win=SIDE;
  }

   // get the VBO instance and draw the built in teapot
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();

  // first draw a top  persp // front //side
  ngl::Vec3 from(0,2,0);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,0,-1);
  /// a side view (bottom right)
  m_transformStack.pushTransform();
  {
    from.set(200,0,0);
    up.set(0,1,0);
    m_view=ngl::lookAt(from,to,up);
    m_projection=ngl::ortho(-50,50,-50,50, 0.1f, 100.0f);
    // x,y w/h
    if(_m==PANEL)
    {
      glViewport (m_width/2, 0, m_width/2, m_height/2);
    }
    else
    {
      glViewport(0,0,m_width,m_height);
    }

    // draw
    ngl::Vec3 p=m_panelMouseInfo[win].m_modelPos;
    m_transformStack.setGlobal(trans);
    m_transformStack.setPosition(0,p.m_y,-p.m_x);
    m_transformStack.setScale(p.m_z,p.m_z,p.m_z);


    loadMatricesToShader();
    m_scene->draw();
//    m_transformStack.setRotation(90,90,0);
//    m_transformStack.addPosition(0,0,2);
//    loadMatricesToShader();
//    prim->draw("grid");
  }
  m_transformStack.popTransform();



}
void NGLDraw::persp(MODE _m)
{
  // grab an instance of the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["nglDiffuseShader"]->use();

  // Rotation based on the mouse position for our global transform
  // 4 is the panel full screen mode
  int win=FULLOFFSET;
  if(_m == PANEL)
  {
    win=PERSP;
  }
  ngl::Transformation trans;
  ngl::Mat4 rotX;
  ngl::Mat4 rotY;
  // create the rotation matrices
  rotX.rotateX(m_panelMouseInfo[win].m_spinXFace);
  rotY.rotateY(m_panelMouseInfo[win].m_spinYFace);
  // multiply the rotations
  ngl::Mat4 final=rotY*rotX;
  // add the translations
  final.m_m[3][0] = m_panelMouseInfo[win].m_modelPos.m_x;
  final.m_m[3][1] = m_panelMouseInfo[win].m_modelPos.m_y;
  final.m_m[3][2] = m_panelMouseInfo[win].m_modelPos.m_z;
  // set this in the TX stack

   // get the VBO instance and draw the built in teapot
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();

  // first draw a top  persp // front //side
  ngl::Vec3 from(0,25,100);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,0,-1);
  m_transformStack.pushTransform();
  {
    /// a perspective view (right upper)
    //first set the global mouse rotation for this one
    trans.setMatrix(final);
    m_transformStack.setGlobal(trans);
    from.set(0,25,100);
    up.set(0,1,0);
    m_view=ngl::lookAt(from,to,up);
    m_projection=ngl::perspective(45,float(m_width/m_height),0.01,100);
    // x,y w/h
    if(_m==PANEL)
    {
      glViewport (m_width/2, m_height/2, m_width/2, m_height/2);
    }
    else
    {
      glViewport(0,0,m_width,m_height);
    }

    // draw
    loadMatricesToShader();
    //prim->draw("troll");
    m_scene->draw();

//    m_transformStack.setPosition(0,-0.55,0);
//    loadMatricesToShader();
//    prim->draw("grid");
  }
  m_transformStack.popTransform();

}
void NGLDraw::front(MODE _m)
{
  // grab an instance of the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["nglDiffuseShader"]->use();

  ngl::Transformation trans;
  int win=FULLOFFSET;
  if(_m == PANEL)
  {
    win=FRONT;
  }

   // get the VBO instance and draw the built in teapot
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();

  // first draw a top  persp // front //side
  ngl::Vec3 from(0,25,100);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,0,-1);
  /// a front view (bottom left)
  m_transformStack.pushTransform();
  {
    from.set(0,0,200);
    up.set(0,1,0);
    m_view=ngl::lookAt(from,to,up);
    m_projection=ngl::ortho(-50,50,-50,50, 0.01f, 200.0f);
    // x,y w/h
    if(_m==PANEL)
    {
      glViewport (0,0, m_width/2, m_height/2);
    }
    else
    {
      glViewport(0,0,m_width,m_height);
    }
    // draw
    // in this case set to an identity
    ngl::Vec3 p=m_panelMouseInfo[win].m_modelPos;
    m_transformStack.setGlobal(trans);
    m_transformStack.setPosition(p.m_x,p.m_y,0);
    m_transformStack.setScale(p.m_z,p.m_z,p.m_z);
    loadMatricesToShader();
   // prim->draw("troll");
    m_scene->draw();

//    m_transformStack.setRotation(90,0,0);
//    m_transformStack.addPosition(0,0,-1);
//    loadMatricesToShader();
//    prim->draw("grid");
  }
  m_transformStack.popTransform();

}


NGLDraw::WINDOW NGLDraw::getActiveQuadrant() const
{
  // find where the  mouse is and set quadrant
  if( (m_mouseX <m_width/2) && (m_mouseY<m_height/2) )
  {
    return TOP;
  }
  else if( (m_mouseX >=m_width/2) && (m_mouseY<m_height/2) )
  {
    return PERSP;
  }
  else if( (m_mouseX <=m_width/2) && (m_mouseY>m_height/2) )
  {
    return FRONT;
  }
  else if( (m_mouseX >=m_width/2) && (m_mouseY>m_height/2) )
  {
    return SIDE;
  }
  else // should never get here but stops warning
  {
    return ALL;
  }
}


void NGLDraw::toggleWindow()
{
  if(m_activeWindow ==ALL)
  {
    m_activeWindow=getActiveQuadrant();
    //store mouse info as we have gone fullscreen
    m_panelMouseInfo[FULLOFFSET].m_modelPos = m_panelMouseInfo[m_activeWindow].m_modelPos;
    m_panelMouseInfo[FULLOFFSET].m_origX = m_panelMouseInfo[m_activeWindow].m_origX;
    m_panelMouseInfo[FULLOFFSET].m_origY = m_panelMouseInfo[m_activeWindow].m_origY;

    m_panelMouseInfo[FULLOFFSET].m_spinXFace = m_panelMouseInfo[m_activeWindow].m_spinXFace;
    m_panelMouseInfo[FULLOFFSET].m_spinYFace = m_panelMouseInfo[m_activeWindow].m_spinYFace;
    m_panelMouseInfo[FULLOFFSET].m_origXPos = m_panelMouseInfo[m_activeWindow].m_origXPos;
    m_panelMouseInfo[FULLOFFSET].m_origYPos = m_panelMouseInfo[m_activeWindow].m_origYPos;
    m_panelMouseInfo[FULLOFFSET].m_rotate = m_panelMouseInfo[m_activeWindow].m_rotate;
    m_panelMouseInfo[FULLOFFSET].m_translate = m_panelMouseInfo[m_activeWindow].m_translate;
  }
  else
  {
    // store info as we are minimised
    m_panelMouseInfo[m_activeWindow].m_modelPos = m_panelMouseInfo[FULLOFFSET].m_modelPos;
    m_panelMouseInfo[m_activeWindow].m_origX = m_panelMouseInfo[FULLOFFSET].m_origX;
    m_panelMouseInfo[m_activeWindow].m_origY = m_panelMouseInfo[FULLOFFSET].m_origY;

    m_panelMouseInfo[m_activeWindow].m_spinXFace = m_panelMouseInfo[FULLOFFSET].m_spinXFace;
    m_panelMouseInfo[m_activeWindow].m_spinYFace = m_panelMouseInfo[FULLOFFSET].m_spinYFace;
    m_panelMouseInfo[m_activeWindow].m_origXPos = m_panelMouseInfo[FULLOFFSET].m_origXPos;
    m_panelMouseInfo[m_activeWindow].m_origYPos = m_panelMouseInfo[FULLOFFSET].m_origYPos;
    m_panelMouseInfo[m_activeWindow].m_rotate = m_panelMouseInfo[FULLOFFSET].m_rotate;
    m_panelMouseInfo[m_activeWindow].m_translate = m_panelMouseInfo[FULLOFFSET].m_translate;
    m_activeWindow=ALL;
  }

}


void NGLDraw::draw()
{
  // clear the screen and depth buffer
   glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

   switch(m_activeWindow)
   {
     case ALL :
     {
       front(PANEL);
       side(PANEL);
       top(PANEL);
       persp(PANEL);
       break;
     }
     case FRONT : {front(FULLSCREEN); break; }
     case SIDE : {side(FULLSCREEN); break; }
     case TOP : {top(FULLSCREEN); break; }
     case PERSP : {persp(FULLSCREEN); break; }

   }
}



//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::mouseMoveEvent (const SDL_MouseMotionEvent &_event)
{

  m_mouseX=_event.x;
  m_mouseY=_event.y;
  int win;
  if(m_activeWindow ==ALL)
    win=(int)getActiveQuadrant();
  else
    win=FULLOFFSET;
  // note the method buttons() is the button state when event was called
  // this is different from button() which is used to check which button was
  // pressed when the mousePress/Release event is generated
  if(m_panelMouseInfo[win].m_rotate && _event.state &SDL_BUTTON_LMASK)
  {
    int diffx=_event.x-m_panelMouseInfo[win].m_origX;
    int diffy=_event.y-m_panelMouseInfo[win].m_origY;
    m_panelMouseInfo[win].m_spinXFace += (float) 0.5f * diffy;
    m_panelMouseInfo[win].m_spinYFace += (float) 0.5f * diffx;
    m_panelMouseInfo[win].m_origX = m_mouseX;
    m_panelMouseInfo[win].m_origY = m_mouseY;
    this->draw();

	}
	// right mouse translate code
	else if(m_panelMouseInfo[win].m_translate && _event.state &SDL_BUTTON_RMASK)
	{
		int diffX = (int)(_event.x - m_panelMouseInfo[win].m_origXPos);
		int diffY = (int)(_event.y - m_panelMouseInfo[win].m_origYPos);
		m_panelMouseInfo[win].m_origXPos=_event.x;
		m_panelMouseInfo[win].m_origYPos=_event.y;
		m_panelMouseInfo[win].m_modelPos.m_x += INCREMENT * diffX;
		m_panelMouseInfo[win].m_modelPos.m_y -= INCREMENT * diffY;
    this->draw();

	}

}




//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::mousePressEvent (const SDL_MouseButtonEvent &_event)
{
	int win;
	if(m_activeWindow ==ALL)
		win=(int)getActiveQuadrant();
	else
		win=FULLOFFSET;

  // this method is called when the mouse button is pressed in this case we
  // store the value where the maouse was clicked (x,y) and set the Rotate flag to true
  if(_event.button == SDL_BUTTON_LEFT)
  {
    m_panelMouseInfo[win].m_origX = _event.x;
    m_panelMouseInfo[win].m_origY = _event.y;
    m_panelMouseInfo[win].m_rotate =true;
  }
  // right mouse translate mode
  else if(_event.button == SDL_BUTTON_RIGHT)
  {
    m_panelMouseInfo[win].m_origXPos = _event.x;
    m_panelMouseInfo[win].m_origYPos = _event.y;
    m_panelMouseInfo[win].m_translate=true;
  }
}

//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::mouseReleaseEvent (const SDL_MouseButtonEvent &_event)
{

   // this event is called when the mouse button is released
  // we then set Rotate to false
  int win;
  if(m_activeWindow ==ALL)
    win=(int)getActiveQuadrant();
  else
    win=FULLOFFSET;
  if (_event.button == SDL_BUTTON_LEFT)
  {
    m_panelMouseInfo[win].m_rotate=false;
  }
  // right mouse translate mode
  if (_event.button == SDL_BUTTON_RIGHT)
  {
    m_panelMouseInfo[win].m_translate=false;
  }


}


void NGLDraw::keyEvent(const SDLKey &_key)
{
  int win;
  if(m_activeWindow ==ALL)
    win=(int)getActiveQuadrant();
  else
    win=FULLOFFSET;

  // this method is called every time the main window recives a key event.
  // we then switch on the key value and set the camera in the GLWindow
  // find which key and do appropriate event
  switch (_key)
  {
 // SDLK_SPACE : clearCharacters(); break;
  // this method is called every time the main window recives a key event.
  // we then switch on the key value and set the camera in the GLWindow
  // find which key and do appropriate event



    case SDLK_f : frameActive(); break;
    // show windowed
    case SDLK_SPACE : toggleWindow(); break;

	// check the diff of the wheel position (0 means no change)
	case SDLK_i :
		m_panelMouseInfo[win].m_modelPos.m_z+=ZOOM;
	break;
	case SDLK_o :
		m_panelMouseInfo[win].m_modelPos.m_z-=ZOOM;
	break;




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
