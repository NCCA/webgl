#include "NGLDraw.h"
#include <ngl/VAOPrimitives.h>
#include <ngl/ShaderLib.h>
#include <ngl/Material.h>
#include <boost/format.hpp>


const static float INCREMENT=0.01;
const static float ZOOM=0.05;
NGLDraw::NGLDraw()
{
  m_weight1=0.0;
  m_weight2=0.0;
  m_animation=true;
  m_punchLeft=false;
  m_punchRight=false;

  m_rotate=false;
  // mouse rotation values set to 0
  m_spinXFace=0;
  m_spinYFace=0;
  glColorMask (GL_TRUE, GL_TRUE, GL_TRUE, GL_FALSE);
  glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  glEnable(GL_DEPTH_TEST);

  glClearColor(0.4f, 0.4f, 0.4f, 1.0f);			   // Grey Background

  // Now we will create a basic Camera from the graphics library
  // This is a static camera so it only needs to be set once
  // First create Values for the camera position
  ngl::Vec3 from(0,10,40);
  ngl::Vec3 to(0,10,0);
  ngl::Vec3 up(0,1,0);


  // first we create a mesh from an obj passing in the obj file and texture
  ngl::Obj *mesh1= new ngl::Obj("/models/BrucePose1.obj");
  m_meshes.push_back(mesh1);

  ngl::Obj *mesh2= new ngl::Obj("/models/BrucePose2.obj");
  m_meshes.push_back(mesh2);

  ngl::Obj *mesh3= new ngl::Obj("/models/BrucePose3.obj");
  m_meshes.push_back(mesh3);
  createMorphMesh();

  m_cam= new ngl::Camera(from,to,up);
  // set the shape using FOV 45 Aspect Ratio based on Width and Height
  // The final two are near and far clipping planes of 0.5 and 10
  m_cam->setShape(45,(float)720.0/576.0,0.05,350);
  // now to load the shader and set the values
  // grab an instance of shader manager
  ngl::ShaderLib *shader=ngl::ShaderLib::instance();
  // we are creating a shader called PerFragADS
  shader->createShaderProgram("PerFragADS");
  // now we are going to create empty shaders for Frag and Vert
  shader->attachShader("PerFragADSVertex",ngl::VERTEX);
  shader->attachShader("PerFragADSFragment",ngl::FRAGMENT);
  // attach the source
  shader->loadShaderSource("PerFragADSVertex","/shaders/PerFragASDVert.glsl");
  shader->loadShaderSource("PerFragADSFragment","/shaders/PerFragASDFrag.glsl");
  // compile the shaders
  shader->compileShader("PerFragADSVertex");
  shader->compileShader("PerFragADSFragment");
  // add them to the program
  shader->attachShaderToProgram("PerFragADS","PerFragADSVertex");
  shader->attachShaderToProgram("PerFragADS","PerFragADSFragment");
  shader->bindAttribute("PerFragADS",0,"baseVert");
  shader->bindAttribute("PerFragADS",1,"baseNormal");
  shader->bindAttribute("PerFragADS",2,"poseVert1");
  shader->bindAttribute("PerFragADS",3,"poseNormal1");
  shader->bindAttribute("PerFragADS",4,"poseVert2");
  shader->bindAttribute("PerFragADS",5,"poseNormal2");

  // now we have associated this data we can link the shader
  shader->linkProgramObject("PerFragADS");
  // and make it active ready to load values
  (*shader)["PerFragADS"]->use();
  // now we need to set the material and light values
  /*
   *struct MaterialInfo
   {
        // Ambient reflectivity
        vec3 Ka;
        // Diffuse reflectivity
        vec3 Kd;
        // Specular reflectivity
        vec3 Ks;
        // Specular shininess factor
        float shininess;
  };*/
  shader->setShaderParam3f("material.Ka",0.1,0.1,0.1);
  // red diffuse
  shader->setShaderParam3f("material.Kd",0.8,0.8,0.8);
  // white spec
  shader->setShaderParam3f("material.Ks",1.0,1.0,1.0);
  shader->setShaderParam1f("material.shininess",1000);
  // now for  the lights values (all set to white)
  /*struct LightInfo
  {
  // Light position in eye coords.
  vec4 position;
  // Ambient light intensity
  vec3 La;
  // Diffuse light intensity
  vec3 Ld;
  // Specular light intensity
  vec3 Ls;
  };*/
  shader->setUniform("light.position",ngl::Vec3(2,20,2));
  shader->setShaderParam3f("light.La",0.1,0.1,0.1);
  shader->setShaderParam3f("light.Ld",1.0,1.0,1.0);
  shader->setShaderParam3f("light.Ls",0.9,0.9,0.9);

  glEnable(GL_DEPTH_TEST); // for removal of hidden surfaces
  m_text = new ngl::Text("/font/arial.ttf",35);
  m_text->setScreenSize(720,576);
  m_text->setColour(1.0,0.0,0.0);

}



