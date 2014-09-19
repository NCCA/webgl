#ifndef __Head_H__
#define __Head_H__

#include <ngl/Camera.h>
#include <ngl/Vec3.h>
#include <ngl/Obj.h>
#include <ngl/TransformStack.h>

/// @file Head.h
/// @brief Head of the snake
/// @author Michelle Foley
/// @date 29/03/12
/// @class Head

/// @brief This is the Head Class where the functions for the head sphere are created
class Head
{

  public :
//----------------------------------------------------------------------------------------------------------------------
    /// @brief ctor
    /// @param _pos the initial position
    /// @param _rad the radius of the Head
    Head(
         ngl::Vec3 _pos,
         GLfloat _rad
        );

//----------------------------------------------------------------------------------------------------------------------
    /// @brief dtor
    ~Head();

//----------------------------------------------------------------------------------------------------------------------
    /// @brief variable that returns the radius (allows access to private variable)
    inline GLfloat getRadius() const {return m_radius;}

//----------------------------------------------------------------------------------------------------------------------
    /// @brief variable that returns the position (allows access to private variable)
    inline ngl::Vec3 getPos() const {return m_pos;}

//----------------------------------------------------------------------------------------------------------------------
    /// @brief variable that returns the last position (allows access to private variable)
    inline ngl::Vec3 getLastPos() {return m_lastPos;}

//----------------------------------------------------------------------------------------------------------------------
    /// @brief variable that returns the direction (allows access to private variable)
    inline ngl::Vec3 getDir() {return m_dir;}

//----------------------------------------------------------------------------------------------------------------------
    /// @brief variable that returns the speed (allows access to private variable)
    float getSpeed()const {return m_speed;}

//----------------------------------------------------------------------------------------------------------------------
    /// @brief variable that sets the speed (allows access to private variable to change the value)
    inline void setSpeed(float _speed){m_speed = _speed;}

//----------------------------------------------------------------------------------------------------------------------
    /// @brief draw method
    /// @param _shader shader name
    /// @param *_cam the camera
    void draw(
              const std::string &_shader,
              ngl::Camera *_cam
             );

//----------------------------------------------------------------------------------------------------------------------
    /// @brief move method
    /// @param _x x-co-ordinates for direction
    /// @param _z z-co-ordinates for direction
    void move(
              float _x,
              float _z
             );

//----------------------------------------------------------------------------------------------------------------------
    /// @brief function to update
    void update ();


private :
//----------------------------------------------------------------------------------------------------------------------
    /// @brief the position of the Head
    ngl::Vec3 m_pos;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief the direction of the Head
    ngl::Vec3 m_dir;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief the last position of the Head
    ngl::Vec3 m_lastPos;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief the speed of the Head
    float m_speed;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief the radius of the Head
    GLfloat m_radius;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief the pointer of the Head
    ngl::Obj m_sphere;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief head movement increment
    const static float s_increment;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief a transform stack
    ngl::TransformStack m_transform;

};

#endif
