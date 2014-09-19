#include "NGLDraw.h"
#include <ngl/Camera.h>
#include <ngl/Light.h>
#include <ngl/TransformStack.h>
#include <ngl/Material.h>
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Random.h>
#include "PhysicsWorld.h"
#include "CollisionShape.h"
#include <boost/format.hpp>
#include <string>

const static float INCREMENT=0.1;
const static float ZOOM=0.2;
const static float EXT=5.0f;
const static float BOXW=10.0f;
const static float BOXH=1.5f;
const static float BOXD=1.5f;


NGLDraw::NGLDraw()
{
  // re-size the widget to that of the parent (in this case the GLFrame passed in on construction)
  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  m_numBlocks=40;

  m_animate=true;
  m_randomPlace=false;
  m_wireframe=false;
  m_physics = new PhysicsWorld();
  m_physics->setGravity(ngl::Vec3(0,-10,0));
  m_physics->addGroundPlane(ngl::Vec3(0,0,0),ngl::Vec3(50,0.01,50));
  ngl::Random *rng=ngl::Random::instance();
  rng->setSeed();

  CollisionShape *shapes=CollisionShape::instance();

  shapes->addBox("box",BOXW,BOXH,BOXD);
  shapes->addSphere("sphere",1.0f);
  m_x=0.0f;
  m_y=10.0f;
  m_rot=0.0;
  addCube();
  m_radius=20;
  m_firePos.set(cos(ngl::radians((m_rot)))*m_radius, m_y, sin(ngl::radians(m_rot))*m_radius);

  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background
  // enable depth testing for drawing
  glEnable(GL_DEPTH_TEST);
  // enable multisampling for smoother drawing
  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background
  // enable depth testing for drawing
  glEnable(GL_DEPTH_TEST);
  // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["nglToonShader"]->use();
  shader->setShaderParam4f("Colour",1,1,1,1);

  (*shader)["nglDiffuseShader"]->use();
  shader->setShaderParam4f("Colour",1,1,0,1);
  shader->setShaderParam3f("lightPos",1,1,1);
  shader->setShaderParam4f("lightDiffuse",1,1,1,1);

  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(0,0,40);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,1,0);
  // now load to our new camera
  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(50,(float)720.0/576.0,0.05,350);

  ngl::VAOPrimitives *prim = ngl::VAOPrimitives::instance();
  prim->createSphere("sphere",0.5,40);
  prim->createLineGrid("plane",240,240,40);

  // as re-size is not explicitly called we need to do this.
  glViewport(0,0,720,576);
  m_text = new  ngl::Text("fonts/arial.ttf",28);
  m_text->setScreenSize(720,576);
  m_text->setColour(1,1,1);
  m_x=0.0f;
  m_y=10.0f;
}


void NGLDraw::addCube()
{
  ngl::Vec3 pos;
  float angle;
  ngl::Vec3 axis(0,1,0);
  float y=0.0f;

  while(y<=m_numBlocks)
  {
      for(float x=-EXT; x<=EXT; x+=BOXD)
      {
          pos.set(x,y,0);
          angle=90.0f;
          m_physics->addBox("box",pos,axis,angle);
      }
      y+=BOXH;
      for(float z=-EXT; z<=EXT; z+=BOXD)
      {
          pos.set(0,y,z);
          angle=0.0f;
          m_physics->addBox("box",pos,axis,angle);
      }
      y+=BOXH;
}
}

void NGLDraw::addSphere()
{


  ngl::Random *rng=ngl::Random::instance();
  ngl::Vec3 dir=ngl::Vec3(0,m_y,0)-m_firePos;
  m_physics->addSphere("sphere",m_firePos,dir*5,30,rng->getRandomVec3()*20);

}


