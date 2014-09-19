#ifndef TEXTSHADERS_H__
#define TEXTSHADERS_H__
// see below for the really cool c++ 11 way of doing this
static const char * textVertexShader[]={
    "precision mediump float; \n"
    "attribute vec2 inVert; \n"
    "attribute vec2 inUV; \n"
    "varying vec2 vertUV; \n"
    "uniform vec3 textColour; \n"
    "uniform float scaleX; \n"
    "uniform float scaleY; \n"
    "uniform float xpos;  \n"
    "uniform float ypos; \n"
    "void main() \n"
    "{ \n"
    "vertUV=inUV; \n"
    "gl_Position=vec4( ((xpos+inVert.x)*scaleX)-1.0,((ypos+inVert.y)*scaleY)+1.0,0.0,1.0); \n"
    "}\n\0"
  };

static const char * textFragmentShader[]={"precision mediump float;\n"
    "uniform sampler2D tex; \n"
    "varying vec2 vertUV; \n"
    "uniform vec3 textColour; \n"
    "void main() \n"
    "{ \n"
    "vec4 text=texture2D(tex,vertUV.st); \n"
    "gl_FragColor.rgb=textColour.rgb; \n"
    "gl_FragColor.a=text.a; \n"
    "}\n\0"
 };
// in c++ 11 we can use this which is really cool alas the
// lab build doesn't support the latest c++

/*
const std::string textVertexShader =
R"DELIM(
#version 150
in vec2 inVert;
in vec2 inUV;
out vec2 vertUV;
uniform vec3 textColour;
uniform float scaleX;
uniform float scaleY;
uniform float xpos;
uniform float ypos;
void main()
{
  vertUV=inUV;
  gl_Position=vec4( ((xpos+inVert.x)*scaleX)-1.0,((ypos+inVert.y)*scaleY)+1.0,0.0,1.0);
}
)DELIM";




const std::string  textFragmentShader=
R"DELIM(
#version 150
uniform sampler2D tex;
in vec2 vertUV;
out vec4 fragColour;
uniform vec3 textColour;
void main()
{
  vec4 text=texture(tex,vertUV.st);
  fragColour.rgb=textColour.rgb;
  fragColour.a=text.a;
}
)DELIM";
*/
#endif

