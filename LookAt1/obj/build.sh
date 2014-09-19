#!/bin/bash
em++  -Oz -o WebNGL.js main.cpp NGLDraw.cpp \
../webngl/src/Mat4.cpp ../webngl/src/Mat3.cpp ../webngl/src/Util.cpp ../webngl/src/Vec4.cpp \
../webngl/src/Camera.cpp \
../webngl/src/Vec3.cpp ../webngl/src/Vec2.cpp ../webngl/src/Plane.cpp  \
../webngl/src/Shader.cpp ../webngl/src/ShaderLib.cpp ../webngl/src/ShaderProgram.cpp \
../webngl/src/Colour.cpp ../webngl/src/NGLStream.cpp \
../webngl/src/Transformation.cpp ../webngl/src/TransformStack.cpp \
../webngl/src/VertexArrayObject.cpp  ../webngl/src/VAOPrimitives.cpp  \
 -I../webngl/include/ -I../webngl/include/ngl -I/usr/local/include/ -s FULL_ES2=1 -DNGL_DEBUG -s ALLOW_MEMORY_GROWTH=1


#scp *.js* *.data nccastaff.bmth.ac.uk:/home/ncca/public_html/jmacey/WebGL/NGL1

cp *.js*  index.html /Applications/MAMP/htdocs/LookAt1/
