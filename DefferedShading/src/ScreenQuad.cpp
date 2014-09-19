#include "ScreenQuad.h"
#include <ngl/ShaderLib.h>
#include <ngl/NGLassert.h>
#include <ngl/VAOPrimitives.h>

static int s_pixels=4;

ScreenQuad::ScreenQuad(const std::string &_shader)
{

static ngl::Vec3 verts[]=
                        {
                          ngl::Vec3(-1.0f,-1.0f,0.0f),
                          ngl::Vec3(1.0f,-1.0f,0.0f),
                          ngl::Vec3(1.0f,1.0f,0.0f),
                          ngl::Vec3(1.0f,1.0f,0.0f),
                          ngl::Vec3(-1.0f,-1.0f,0.0f),
                          ngl::Vec3(-1.0f,1.0f,0.0f)
                        };
static ngl::Vec2 uv[]=
                      {
                        ngl::Vec2(0.0f,0.0f),
                        ngl::Vec2(1.0f,0.0f),
                        ngl::Vec2(1.0f,1.0f),

                        ngl::Vec2(1.0f,1.0f),
                        ngl::Vec2(0.0f,0.0f),
                        ngl::Vec2(0.0f,1.0f)
                      };
  m_shader=_shader;

  glGenVertexArraysOES(1,&m_vao);
  glBindVertexArrayOES(m_vao);

  GLuint vbo[2];
  glGenBuffers(2,vbo);
  glBindBuffer(GL_ARRAY_BUFFER,vbo[0]);
  glBufferData(GL_ARRAY_BUFFER,6*sizeof(ngl::Vec3),&verts[0].m_x,GL_STATIC_DRAW);

  glVertexAttribPointer(0, // atrib 0
                        3, // with x,y,z
                        GL_FLOAT, // what type
                        GL_FALSE, // normalize?
                        0, // stride
                        0 // start ptr
                        );
  glEnableVertexAttribArray(0);

  glBindBuffer(GL_ARRAY_BUFFER,vbo[1]);
  glBufferData(GL_ARRAY_BUFFER,6*sizeof(ngl::Vec2),&uv[0].m_x,GL_STATIC_DRAW);

  glVertexAttribPointer(1, // atrib 0
                        2, // with x,y,z
                        GL_FLOAT, // what type
                        GL_FALSE, // normalize?
                        0, // stride
                        0 // start ptr
                        );
  glEnableVertexAttribArray(1);



  glBindVertexArrayOES(0);


}

ScreenQuad::~ScreenQuad()
{
  glDeleteVertexArraysOES(1,&m_vao);
}

void ScreenQuad::draw()
{

  ngl::ShaderLib *shader = ngl::ShaderLib::instance();
  shader->use(m_shader);
  glBindVertexArrayOES(m_vao);
  glDrawArrays(GL_TRIANGLES,0,6);
  glBindVertexArrayOES(0);

}
