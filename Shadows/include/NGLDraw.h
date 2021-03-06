#ifndef NGLDRAW_H__
#define NGLDRAW_H__

#include <ngl/Camera.h>
#include <ngl/Colour.h>
#include <ngl/Light.h>
#include <ngl/TransformStack.h>
#include <ngl/Text.h>

#include <SDL.h>

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
    //void wheelEvent(const SDL_MouseWheelEvent &_event);
    //----------------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------------
    void timerEvent( );
    void keyEvent(const SDLKey &_key);

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
    /// @brief camera from light view
    //----------------------------------------------------------------------------------------------------------------------
    ngl::Camera *m_lightCamera;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief transformation stack for the gl transformations etc
    //----------------------------------------------------------------------------------------------------------------------
    ngl::Transformation m_transform;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief the model position for mouse movement
    //----------------------------------------------------------------------------------------------------------------------
    ngl::Vec3 m_modelPos;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief a simple light use to illuminate the screen
    //----------------------------------------------------------------------------------------------------------------------
    ngl::Light *m_light;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief timer id for the animation timer
    //----------------------------------------------------------------------------------------------------------------------
    int m_lightTimer;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief flag to indicate if were animating the light
    //----------------------------------------------------------------------------------------------------------------------
    bool m_animate;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief the angle of the light updated when the timer triggers to make it rotate
    //----------------------------------------------------------------------------------------------------------------------
    ngl::Real m_lightAngle;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief the position of the light used to create the shadow map
    //----------------------------------------------------------------------------------------------------------------------
    ngl::Vec3 m_lightPosition;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief our texture id used by the FBO
    //----------------------------------------------------------------------------------------------------------------------
    GLuint m_textureID;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief our FBO id used by the FBO
    //----------------------------------------------------------------------------------------------------------------------
    GLuint m_fboID;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief screen width
    //----------------------------------------------------------------------------------------------------------------------
    GLuint m_width;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief screen height
    //----------------------------------------------------------------------------------------------------------------------
    GLuint m_height;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief y pos of the light
    //----------------------------------------------------------------------------------------------------------------------
    GLfloat m_lightYPos;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief x offset of the light
    //----------------------------------------------------------------------------------------------------------------------
    GLfloat m_lightXoffset;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief z offset of the light
    //----------------------------------------------------------------------------------------------------------------------
    GLfloat m_lightZoffset;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief text for debug
    //----------------------------------------------------------------------------------------------------------------------
    ngl::Text *m_text;
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief a method to update the light
    //----------------------------------------------------------------------------------------------------------------------
    void updateLight();


    //----------------------------------------------------------------------------------------------------------------------
    /// @brief define a type to pass a class method to a function
    /// this code is adapted from
    /// http://www.parashift.com/c++-faq-lite/pointers-to-members.html
    //----------------------------------------------------------------------------------------------------------------------
    typedef void (NGLDraw::*funcPointer)();
    //----------------------------------------------------------------------------------------------------------------------
    /// @brief define a type to pass a class method to a function
    /// this code is adapted from
    /// http://www.parashift.com/c++-faq-lite/pointers-to-members.html
    #define CALLMEMBERFUNC(object,ptrToMember)  ((object).*(ptrToMember))
    //----------------------------------------------------------------------------------------------------------------------

    //----------------------------------------------------------------------------------------------------------------------
    /// @brief draw our scene passing in the shader to use
    /// @param[in] _shader the name of the shader to use when drawing
    /// @param[in] _shaderFunc the function to load values to the shader
    //----------------------------------------------------------------------------------------------------------------------
    void drawScene(funcPointer _shaderFunc);

    //----------------------------------------------------------------------------------------------------------------------
    /// @brief load all the transform values to the shader
    /// @param[in] _tx the current transform to load
    //----------------------------------------------------------------------------------------------------------------------
    void loadMatricesToShadowShader();

    //----------------------------------------------------------------------------------------------------------------------
    /// @brief load all the transform values to the shader from light POV
    /// @param[in] _tx the current transform to load
    //----------------------------------------------------------------------------------------------------------------------
    void loadToLightPOVShader();
    void debugTexture(float _t, float _b, float _l, float _r);
    void createFramebufferObject();
    inline void toggleAnimation(){m_animate ^=true;}
    inline void changeLightYPos(float _dy){m_lightYPos+=_dy;}
    inline void changeLightZOffset(float _dz){m_lightZoffset+=_dz;}
    inline void changeLightXOffset(float _dx){m_lightXoffset+=_dx;}

    //----------------------------------------------------------------------------------------------------------------------
    /// @brief method to load transform matrices to the shader
    //----------------------------------------------------------------------------------------------------------------------
    void loadMatricesToShader();
    GLuint depthRenderbuffer;
    GLuint framebuffer;
};


#endif
