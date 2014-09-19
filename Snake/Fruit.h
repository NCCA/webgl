#ifndef __Fruit_H__
#define __Fruit_H__

#include <ngl/Camera.h>
#include <ngl/Obj.h>
#include <ngl/TransformStack.h>
#include <ngl/Vec3.h>

/// @file Fruit.h
/// @brief Fruit of the snake
/// @author Michelle Foley
/// @date 29/03/12
/// @class Fruit

/// @brief This is the Fruit Class where the functions for the fruit sphere are created
class Fruit
{
  public :
//----------------------------------------------------------------------------------------------------------------------
    /// @brief ctor
    /// @param _pos the initial position
    Fruit(
         ngl::Vec3 _pos
         );

//----------------------------------------------------------------------------------------------------------------------
    /// @brief dtor
    ~Fruit();

//----------------------------------------------------------------------------------------------------------------------
   /// @brief variable that returns the position (allows access to private variable)
   inline ngl::Vec3 getPos() const {return m_pos;}

//----------------------------------------------------------------------------------------------------------------------
   /// @brief variable that returns the score (allows access to private variable)
   int getScore()const {return m_score;}

//----------------------------------------------------------------------------------------------------------------------
   /// @brief draw method
   /// @param &_shader shader name
   /// @param *_cam camera
   void draw(
              const std::string &_shader,
              ngl::Camera *_cam
             );

//----------------------------------------------------------------------------------------------------------------------
   /// @brief function to update Fruit
   void updateFruit();

//----------------------------------------------------------------------------------------------------------------------
   /// @brief function to create a score
   /// @param _score the integer increase called
   int Score(int _score);

  private :
//----------------------------------------------------------------------------------------------------------------------
    /// @brief the position of the Fruit
    ngl::Vec3 m_pos;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief create the sphere for Fruit
    ngl::Obj m_sphere;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief the Score
    int m_score;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief a transform stack
    ngl::TransformStack m_transform;

};

#endif
