#include "AIUtil.h"
#include <iostream>
#include "NGLDraw.h"
#include <ngl/NGLStream.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>
#include <assimp/cimport.h>
#include <assimp/scene.h>
#include <assimp/postprocess.h>
#include <assimp/vector3.h>
#include <boost/foreach.hpp>
#include <boost/format.hpp>
#include <ctime>

const static float INCREMENT=0.01;
const static float ZOOM=0.05;
NGLDraw::NGLDraw()
{
  glClearColor(0.6,0.6,0.6,1.0);
  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  // the following code is modified from this
  // http://assimp.svn.sourceforge.net/viewvc/assimp/trunk/samples/SimpleOpenGL/
  // we are taking one of the postprocessing presets to avoid
  // spelling out 20+ single postprocessing flags here.
  m_animate=true;
  m_frameTime=0.0;

  m_scene = m_importer.ReadFile("models/bobWalk.dae",
                                aiProcessPreset_TargetRealtime_Quality |
                                aiProcess_Triangulate
                                );
  if(m_scene == 0)
  {
    std::cerr<<"Error loading scene file\n";
    exit(EXIT_FAILURE);
  }
  std::cout<<"num animations "<<m_scene->mNumAnimations<<"\n";
  if(m_scene->mNumAnimations <1)
  {
      std::cerr<<"No animations in this scene exiting\n";
      exit(EXIT_FAILURE);
  }
  bool loaded=m_mesh.load(m_scene);
  if(loaded == false)
  {
      std::cerr<<"Assimp reports "<<m_importer.GetErrorString()<<"\n";
      exit(EXIT_FAILURE);
  }
  // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // we are creating a shader called Skinning
  shader->createShaderProgram("Skinning");
  // now we are going to create empty shaders for Frag and Vert
  shader->attachShader("SkinningVertex",ngl::VERTEX);
  shader->attachShader("SkinningFragment",ngl::FRAGMENT);
  // attach the source
  shader->loadShaderSource("SkinningVertex","/shaders/SkinningVertex.glsl");
  shader->loadShaderSource("SkinningFragment","/shaders/SkinningFragment.glsl");
  // compile the shaders
  shader->compileShader("SkinningVertex");
  shader->compileShader("SkinningFragment");
  // add them to the program
  shader->attachShaderToProgram("Skinning","SkinningVertex");
  shader->attachShaderToProgram("Skinning","SkinningFragment");
  // now bind the shader attributes for most NGL primitives we use the following
  // now we have associated this data we can link the shader
  // layout attribute 0 is the vertex data (x,y,z)
  shader->bindAttribute("Skinning",0,"inVert");
  // attribute 1 is the UV data u,v (if present)
  shader->bindAttribute("Skinning",1,"inUV");
  // attribute 2 are the normals x,y,z
  shader->bindAttribute("Skinning",2,"inNormal");
  shader->bindAttribute("Skinning",3, "BoneIDs");
  shader->bindAttribute("Skinning",4, "Weights");


  shader->linkProgramObject("Skinning");
  std::cerr<<"linking \n";
  //shader->autoRegisterUniforms("Skinning");
  std::cerr<<"done auto reg\n";
  (*shader)["Skinning"]->use();

  // the shader will use the currently active material and light0 so set them
  ngl::Material m(ngl::GOLD);
  // load our material values to the shader into the structure material (see Vertex shader)
  m.loadToShader("material");
  ngl::Vec3 min,max;
  std::cerr<<"get scene BBBox\n";
  AIU::getSceneBoundingBox(m_scene,min,max);
  ngl::Vec3 center=(min+max)/2.0;
  ngl::Vec3 from;
  from.m_x=0;
  from.m_y=max.m_y*2;
  from.m_z=max.m_z*2;
  std::cout<<"from "<<from<<" center "<<center<<"\n";
  ngl::Vec3 up(0,1,0);
  // now load to our new camera
  m_cam= new ngl::Camera(from,center,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(45,(float)720.0/576.0,0.05,350);
  shader->setShaderParam3f("viewerPos",m_cam->getEye().m_x,m_cam->getEye().m_y,m_cam->getEye().m_z);
  // now create our light this is done after the camera so we can pass the
  // transpose of the projection matrix to the light to do correct eye space
  // transformations
  ngl::Mat4 iv=m_cam->getViewMatrix();
  iv.transpose();
  m_light = new ngl::Light(from,ngl::Colour(1,1,1,1),ngl::Colour(1,1,1,1),ngl::POINTLIGHT );
  m_light->setTransform(iv);
  // load these values to the shader as well
  m_light->loadToShader("light");

  // as re-size is not explicitly called we need to do this.
  glViewport(0,0,720,576);

}



void NGLDraw::loadMatricesToShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();

    ngl::Mat4 MV;
    ngl::Mat4 MVP;
    ngl::Mat4 M;
    M=m_transform.getMatrix()*m_mouseGlobalTX;
    MV=  M*m_cam->getViewMatrix();
    MVP= M*m_cam->getVPMatrix();
    shader->setShaderParamFromMat4("MV",MV);
    shader->setShaderParamFromMat4("MVP",MVP);
    shader->setShaderParamFromMat4("M",M);
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
  // grab an instance of the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["Skinning"]->use();

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
  // set this in the TX stack
  loadMatricesToShader();
  std::vector<ngl::Mat4> transforms;
  if(m_animate)
  {
    static float t=0.0;
    t+=0.1;
    float time=float(SDL_GetTicks()/1000.0)*m_mesh.getDuration()/m_mesh.getTicksPerSec();
    std::cout<<time<<"\n";
    m_mesh.boneTransform(time, transforms);
  }
  else
  {
    m_mesh.boneTransform(m_frameTime, transforms);

  }
  unsigned int size=transforms.size();
  for (unsigned int i = 0 ; i < size ; ++i)
  {
    std::string name=boost::str(boost::format("gBones[%d]") % i );
    shader->setUniform(name.c_str(),transforms[i]);
  }

  m_mesh.render();

}




void NGLDraw::timerEvent( )
{
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
	switch(_key)
	{
		default : break;
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
