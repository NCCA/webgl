ODIR=obj
LDIR =lib

CFLAGS= -Oz  -I../webngl/include/ -I../webngl/include/ngl -Iinclude -I/usr/local/include/ \
-I/usr/local/include/bullet -s FULL_ES2=1 -DNGL_DEBUG -s ALLOW_MEMORY_GROWTH=1 --js-library compiledfuncs.js
CC=em++ $(CFLAGS)
SRCDIR   = ../webngl/src
OBJDIR   = ../webngl/obj
LIBDIR   =
LDFLAGS := --preload-file models --preload-file font  \
--compression /Users/jmacey/emsdk_portable/emscripten/1.13.0/third_party/lzma.js/lzma-native,/Users/jmacey/emsdk_portable/emscripten/1.13.0/third_party/lzma.js/lzma-decoder.js,LZMA.decompress

SOURCES  := $(wildcard $(SRCDIR)/*.cpp) ./src/NGLDraw.cpp ./src/main.cpp ./src/CollisionShape.cpp ./src/PhysicsWorld.cpp libBulletDynamics.bc libBulletCollision.bc libLinearMath.bc
INCLUDES := $(wildcard $(SRCDIR)/include/ngl/*.h) ./NGLDraw.o ./main.o
OBJECTS  := $(SOURCES:$(SRCDIR)/%.cpp=$(OBJDIR)/%.o)

BUILDLIB=WebNGL.html

../webngl/obj/%.o: ../webngl/src/%.cpp
	$(CC) -c $(CFLAGS) -o $@ $<

%.o: %.cpp
	$(CC) -c $(CFLAGS) -o $@ $<


$(BUILDLIB): $(OBJECTS)
	$(CC) $(LDFLAGS) $(OBJECTS) -o $@

.PHONY: clean

clean:
	rm -f src/*.o $(ODIR)/*.o ../webngl/obj/* *.js.* *.data *.js

