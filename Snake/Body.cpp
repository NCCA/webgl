/// @file Body.cpp
/// @brief Snake body created

#include "Body.h"

#include <ngl/ShaderLib.h>
#include <ngl/VAOPrimitives.h>


//----------------------------------------------------------------------------------------------------------------------
// Body fuction stores the position and radius values for the Body to use for the program when initialised
//----------------------------------------------------------------------------------------------------------------------
Body::Body(
           ngl::Vec3 _pos,
           GLfloat _rad
          )
    {
    m_pos=_pos;
    m_radius=_rad;
    }

//----------------------------------------------------------------------------------------------------------------------
// Destructor function, anything that needs tidying up and clearing is entered here.
//----------------------------------------------------------------------------------------------------------------------
    Body::~Body()
    {

    }

//----------------------------------------------------------------------------------------------------------------------
// Funtion to load matrices to shader for the body sphere's created
//----------------------------------------------------------------------------------------------------------------------
void Body::loadMatricesToShader(
                                ngl::TransformStack &_tx,
                                ngl::Camera *_cam
                               ) const
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();

  ngl::Mat4 MV;
  ngl::Mat4 MVP;
  ngl::Mat3 normalMatrix;
  ngl::Mat4 M;
  M=_tx.getCurrentTransform().getMatrix();
  MV=_tx.getCurrAndGlobal().getMatrix()*_cam->getViewMatrix() ;
  MVP=MV*_cam->getProjectionMatrix();
  normalMatrix=MV;
  normalMatrix.inverse();
  shader->setShaderParamFromMat4("MV",MV);
  shader->setShaderParamFromMat4("MVP",MVP);
  shader->setShaderParamFromMat3("normalMatrix",normalMatrix);
  shader->setShaderParamFromMat4("M",M);
}
//----------------------------------------------------------------------------------------------------------------------
// Function to draw the body sphere using the shaders and positions set
//----------------------------------------------------------------------------------------------------------------------
void Body::draw(
                const std::string &_shader,
                ngl::Camera *_cam
               )
{
    ngl::ShaderLib *shader=ngl::ShaderLib::instance();
    (*shader)[_shader]->use();

    m_transform.getCurrentTransform().setPosition(m_pos);

    ngl::Mat4 MVP= m_transform.getCurrentTransform().getMatrix() * _cam->getVPMatrix() ;
    shader->setShaderParamFromMat4("MVP",MVP);

    ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
    prim->draw("body");
}
















