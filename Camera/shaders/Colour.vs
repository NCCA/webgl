precision mediump float;

uniform mat4 MVP;

attribute vec3 inVert;
attribute vec2 inUV;


void main(void)
{
  gl_Position = MVP*vec4(inVert,1.0);
}
