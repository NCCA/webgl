#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>

const static float INCREMENT=0.01;
const static float ZOOM=0.05;
const static float znear=0.1;
const static float zfar=100;

NGLDraw::NGLDraw()
{
  m_animate=true;
  m_lightPosition.set(8,4,8);
  m_lightYPos=4.0;
  m_lightXoffset=8.0;
  m_lightZoffset=8.0;
  m_width=720;
  m_height=576;
  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;

  glColorMask (GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
  glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glEnable(GL_DEPTH_TEST);


  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background
  // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();

  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(0,2,6);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,1,0);
  // now load to our new camera
  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(45,(float)720.0/576.0,znear,zfar);

  // now load to our light POV camera

  m_lightCamera= new ngl::Camera(m_lightPosition,to,up);
  // here we set the light POV camera shape, the aspect is 1 as our
  // texture is square.
  // use the same clip plane as before but set the FOV a bit larger
  // to get slightly better shadows and the clip planes will help
  // to get rid of some of the artefacts
  m_lightCamera->setShape(45,float(720/576),znear,zfar);


  // in this case I'm only using the light to hold the position
  // it is not passed to the shader directly
  m_lightAngle=0.0;

  // we are creating a shader called Texture
  shader->createShaderProgram("Texture");
  // now we are going to create empty shaders for Frag and Vert
  shader->attachShader("TextureVertex",ngl::VERTEX);
  shader->attachShader("TextureFragment",ngl::FRAGMENT);
  // attach the source
  shader->loadShaderSource("TextureVertex","/shaders/TextureVert.glsl");
  shader->loadShaderSource("TextureFragment","/shaders/TextureFrag.glsl");
  // compile the shaders
  shader->compileShader("TextureVertex");
  shader->compileShader("TextureFragment");
  // add them to the program
  shader->attachShaderToProgram("Texture","TextureVertex");
  shader->attachShaderToProgram("Texture","TextureFragment");
  // now bind the shader attributes for most NGL primitives we use the following
  // layout attribute 0 is the vertex data (x,y,z)
  shader->bindAttribute("Phong",0,"inVert");
  // attribute 1 is the UV data u,v (if present)
  shader->bindAttribute("Phong",1,"inUV");
  // attribute 2 are the normals x,y,z
  //shader->bindAttribute("Phong",2,"inNormal");

  // now we have associated this data we can link the shader
  shader->linkProgramObject("Texture");


  // we are creating a shader called Shadow
  shader->createShaderProgram("Shadow");
  // now we are going to create empty shaders for Frag and Vert
  shader->attachShader("ShadowVertex",ngl::VERTEX);
  shader->attachShader("ShadowFragment",ngl::FRAGMENT);
  // attach the source
  shader->loadShaderSource("ShadowVertex","/shaders/ShadowVert.glsl");
  shader->loadShaderSource("ShadowFragment","/shaders/ShadowFrag.glsl");
  // compile the shaders
  shader->compileShader("ShadowVertex");
  shader->compileShader("ShadowFragment");
  // add them to the program
  shader->attachShaderToProgram("Shadow","ShadowVertex");
  shader->attachShaderToProgram("Shadow","ShadowFragment");
  // now bind the shader attributes for most NGL primitives we use the following
  // layout attribute 0 is the vertex data (x,y,z)
  shader->bindAttribute("Phong",0,"inVert");
  // attribute 1 is the UV data u,v (if present)
  shader->bindAttribute("Phong",1,"inUV");
  // attribute 2 are the normals x,y,z
  shader->bindAttribute("Phong",2,"inNormal");

  // now we have associated this data we can link the shader
  shader->linkProgramObject("Shadow");
  // create the primitives to draw
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  prim->createSphere("sphere",0.5,50);
  prim->createTorus("torus",0.15,0.4,40,40);

  prim->createTrianglePlane("plane",14,14,80,80,ngl::Vec3(0,1,0));
  // now create our FBO and texture
  createFramebufferObject();
  // we need to enable depth testing
  glEnable(GL_DEPTH_TEST);
  // set the depth comparison mode
  glDepthFunc(GL_LEQUAL);
  // set the bg to black
  glClearColor(0,0,0,1.0f);
  // enable face culling this will be switch to front and back when
  // rendering shadow or scene
 // glEnable(GL_CULL_FACE);
 // glPolygonOffset(1.1,4);
//  m_text = new ngl::Text(QFont("Ariel",14));
//  m_text->setColour(1,1,1);


}

