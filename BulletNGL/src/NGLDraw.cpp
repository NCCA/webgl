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

const static float INCREMENT=0.2;
const static float ZOOM=0.2;
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
  m_animate=true;
  m_randomPlace=false;
  m_wireframe=false;
  m_physics = new PhysicsWorld();
  m_physics->setGravity(ngl::Vec3(0,-10,0));
  m_physics->addGroundPlane(ngl::Vec3(0,0,0),ngl::Vec3(50,0.01,50));
  ngl::Random *rng=ngl::Random::instance();
  rng->setSeed();
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
  ngl::Vec3 from(0,1,10);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,1,0);
  // now load to our new camera
  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(50,(float)720.0/576.0,0.05,350);
  ngl::VAOPrimitives *prim = ngl::VAOPrimitives::instance();
  prim->createSphere("sphere",0.5,40);
  prim->createLineGrid("plane",140,140,40);
  m_teapotMesh = new ngl::Obj("models/teapot.obj");
  m_teapotMesh->createVAO();
  //create a dynamic rigidbody

  m_appleMesh = new ngl::Obj("models/apple.obj");
  m_appleMesh->createVAO();
  m_appleMesh->calcBoundingSphere();
  prim->createCapsule("defaultCap",0.5,1.0,20);
  prim->createCone("cone",0.5,1.0,20,20);
  prim->createCylinder("cylinder",0.5,2.0,20,20);

  // as re-size is not explicitly called we need to do this.
  glViewport(0,0,720,576);
  // we add the shapes first then refer to them by name in the
  // rest of the system this reduces the overhead to bullet as it
  // can re-use the shapes for efficiency.
  CollisionShape *shapes=CollisionShape::instance();
  shapes->addMesh("teapot","/models/teapotCollisionMesh.obj");
  shapes->addMesh("apple","/models/appleCollisionMesh.obj");

  shapes->addBox("box",1.0f,1.0f,1.0f);
  shapes->addSphere("sphere",1.0f);
  shapes->addCapsule("capsule",0.5f,1.0f);
  shapes->addCone("cone",0.5f,2.0f);
  shapes->addCylinder("cylinder",0.5f,1.0f);
  m_text = new  ngl::Text("/fonts/arial.ttf",16);
  m_text->setScreenSize(720,576);


}


void NGLDraw::addCube()
{
  ngl::Random *rng=ngl::Random::instance();

  ngl::Vec3 pos=rng->getRandomVec3();
  pos*=10;
  pos.m_y=10;
  if(m_randomPlace == false)
    pos.set(0,10,0);
    m_physics->addBox("box",pos);
}

void NGLDraw::addSphere()
{

  ngl::Random *rng=ngl::Random::instance();

  ngl::Vec3 pos=rng->getRandomVec3();
  pos*=10;
  pos.m_y=10;
  if(m_randomPlace == false)
    pos.set(0,10,0);
  m_physics->addSphere("sphere",pos,rng->randomPositiveNumber(5.0),rng->getRandomVec3()*20);

}

void NGLDraw::addCylinder()
{

  ngl::Random *rng=ngl::Random::instance();

  ngl::Vec3 pos=rng->getRandomVec3();
  pos*=10;
  pos.m_y=10;
  if(m_randomPlace == false)
    pos.set(0,10,0);
  m_physics->addCylinder("cylinder",pos);

}

void NGLDraw::addCone()
{

  ngl::Random *rng=ngl::Random::instance();

  ngl::Vec3 pos=rng->getRandomVec3();
  pos*=10;
  pos.m_y=10;
  if(m_randomPlace == false)
    pos.set(0,10,0);
  m_physics->addCone("cone",pos);

}
void NGLDraw::addCapsule()
{
  ngl::Random *rng=ngl::Random::instance();

  ngl::Vec3 pos=rng->getRandomVec3();
  pos*=10;
  pos.m_y=10;
  if(m_randomPlace == false)
    pos.set(0,10,0);
  m_physics->addCapsule("capsule",pos);
}

void NGLDraw::addMesh(MeshType _m)
{
  ngl::Random *rng=ngl::Random::instance();

  ngl::Vec3 pos=rng->getRandomVec3();
  pos*=10;
  pos.m_y=10;
  if(m_randomPlace == false)
    pos.set(0,10,0);
  if(_m == TEAPOT)
    m_physics->addMesh("teapot",pos);
  else if(_m == APPLE)
    m_physics->addMesh("apple",pos);

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
    shader->setRegisteredUniform("Colour",0.0f,0.0f,1.0f,1.0f);
    switch(m_physics->getCollisionShape(i))
    {
      case BOX_SHAPE_PROXYTYPE :
        shader->setRegisteredUniform("Colour",1.0f,0.0f,0.0f,1.0f);
        prim->draw("cube");
      break;
      case SPHERE_SHAPE_PROXYTYPE :
        shader->setRegisteredUniform("Colour",0.0f,1.0f,0.0f,1.0f);
        prim->draw("sphere");

      break;
      case CAPSULE_SHAPE_PROXYTYPE :
        shader->setRegisteredUniform("Colour",0.0f,0.0f,1.0f,1.0f);
        prim->draw("defaultCap");
      break;

      case CONE_SHAPE_PROXYTYPE :
        shader->setRegisteredUniform("Colour",0.0f,1.0f,1.0f,1.0f);
        prim->draw("cone");
      break;
      case CYLINDER_SHAPE_PROXYTYPE :
        shader->setRegisteredUniform("Colour",1.0f,1.0f,0.0f,1.0f);
        prim->draw("cylinder");
      break;
      case 4 :
         std::string name=m_physics->getBodyNameAtIndex(i);
        if(name =="teapot")
        {
          shader->setRegisteredUniform("Colour",1.0f,1.0f,0.0f,1.0f);
          m_teapotMesh->draw();
        }
        else if(name =="apple")
        {
          shader->setRegisteredUniform("Colour",0.0f,1.0f,0.0f,1.0f);
          m_appleMesh->draw();
        }
      break;
    }
  }


  shader->setShaderParam4f("Colour",1.0f,1.0f,1.0f,1.0f);

  m_bodyTransform.identity();
  loadMatricesToShader();

  prim->draw("plane");
  m_text->setColour(1,1,1);
 // QString text=QString("Number of Bodies=%2").arg(bodies-1);
 // m_text->renderText(10,18,text );
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
  case SDLK_x : stepAnimation(); break;
  case SDLK_1 : addCube(); break;
  case SDLK_2 : addSphere(); break;
  case SDLK_3 : addCapsule(); break;
  case SDLK_4 : addCylinder(); break;
  case SDLK_5 : addCone(); break;
  case SDLK_6 : addMesh(TEAPOT); break;
  case SDLK_7 : addMesh(APPLE); break;
  case SDLK_LEFT : m_physics->addImpulse(ngl::Vec3(-5,0.0f,0.0f)); break;
  case SDLK_RIGHT : m_physics->addImpulse(ngl::Vec3(5.0f,0.0f,0.0f)); break;
  case SDLK_UP : m_physics->addImpulse(ngl::Vec3(0.0f,5.0f,0.0f)); break;
  case SDLK_DOWN : m_physics->addImpulse(ngl::Vec3(0.0f,-5.0f,0.0f)); break;



  case SDLK_r : toggleRandomPlace(); break;
  case SDLK_SPACE: resetSim(); break;


  }
}

void NGLDraw::stepAnimation()
{
  m_physics->step(1.0/60.0,10);

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
