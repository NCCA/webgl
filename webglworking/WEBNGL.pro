# -------------------------------------------------
# Project created by QtCreator 2009-11-05T12:31:57
# -------------------------------------------------
# qt 5 wants this may cause errors with 4
isEqual(QT_MAJOR_VERSION, 5) {cache() }

# We will use the built in Qt lib template
TEMPLATE = lib

QMAKE_CXX=em++
QMAKE_CFLAGS = -I../webngl/include/ -I../webngl/include/ngl -I/usr/local/include/ -s FULL_ES2=1 -DNGL_DEBUG

SOURCES += ./src/Vec4.cpp \
		./src/VAOPrimitives.cpp \
		./src/Util.cpp \
		./src/Texture.cpp \
		./src/SpotLight.cpp \
		./src/ShaderLib.cpp \
		./src/Transformation.cpp \
		./src/RibExport.cpp \
		./src/Quaternion.cpp \
		./src/PathCamera.cpp \
		./src/Obj.cpp \
		./src/Mat4.cpp \
		./src/TransformStack.cpp \
		./src/Material.cpp \
		./src/Light.cpp \
		./src/NGLInit.cpp \
		./src/Colour.cpp \
		./src/Camera.cpp \
		./src/NCCABinMesh.cpp \
		./src/BezierCurve.cpp \
		./src/BBox.cpp \
		./src/AbstractMesh.cpp \
		./src/Random.cpp \
		./src/NCCAPointBake.cpp \
		./src/Shader.cpp \
		./src/ShaderProgram.cpp \
		./src/Plane.cpp \
		./src/AABB.cpp \
		./src/VertexArrayObject.cpp \
		./src/createDefaultVAOs.cpp \
		./src/Vec3.cpp \
		./src/Vec2.cpp \
		./src/Text.cpp \
		./src/Mat3.cpp





HEADERS += ./include/ngl/Vec4.h \
		./include/ngl/VAOPrimitives.h \
		./include/ngl/Singleton.h \
		./include/ngl/Util.h \
		./include/ngl/Types.h \
		./include/ngl/Texture.h \
		./include/ngl/SpotLight.h \
		./include/ngl/ShaderLib.h \
		./include/ngl/RibExport.h \
		./include/ngl/Transformation.h \
		./include/ngl/Quaternion.h \
		./include/ngl/PathCamera.h \
		./include/ngl/Obj.h \
		./include/ngl/NGLassert.h \
		./include/ngl/Mat4.h \
		./include/ngl/TransformStack.h \
		./include/ngl/Material.h \
		./include/ngl/Light.h \
		./include/ngl/NGLInit.h \
		./include/ngl/Colour.h \
		./include/ngl/Camera.h \
		./include/ngl/BezierCurve.h \
		./include/ngl/NCCABinMesh.h \
		./include/ngl/BBox.h \
		./include/ngl/AbstractMesh.h \
		./include/ngl/Random.h \
		./include/ngl/NCCAPointBake.h \
		./include/ngl/Shader.h \
		./include/ngl/ShaderProgram.h \
		./include/ngl/Plane.h \
		./include/ngl/AABB.h \
		./include/ngl/VertexArrayObject.h \
		./include/ngl/Vec3.h \
		./include/ngl/Vec2.h \
		./include/ngl/Text.h \
		./include/ngl/Mat3.h \