const static int TEXTURE_WIDTH=512;
const static int TEXTURE_HEIGHT=512;

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

void NGLDraw::loadMatricesToShadowShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  shader->use("Shadow");
  ngl::Mat4 MV;
  ngl::Mat4 MVP;
  ngl::Mat3 normalMatrix;
  ngl::Mat4 M;
  M=m_transform.getMatrix()*m_mouseGlobalTX;
  MV=  M*m_cam->getViewMatrix();
  MVP= M*m_cam->getVPMatrix();
  normalMatrix=MV;
  normalMatrix.inverse();
  shader->setShaderParamFromMat4("MV",MV);
  shader->setShaderParamFromMat4("MVP",MVP);
  shader->setShaderParamFromMat3("normalMatrix",normalMatrix);
  shader->setShaderParam3f("LightPosition",m_lightPosition.m_x,m_lightPosition.m_y,m_lightPosition.m_z);
  shader->setShaderParam4f("inColour",1,1,1,1);

  // x = x* 0.5 + 0.5
  // y = y* 0.5 + 0.5
  // z = z* 0.5 + 0.5
  // Moving from unit cube [-1,1] to [0,1]
  ngl::Mat4 bias;
  bias.scale(0.5,0.5,0.5);
  bias.translate(0.5,0.5,0.5);

  ngl::Mat4 view=m_lightCamera->getViewMatrix();
  ngl::Mat4 proj=m_lightCamera->getProjectionMatrix();
  ngl::Mat4 model=m_transform.getMatrix();

  ngl::Mat4 textureMatrix= model * view*proj * bias;
  shader->setShaderParamFromMat4("textureMatrix",textureMatrix);
}

void NGLDraw::loadToLightPOVShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  shader->use("nglColourShader");
  ngl::Mat4 MVP=m_transform.getMatrix()* m_lightCamera->getVPMatrix();
  shader->setShaderParamFromMat4("MVP",MVP);
}

void NGLDraw::drawScene(funcPointer _shaderFunc )
{
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

   // get the VBO instance and draw the built in teapot
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();

    // this is the same as calling
    //  ((*this).*(_shaderFunc))(m_transformStack);
    // but a lot more readable as to the intent
    // see the c++ faq link in header for more details
    m_transform.setScale(0.1,0.1,0.1);
    m_transform.setPosition(0.0f,-0.5f,0.0f);
    CALLMEMBERFUNC(*this,_shaderFunc)();
    prim->draw("troll");
    m_transform.reset();
    m_transform.setPosition(-3.0f,0.0f,0.0f);
    CALLMEMBERFUNC(*this,_shaderFunc)();
    prim->draw("sphere");
    m_transform.reset();
    m_transform.setPosition(3.0f,0.0f,0.0f);
    CALLMEMBERFUNC(*this,_shaderFunc)();
    prim->draw("cube");
    m_transform.reset();
    m_transform.setPosition(0.0f,0.0f,2.0f);
    CALLMEMBERFUNC(*this,_shaderFunc)();
    prim->draw("teapot");
    m_transform.reset();
    m_transform.setScale(0.1f,0.1f,0.1f);
    m_transform.setPosition(0.0f,-0.5f,-2.0f);
    CALLMEMBERFUNC(*this,_shaderFunc)();
    prim->draw("troll");
    m_transform.reset();
    m_transform.setPosition(2.0f,0.0f,-2.0f);
    CALLMEMBERFUNC(*this,_shaderFunc)();
    prim->draw("torus");
    m_transform.reset();
    m_transform.setPosition(0.0f,-0.5f,0.0f);
    CALLMEMBERFUNC(*this,_shaderFunc)();
    prim->draw("plane");

}