// a simple structure to hold our vertex data
struct vertData
{
  ngl::Vec3 p1;
  ngl::Vec3 n1;
  ngl::Vec3 p2;
  ngl::Vec3 n2;
  ngl::Vec3 p3;
  ngl::Vec3 n3;
};
void NGLDraw::createMorphMesh()
{

  // base pose is mesh 1 stored in m_meshes[0]
  // get the obj data so we can process it locally
  std::vector <ngl::Vec3> verts1=m_meshes[0]->getVertexList();
  // should really check to see if the poses match if we were doing this properly
  std::vector <ngl::Vec3> verts2=m_meshes[1]->getVertexList();
  std::vector <ngl::Vec3> verts3=m_meshes[2]->getVertexList();
  // faces will be the same for each mesh so only need one
  std::vector <ngl::Face> faces=m_meshes[0]->getFaceList();
  // now get the normals
  std::vector <ngl::Vec3> normals1=m_meshes[0]->getNormalList();
  std::vector <ngl::Vec3> normals2=m_meshes[1]->getNormalList();
  std::vector <ngl::Vec3> normals3=m_meshes[2]->getNormalList();

  // now we are going to process and pack the mesh into an ngl::VertexArrayObject
  std::vector <vertData> vboMesh;
  vertData d;
  unsigned int nFaces=faces.size();
  // loop for each of the faces
  for(unsigned int i=0;i<nFaces;++i)
  {
    // now for each triangle in the face (remember we ensured tri above)
    for(int j=0;j<3;++j)
    {
      // pack in the vertex data first

      d.p1=verts1[faces[i].m_vert[j]];
      // the blend meshes are just the differences so we subtract the base mesh
      // from the current one (could do this on GPU but this saves processing time)
      d.p2=verts2[faces[i].m_vert[j]]-d.p1;
      d.p3=verts3[faces[i].m_vert[j]]-d.p1;

      // now do the normals
      d.n1=normals1[faces[i].m_norm[j]];
      // again we only need the differences so subtract base mesh value from pose values
      d.n2=normals2[faces[i].m_norm[j]]-d.n1;
      d.n3=normals3[faces[i].m_norm[j]]-d.n1;

    // finally add it to our mesh VAO structure
    vboMesh.push_back(d);
    }
  }
  // first we grab an instance of our VOA class as a TRIANGLE_STRIP
  m_vaoMesh= ngl::VertexArrayObject::createVOA(GL_TRIANGLES);
  // next we bind it so it's active for setting data
  m_vaoMesh->bind();
  unsigned int meshSize=vboMesh.size();
  // now we have our data add it to the VAO, we need to tell the VAO the following
  // how much (in bytes) data we are copying
  // a pointer to the first element of data (in this case the address of the first element of the
  // std::vector
  m_vaoMesh->setData(meshSize*sizeof(vertData),vboMesh[0].p1.m_x);

  // so data is Vert / Normal for each mesh
  m_vaoMesh->setVertexAttributePointer(0,3,GL_FLOAT,sizeof(vertData),0);
  m_vaoMesh->setVertexAttributePointer(1,3,GL_FLOAT,sizeof(vertData),3);

  m_vaoMesh->setVertexAttributePointer(2,3,GL_FLOAT,sizeof(vertData),6);
  m_vaoMesh->setVertexAttributePointer(3,3,GL_FLOAT,sizeof(vertData),9);

  m_vaoMesh->setVertexAttributePointer(4,3,GL_FLOAT,sizeof(vertData),12);
  m_vaoMesh->setVertexAttributePointer(5,3,GL_FLOAT,sizeof(vertData),15);


  // now we have set the vertex attributes we tell the VAO class how many indices to draw when
  // glDrawArrays is called, in this case we use buffSize (but if we wished less of the sphere to be drawn we could
  // specify less (in steps of 3))
  m_vaoMesh->setNumIndices(meshSize);
  // finally we have finished for now so time to unbind the VAO
  m_vaoMesh->unbind();
}

