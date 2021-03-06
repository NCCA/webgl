#include "NGLDraw.h"
#include <ngl/Random.h>
#include <ngl/ShaderLib.h>
#include <ngl/TransformStack.h>
#include <ngl/Material.h>
#include <ngl/VAOPrimitives.h>

#include <boost/foreach.hpp>

const static float INCREMENT=0.01;
const static float ZOOM=0.05;
NGLDraw::NGLDraw()
{
  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  // Now set the initial GLWindow attributes to default values
  // Roate is false
  m_animate=true;
  // now create the actual spheres for our program
  ngl::Random *rng=ngl::Random::instance();
  float x;
  float y;
  m_numSpheres=150;
  for (int i=0; i<m_numSpheres; ++i)
  {
    x=rng->randomNumber(10);
    y=rng->randomNumber(8);
    m_sphereArray.push_back(Sphere(ngl::Vec3(x,y,0),rng->randomPositiveNumber(1)+0.2));
  }

	// create the points for our ray
	m_rayStart.set(0,10,0);
	m_rayEnd.set(0,-5,0);
	m_rayStart2.set(0,0,20);
	m_rayEnd2.set(0,0,-5);



  glColorMask (GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
  glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glEnable(GL_DEPTH_TEST);


  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background
 
  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(0,0,-25);
  ngl::Vec3 to(0,0,0);
  ngl::Vec3 up(0,1,0);
  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(45,(float)720.0/576.0,0.5,150);
  // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["nglDiffuseShader"]->use();

  shader->setShaderParam4f("Colour",1,1,1,1);
  shader->setShaderParam3f("lightPos",1,1,1);
  shader->setShaderParam4f("lightDiffuse",1,1,1,1);

  (*shader)["nglColourShader"]->use();
  shader->setShaderParam4f("Colour",1,1,1,1);

  glEnable(GL_DEPTH_TEST); // for removal of hidden surfaces

  ngl::VAOPrimitives *prim =  ngl::VAOPrimitives::instance();
  prim->createSphere("sphere",1.0,40);
  prim->createSphere("smallSphere",0.2,10);


  // as re-size is not explicitly called we need to do this.
  glViewport(0,0,720,576);

}

void NGLDraw::loadMatricesToShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  (*shader)["nglDiffuseShader"]->use();

  ngl::Mat4 MV;
  ngl::Mat4 MVP;
  ngl::Mat3 normalMatrix;
  ngl::Mat4 M;
  M=m_transformStack.getCurrentTransform().getMatrix();
  MV=  M*m_mouseGlobalTX*m_cam->getViewMatrix();
  MVP=  MV*m_cam->getProjectionMatrix();
  normalMatrix=MV;
  normalMatrix.inverse();
  shader->setShaderParamFromMat4("MVP",MVP);
  shader->setShaderParamFromMat3("normalMatrix",normalMatrix);
}

void NGLDraw::loadMatricesToColourShader()
{
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
   (*shader)["nglColourShader"]->use();
   ngl::Mat4 MVP;

   MVP=m_transformStack.getCurrentTransform().getMatrix()
       *m_mouseGlobalTX*m_cam->getVPMatrix();
   shader->setRegisteredUniformFromMat4("MVP",MVP);

}

NGLDraw::~NGLDraw()
{
  std::cerr<<"Shutting down NGL, removing VAO's and Shaders\n";
}

void NGLDraw::resize(int _w, int _h)
{
  glViewport(0,0,_w,_h);
  // now set the camera size values as the screen size has changed
  m_cam->setShape(45,(float)_w/_h,0.05,350);

}

