#include "NGLDraw.h"
#include <ngl/Quaternion.h>
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>
#include <ngl/NGLStream.h>
#include <boost/format.hpp>

const static float INCREMENT=0.01;
const static float ZOOM=0.05;
NGLDraw::NGLDraw()
{
  m_interp=0.0;
  m_srotation.set(45,90,80);
  m_erotation.set(-300,270,360);

  glColorMask (GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
  glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glEnable(GL_DEPTH_TEST);

  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background

  /// create our camera in this case we are generating it from
  /// the util lookAt function as the camera doesn't move
  ngl::Vec3 eye(0,0,3);
  ngl::Vec3 look(0,0,0);
  ngl::Vec3 up(0,1,0);
  m_lookAt=ngl::lookAt(eye,look,up);
  // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // we are going to use the built in nglDiffuse shader
  (*shader)["nglDiffuseShader"]->use();
  // set the directional light position colour and diffuse
  shader->setRegisteredUniform("lightPos",1.0f,1.0f,1.0f);
  shader->setRegisteredUniform("Colour",1.0f,0.0f,0.0f,1.0f);
  shader->setRegisteredUniform("lightDiffuse",1.0f,1.0f,1.0f,1.0f);
  m_projection=ngl::infinitePerspective(60.0f,1024.0/720.0,0.2f);

}

NGLDraw::~NGLDraw()
{
  std::cout<<"Shutting down NGL, removing VAO's and Shaders\n";
}

void NGLDraw::resize(int _w, int _h)
{
  glViewport(0,0,_w,_h);
  // now set the camera size values as the screen size has changed
  m_projection=ngl::infinitePerspective(60.0f,1024.0/720.0,0.2f);
}

void NGLDraw::draw()
{
  // clear the screen and depth buffer
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  // grab the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["nglDiffuseShader"]->use();


  // create some matrices to help with our rotations
  ngl::Mat4 start;
  ngl::Mat4 sx,sy,sz;
  ngl::Mat4 end;
  ngl::Mat4 ex,ey,ez;
  // we are going to create 3 rotation matrices and combine them
  // using x*y*z for our start rotation
  sx.rotateX(m_srotation.m_x);
  sy.rotateY(m_srotation.m_y);
  sz.rotateZ(m_srotation.m_z);
  start=sx*sy*sz;
  // same for the end rotation
  ex.rotateX(m_erotation.m_x);
  ey.rotateY(m_erotation.m_y);
  ez.rotateZ(m_erotation.m_z);
  end=ex*ey*ez;
  // just to demonstrate we can construct from a vec3 with x,y,z
  ngl::Quaternion startQuat(m_srotation);
  // or a matrix the ends are the same
  ngl::Quaternion endQuat(end);

  // Now we interpolate between the start and end quat using a value
  // from 0-1 this will return a quat
  ngl::Quaternion i=ngl::Quaternion::slerp(startQuat,endQuat,m_interp);
  // convert this Quat into a matrix and use this for the final
  // rotation
  ngl::Mat4 tx=i.toMat4();
  // now set this matrix to be the current transform for the tx stack
  // we now load this to the shaders
  m_transformStack.setCurrent(tx);
  shader->setRegisteredUniform("Colour",1.0f,1.0f,0.0f,1.0f);
  loadMatricesToShader();
  prim->draw("teapot");

  // in this case I will convert to a rotation matrix from the quat
  tx=startQuat.toMat4();
  // and set the position in the x to the teapot is on the left
  tx.m_30=-2.0;
  m_transformStack.setCurrent(tx);
  shader->setRegisteredUniform("Colour",1.0f,0.0f,0.0f,1.0f);
  loadMatricesToShader();
  prim->draw("teapot");
  // in this case we use the normal tx stack version instead
  m_transformStack.setPosition(2.0f,0.0f,0.0f);
  m_transformStack.setRotation(m_erotation);
  shader->setRegisteredUniform("Colour",0.0f,1.0f,0.0f,1.0f);

  loadMatricesToShader();
  prim->draw("teapot");
  m_startQuatText=boost::str(boost::format("%f [%f,%f,%f]") % startQuat.getS() % startQuat.getX() %startQuat.getY()%startQuat.getZ() )  ;
  m_endQuatText=boost::str(boost::format("%f [%f,%f,%f]") % endQuat.getS() % endQuat.getX() %endQuat.getY()%endQuat.getZ() )  ;
  m_interpQuatText=boost::str(boost::format("%f [%f,%f,%f]") % i.getS() % i.getX() %i.getY()%i.getZ() )  ;
  tx=i.toMat4();

  m_rotMatrixText=boost::str(boost::format("[%+0.5f %+0.5f,%+0.5f,%+0.5f]\n[%+0.5f %+0.5f,%+0.5f,%+0.5f]\n[%+0.5f %+0.5f,%+0.5f,%+0.5f]\n[%+0.5f %+0.5f,%+0.5f,%+0.5f]\n")
  % tx.m_00 %tx.m_01%tx.m_02%tx.m_03
  % tx.m_10 %tx.m_11%tx.m_12%tx.m_13
  % tx.m_20 %tx.m_11%tx.m_22%tx.m_23
  % tx.m_30 %tx.m_11%tx.m_32%tx.m_33);

}


void NGLDraw::loadMatricesToShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["nglDiffuseShader"]->use();

  ngl::Mat4 MVP;
  ngl::Mat4 MV;
  ngl::Mat3 normalMatrix;
  MV=m_transformStack.getCurrentTransform().getMatrix()*m_lookAt;
  MVP=MV*m_projection;
  normalMatrix=MV;
  normalMatrix.inverse();
  shader->setRegisteredUniform("MVP",MVP);
  shader->setRegisteredUniform("normalMatrix",normalMatrix);
}




