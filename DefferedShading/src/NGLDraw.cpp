#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>

//----------------------------------------------------------------------------------------------------------------------
/// @brief the increment for x/y translation with mouse movement
//----------------------------------------------------------------------------------------------------------------------
const static float INCREMENT=0.01;
//----------------------------------------------------------------------------------------------------------------------
/// @brief the increment for the wheel zoom
//----------------------------------------------------------------------------------------------------------------------
const static float ZOOM=0.1;

const static int FBWIDTH=1024;
const static int FBHEIGHT=720;

NGLDraw::NGLDraw()
{
  // re-size the widget to that of the parent (in this case the GLFrame passed in on construction)
  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  m_debug=true;
  m_debugMode=0;
  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(0,2,5);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,1,0);
  // now load to our new camera
  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(45,(float)float(720/576),0.05,350);

  glClearColor(0.0f, 0.0f, 0.0f, 1.0f);			   // Grey Background
  // enable depth testing for drawing
  glEnable(GL_DEPTH_TEST);
   // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // we are creating a shader for Pass 1
  shader->createShaderProgram("Pass1");
  // now we are going to create empty shaders for Frag and Vert
  shader->attachShader("Pass1Vertex",ngl::VERTEX);
  shader->attachShader("Pass1Fragment",ngl::FRAGMENT);
  // attach the source
  shader->loadShaderSource("Pass1Vertex","shaders/Pass1Vert.glsl");
  shader->loadShaderSource("Pass1Fragment","shaders/Pass1Frag.glsl");
  // compile the shaders
  shader->compileShader("Pass1Vertex");
  shader->compileShader("Pass1Fragment");
  // add them to the program
  shader->attachShaderToProgram("Pass1","Pass1Vertex");
  shader->attachShaderToProgram("Pass1","Pass1Fragment");
//  shader->bindFragDataLocation("Pass1",0,"pointDeferred");
//  shader->bindFragDataLocation("Pass1",1,"normalDeferred");
//  shader->bindFragDataLocation("Pass1",2,"colourDeferred");
//  shader->bindFragDataLocation("Pass1",3,"shadingDeferred");

  shader->linkProgramObject("Pass1");
  shader->use("Pass1");

  // we are creating a shader for Pass 2
  shader->createShaderProgram("Pass2");
  // now we are going to create empty shaders for Frag and Vert
  shader->attachShader("Pass2Vertex",ngl::VERTEX);
  shader->attachShader("Pass2Fragment",ngl::FRAGMENT);
  // attach the source
  shader->loadShaderSource("Pass2Vertex","shaders/Pass2Vert.glsl");
  shader->loadShaderSource("Pass2Fragment","shaders/Pass2Frag.glsl");
  // compile the shaders
  shader->compileShader("Pass2Vertex");
  shader->compileShader("Pass2Fragment");
  // add them to the program
  shader->attachShaderToProgram("Pass2","Pass2Vertex");
  shader->attachShaderToProgram("Pass2","Pass2Fragment");
  shader->linkProgramObject("Pass2");
  shader->use("Pass2");
  shader->setShaderParam1i("pointTex",0);
  shader->setShaderParam1i("normalTex",1);
  shader->setShaderParam1i("colourTex",2);
  shader->setShaderParam1i("lightPassTex",3);
  shader->setShaderParam1i("diffusePassTex",4);

  // we are creating a shader for Debug pass
  shader->createShaderProgram("Debug");
  // now we are going to create empty shaders for Frag and Vert
  shader->attachShader("DebugVertex",ngl::VERTEX);
  shader->attachShader("DebugFragment",ngl::FRAGMENT);
  // attach the source
  shader->loadShaderSource("DebugVertex","shaders/DebugVert.glsl");
  shader->loadShaderSource("DebugFragment","shaders/DebugFrag.glsl");
  // compile the shaders
  shader->compileShader("DebugVertex");
  shader->compileShader("DebugFragment");
  // add them to the program
  shader->attachShaderToProgram("Debug","DebugVertex");
  shader->attachShaderToProgram("Debug","DebugFragment");
  shader->linkProgramObject("Debug");
  shader->use("Debug");
  shader->setShaderParam1i("pointTex",0);
  shader->setShaderParam1i("normalTex",1);
  shader->setShaderParam1i("colourTex",2);
  shader->setShaderParam1i("lightPassTex",3);
  shader->setShaderParam1i("diffusePassTex",4);

  shader->setRegisteredUniform1i("mode",1);


  // we are creating a shader for Lighting pass
  shader->createShaderProgram("Lighting");
  // now we are going to create empty shaders for Frag and Vert
  shader->attachShader("LightingVertex",ngl::VERTEX);
  shader->attachShader("LightingFragment",ngl::FRAGMENT);
  // attach the source
  shader->loadShaderSource("LightingVertex","shaders/LightingPassVert.glsl");
  shader->loadShaderSource("LightingFragment","shaders/LightingPassFrag.glsl");
  // compile the shaders
  shader->compileShader("LightingVertex");
  shader->compileShader("LightingFragment");
  // add them to the program
  shader->attachShaderToProgram("Lighting","LightingVertex");
  shader->attachShaderToProgram("Lighting","LightingFragment");
  shader->linkProgramObject("Lighting");
  shader->use("Lighting");
  shader->setShaderParam1i("pointTex",0);
  shader->setShaderParam1i("normalTex",1);
  shader->setShaderParam1i("colourTex",2);
  shader->setShaderParam1i("lightPassTex",3);

  shader->setShaderParam2f("wh",720,576);

  m_text = new ngl::Text("font/arial.ttf",14);
  m_text->setScreenSize(720,576);

  m_screenQuad = new ScreenQuad("Debug");
  // as re-size is not explicitly called we need to do this.
  glViewport(0, 0, 720,576);
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  prim->createSphere("sphere",0.5,50);

  prim->createSphere("lightSphere",0.1,10);
  prim->createCylinder("cylinder",0.5,1.4,40,40);

  prim->createCone("cone",0.5,1.4,20,20);

  prim->createDisk("disk",0.8,120);
  prim->createTorus("torus",0.15,0.4,40,40);
  prim->createTrianglePlane("plane",14,14,80,80,ngl::Vec3(0,1,0));

  createFrameBuffer();
  printFrameBufferInfo(m_gbuffer);
  printFrameBufferInfo(m_lightBuffer);
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


