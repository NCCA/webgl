/// @file Head.cpp
/// @brief Head is created

#include "Head.h"

#include <ngl/ShaderLib.h>
#include <ngl/VAOPrimitives.h>

//----------------------------------------------------------------------------------------------------------------------
// Head fuction holds the values for the head position, radius and speed when initialised
// also creates the sphere now so that it isnt being created during every updateGL
//----------------------------------------------------------------------------------------------------------------------
Head::Head(
           ngl::Vec3 _pos,
           GLfloat _rad
          )
 {
   m_pos=_pos;
   m_radius=_rad;
   m_speed = 4.000;

   ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
   prim->createSphere("sphere", 2, 80);
 }

//----------------------------------------------------------------------------------------------------------------------
// Destructor function, anything that needs tidying up and clearing is entered here.
//----------------------------------------------------------------------------------------------------------------------
Head::~Head()
{

}

//----------------------------------------------------------------------------------------------------------------------
// Function to draw the body sphere using the shaders and positions set
//----------------------------------------------------------------------------------------------------------------------
void Head::draw(
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
  prim->draw("sphere");
}

//----------------------------------------------------------------------------------------------------------------------
// Function to move the Head, sets the x and z co-ordinates to the direction vectors
// if statement tells the head to move one direction if not already already heading the opposite direction
//----------------------------------------------------------------------------------------------------------------------
void Head::move(
                float _x,
                float _z
               )
{
    if (m_dir.m_x == -_x)
    {
        m_dir.m_x = -_x;
    }
    else
    {
        m_dir.m_x = _x;
    }

    if (m_dir.m_z == -_z)
    {
        m_dir.m_z = -_z;
    }
    else
    {
        m_dir.m_z = _z;
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Sets the parameters of the so the head can not go further then allowed.
//----------------------------------------------------------------------------------------------------------------------
const static float s_xExtents=38;
const static float s_zExtents=38;

//----------------------------------------------------------------------------------------------------------------------
// update function sets the position of the head as the last position
// also adds and reads the direction so that the head keeps going in the same direction until told otherwise
//----------------------------------------------------------------------------------------------------------------------
void Head::update(
                    )
{
    m_lastPos = m_pos;
    m_pos += m_dir;

//----------------------------------------------------------------------------------------------------------------------
// if the x position of the head is less then or equal to the minus value given -0.5
//then the sphere should jump to the position value given else if, reverse the algorithm
// same again for the z position
//----------------------------------------------------------------------------------------------------------------------
    if(m_pos.m_x <= -s_xExtents - 0.5)
    {
        m_pos.m_x = s_xExtents;
    }
    else if (m_pos.m_x >= s_xExtents + 0.5)
    {
        m_pos.m_x = -s_xExtents;
    }


    if(m_pos.m_z <= -s_zExtents - 0.5)
    {
        m_pos.m_z = s_zExtents;
    }
    else if (m_pos.m_z >= s_zExtents + 0.5)
    {
        m_pos.m_z = -s_zExtents;
    }

}

