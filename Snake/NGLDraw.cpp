#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>
#include <ngl/Random.h>
#include "Body.h"
// incremental value
static float s_headUpdate=1.0f;

const static float INCREMENT=0.01;
const static float ZOOM=0.05;
NGLDraw::NGLDraw()
{
  m_active=true;

  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  glColorMask (GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
  glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glEnable(GL_DEPTH_TEST);

  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background

    ngl::ShaderLib *shader=ngl::ShaderLib::instance();
    // we are creating a shader called Phong
     shader->createShaderProgram("Phong");
    // now we are going to create empty shaders for Frag and Vert
    shader->attachShader("PhongVertex",ngl::VERTEX);
    shader->attachShader("PhongFragment",ngl::FRAGMENT);
    // attach the source
    shader->loadShaderSource("PhongVertex","/shaders/PhongVertex.glsl");
    shader->loadShaderSource("PhongFragment","/shaders/PhongFragment.glsl");
    // compile the shaders
    shader->compileShader("PhongVertex");
    shader->compileShader("PhongFragment");
    // add them to the program
    shader->attachShaderToProgram("Phong","PhongVertex");
    shader->attachShaderToProgram("Phong","PhongFragment");
    // now bind the shader attributes for most NGL primitives we use the following
    // layout attribute 0 is the vertex data (x,y,z)
    shader->bindAttribute("Phong",0,"inVert");
    // attribute 1 is the UV data u,v (if present)
    shader->bindAttribute("Phong",1,"inUV");
    // attribute 2 are the normals x,y,z
    shader->bindAttribute("Phong",2,"inNormal");

    // now we have associated this data we can link the shader
    shader->linkProgramObject("Phong");
    // and make it active ready to load values
    (*shader)["Phong"]->use();

    // Now we will create a basic Camera from the graphics library
    // This is a static camera so it only needs to be set once
    // First create Values for the camera position
    ngl::Vec3 From(0,85,-85);
    ngl::Vec3 To(0,0,0);
    ngl::Vec3 Up(0,1,0);
    // now load to our new camera
    m_cam= new ngl::Camera(From,To,Up);
    // set the shape using FOV 45 Aspect Ratio based on Width and Height
    // The final two are near and far clipping planes of 0.5 and 10
    m_cam->setShape(45,(float)720.0/576.0,0.05,350);
    shader->setShaderParam3f("viewerPos",m_cam->getEye().m_x,m_cam->getEye().m_y,m_cam->getEye().m_z);
    // now create our light this is done after the camera so we can pass the
    // transpose of the projection matrix to the light to do correct eye space
    // transformations
    ngl::Mat4 iv=m_cam->getViewMatrix();
    iv.transpose();
    m_light = new ngl::Light(ngl::Vec3(0,0,2),ngl::Colour(1,1,1,1),ngl::Colour(1,1,1,1),ngl::DIRECTIONALLIGHT);
    m_light->setTransform(iv);
    // load these values to the shader as well
    m_light->loadToShader("light");
    ngl::Material m(ngl::COPPER);
    m.loadToShader("material");

    // create head sphere
    m_head= new Head(ngl::Vec3(0,0,0), 2.0);

    //randomise the points for the fruit to be created (within range of 38 in the x-axis and 38 in the z-axis)
    ngl::Random *rng=ngl::Random::instance();
    // sets the seed using std::time(NULL)
    rng->setSeed();
    ngl::Vec3 r_pos=rng->getRandomPoint(35,0,35);

    //create our fruit
    m_fruit= new Fruit(r_pos);

    // create body sphere
    ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
    prim->createSphere("body", 2, 80);

    // initialise m_active to orginially be true so timer events and update runs
    m_active = true;


}


void NGLDraw::loadMatricesToShader(
                                    ngl::TransformStack &_tx
                                   )
{
    ngl::ShaderLib *shader=ngl::ShaderLib::instance();
    (*shader)["Phong"]->use();

    ngl::Mat4 MVP=m_cam->getVPMatrix() * _tx.getCurrAndGlobal().getMatrix();

    shader->setShaderParamFromMat4("MVP",MVP);
}


NGLDraw::~NGLDraw()
{
  std::cout<<"Shutting down NGL, removing VAO's and Shaders\n";
  delete m_cam;
}

void NGLDraw::resize(int _w, int _h)
{
  glViewport(0,0,_w,_h);
  // now set the camera size values as the screen size has changed
  m_cam->setShape(45,(float)_w/_h,0.05,350);
}

void NGLDraw::draw()
{
    std::cout<<"paint\n";
    // clear the screen and depth buffer
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    // now load these values to the shader
    m_head->draw("Phong",m_cam);
    m_fruit->draw("Phong",m_cam);

    ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
    prim->createLineGrid("grid", 75,75,20);
    loadMatricesToShader(m_transformStack);
    prim->draw("grid");

    // draws each sphere within the array with the values set in its class
    //BOOST_FOREACH(Body s, m_snakeArray)
    for(int i=0; i<m_snakeArray.size(); ++i)
    {
        m_snakeArray[i].draw("Phong",m_cam);
    }

    //if statement to draw certain text depending on if the program is active or not
    if (m_active == true)
    {
/*        // text to write
        QString text;
        text.sprintf("Your score is %d",m_fruit->getScore());
        // now render the text using the QT renderText helper function
        m_text->renderText(10,10,text);
        text = QString("Your Speed: %1").arg((m_head->getSpeed()));
        m_text->renderText(10,40,text);
*/    }

    if (m_active == false)
    {
/*        m_text = new ngl::Text(QFont("Fantasy",100));
        m_text->setColour(0.75,0,0);
        m_text->renderText(200,200,QString("GAME OVER!"));
        m_text = new ngl::Text(QFont("Fantasy",75));
        QString text;
        text.sprintf("Your Score = %d",m_fruit->getScore());
        m_text->renderText(170,320,text);
  */  }
}


void NGLDraw::loadMatricesToShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["PerFragADS"]->use();
  ngl::Mat4 MV;
  ngl::Mat4 MVP;
  ngl::Mat3 normalMatrix;
  MV= m_mouseGlobalTX*m_cam->getViewMatrix();
  MVP=MV*m_cam->getProjectionMatrix() ;
  normalMatrix=MV;
  normalMatrix.inverse();
  shader->setUniform("MVP",MVP);
  shader->setUniform("MV",MV);
  shader->setUniform("normalMatrix",normalMatrix);
  shader->setUniform("weight1",m_weight1);
  shader->setUniform("weight2",m_weight2);
}