void NGLDraw::createFrameBuffer()
{

  // create a framebuffer object this is deleted in the dtor
  int w=720;
  int h=576;

  glGenFramebuffers(1, &m_gbuffer);
  glBindFramebuffer(GL_FRAMEBUFFER, m_gbuffer);

  // create a renderbuffer object to store depth info
  GLuint m_rboID;
  glGenRenderbuffers(1, &m_rboID);
  glBindRenderbuffer(GL_RENDERBUFFER, m_rboID);

  glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT, w, h);

  // create a texture object
  glGenTextures(1, &m_pointTexID);
  // bind it to make it active
  glBindTexture(GL_TEXTURE_2D, m_pointTexID);
  // set params
  glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, w, h, 0, GL_RGB, GL_UNSIGNED_BYTE, 0);

  // create a texture object
  glGenTextures(1, &m_normalTexID);
  // bind it to make it active
  glBindTexture(GL_TEXTURE_2D, m_normalTexID);
  // set params
  glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, w, h, 0, GL_RGB, GL_UNSIGNED_BYTE, 0);

  glGenTextures(1, &m_colourTexID);
  // bind it to make it active
  glBindTexture(GL_TEXTURE_2D, m_colourTexID);
  // set params
  glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, w, h, 0, GL_RGB, GL_UNSIGNED_BYTE, 0);

  glGenTextures(1, &m_shadingTexID);
  // bind it to make it active
  glBindTexture(GL_TEXTURE_2D, m_shadingTexID);
  // set params
  glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, w, h, 0, GL_RGB, GL_UNSIGNED_BYTE, 0);


  // The depth buffer
//	glGenTextures(1, &m_depthTex);
//	glBindTexture(GL_TEXTURE_2D, m_depthTex);
//	glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH32F_STENCIL8, w, h, 0, GL_DEPTH_COMPONENT, GL_FLOAT, NULL);
//	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
//	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);


  // attatch the texture we created earlier to the FBO
  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, m_pointTexID, 0);
  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT1_NV  , GL_TEXTURE_2D, m_normalTexID, 0);
  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT2, GL_TEXTURE_2D, m_colourTexID, 0);
  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT3, GL_TEXTURE_2D, m_shadingTexID, 0);

  // glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_TEXTURE_2D, m_depthTex, 0);

  // now attach a renderbuffer to depth attachment point
  glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, m_rboID);
