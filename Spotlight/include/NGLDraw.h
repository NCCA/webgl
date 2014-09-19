#ifndef NGLDRAW_H__
#define NGLDRAW_H__

#include <ngl/Camera.h>
#include <ngl/Colour.h>
#include <ngl/SpotLight.h>
#include <ngl/TransformStack.h>

#include <SDL.h>
class SpotData
{
public :
  //----------------------------------------------------------------------------------------------------------------------
  /// @brief the time offset for the spot
  //----------------------------------------------------------------------------------------------------------------------
  float m_time;
  //----------------------------------------------------------------------------------------------------------------------
  /// @brief x radius of ellipse
  //----------------------------------------------------------------------------------------------------------------------
  float m_radiusX;
  //----------------------------------------------------------------------------------------------------------------------
  /// @brief z radius of the ellipse
  //----------------------------------------------------------------------------------------------------------------------
  float m_radiusZ;
  //----------------------------------------------------------------------------------------------------------------------
  /// @brief current mix factor of the light for Lerp of colours
  //----------------------------------------------------------------------------------------------------------------------
  float m_mix;
  //----------------------------------------------------------------------------------------------------------------------
  /// @brief aim center of the spot where the ellipse is centered
  //----------------------------------------------------------------------------------------------------------------------
  ngl::Vec3 m_aimCenter;
  //----------------------------------------------------------------------------------------------------------------------
  /// @brief start colour of light interpolated to end colour
  //----------------------------------------------------------------------------------------------------------------------
  ngl::Colour m_startColour;
  //----------------------------------------------------------------------------------------------------------------------
  /// @brief end colour of the light
  //----------------------------------------------------------------------------------------------------------------------
  ngl::Colour m_endColour;
};




class NGLDraw
{
  public :
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief ctor this will have a valid OpenGL context so we can create gl stuff
    //----------------------------------------------------------------------------------------------------------------------
    NGLDraw();
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief dtor used to remove any NGL stuff created
    //----------------------------------------------------------------------------------------------------------------------
    ~NGLDraw();
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief resize our screen and set the camera aspect ratio
    /// @param[in] _w the new width
    /// @param[in] _h the new height
    //----------------------------------------------------------------------------------------------------------------------
    void resize(int _w, int _h);
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief draw the scene
    //----------------------------------------------------------------------------------------------------------------------
    void draw();
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief this method is called every time a mouse is moved
    /// @param _event the SDL mouse event structure containing all mouse info
    //----------------------------------------------------------------------------------------------------------------------
    void mouseMoveEvent (const SDL_MouseMotionEvent &_event);
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief this method is called every time a mouse button is presses
    /// @param _event the SDL mouse event structure containing all mouse info
    //----------------------------------------------------------------------------------------------------------------------
    void mousePressEvent (const SDL_MouseButtonEvent &_event);
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief this method is called everytime the mouse button is released
    /// @param _event the SDL mouse event structure containing all mouse info
    //----------------------------------------------------------------------------------------------------------------------
    void mouseReleaseEvent (const SDL_MouseButtonEvent &_event);
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief this method is called everytime the mouse wheel is moved
    /// @param _event the SDL mouse event structure containing all mouse info
    //----------------------------------------------------------------------------------------------------------------------
    void wheelEvent(float _delta);
    //----------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------
    void timerEvent( );
    void keyEvent(const SDLKey &_key);
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief a method to change the spot light parameters
    //----------------------------------------------------------------------------------------------------------------------
    void changeSpotParams();
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief toggle the Animation of the lights called from main window
    //----------------------------------------------------------------------------------------------------------------------
    inline void toggleAnimation(){m_animate^=true;}

private:
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief used to store the x rotation mouse value
    //----------------------------------------------------------------------------------------------------------------------
    int m_spinXFace;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief used to store the y rotation mouse value
    //----------------------------------------------------------------------------------------------------------------------
    int m_spinYFace;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief flag to indicate if the mouse button is pressed when dragging
    //----------------------------------------------------------------------------------------------------------------------
    bool m_rotate;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief flag to indicate if the Right mouse button is pressed when dragging
    //----------------------------------------------------------------------------------------------------------------------
    bool m_translate;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief the previous x mouse value
    //----------------------------------------------------------------------------------------------------------------------
    int m_origX;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief the previous y mouse value
    //----------------------------------------------------------------------------------------------------------------------
    int m_origY;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief the previous x mouse value for Position changes
    //----------------------------------------------------------------------------------------------------------------------
    int m_origXPos;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief the previous y mouse value for Position changes
    //----------------------------------------------------------------------------------------------------------------------
    int m_origYPos;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief used to store the global mouse transforms
    //----------------------------------------------------------------------------------------------------------------------
    ngl::Mat4 m_mouseGlobalTX;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief Our Camera
    //----------------------------------------------------------------------------------------------------------------------
    ngl::Camera *m_cam;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief the model position for mouse movement
    //----------------------------------------------------------------------------------------------------------------------
    ngl::Vec3 m_modelPos;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief timer to change the light
    //----------------------------------------------------------------------------------------------------------------------
    int m_lightChangeTimer;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief light parameter change timer
    //----------------------------------------------------------------------------------------------------------------------
    int m_lightParamChangeTimer;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief our transform stack for drawing the teapots
    //----------------------------------------------------------------------------------------------------------------------
    ngl::TransformStack m_transformStack;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief dynamic array of spotlights for drawing
    //----------------------------------------------------------------------------------------------------------------------
    std::vector <ngl::SpotLight> m_spots;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief a class to contain the spot attributes
    //----------------------------------------------------------------------------------------------------------------------
    std::vector <SpotData> m_spotData;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief flag to indicate if animation is active or not
    //----------------------------------------------------------------------------------------------------------------------
    bool m_animate;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief method to load transform matrices to the shader
    //----------------------------------------------------------------------------------------------------------------------
    void loadMatricesToShader();
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief create the initial lights
    //----------------------------------------------------------------------------------------------------------------------
    void createLights();

};


#endif
