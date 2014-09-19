ODIR=obj
LDIR =lib

CFLAGS= -Oz  -I../webngl/include/ -I../webngl/include/ngl -I/usr/local/include/ -Iinclude \
-s FULL_ES2=1 -DNGL_DEBUG -s ALLOW_MEMORY_GROWTH=1
CC=em++ $(CFLAGS)
SRCDIR   = ../webngl/src
OBJDIR   = ../webngl/obj
LIBDIR   =
LDFLAGS := --preload-file shaders \
--compression /Users/jmacey/emsdk_portable/emscripten/1.13.0/third_party/lzma.js/lzma-native,/Users/jmacey/emsdk_portable/emscripten/1.13.0/third_party/lzma.js/lzma-decoder.js,LZMA.decompress

SOURCES  := $(wildcard $(SRCDIR)/*.cpp) src/main.cpp src/NGLDraw.cpp


INCLUDES := $(wildcard $(SRCDIR)/include/ngl/*.h)
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

