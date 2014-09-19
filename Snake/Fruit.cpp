/// @file Fruit.cpp
/// @brief Fruit created

#include "Fruit.h"

#include <ngl/Random.h>
#include <ngl/ShaderLib.h>
#include <ngl/VAOPrimitives.h>

//----------------------------------------------------------------------------------------------------------------------
// Fruit fuction stores the position values for the Body to use for the program when initialised
//----------------------------------------------------------------------------------------------------------------------
Fruit::Fruit(
             ngl::Vec3 _pos
            )
{
   m_pos = _pos;
   m_score = 0;
   ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
   prim->createSphere("fruit", 1.5, 80);
}

//----------------------------------------------------------------------------------------------------------------------
// Destructor function, anything that needs tidying up and clearing is entered here.
//----------------------------------------------------------------------------------------------------------------------
Fruit::~Fruit()
{

}

//----------------------------------------------------------------------------------------------------------------------
// Function to draw the body sphere using the shaders and positions set
//----------------------------------------------------------------------------------------------------------------------
void Fruit::draw(
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
   prim->draw("fruit");
}

//----------------------------------------------------------------------------------------------------------------------
// update function sets the position of the fruit by getting random points between the values given
// for the x, y and z co-ordinates
//----------------------------------------------------------------------------------------------------------------------
void Fruit::updateFruit()
{
   ngl::Random *rng=ngl::Random::instance();
   rng->setSeed();
   ngl::Vec3 r_pos=rng->getRandomPoint(35,0,35);
   m_pos = r_pos;
}

//----------------------------------------------------------------------------------------------------------------------
// score function creates the score by setting parameters for the _score
// sets _score value to ngl::Vec3 m_score
//----------------------------------------------------------------------------------------------------------------------
int Fruit::Score(int _score)
{
   m_score += _score;
}