//  GLenum drawBuffers[] = { GL_COLOR_ATTACHMENT0,GL_COLOR_ATTACHMENT1,GL_COLOR_ATTACHMENT2};
//  glDrawBuffers (3, drawBuffers);


  // now we are going to create a buffer for the lighting pass

  // create a framebuffer object this is deleted in the dtor

  glGenFramebuffers(1, &m_lightBuffer);
  glBindFramebuffer(GL_FRAMEBUFFER, m_lightBuffer);

  // create a renderbuffer object to store depth info
  glGenRenderbuffers(1, &m_rboID);
  glBindRenderbuffer(GL_RENDERBUFFER, m_rboID);

  glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT, w, h);
  glGenTextures(1, &m_lightPassTexID);
  // bind it to make it active
  glBindTexture(GL_TEXTURE_2D, m_lightPassTexID);
  // set params
  glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB16F, w, h, 0, GL_RGB, GL_UNSIGNED_BYTE, 0);





  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, m_lightPassTexID, 0);
//  GLuint lightBuffers[] = { GL_COLOR_ATTACHMENT0};
//  glDrawBuffers (1, lightBuffers);

  // now got back to the default render context
  glBindFramebuffer(GL_FRAMEBUFFER, 0);


}

void NGLDraw::draw()
{
  glBindFramebuffer (GL_FRAMEBUFFER, m_gbuffer);
  /*************************************************************************************************/
  // Geo Pass
  /*************************************************************************************************/

  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  GLenum drawBuffers[] = { GL_COLOR_ATTACHMENT0,GL_COLOR_ATTACHMENT1,GL_COLOR_ATTACHMENT2,GL_COLOR_ATTACHMENT3};
  glDrawBuffers (4, drawBuffers);

  drawScene("Pass1");
  /*************************************************************************************************/
  // now do the light pass
  /*************************************************************************************************/
  glBindFramebuffer (GL_FRAMEBUFFER, m_lightBuffer);
  GLenum lightBuffers[] = { GL_COLOR_ATTACHMENT0};
  glDrawBuffers (1, lightBuffers);

  glClear (GL_COLOR_BUFFER_BIT);

  // map the texture buffers so light pass can read them
 glActiveTexture (GL_TEXTURE0);
 glBindTexture (GL_TEXTURE_2D, m_pointTexID);
 glActiveTexture (GL_TEXTURE1);
 glBindTexture (GL_TEXTURE_2D, m_normalTexID);
 glActiveTexture (GL_TEXTURE2);
 glBindTexture (GL_TEXTURE_2D, m_colourTexID);
 glActiveTexture (GL_TEXTURE3);
 glBindTexture (GL_TEXTURE_2D, m_shadingTexID);
 glActiveTexture (GL_TEXTURE4);
 glBindTexture (GL_TEXTURE_2D, m_lightPassTexID);



 glGenerateMipmap(GL_TEXTURE_2D);

 glClear(GL_COLOR_BUFFER_BIT);

 renderLightPass("Lighting");

  glActiveTexture (GL_TEXTURE0);
  glBindTexture (GL_TEXTURE_2D, m_pointTexID);
  glActiveTexture (GL_TEXTURE1);
  glBindTexture (GL_TEXTURE_2D, m_normalTexID);
  glActiveTexture (GL_TEXTURE2);
  glBindTexture (GL_TEXTURE_2D, m_colourTexID);
  glActiveTexture (GL_TEXTURE3);
  glBindTexture (GL_TEXTURE_2D, m_shadingTexID);
  glActiveTexture (GL_TEXTURE4);
  glBindTexture (GL_TEXTURE_2D, m_lightPassTexID);



  // now blit

//  glBindFramebuffer(GL_DRAW_FRAMEBUFFER, 0);
//  glBindFramebuffer(GL_READ_FRAMEBUFFER, m_lightBuffer);

//  glReadBuffer(GL_COLOR_ATTACHMENT0+m_debugMode);
//  int w=width()*devicePixelRatio();
//  int h=height()*devicePixelRatio();

//  glBlitFramebuffer(0, 0, w, h, 0, 0, w, h, GL_COLOR_BUFFER_BIT, GL_NEAREST);

  if(m_debug==true)
  {
    glBindFramebuffer (GL_FRAMEBUFFER, 0);
    glActiveTexture (GL_TEXTURE0);
    glBindTexture (GL_TEXTURE_2D, m_pointTexID);
    glActiveTexture (GL_TEXTURE1);
    glBindTexture (GL_TEXTURE_2D, m_normalTexID);
    glActiveTexture (GL_TEXTURE2);
    glBindTexture (GL_TEXTURE_2D, m_colourTexID);
    glActiveTexture (GL_TEXTURE3);
    glBindTexture (GL_TEXTURE_2D, m_shadingTexID);
    glActiveTexture (GL_TEXTURE4);
    glBindTexture (GL_TEXTURE_2D, m_lightPassTexID);

    glGenerateMipmap(GL_TEXTURE_2D);

    glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    ngl::ShaderLib *shader = ngl::ShaderLib::instance();

    shader->use("Debug");
    //shader->setUniform("cam",m_cam->getEye().toVec3());
    shader->setShaderParam1i("mode",m_debugMode);
    m_screenQuad->draw();

  }

  // calculate and draw FPS
  glBindFramebuffer (GL_FRAMEBUFFER, 0);

  ++m_frames;
  glPolygonMode(GL_FRONT_AND_BACK,GL_FILL);
  m_text->setColour(1,1,0);
 // QString text=QString("%1 fps using %2 to draw").arg(m_fps).arg(m_debug ? "ScreenQuad" : "glBlitFramebuffer");
 // m_text->renderText(10,20,text);

}


