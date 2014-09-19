#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>
#include <string>
#include <boost/format.hpp>
#include <ngl/Random.h>

const static float INCREMENT=0.01;
const static float ZOOM=0.05;
NGLDraw::NGLDraw()
{
  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  m_animate=true;

  glColorMask (GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
  glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glEnable(GL_DEPTH_TEST);


  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background
  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background
  // enable depth testing for drawing
  glEnable(GL_DEPTH_TEST);
  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(0,4,10);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,1,0);
  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(45,(float)720.0/576.0,0.5,150);
  // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // we are creating a shader called Spotlight
  shader->createShaderProgram("Spotlight");
  // now we are going to create empty shaders for Frag and Vert
  shader->attachShader("SpotlightVertex",ngl::VERTEX);
  shader->attachShader("SpotlightFragment",ngl::FRAGMENT);
  // attach the source
  shader->loadShaderSource("SpotlightVertex","/shaders/SpotlightVert.glsl");
  shader->loadShaderSource("SpotlightFragment","/shaders/SpotlightFrag.glsl");
  // compile the shaders
  shader->compileShader("SpotlightVertex");
  shader->compileShader("SpotlightFragment");
  // add them to the program
  shader->attachShaderToProgram("Spotlight","SpotlightVertex");
  shader->attachShaderToProgram("Spotlight","SpotlightFragment");
  shader->bindAttribute("Spotlight",0,"inVert");
  // attribute 1 is the UV data u,v (if present)
  shader->bindAttribute("Spotlight",1,"inUV");
  // attribute 2 are the normals x,y,z
  shader->bindAttribute("Spotlight",2,"inNormal");

  // now we have associated this data we can link the shader
  shader->linkProgramObject("Spotlight");
  // and make it active ready to load values
  (*shader)["Spotlight"]->use();
  shader->setShaderParam1f("Normalize",1);
  glEnable(GL_DEPTH_TEST); // for removal of hidden surfaces
  // the shader will use the currently active material and light0 so set them
  ngl::Material m(ngl::GOLD);
  // load our material values to the shader into the structure material (see Vertex shader)
  m.loadToShader("material");
  ngl::VAOPrimitives *prim =  ngl::VAOPrimitives::instance();
  prim->createTrianglePlane("plane",30,30,180,180,ngl::Vec3(0,1,0));
  // create the lights
  createLights();
  // as re-size is not explicitly called we need to do this.
  glViewport(0,0,720,576);


}

NGLDraw::~NGLDraw()
{
  std::cerr<<"Shutting down NGL, removing VAO's and Shaders\n";
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
  // add the translations
  m_mouseGlobalTX.m_m[3][0] = m_modelPos.m_x;
  m_mouseGlobalTX.m_m[3][1] = m_modelPos.m_y;
  m_mouseGlobalTX.m_m[3][2] = m_modelPos.m_z;
  // grab an instance of the primitives for drawing
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  // Rotation based on the mouse position for our global
  // transform
  // grab an instance of the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["Spotlight"]->use();
  // load the values to the shader and draw the plane
  loadMatricesToShader();
  prim->draw("plane");

  for (int z=-8; z<8; z+=2)
  {
    for (int x=-8; x<8; x+=2)
    {
    m_transformStack.pushTransform();
    {
      // set the teapot position and roation
      m_transformStack.getCurrentTransform().setRotation(0,(x*z)*20,0);
      m_transformStack.getCurrentTransform().setPosition(x,0.49,z);
      // load the current transform to the shader
      loadMatricesToShader();
      prim->draw("teapot");
     } // and before a pop
     m_transformStack.popTransform();
   }
  }
}
void NGLDraw::loadMatricesToShader()
{
  // grab an instance of the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // these are used to hold our pre-computed matrix values
  ngl::Mat4 MV;
  ngl::Mat4 MVP;
  ngl::Mat3 normalMatrix;
  // our model view matrix
  MV=m_transformStack.getCurrentTransform().getMatrix()
     *m_mouseGlobalTX*m_cam->getViewMatrix() ;
  // our model view ;rojection matrix
  MVP=MV*m_cam->getProjectionMatrix();
  // calculate normal matrix by getting the top 3x3 of the MV
  normalMatrix=MV;
  // then calculate the inverse
  normalMatrix.inverse();
  // now load them to the current shader
  shader->setShaderParamFromMat4("MV",MV);
  shader->setShaderParamFromMat4("MVP",MVP);
  shader->setShaderParamFromMat3("normalMatrix",normalMatrix);
}



