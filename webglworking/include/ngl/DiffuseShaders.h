#ifndef DIFFUSESHADERS_H__
#define DIFFUSESHADERS_H__
// see below for the really cool c++ 11 version of this

static const char * diffuseVertexShader[]={
  "precision mediump float; \n"
  "varying vec3 fragmentNormal;  \n"
  "attribute vec3 inVert;  \n"
  "attribute vec3 inNormal;  \n"
  "uniform mat4 MVP;  \n"
  "uniform mat3 normalMatrix; \n"
  "void main(void) \n"
  "{  \n"
  "fragmentNormal = (normalMatrix*inNormal); \n"
  "gl_Position = MVP*vec4(inVert,1.0); \n"
  "}  \n\0"
};

static const char * diffuseFragmentShader[]={
  "precision mediump float; \n"
  "varying vec3 fragmentNormal; \n"
  "uniform vec4 Colour; \n"
  "uniform vec3 lightPos; \n"
  "uniform vec4 lightDiffuse; \n"
  "void main () \n"
  "{ \n"
  "gl_FragColor= vec4(0.); \n"
  "vec3 N = normalize(fragmentNormal); \n"
  "vec3 L = normalize(lightPos); \n"
  "gl_FragColor += Colour*lightDiffuse *dot(L, N); \n"
  "}  \n\0"
};


#endif