void NGLDraw::draw()
{
  //----------------------------------------------------------------------------------------------------------------------
  // Pass 1 render our Depth texture to the FBO
  //----------------------------------------------------------------------------------------------------------------------
  // enable culling
  glEnable(GL_CULL_FACE);

  // bind the FBO and render offscreen to the texture
  glBindFramebuffer(GL_FRAMEBUFFER,m_fboID);
  // bind the texture object to 0 (off )
  glBindTexture(GL_TEXTURE_2D,0);
  // we need to render to the same size as the texture to avoid
  // distortions
  glViewport(0,0,TEXTURE_WIDTH,TEXTURE_HEIGHT);

  // Clear previous frame values
  glClear( GL_DEPTH_BUFFER_BIT);
  // as we are only rendering depth turn off the colour / alpha
  //glColorMask(GL_FALSE, GL_FALSE, GL_FALSE, GL_FALSE);

  // render only the back faces so we don't get too much self shadowing
  glCullFace(GL_FRONT);
  // draw the scene from the POV of the light
  drawScene(&NGLDraw::loadToLightPOVShader);
  //----------------------------------------------------------------------------------------------------------------------
  // Pass two use the texture
  // now we have created the texture for shadows render the scene properly
  //----------------------------------------------------------------------------------------------------------------------
  // go back to our normal framebuffer

  glBindFramebuffer(GL_FRAMEBUFFER,0);
  // set the viewport to the screen dimensions
  glViewport(0, 0, 720,576);
  // enable colour rendering again (as we turned it off earlier)
  glColorMask(GL_TRUE, GL_TRUE, GL_TRUE, GL_TRUE);
  // clear the screen
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

  // bind the shadow texture
  glBindTexture(GL_TEXTURE_2D,m_textureID);

  // we need to generate the mip maps each time we bind
  glGenerateMipmap(GL_TEXTURE_2D);

  // now only cull back faces
  glDisable(GL_CULL_FACE);
  glCullFace(GL_BACK);
  // render our scene with the shadow shader
  drawScene(&NGLDraw::loadMatricesToShadowShader);
  //----------------------------------------------------------------------------------------------------------------------
  // this draws the debug texture on the quad
  //----------------------------------------------------------------------------------------------------------------------

  glBindTexture(GL_TEXTURE_2D,m_textureID);
  debugTexture(-0.6,-1,0.6,1);
  //----------------------------------------------------------------------------------------------------------------------
  // now we draw a cube to visualise the light
  //----------------------------------------------------------------------------------------------------------------------

  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  ngl::ShaderLib *shader = ngl::ShaderLib::instance();

  shader->use("nglColourShader");
  shader->setShaderParam4f("Colour",1,0,0,1);

  m_transform.reset();
  m_transform.setPosition(m_lightPosition);
  ngl::Mat4 MVP=m_transform.getMatrix() *m_cam->getVPMatrix();
  shader->setShaderParamFromMat4("MVP",MVP);
  prim->draw("cube");

  //----------------------------------------------------------------------------------------------------------------------
  // now draw the text
  //----------------------------------------------------------------------------------------------------------------------
  // we need to do this else the font will not render
  glDisable(GL_CULL_FACE);

//  QString text=QString("Light Position [%1,%2,%3]")
//                      .arg(m_lightPosition.m_x)
//                      .arg(m_lightPosition.m_y)
//                      .arg(m_lightPosition.m_z);

//  m_text->setColour(1,1,1);
//  m_text->renderText(250,20,text);
//  text.sprintf("Y Position %0.2f",m_lightYPos);
//  m_text->renderText(250,40,text);
//  text.sprintf("X offset %0.2f",m_lightXoffset);
//  m_text->renderText(250,60,text);
//  text.sprintf("Z offset %0.2f",m_lightZoffset);
//  m_text->renderText(250,80,text);
//
}

