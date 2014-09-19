#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>
#include <boost/format.hpp>

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
  m_time=0;
  m_animate=true;


  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background
 
  // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // we are creating a shader called Phong
  shader->createShaderProgram("Phong");
  // now we are going to create empty shaders for Frag and Vert
  shader->attachShader("PhongVertex",ngl::VERTEX);
  shader->attachShader("PhongFragment",ngl::FRAGMENT);
  // attach the source
  shader->loadShaderSource("PhongVertex","shaders/PhongVertex.glsl");
  shader->loadShaderSource("PhongFragment","shaders/PhongFragment.glsl");
  // compile the shaders
  shader->compileShader("PhongVertex");
  shader->compileShader("PhongFragment");
  // add them to the program
  shader->attachShaderToProgram("Phong","PhongVertex");
  shader->attachShaderToProgram("Phong","PhongFragment");
  // now bind the shader attributes for most NGL primitives we use the following
  // layout attribute 0 is the vertex data (x,y,z)
  shader->bindAttribute("Phong",0,"inVert");
  // attribute 1 is the UV data u,v (if present)
  shader->bindAttribute("Phong",1,"inUV");
  // attribute 2 are the normals x,y,z
  shader->bindAttribute("Phong",2,"inNormal");

  // now we have associated this data we can link the shader
  shader->linkProgramObject("Phong");
  // and make it active ready to load values
  (*shader)["Phong"]->use();
  // the shader will use the currently active material and light0 so set them
  ngl::Material m(ngl::GOLD);
  // load our material values to the shader into the structure material (see Vertex shader)
  m.loadToShader("material");
  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(0,0,20);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,1,0);
  // now load to our new camera
  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(45,(float)720/576,0.05,350);
  shader->setShaderParam3f("viewerPos",m_cam->getEye().m_x,m_cam->getEye().m_y,m_cam->getEye().m_z);
  // now create our light this is done after the camera so we can pass the
  // transpose of the projection matrix to the light to do correct eye space
  // transformations
  ngl::Mat4 iv=m_cam->getViewMatrix();
  iv.transpose();
  m_light = new ngl::Light(ngl::Vec3(-2,5,2),ngl::Colour(1,1,1,1),ngl::Colour(1,1,1,1),ngl::POINTLIGHT);
  m_light->setTransform(iv);
  // load these values to the shader as well
  m_light->loadToShader("light");
  m_text = new ngl::Text("/fonts/arial.ttf",16);
  m_text->setColour(1,1,1);
  m_text->setScreenSize(720,576);
  glViewport(0,0,720,576);


}

void NGLDraw::loadMatricesToShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();

  ngl::Mat4 MV;
  ngl::Mat4 MVP;
  ngl::Mat3 normalMatrix;
  ngl::Mat4 M;
  M=m_transformStack.getCurrentTransform().getMatrix();
  MV=  M*m_cam->getViewMatrix();
  MVP=  MV*m_cam->getProjectionMatrix();
  normalMatrix=MV;
  normalMatrix.inverse();
  shader->setShaderParamFromMat4("MV",MV);
  shader->setShaderParamFromMat4("MVP",MVP);
  shader->setShaderParamFromMat3("normalMatrix",normalMatrix);
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
  (*shader)["Phong"]->use();


  static ngl::Vec3 start(-8,-5,0);
  static ngl::Vec3 end(8,5,0);


   // get the VBO instance and draw the built in teapot
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  // draw
  ngl::Vec3 lpos=ngl::lerp(start,end,m_time);
  m_transformStack.setPosition(lpos);
  ngl::Material m(ngl::GOLD);
  // load our material values to the shader into the structure material (see Vertex shader)
  m.loadToShader("material");

  loadMatricesToShader();
  prim->draw("teapot");


  ngl::Vec3 tpos=ngl::trigInterp(start,end,m_time);
  tpos.m_y=tpos.m_y+2.0;
  m_transformStack.setPosition(tpos);
  m.change(ngl::PEWTER);
      // load our material values to the shader into the structure material (see Vertex shader)
  m.loadToShader("material");

  loadMatricesToShader();
  prim->draw("teapot");

  ngl::Vec3  cpos=ngl::cubic(start,end,m_time);
  cpos.m_y=cpos.m_y-2.0;
  m_transformStack.setPosition(cpos);
  m.change(ngl::BRASS);
      // load our material values to the shader into the structure material (see Vertex shader)
  m.loadToShader("material");

  loadMatricesToShader();
  prim->draw("teapot");
  std::string text;
  text=boost::str(boost::format("T= %0.2f") % m_time  );

  m_text->renderText(10,18,text );
  text=boost::str(boost::format("Trigonomic interpolation [%0.4f %0.4f %0.4f]") % tpos.m_x % tpos.m_y % tpos.m_z  );
  m_text->renderText(10,40,text );
  text=boost::str(boost::format("Linear interpolation [%0.4f %0.4f %0.4f]") % lpos.m_x % lpos.m_y % lpos.m_z  );

  m_text->renderText(10,60,text );
  text=boost::str(boost::format("Cubic interpolation [%0.4f %0.4f %0.4f]") % cpos.m_x % cpos.m_y % cpos.m_z  );
  m_text->renderText(10,80,text );
}




void NGLDraw::timerEvent( )
{
  if(m_animate==true)
  {
    m_time+=0.01;
    if (m_time >=1.0)
    {
      m_time=0.0;
    }
  }
}






void NGLDraw::keyEvent(const SDLKey &_key)
{
	switch(_key)
	{
		case SDLK_SPACE : m_animate^=true; break;
	case SDLK_LEFT :
				m_time-=0.01f;
				if(m_time<0.0f)
					m_time=0.0f;
		break;
		case SDLK_RIGHT :
				m_time+=0.01f;
				if(m_time>1.0f)
					m_time=1.0f;
		break;
		default : break;
	}

}