//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::mouseMoveEvent (const SDL_MouseMotionEvent &_event)
{

  if(m_rotate && _event.state &SDL_BUTTON_LMASK)
  {
    int diffx=_event.x-m_origX;
    int diffy=_event.y-m_origY;
    m_spinXFace += (float) 0.5f * diffy;
    m_spinYFace += (float) 0.5f * diffx;
    m_origX = _event.x;
    m_origY = _event.y;

    this->draw();

  }
  // right mouse translate code
  else if(m_translate && _event.state &SDL_BUTTON_RMASK)
  {
    int diffX = (int)(_event.x - m_origXPos);
    int diffY = (int)(_event.y - m_origYPos);
    m_origXPos=_event.x;
    m_origYPos=_event.y;
    m_modelPos.m_x += INCREMENT * diffX;
    m_modelPos.m_y -= INCREMENT * diffY;
    this->draw();
  }
}


//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::mousePressEvent (const SDL_MouseButtonEvent &_event)
{
  // this method is called when the mouse button is pressed in this case we
  // store the value where the maouse was clicked (x,y) and set the Rotate flag to true
  if(_event.button == SDL_BUTTON_LEFT)
  {
    m_origX = _event.x;
    m_origY = _event.y;
    m_rotate =true;
  }
  // right mouse translate mode
  else if(_event.button == SDL_BUTTON_RIGHT)
  {
    m_origXPos = _event.x;
    m_origYPos = _event.y;
    m_translate=true;
  }
}

//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::mouseReleaseEvent (const SDL_MouseButtonEvent &_event)
{
  // this event is called when the mouse button is released
  // we then set Rotate to false
  if (_event.button == SDL_BUTTON_LEFT)
  {

    m_rotate=false;
  }
  // right mouse translate mode
  if (_event.button == SDL_BUTTON_RIGHT)
  {
    m_translate=false;
  }
}


void NGLDraw::keyEvent(const SDLKey &_key)
{
	switch(_key)
	{
		SDLK_SPACE : m_active ^=true; break;
		 case SDLK_LEFT : {xDirection=s_headUpdate; zDirection= 0; break;}
		 case SDLK_RIGHT : {xDirection =-s_headUpdate; zDirection= 0; break;}
		 case SDLK_UP :    {zDirection=s_headUpdate; xDirection=0; break;}
		 case SDLK_DOWN :  {zDirection=-s_headUpdate;xDirection=0; break;}

	}
}


void NGLDraw::timerEvent()
{
/*    // allows the event timer to run if m_active is true
 //   if (m_active == true)
    {
        // the usual process is to check the event timerID and compare it to
        // any timers we have started with startTimer
        // runs the functions connected to those timers
//        if (_event->timerId() == m_updateHeadTimer)
        {
                moveHead();
        }
  //      if (_event->timerId() == m_updateSnake)
        {
                m_head->update();
                checkFruitCollision();
                headBodyCollision();
                updateBody();
        }
    }
  */  
if (m_active == true)
{    
    moveHead();
	m_head->update();
	checkFruitCollision();
	headBodyCollision();
	updateBody();
}
    

}