void NGLDraw::timerEvent( )
{
  if (m_animate !=true)
  {
   return;
  }
  static float time=0.0;
  // create pointers to the begining and end of the spot vector
   int size=m_spots.size();
   for(int i=0; i<size; ++i)
   {
     float pointOnCircleX= cos(time+m_spotData[i].m_time)*m_spotData[i].m_radiusX;
     float pointOnCircleZ= sin(time+m_spotData[i].m_time)*m_spotData[i].m_radiusZ;
     // get the points value we need
     ngl::Vec4 p(m_spotData[i].m_aimCenter[0]+pointOnCircleX,0,m_spotData[i].m_aimCenter[2]+pointOnCircleZ,0.0);
     m_spots[i].setColour(trigInterp(m_spotData[i].m_startColour,m_spotData[i].m_endColour,m_spotData[i].m_mix ));
     // do the colour mixing
     m_spotData[i].m_mix+=0.01;
     if (m_spotData[i].m_mix >=1.0)
     {
       m_spotData[i].m_mix=0.0;
     }
     // set spot aim
     m_spots[i].aim(p);
     // now load to shader
     std::string light=boost::str(boost::format("light[%d]") % i);
     m_spots[i].loadToShader(light);
   }
   time+=0.05;

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


void NGLDraw::createLights()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["Spotlight"]->use();
  ngl::Real x=0;
  ngl::Real z=0;
  // loop an set the spot values
  ngl::Random *rand=ngl::Random::instance();
  rand->setSeed(time(NULL));
  for(int i=0; i<8; ++i)
  {
    // create a random position for the spot
    x=rand->randomNumber(3);
    z=rand->randomNumber(3);
    ngl::Vec3 pos(x,3,z);
    // shine down
    ngl::Vec3 dir(0,-1,0);
    // now load this to the spot data class
    SpotData d;
    d.m_aimCenter=rand->getRandomPoint(x*3,0,z*3);
    d.m_radiusX=rand->randomNumber(2)+0.5;
    d.m_radiusZ=rand->randomNumber(2)+0.5;
    d.m_startColour =rand->getRandomColour();
    d.m_endColour =rand->getRandomColour();
    d.m_startColour.clamp(0.4,1.0);
    d.m_endColour.clamp(0.4,1.0);

    d.m_mix=0.0;
    d.m_time=rand->randomPositiveNumber(4)+0.6;
    m_spotData.push_back(d);
    m_spots.push_back(ngl::SpotLight(pos,dir,d.m_startColour));
  }
  // get the inverse view matrix and load this to the light shader
  // we use this as we do the light calculations in eye space in the shader
  ngl::Mat4 iv=m_cam->getViewMatrix();
  iv.transpose();

  for(int i=0; i<8; ++i)
  {
    // set the spot values
    m_spots[i].setSpecColour(ngl::Colour(1,1,1,1));
    m_spots[i].setCutoff(rand->randomPositiveNumber(24)+0.5);
    m_spots[i].setInnerCutoff(rand->randomPositiveNumber(12)+0.1);
    m_spots[i].setExponent(rand->randomPositiveNumber(2)+1);
    m_spots[i].setAttenuation(1.0,0.0,0.0);
    m_spots[i].enable();
    m_spots[i].setTransform(iv);
    std::string light=boost::str(boost::format("light[%d]") % i);
    m_spots[i].loadToShader(light);
  }
}

//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::changeSpotParams()
{
  ngl::Random *rand=ngl::Random::instance();
  rand->setSeed(time(NULL));
  // change the spot positions

  for(int i=0; i<8; ++i)
  {
    float x=rand->randomNumber(3);
    float z=rand->randomNumber(3);
    m_spots[i].setPosition(ngl::Vec3(x,3,z));
    m_spots[i].setCutoff(rand->randomPositiveNumber(24)+0.5);
    m_spots[i].setInnerCutoff(rand->randomPositiveNumber(12)+0.1);

    // now we update the spot values
    m_spotData[i].m_aimCenter=rand->getRandomPoint(x*4,0,z*4);
    m_spotData[i].m_radiusX=rand->randomNumber(2)+0.5;
    m_spotData[i].m_radiusZ=rand->randomNumber(2)+0.5;
    m_spotData[i].m_time=rand->randomPositiveNumber(4)+0.6;
    m_spotData[i].m_startColour =rand->getRandomColour();
    m_spotData[i].m_endColour =rand->getRandomColour();
    m_spotData[i].m_mix=0.0;
  }
}

void NGLDraw::keyEvent(const SDLKey &_key)
{
	switch(_key)
	{
		case SDLK_SPACE : changeSpotParams(); break;
		case SDLK_p : m_animate^=true; break;
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