void NGLDraw::loadMatricesToShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();

  ngl::Mat4 MV;
  ngl::Mat4 MVP;
  ngl::Mat3 normalMatrix;

  MV=  m_bodyTransform*m_globalTransformMatrix*m_cam->getViewMatrix();
  MVP= MV*m_cam->getVPMatrix();
  normalMatrix=MV;
  normalMatrix.inverse();
  shader->setRegisteredUniform("MVP",MVP);
  shader->setRegisteredUniform("normalMatrix",normalMatrix);
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
  (*shader)["nglDiffuseShader"]->use();

  // Rotation based on the mouse position for our global transform
  ngl::Mat4 rotX;
  ngl::Mat4 rotY;
  // create the rotation matrices
  rotX.rotateX(m_spinXFace);
  rotY.rotateY(m_spinYFace);
  // multiply the rotations
  m_globalTransformMatrix=rotY*rotX;
  // add the translations
  m_globalTransformMatrix.m_m[3][0] = m_modelPos.m_x;
  m_globalTransformMatrix.m_m[3][1] = m_modelPos.m_y;
  m_globalTransformMatrix.m_m[3][2] = m_modelPos.m_z;
  // set this in the TX stack

   // get the VBO instance and draw the built in teapot
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  unsigned int bodies=m_physics->getNumCollisionObjects();
  for(unsigned int i=1; i<bodies; ++i)
  {
    m_bodyTransform=m_physics->getTransformMatrix(i);
    loadMatricesToShader();
    ngl::Mat4 scale;
    scale.scale(BOXW,BOXH,BOXD);

    shader->setRegisteredUniform("Colour",0.0f,0.0f,1.0f,1.0f);
    switch(m_physics->getCollisionShape(i))
    {
      case BOX_SHAPE_PROXYTYPE :
        shader->setRegisteredUniform("Colour",1.0f,0.0f,0.0f,1.0f);
        m_bodyTransform*=scale;
        loadMatricesToShader();

        prim->draw("cube");
      break;
      case SPHERE_SHAPE_PROXYTYPE :
        shader->setRegisteredUniform("Colour",0.0f,1.0f,0.0f,1.0f);
        prim->draw("sphere");

      break;
    }
  }


  m_bodyTransform.identity();
  m_bodyTransform.translate(m_firePos.m_x,m_firePos.m_y,m_firePos.m_z);
  shader->setShaderParam4f("Colour",0.0f,0.0f,1.0f,1.0f);
  loadMatricesToShader();
  prim->draw("cube");


  shader->setShaderParam4f("Colour",1.0f,1.0f,1.0f,1.0f);

  m_bodyTransform.identity();
  loadMatricesToShader();

  prim->draw("plane");
  std::string text;
  text=boost::str(boost::format("Number of Bodies %d") % m_physics->getNumCollisionObjects()  );
  m_text->renderText(10,18,text );
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

void NGLDraw::resetSim()
{
   m_physics->reset();
}


void NGLDraw::timerEvent()
{

if(m_animate == true)
 {
   m_physics->step(1.0/60.0,10);
 }
}


void NGLDraw::keyEvent(const SDLKey &_key)
{
  // this method is called every time the main window recives a key event.
  // we then switch on the key value and set the camera in the GLWindow
  // find which key and do appropriate event
  switch (_key)
  {
  case SDLK_1 : addCube(); break;
  case SDLK_2 : addSphere(); break;
  case SDLK_LEFT : m_rot+=5; break;
  case SDLK_RIGHT : m_rot-=5; break;
  case SDLK_DOWN : m_y-=1.0; break;
  case SDLK_UP : m_y+=1.0; break;
  case SDLK_q :
    m_numBlocks+=5;
    if(m_numBlocks > 300)
      m_numBlocks=300;
  resetSim();
  addCube();
  break;
  case SDLK_w :
    m_numBlocks-=5;
    if(m_numBlocks<10)
      m_numBlocks=10;
    resetSim();
    addCube();
    break;


  case SDLK_0 : resetSim(); addCube(); break;


  }
  m_firePos.set(cos(ngl::radians((m_rot)))*m_radius, m_y, sin(ngl::radians(m_rot))*m_radius);

}

void NGLDraw::stepAnimation()
{
  m_physics->step(1.0/60.0,10);

}

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
