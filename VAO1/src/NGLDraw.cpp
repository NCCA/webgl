#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
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
	m_cam->setShape(45,(float)720.0/576.0,0.001,150);
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
	(*shader)["TextureShader"]->use();
	// build our VertexArrayObject
	buildVAOSphere();
	// load and set a texture
	ngl::Texture t("textures/earth.png");
	t.setTextureGL();
	glViewport(0,0,720,576);

}


// a simple structure to hold our vertex data
struct vertData
{
  GLfloat u;
  GLfloat v;
  GLfloat nx;
  GLfloat ny;
  GLfloat nz;
  GLfloat x;
  GLfloat y;
  GLfloat z;
};

void NGLDraw::buildVAOSphere()
{
	//  Sphere code based on a function Written by Paul Bourke.
	//  http://astronomy.swin.edu.au/~pbourke/opengl/sphere/
	// first we grab an instance of our VOA class as a TRIANGLE_STRIP
	m_vaoSphere= ngl::VertexArrayObject::createVOA(GL_TRIANGLE_STRIP);
	// next we bind it so it's active for setting data
	m_vaoSphere->bind();
	// the next part of the code calculates the P,N,UV of the sphere for tri_strips
	int buffSize;

	float theta1 = 0.0;
	float theta2 = 0.0;
	float theta3 = 0.0;


  float radius=1.0;
  float precision=80;
  // a std::vector to store our verts, remember vector packs contiguously so we can use it
  buffSize = (precision/2) * ((precision+1)*2);

	std::vector <vertData> data(buffSize);
	// calculate how big our buffer is
	// Disallow a negative number for radius.
	if( radius < 0 )
	{
	radius = -radius;
	}
	// Disallow a negative number for _precision.
	if( precision < 4 )
	{
	precision = 4;
	}
	// now fill in a vertData structure and add to the data list for our sphere
	vertData d;
	unsigned int index=0;
	for( int i = 0; i < precision/2; ++i )
	{
		theta1 = i * ngl::TWO_PI / precision - ngl::PI2;
		theta2 = (i + 1) * ngl::TWO_PI / precision - ngl::PI2;

		for( int j = 0; j <= precision; ++j )
		{
			theta3 = j * ngl::TWO_PI / precision;

			d.nx = cosf(theta2) * cosf(theta3);
			d.ny = sinf(theta2);
			d.nz = cosf(theta2) * sinf(theta3);
			d.x = radius * d.nx;
			d.y = radius * d.ny;
			d.z = radius * d.nz;

			d.u  = (j/(float)precision);
			d.v  = 2*(i+1)/(float)precision;

			data[index++]=d;

			d.nx = cosf(theta1) * cosf(theta3);
			d.ny = sinf(theta1);
			d.nz = cosf(theta1) * sinf(theta3);
			d.x = radius * d.nx;
			d.y = radius * d.ny;
			d.z = radius * d.nz;

			d.u  = (j/(float)precision);
			d.v  = 2*i/(float)precision;
			data[index++]=d;
		} // end inner loop
	}// end outer loop


	// now we have our data add it to the VAO, we need to tell the VAO the following
	// how much (in bytes) data we are copying
	// a pointer to the first element of data (in this case the address of the first element of the
	// std::vector
	m_vaoSphere->setData(buffSize*sizeof(vertData),data[0].u);
	// in this case we have packed our data in interleaved format as follows
	// u,v,nx,ny,nz,x,y,z
	// If you look at the shader we have the following attributes being used
	// attribute vec3 inVert; attribute 0
	// attribute vec2 inUV; attribute 1
	// attribute vec3 inNormal; attribure 2
	// so we need to set the vertexAttributePointer so the correct size and type as follows
	// vertex is attribute 0 with x,y,z(3) parts of type GL_FLOAT, our complete packed data is
	// sizeof(vertData) and the offset into the data structure for the first x component is 5 (u,v,nx,ny,nz)..x
		m_vaoSphere->setVertexAttributePointer(0,3,GL_FLOAT,sizeof(vertData),5);
	// uv same as above but starts at 0 and is attrib 1 and only u,v so 2
	m_vaoSphere->setVertexAttributePointer(1,2,GL_FLOAT,sizeof(vertData),0);
	// normal same as vertex only starts at position 2 (u,v)-> nx
	m_vaoSphere->setVertexAttributePointer(2,3,GL_FLOAT,sizeof(vertData),2);
	// now we have set the vertex attributes we tell the VAO class how many indices to draw when
	// glDrawArrays is called, in this case we use buffSize (but if we wished less of the sphere to be drawn we could
	// specify less (in steps of 3))
	m_vaoSphere->setNumIndices(buffSize);
	// finally we have finished for now so time to unbind the VAO
	m_vaoSphere->unbind();
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
	ngl::Mat4 MVP;
	MVP=m_transformStack.getCurrentTransform().getMatrix()
			*m_mouseGlobalTX*m_cam->getVPMatrix();

	shader->setShaderParamFromMat4("MVP",MVP);

	// now we bind back our vertex array object and draw
	m_vaoSphere->bind();
	m_vaoSphere->draw();
	// now we are done so unbind
	m_vaoSphere->unbind();
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
