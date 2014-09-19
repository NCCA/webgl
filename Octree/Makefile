ODIR=obj
LDIR =lib
SRCDIR   = ../webngl/src
OBJDIR   = ../webngl/obj

CFLAGS= -Oz  -I../webngl/include/ -I../webngl/include/ngl -I/usr/local/include/  -Iinclude \
-s FULL_ES2=1 -DNGL_DEBUG -s ALLOW_MEMORY_GROWTH=1 --js-library compiledfuncs.js
CC=em++ $(CFLAGS)
LIBDIR   =
LDFLAGS :=
SOURCES  := ../webngl/lib/NGL.bc src/NGLDraw.cpp src/main.cpp src/Particle.cpp  src/ParticleOctree.cpp src/Scene.cpp
INCLUDES := $(wildcard $(SRCDIR)/include/ngl/*.h) ./NGLDraw.o ./main.o
OBJECTS  := $(SOURCES:$(SRCDIR)/%.cpp=$(OBJDIR)/%.o)
LDFLAGS = --compression /Users/jmacey/emsdk_portable/emscripten/1.13.0/third_party/lzma.js/lzma-native,/Users/jmacey/emsdk_portable/emscripten/1.13.0/third_party/lzma.js/lzma-decoder.js,LZMA.decompress

BUILDLIB=WebNGL.html

%.o: %.cpp
	$(CC) -c $(CFLAGS) -o $@ $<


$(BUILDLIB): $(OBJECTS)
	$(CC) $(LDFLAGS) $(OBJECTS) -o $@

.PHONY: clean

clean:
	rm -f src/*.o $(ODIR)/*.o  *.js.* *.data *.compress WebNGL.html