void NGLDraw::changeWeight(Weights _w,Direction _d )
{

  switch(_w)
   {
    case POSE1 :
      if(_d == UP)
        m_weight1+=0.1;
      else
        m_weight1-=0.1;
    break;

    case POSE2 :
      if(_d == UP)
        m_weight2+=0.1;
      else
        m_weight2-=0.1;
    break;
   }
  // clamp to 0.0 -> 1.0 range
  m_weight1=std::min(1.0f, std::max(0.0f, m_weight1));
  m_weight2=std::min(1.0f, std::max(0.0f, m_weight2));
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
 // clear the screen and depth buffer
   glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
   // Rotation based on the mouse position for our global transform
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

  loadMatricesToShader();
  // draw the mesh
  m_vaoMesh->bind();
  m_vaoMesh->draw();
  m_vaoMesh->unbind();


  m_text->setColour(1.0f,1.0f,1.0f);

  std::string text;
  text=boost::str(boost::format("Q-W change Pose one weight %0.1f") % m_weight1  );
  m_text->renderText(10,18,text);
  text=boost::str(boost::format("A-S change Pose one weight %0.1f") % m_weight2  );

  m_text->renderText(10,34,text);
  m_text->renderText(10,58,"Z trigger Left Punch X trigger Right");



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
  case SDLK_q : changeWeight(POSE1,DOWN); break;
  case SDLK_w : changeWeight(POSE1,UP); break;
  case SDLK_a : changeWeight(POSE2,DOWN); break;
  case SDLK_s : changeWeight(POSE2,UP); break;
  case SDLK_z : m_punchLeft=true; break;
  case SDLK_x : m_punchRight=true; break;

	}
}


void NGLDraw::timerEvent()
{
  static Direction left=UP;
  static Direction right=UP;
  if (m_punchLeft == true)
  {
    if(left == UP )
    {
      m_weight1+=0.2;
      if(m_weight1 >1.1)
        left=DOWN;
    }
    else if(left == DOWN )
    {
      m_weight1-=0.2;
      if(m_weight1<=0.0)
      {
        m_weight1=0.0;

        left=UP;
        m_punchLeft=false;
      }
    }
  }

  if (m_punchRight == true)
  {
    if(right == UP )
    {
      m_weight2+=0.2;
      if(m_weight2 >1.1)
        right=DOWN;
    }
    else if(right == DOWN )
    {
      m_weight2-=0.2f;
      if(m_weight2<=0.0)
      {
        m_weight2=0.0;
        right=UP;
        m_punchRight=false;
      }
    }
  }

}



//----------------------------------------------------------------------------------------------------------------------
void NGLDraw::wheelEvent(float _delta)
{

  // check the diff of the wheel position (0 means no change)
  if(_delta > 0)
  {
    m_modelPos.m_z+=ZOOM;
  }
  else if(_delta <0 )
  {
    m_modelPos.m_z-=ZOOM;
  }


}
