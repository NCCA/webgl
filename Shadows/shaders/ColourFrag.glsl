precision mediump float;
/// @file Colour.fs
/// @brief a basic unshaded solid colour shader
/// @brief the colour to shade draw with

uniform vec4 Colour;

void main ()
{
  gl_FragColor = Colour;
}