void NGLDraw::createFramebufferObject()
{

  // generate the framebuffer, renderbuffer, and texture object names
  glGenFramebuffers(1, &m_fboID);
  glGenRenderbuffers(1, &depthRenderbuffer);
  glGenTextures(1, &m_textureID);
  glBindTexture(GL_TEXTURE_2D, m_textureID);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, TEXTURE_WIDTH, TEXTURE_HEIGHT,0, GL_RGB, GL_UNSIGNED_SHORT_5_6_5, NULL);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  // bind renderbuffer and create a 16-bit depth buffer
  // width and height of renderbuffer = width and height of
  // the texture
  glBindRenderbuffer(GL_RENDERBUFFER, depthRenderbuffer);
  glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16,TEXTURE_WIDTH, TEXTURE_HEIGHT);
  // bind the framebuffer
  glBindFramebuffer(GL_FRAMEBUFFER, m_fboID);
  // specify texture as color attachment
  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,GL_TEXTURE_2D, m_textureID, 0);
  // specify depth_renderbufer as depth attachment
  glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthRenderbuffer);

  /*

  // Try to use a texture depth component
  glGenTextures(1, &m_textureID);
  glBindTexture(GL_TEXTURE_2D, m_textureID);
  //glTexParameteri(GL_TEXTURE_2D, GL_GENERATE_MIPMAP, GL_TRUE);

  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

  //glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_FUNC, GL_LEQUAL);
  //glTexParameteri(GL_TEXTURE_2D, GL_DEPTH_TEXTURE_MODE, GL_LUMINANCE);
  //glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_MODE, GL_COMPARE_R_TO_TEXTURE);

  glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE );
  glTexParameterf( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE );

  glTexImage2D( GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT16, TEXTURE_WIDTH, TEXTURE_HEIGHT, 0, GL_DEPTH_COMPONENT, GL_FLOAT, 0);


  glBindTexture(GL_TEXTURE_2D, 0);

  // create our FBO
  glGenFramebuffers(1, &m_fboID);
  glBindFramebuffer(GL_FRAMEBUFFER, m_fboID);
  // disable the colour and read buffers as we only want depth
 // glDrawBuffer(GL_NONE);
 // glReadBuffer(GL_NONE);

  // attach our texture to the FBO

  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT,GL_TEXTURE_2D, m_textureID, 0);

*/

  // switch back to window-system-provided framebuffer
  glBindFramebuffer(GL_FRAMEBUFFER, 0);
}


void NGLDraw::timerEvent( )
{
  updateLight();
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


void NGLDraw::updateLight()
{
  // change the light angle
  m_lightAngle+=0.05;
  m_lightPosition.set(m_lightXoffset*cos(m_lightAngle),m_lightYPos,m_lightXoffset*sin(m_lightAngle));
  // now set this value and load to the shader
  m_lightCamera->set(m_lightPosition,ngl::Vec3(0,0,0),ngl::Vec3(0,1,0));
}

void NGLDraw::debugTexture(float _t, float _b, float _l, float _r)
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  shader->use("Texture");
  ngl::Mat4 MVP=1;
  shader->setShaderParamFromMat4("MVP",MVP);
  glBindTexture(GL_TEXTURE_2D,m_textureID);

  ngl::VertexArrayObject *quad=ngl::VertexArrayObject::createVOA(GL_TRIANGLES);
  float* vert = new float[18];	// vertex array
  float* uv = new float[12];	// uv array
  vert[0] =_t; vert[1] =  _l; vert[2] =0.0;
  vert[3] = _t; vert[4] =  _r; vert[5] =0.0;
  vert[6] = _b; vert[7] = _l; vert[8]= 0.0;

  vert[9] =_b; vert[10]= _l; vert[11]=0.0;
  vert[12] =_t; vert[13]=_r; vert[14]=0.0;
  vert[15] =_b; vert[16]= _r; vert[17]=0.0;

  uv[0] =0.0; uv[1] =  1.0;
  uv[2] = 1.0; uv[3] =  1.0;
  uv[4] = 0.0; uv[5] = 0.0;

  uv[6] =0.0; uv[7]= 0.0;
  uv[8] =1.0; uv[9]= 1.0;
  uv[10] =1.0; uv[11]= 0.0;


  quad->bind();

  quad->setData(18*sizeof(GLfloat),vert[0]);
  quad->setVertexAttributePointer(0,3,GL_FLOAT,0,0);
  quad->setData(12*sizeof(GLfloat),uv[0]);
  quad->setVertexAttributePointer(1,2,GL_FLOAT,0,0);
  quad->setNumIndices(6);
  quad->draw();
  quad->unbind();
  quad->removeVOA();
  delete quad;
  delete uv;
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
