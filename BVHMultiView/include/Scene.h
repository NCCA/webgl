#ifndef __SCENE_H__
#define __SCENE_H__

#include <ngl/Camera.h>
#include <ngl/Vec3.h>
#include <ngl/Colour.h>
#include <list>
#include "Bvh.h"

/// @file Scene.h
/// @brief a simple Scene class, Revised from Jon's ParticleFactory
/// @author Jonathan Macey, Xiaosong Yang
/// @version 1.0
/// @date 24/02/13
/// @class Scene
/// @brief this class acts as an Scene for the moving character
class Bvh;

typedef struct WALL{
    ngl::Vec3   centre;
    float   size;
    float   a;
    float   b;
    float   c;
    float   d;
    bool    draw_flag;
} Wall;

class Scene
{
  public :
    /// @brief ctor
    /// @param[in] _t a pointer to the global transform stack
    /// @param[in] _cam a pointer to the global camera
    Scene(ngl::TransformStack *_t, const ngl::Mat4 *_view, const ngl::Mat4 *_proj);

    /// @dtor will explicitly call the Particle dtors as they are stored as pointers
    ~Scene();
    /// @brief update all the particles stored, if the particle died, delete it
    void update();
    /// @brief draw all the particles using the particle draw method
    void draw() const;
    /// @brief add a new particle to the end of the list
    /// @param[in] _character the pointer to the bvh data
    void addCharacter(Bvh *_character);
    inline unsigned int getNumCharacters()const {return m_numCharacters;}
    /// @brief get the global camera
   // inline const ngl::Camera *getCamera() const {return m_cam;}
    /// @brief get the global transform stack
    inline ngl::TransformStack *getTransformStack() const {return m_transform;}
    /// @brief a method to clear all characters
    void clearCharacters();
    /// @brief replay motins
    void replay();
    void forwardAnimation();
    void backwardAnimation();
    /// @brief add a new wall
    /// @param[in] _point center of the wall
    /// @param[in] _size size of the wall
    /// @param[in] _normal normal of the wall
    /// @param[in] _draw if the wall will be drew in the scene
    void addNewWall(ngl::Vec3 _point, float size, ngl::Vec3 _normal, bool _draw);
    /// @brief add a new wall
    void deleteAllWalls();
    /// @brief pause the animation, no update
    inline void pauseAnimationAndContinue(){paused = 1-paused;};
    /// @brief get rotation angle, rotate y axis to normal
    ngl::Vec3 getRotationFromY(ngl::Vec3 _vec) const;
    int getCurrentFrameNumber();
    inline void setActiveAnimation(int _i){m_currentAnimation=_i;}
    ngl::Mat4 getVP(){return *m_view**m_proj;}

  private :
    /// @brief the character list stores a pointer to each character
    std::vector <Bvh *> m_characters;
    /// @brief the global transform stack, used for global rotation only so could be replaced with
    /// a single matrix if required
    ngl::TransformStack *m_transform;
    /// @brief a pointer to the current camera, this is used for accesing the VP matrix to load to the
    /// shader
    //const ngl::Camera *m_cam;
    const ngl::Mat4 *m_view;
    const ngl::Mat4 *m_proj;

    /// @brief the number of particles
    unsigned int m_numCharacters;
    /// @brief the wall list
    std::vector <Wall *> m_walls;
    /// @brief pause the animation
    bool   paused;
    int m_currentAnimation;
};


#endif