//----------------------------------------------------------------------------------------------------------------------
// runs the moveHead function when called, snake moves the direction connected to the key when it is pressed
//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::moveHead()
{
    // first we reset the movement values
    // now we loop for each of the pressed keys in the the set
    // and see which ones have been pressed. If they have been pressed
    // we set the movement value to be an incremental value
 //    foreach(Qt::Key key, m_keysPressed)
//     {
//         switch (key)
//         {
//             case Qt::Key_Left : {xDirection=s_headUpdate; zDirection= 0; break;}
//             case Qt::Key_Right : {xDirection =-s_headUpdate; zDirection= 0; break;}
//             case Qt::Key_Up :    {zDirection=s_headUpdate; xDirection=0; break;}
//             case Qt::Key_Down :  {zDirection=-s_headUpdate;xDirection=0; break;}
//         default : break;
//         }
//     }

        // if the set is non zero size we can update the head movement
        // then tell openGL to re-draw
  //       if(m_keysPressed.size() !=0)
//         {
//             m_head->move(xDirection,zDirection);
//         }
             m_head->move(xDirection,zDirection);

}

//----------------------------------------------------------------------------------------------------------------------
// this updates the increment value when the function is called
//----------------------------------------------------------------------------------------------------------------------
int NGLDraw::updateSpeed()
{
    s_headUpdate += 0.005;
    m_head->setSpeed(s_headUpdate);
}

//----------------------------------------------------------------------------------------------------------------------
// this checks if the head has collided with the fruit using its position.
// It is called in the timer event so that it is checked every update.
//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::checkFruitCollision()
{
  // Get head pos
  ngl::Vec3 headPos = m_head->getPos();
  // Get fruit pos
  ngl::Vec3 fruitPos = m_fruit->getPos();
  // Distance between two
  float dist = (headPos - fruitPos).length();
  if(dist <=3)
  {
  	std::cout<<"Upate Called\n";
       // Move food position, calls the UpdateFruit function
       m_fruit->updateFruit();
       // Calls the updateSpeed function
       updateSpeed();
       // Calls the addBody function
       addBody();
       // Calls the updateBody function
       updateBody();
       // Calls the Score function inputting 50 to _score
       m_fruit->Score(50);
  }

 }

//----------------------------------------------------------------------------------------------------------------------
// this checks if the head has collided with the body using collision detection.
// It is called in the headBodyCollision function which is called in the timer event so that it is checked every update.
//----------------------------------------------------------------------------------------------------------------------
bool NGLDraw::checkHeadBody(
                             ngl::Vec3 _pos1,
                             GLfloat _radius1,
                             ngl::Vec3 _pos2,
                             GLfloat _radius2
                            )
{

    {
      // the relative position of the spheres
      ngl::Vec3 relPos;
      //min and max distances of the spheres
      GLfloat dist;
      GLfloat minDist;
      GLfloat len;
      relPos =_pos1-_pos2;
      // and the distance
      len=relPos.length();
      dist=len*len;
      minDist =_radius1+_radius2;
      // if it is a hit
      if(dist <=(minDist * minDist))
      {
        return true;
      }
      else
      {
        return false;
      }
    }

}
//----------------------------------------------------------------------------------------------------------------------
// this sets the position and radius for the checkHeadBody funciton to use.
// Getting the values from the head and checking each body part in the array.
// It is called in the timer event so that it is checked every update.
// If collide is true then it sets the m_active to false and stops the timer events but not the updateGL.
// also shows the correct messages int the paintGL
//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::headBodyCollision()
{
    for (int i=0; i<m_snakeArray.size(); i++)
    {
        bool collide = checkHeadBody(m_head->getPos(), m_head->getRadius(), m_snakeArray[i].getPos(), m_snakeArray[i].getRadius());
            if(collide==true)
            {
                m_active = false;
            }
    }
}

//----------------------------------------------------------------------------------------------------------------------
// this creates the array.
//----------------------------------------------------------------------------------------------------------------------
bool NGLDraw::addBody()
{
    m_snakeArray.push_back(Body(m_head->getPos(),0.5));
}

//----------------------------------------------------------------------------------------------------------------------
// this adds to the snakes body, creating the spheres for the body.
// It is called in the timer event so that it is checked every update.
//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::updateBody()
{
    int itr;
    int size = m_snakeArray.size();

    for (int i =0; i<size; i++)
    {
       itr = size-i-1;
       if (itr==0)
       {
           // initially takes the heads position if the array is at zero
           m_snakeArray[itr].setPos(m_head->getLastPos());
       }
       else
       {
           // if the array is not at zero then it gets the position from the one before in the array
           m_snakeArray[itr].setPos(m_snakeArray[itr-1].getPos());

       }
     }
}