void NGLDraw::loadMatricesToShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  shader->use("Pass1");
 // ngl::Mat4 view=ngl::lookAt(ngl::Vec3(0,1,5),ngl::Vec3(0,0,0),ngl::Vec3(0,1,0));
 // ngl::Mat4 proj=ngl::perspective(45,float(width()/height()),0.1,50);
  ngl::Mat4 MV;
  ngl::Mat4 MVP;
  ngl::Mat4 M;

  M=m_transform.getMatrix()*m_mouseGlobalTX;
  MV=  M*m_cam->getViewMatrix();
  MVP=  MV*m_cam->getProjectionMatrix();


  shader->setShaderParamFromMat4("MVP",MVP);
  shader->setShaderParamFromMat4("MV",MV);
}



void NGLDraw::renderLightPass(const std::string &_shader)
{
  // get the VBO instance and draw the built in teapot
 ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
 ngl::ShaderLib *shader = ngl::ShaderLib::instance();
// glDrawBuffer(GL_NONE);
// glEnable(GL_DEPTH_TEST);
// glDisable(GL_CULL_FACE);
// glClear(GL_STENCIL_BUFFER_BIT);
// glStencilFunc(GL_ALWAYS, 0, 0);
// glStencilOpSeparate(GL_FRONT, GL_KEEP, GL_DECR_WRAP, GL_KEEP);
// glStencilOpSeparate(GL_BACK, GL_KEEP, GL_INCR_WRAP, GL_KEEP);


 shader->use(_shader);
  for(float z=-5.0; z<5.0; z+=0.5)
  {
    for(float x=-5.0; x<5.0; x+=0.5)
    {
      m_transform.reset();

      m_transform.setPosition(x,sin(x),z);
      ngl::Mat4 MV;
      ngl::Mat4 MVP;
      ngl::Mat4 M;

      M=m_transform.getMatrix()*m_mouseGlobalTX;
      MV=  M*m_cam->getViewMatrix();
      MVP=  MV*m_cam->getProjectionMatrix();
      ngl::Mat4 globalMV = MV.transpose();
      ngl::Vec4 p(x,sin(x),z,1.0);
      p=globalMV*p;
      shader->setShaderParam3f("lightPos",p.m_x,p.m_y,p.m_z);

      shader->setShaderParamFromMat4("MVP",MVP);
//      shader->setShaderParamFromMat4("MV",MV);
      prim->draw("lightSphere");


    }
  }

	glDisable(GL_BLEND);
	glDisable(GL_CULL_FACE);

}

