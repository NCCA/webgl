#ifndef BODY_H
#define BODY_H

#include <ngl/Camera.h>
#include <ngl/Obj.h>
#include <ngl/TransformStack.h>
#include <ngl/Vec3.h>

/// @file Body.h
/// @brief Body of the snake
/// @author Michelle Foley
/// @date 29/03/12
/// @class Body

/// @brief This is the Body Class where the functions for the body spheres are created
class Body
{
  public :
//----------------------------------------------------------------------------------------------------------------------
    /// @brief ctor
    /// @param _pos the initial position
    /// @param _rad the radius
    Body(
         ngl::Vec3 _pos,
         GLfloat _rad
        );

//----------------------------------------------------------------------------------------------------------------------
    /// @brief dtor
    ~Body();

//----------------------------------------------------------------------------------------------------------------------
    /// @brief variable that returns the radius (allows access to private variable)
    inline GLfloat getRadius() const {return m_radius;}

//----------------------------------------------------------------------------------------------------------------------
    /// @brief variable that sets the position (allows access to private variable to change the value)
    inline void setPos(ngl::Vec3 _pos){m_pos = _pos;}

//----------------------------------------------------------------------------------------------------------------------
    /// @brief variable that returns the position (allows access to private variable)
    inline ngl::Vec3 getPos() const {return m_pos;}

//----------------------------------------------------------------------------------------------------------------------
    /// @brief method to load the tx stack (+MVP) to the shader
    /// @param _tx the transform stack to use for the model part of the matrix
    /// @param *_cam camera
    void loadMatricesToShader(
                              ngl::TransformStack &_tx,
                              ngl::Camera *_cam
                             )const;

//----------------------------------------------------------------------------------------------------------------------
   /// @brief draw method
   /// @param &_shaderName shader name
   /// @param *_cam camera
   void draw(
             const std::string &_shaderName,
             ngl::Camera *_cam
            );

//----------------------------------------------------------------------------------------------------------------------
   /// @brief function to update Body of snake
   /// @param m_pos position of Body
   /// @param m_dir direction of Body
   void updateBody (
                    ngl::Vec3 m_pos,
                    ngl::Vec3 m_dir
                   );

private :
//----------------------------------------------------------------------------------------------------------------------
    /// @brief the position of the Body
    ngl::Vec3 m_pos;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief the direction of the Body
    ngl::Vec3 m_dir;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief the radius of the Body
    GLfloat m_radius;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief head movement increment
    const static float s_increment;

//----------------------------------------------------------------------------------------------------------------------
    /// @brief a transform stack
    ngl::TransformStack m_transform;

  };

#endif