void NGLDraw::draw()
{
  // clear the screen and depth buffer
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
   // Rotation based on the mouse position for our global
   // transform
   ngl::Mat4 rotX;
   ngl::Mat4 rotY;
   // create the rotation matrices
   rotX.rotateX(m_spinXFace);
   rotY.rotateY(m_spinYFace);
   // multiply the rotations
   m_mouseGlobalTX=rotY*rotX;
   // add the translations
   m_mouseGlobalTX.m_m[3][0] = m_modelPos.m_x;
   m_mouseGlobalTX.m_m[3][1] = m_modelPos.m_y;
   m_mouseGlobalTX.m_m[3][2] = m_modelPos.m_z;

  // grab an instance of the primitives for drawing
  ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
  // Rotation based on the mouse position for our global
  // transform
  // grab an instance of the shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  shader->use("nglDiffuseShader");
  // draw a cube at the ray start points
  m_transformStack.pushTransform();
  {
    shader->setRegisteredUniform4f("Colour",1.0f,1.0f,1.0f,1);
    m_transformStack.setPosition(m_rayStart);
    loadMatricesToShader();
    prim->draw("cube");
  } // and before a pop
  m_transformStack.popTransform();

	m_transformStack.pushTransform();
	{
		m_transformStack.setPosition(m_rayStart2);
		loadMatricesToShader();
		prim->draw("cube");
	} // and before a pop
	m_transformStack.popTransform();




	BOOST_FOREACH(Sphere s, m_sphereArray)
	{
		shader->setRegisteredUniform4f("Colour",1,1,0,1);

		s.draw("nglDiffuseShader",m_mouseGlobalTX,m_cam);
		if(s.isHit())
		{
			ngl::Vec3 dir=m_rayEnd-m_rayStart;
			ngl::Vec3 dir2=m_rayEnd2-m_rayStart2;
			drawHitPoints(m_rayStart,dir,s.getPos(),s.getRadius());
			drawHitPoints(m_rayStart2,dir2,s.getPos(),s.getRadius());
		}
	}
	// we build up a VAO for the lines of the start and end points and draw
	m_transformStack.pushTransform();
	{
		shader->use("nglColourShader");
		shader->setRegisteredUniform4f("Colour",1,1,1,1);
		ngl::VertexArrayObject *vao= ngl::VertexArrayObject::createVOA(GL_LINES);
		vao->bind();
		ngl::Vec3 points[4];
		points[0]=m_rayStart;
		points[1]=m_rayEnd;
		points[2]=m_rayStart2;
		points[3]=m_rayEnd2;
		vao->setData(4*sizeof(ngl::Vec3),points[0].m_x);
		vao->setVertexAttributePointer(0,3,GL_FLOAT,sizeof(ngl::Vec3),0);
		vao->setNumIndices(4);
		loadMatricesToColourShader();
		vao->draw();
		vao->removeVOA();
		delete vao;
	}
	m_transformStack.popTransform();
}

//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::drawHitPoints( ngl::Vec3 _raystart,  ngl::Vec3 _raydir,   ngl::Vec3 _pos,  GLfloat _radius	)
{
GLfloat A,B,C,discrim;
ngl::Vec3 p;
GLfloat discRoot;
GLfloat t1 ;        // earlier hit
GLfloat t2 ; 		// second hit
// points for the hit points
ngl::Vec3 h1 ;
ngl::Vec3 h2 ;

// normalize the ray
_raydir.normalize();
// cal the A value as the dotproduct a.a (see lecture notes)
A = _raydir.dot(_raydir);
//b= 2*d.(Po-Pc)
p=_raystart-_pos;
B= _raydir.dot(p)*2.0;
// C = (Po-Pc).(Po-Pc)-r^2
C=p.dot(p)-_radius*_radius;
// finally get the descrim
// b^2-4(ac)
discrim = B * B - 4.0*(A * C);
// if the discrim <= 0.0 it's not a hit
if(discrim >= 0.0)
{
	discRoot = sqrt(discrim);
	t1 = (-B-(discRoot))/2*A;        // earlier hit
	t2 = (-B+(discRoot))/2*A; 		// second hit
	// move along the ray from origin in ray direction with an offset of t1 / t2
	// to get the hit points
	h1=_raystart + (_raydir*t1);
	h2=_raystart + (_raydir*t2);
	// draw the hit points
	ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
	ngl::ShaderLib *shader=ngl::ShaderLib::instance();
	shader->setRegisteredUniform4f("Colour",1,0,0,0);
	m_transformStack.pushTransform();
	{
		m_transformStack.getCurrentTransform().setPosition(h1);
		loadMatricesToShader();
		prim->draw("smallSphere");
	} // and before a pop
	m_transformStack.popTransform();

	m_transformStack.pushTransform();
	{
		shader->setRegisteredUniform4f("Colour",0,1,0,0);
		m_transformStack.getCurrentTransform().setPosition(h2);

    loadMatricesToShader();
    prim->draw("smallSphere");
  } // and before a pop
  m_transformStack.popTransform();
}
}
//----------------------------------------------------------------------------------------------------------------------
bool NGLDraw::raySphere(ngl::Vec3 _rayStart, ngl::Vec3 _rayDir,  ngl::Vec3 _pos,  GLfloat _radius  )
{
  // variables for the Quadratic roots and discriminator
  GLfloat A,B,C,discrim;
  ngl::Vec3 p;
  // normalize the ray
  _rayDir.normalize();
  // cal the A value as the dotproduct a.a (see lecture notes)
  A = _rayDir.dot(_rayDir);
  //b= 2*d.(Po-Pc)
  p=_rayStart-_pos;
  B= _rayDir.dot(p)*2;
  // C = (Po-Pc).(Po-Pc)-r^2
  C=p.dot(p)-_radius*_radius;
  // finally get the descrim
  // b^2-4(ac)
  discrim = B * B - 4*(A * C);
  // if the discrim <= 0.0 it's not a hit
  if(discrim <= 0.0)
  {
    return false;
  }
  else
  {
    return true;
  }
}