void NGLDraw::drawScene(const std::string &_shader)
{
  // clear the screen and depth buffer
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

   // get the VBO instance and draw the built in teapot
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  ngl::ShaderLib *shader = ngl::ShaderLib::instance();
  shader->use(_shader);
  glPolygonMode(GL_FRONT_AND_BACK,m_wireframe);
  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",1,0,0);
    loadMatricesToShader();
    prim->draw("teapot");
  } // and before a pop

  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",0,1,0);

    m_transform.setPosition(-3,0.0,0.0);
    loadMatricesToShader();
    prim->draw("sphere");
  } // and before a pop

  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",1,0,1);

    m_transform.setPosition(3,0.0,0.0);
    loadMatricesToShader();
    prim->draw("cylinder");
  } // and before a pop

  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",0,0,1);

    m_transform.setPosition(0.0,0.01,3.0);
    loadMatricesToShader();
    prim->draw("cube");
  } // and before a pop

  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",1,1,0);

    m_transform.setPosition(-3.0,0.05,3.0);
    loadMatricesToShader();
    prim->draw("torus");
  } // and before a pop

  m_transform.reset();
  {

    m_transform.setPosition(3.0,0.5,3.0);
    loadMatricesToShader();
    prim->draw("icosahedron");
  } // and before a pop

  m_transform.reset();
  {
    m_transform.setPosition(0.0,0.0,-3.0);
    loadMatricesToShader();
    prim->draw("cone");
  } // and before a pop


  m_transform.reset();
  {
    m_transform.setPosition(-3.0,0.6,-3.0);
    loadMatricesToShader();
    prim->draw("tetrahedron");
  } // and before a pop


  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",0,0,0);

    m_transform.setPosition(3.0,0.5,-3.0);
    loadMatricesToShader();
    prim->draw("octahedron");
  } // and before a pop


  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",1,1,1);

    m_transform.setPosition(0.0,0.5,-6.0);
    loadMatricesToShader();
    prim->draw("football");
  } // and before a pop

  m_transform.reset();
  {
    m_transform.setPosition(-3.0,0.5,-6.0);
    m_transform.setRotation(0,180,0);
    loadMatricesToShader();
    prim->draw("disk");
  } // and before a pop


  m_transform.reset();
  {
    m_transform.setPosition(3.0,0.5,-6.0);
    loadMatricesToShader();
    prim->draw("dodecahedron");
  } // and before a pop

  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",1,1,0);

    m_transform.setPosition(1.0,0.35,1.0);
    m_transform.setScale(1.5,1.5,1.5);
    loadMatricesToShader();
    prim->draw("troll");
  } // and before a pop

  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",1,0,0);

    m_transform.setPosition(-1.0,-0.5,1.0);
    m_transform.setScale(0.1,0.1,0.1);
    loadMatricesToShader();
    prim->draw("dragon");
  } // and before a pop

  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",1,0,1);

    m_transform.setPosition(-2.5,-0.5,1.0);
    m_transform.setScale(0.1,0.1,0.1);
    loadMatricesToShader();
    prim->draw("buddah");
  } // and before a pop

  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",1,0,0);

    m_transform.setPosition(2.5,-0.5,1.0);
    m_transform.setScale(0.1,0.1,0.1);
    loadMatricesToShader();
    prim->draw("bunny");
  } // and before a pop

  m_transform.reset();
  {
    shader->setShaderParam3f("Colour",0,0,0.8);

    m_transform.setPosition(0.0,-0.5,0.0);
    loadMatricesToShader();
    prim->draw("plane");
  } // and before a pop

/*
  for(float z=-5.0; z<5.0; z+=0.5)
  {
    for(float x=-5.0; x<5.0; x+=0.5)
    {
      m_transform.reset();

      m_transform.setPosition(x,0,z);
      loadMatricesToShader();
      prim->draw("lightSphere");

    }
  }

*/

glPolygonMode(GL_FRONT_AND_BACK,GL_FILL);
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
//----------------------------------------------------------------------------------------------------------------------
