#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>
#include <ngl/Texture.h>

const static float INCREMENT=0.01;
const static float ZOOM=0.05;
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
  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(0,1,2);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,1,0);
  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(45,(float)720.0/576.0,0.5,150);
  // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // load a frag and vert shaders

  shader->createShaderProgram("TextureShader");

  shader->attachShader("SimpleVertex",ngl::VERTEX);
  shader->attachShader("SimpleFragment",ngl::FRAGMENT);
  shader->loadShaderSource("SimpleVertex","/shaders/TextureVertex.glsl");
  shader->loadShaderSource("SimpleFragment","/shaders/TextureFragment.glsl");

  shader->compileShader("SimpleVertex");
  shader->compileShader("SimpleFragment");
  shader->attachShaderToProgram("TextureShader","SimpleVertex");
  shader->attachShaderToProgram("TextureShader","SimpleFragment");


  shader->linkProgramObject("TextureShader");
  shader->use("TextureShader");
  shader->registerUniform("TextureShader","MVP");

  createCube(0.2);
  loadTexture();
  m_text = new ngl::Text("/fonts/arial.ttf",14);
  m_text->setScreenSize(720,576);


}

void NGLDraw::loadMatricesToShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();

  ngl::Mat4 MVP=m_transformStack.getCurrentTransform().getMatrix()
                *m_mouseGlobalTX*m_cam->getVPMatrix();

  shader->setRegisteredUniform("MVP",MVP);
}
void NGLDraw::loadTexture()
{
  ngl::Texture t("/textures/crate.bmp");
  m_textureName=t.setTextureGL();

  glBindTexture(GL_TEXTURE_2D,m_textureName);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST_MIPMAP_NEAREST);

  glGenerateMipmap(GL_TEXTURE_2D); //  Allocate the mipmaps

}

//----------------------------------------------------------------------------------------------------------------------
/// @brief create a cube and stuff it into a VBO on the GPU
/// @param[in] _scale a scale factor for the unit vertices
void NGLDraw::createCube( GLfloat _scale )
{

   // vertex coords array
  GLfloat vertices[] = {
                        -1,1,-1,1,1,-1,1,-1,-1, -1,1,-1,-1,-1,-1,1,-1,-1, //back
                        -1,1,1,1,1,1,1,-1,1, -1,-1,1, 1,-1,1,-1,1,1,  //front
                        -1,1,-1, 1,1,-1, 1,1,1, -1,1,1, 1,1,1, -1,1,-1, // top
                        -1,-1,-1, 1,-1,-1, 1,-1,1, -1,-1,1, 1,-1,1, -1,-1,-1, // bottom
                        -1,1,-1,-1,1,1,-1,-1,-1, -1,-1,-1,-1,-1,1,-1,1,1, // left
                        1,1,-1,1,1,1,1,-1,-1, 1,-1,-1,1,-1,1,1,1,1, // left

                        };
  GLfloat texture[] = {
                        0,0,0,1,1,1 ,0,0,1,0,1,1, //back
                        0,1,1,0,1,1 ,0,0,1,0,0,1, // front
                        0,0,1,0,1,1 ,0,1,1,1,0,0, //top
                        0,0,1,0,1,1 ,0,1,1,1,0,0, //bottom
                        1,0,1,1,0,0 ,0,0,0,1,1,1, // left
                        1,0,1,1,0,0 ,0,0,0,1,1,1, // right

                        };


  std::cout<<sizeof(vertices)/sizeof(GLfloat)<<"\n";
  // first we scale our vertices to _scale
  for(unsigned int i=0; i<sizeof(vertices)/sizeof(GLfloat); ++i)
  {
    vertices[i]*=_scale;
  }

  // first we create a vertex array Object
  glGenVertexArraysOES(1, &m_vaoID);

  // now bind this to be the currently active one
  glBindVertexArrayOES(m_vaoID);
  // now we create two VBO's one for each of the objects these are only used here
  // as they will be associated with the vertex array object
  GLuint vboID[2];
  glGenBuffers(2, &vboID[0]);
  // now we will bind an array buffer to the first one and load the data for the verts
  glBindBuffer(GL_ARRAY_BUFFER, vboID[0]);
  glBufferData(GL_ARRAY_BUFFER, sizeof(vertices)*sizeof(GLfloat), vertices, GL_STATIC_DRAW);
  // now we bind the vertex attribute pointer for this object in this case the
  // vertex data
  glVertexAttribPointer(0,3,GL_FLOAT,false,0,0);
  glEnableVertexAttribArray(0);
  // now we repeat for the UV data using the second VBO
  glBindBuffer(GL_ARRAY_BUFFER, vboID[1]);
  glBufferData(GL_ARRAY_BUFFER, sizeof(texture)*sizeof(GLfloat), texture, GL_STATIC_DRAW);
  glVertexAttribPointer(1,2,GL_FLOAT,false,0,0);
  glEnableVertexAttribArray(1);

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
 // build our transform stack
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
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["TextureShader"]->use();
  // now we bind back our vertex array object and draw
  glBindVertexArrayOES(m_vaoID);		// select first VAO

  int instances=0;
  // need to bind the active texture before drawing
  glBindTexture(GL_TEXTURE_2D,m_textureName);

	for (float z=-14; z<15; z+=0.5)
		{
		for (float x=-14; x<15; x+=0.5)
		{
		m_transformStack.pushTransform();
		{
			m_transformStack.setRotation(x*20,(x*z)*40,z*2);

       m_transformStack.setPosition(x,0.49,z);
       loadMatricesToShader();
       ++instances;
       glDrawArrays(GL_TRIANGLES, 0,36 );	// draw object
    } // and before a pop
     m_transformStack.popTransform();

	 }
	}
//	// calculate and draw FPS
//	m_text->setColour(1,1,0);
//	QString text=QString("Texture and Vertex Array Object %1 instances Demo %2 fps").arg(instances).arg(m_fps);
//	m_text->renderText(10,20,text);
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