//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::update()
{
  enum {FWD,BWD};

  static int s_direction=0;
  bool collide;
  ngl::Vec3 dir;
  ngl::Vec3 dir2;
  dir=m_rayEnd-m_rayStart;
  dir2=m_rayEnd2-m_rayStart2;

  // note here we need to iterate by reference as we want to modify the Sphere Objects
  // so we need to explicitly create our object as a reference object
  BOOST_FOREACH(Sphere &s,m_sphereArray)
  {
    s.setNotHit();
    collide =raySphere(m_rayStart,dir,s.getPos(),s.getRadius());
    if(collide)
    {
      s.setHit();
    }
    collide =raySphere(m_rayStart2,dir2,s.getPos(),s.getRadius());
    if(collide)
    {
      s.setHit();
    }
  }

  // now update the rays
  if(s_direction==FWD)
  {
    m_rayEnd.m_x+=0.5;
    m_rayEnd2.m_x-=0.5;
    if(m_rayEnd.m_x>22.0)
    {
      s_direction=BWD;
    }
  }
  else
  {
    m_rayEnd.m_x-=0.5;
    m_rayEnd2.m_x+=0.5;
    if(m_rayEnd.m_x<=-22.0)
    {
      s_direction=FWD;
    }
  }
}

void NGLDraw::changeSpheres()
{
  float x;
  float y;
  ngl::Random *rng=ngl::Random::instance();

  for (int i=0; i<m_numSpheres; ++i)
  {
    x=rng->randomNumber(10);
    y=rng->randomNumber(8);
    m_sphereArray[i].setPos(ngl::Vec3(x,y,0));
    m_sphereArray[i].setRadius(rng->randomPositiveNumber(1)+0.2);
  }


}

void NGLDraw::timerEvent( )
{
  static int i=0;
  if(++i > 2)
  {
    update();
    i=0;
  }
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
		case SDLK_SPACE : m_animate^=true; break;
		case SDLK_r : changeSpheres(); break;

		default : break;
	}

}


//----------------------------------------------------------------------------------------------------------------------
//void NGLDraw::wheelEvent(const SDL_MouseWheelEvent &_event)
//{

//  // check the diff of the wheel position (0 means no change)
//  if(_event.y > 0)
//  {
//    m_modelPos.m_z+=ZOOM;
//    this->draw();
//  }
//  else if(_event.y <0 )
//  {
//    m_modelPos.m_z-=ZOOM;
//    this->draw();
//  }

//  // check the diff of the wheel position (0 means no change)
//  if(_event.x > 0)
//  {
//    m_modelPos.m_x-=ZOOM;
//    this->draw();
//  }
//  else if(_event.x <0 )
//  {
//    m_modelPos.m_x+=ZOOM;
//    this->draw();
//  }
//}
//----------------------------------------------------------------------------------------------------------------------
