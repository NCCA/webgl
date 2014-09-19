ODIR=obj
LDIR =lib

CFLAGS= -Oz  -I../webngl/include/ -I../webngl/include/ngl -I/usr/local/include/ -Iinclude \
-s FULL_ES2=1 -DNGL_DEBUG -s ALLOW_MEMORY_GROWTH=1 \
-s DISABLE_EXCEPTION_CATCHING=2 --js-library compiledfuncs.js
CC=em++ $(CFLAGS)
SRCDIR   = ../webngl/src
OBJDIR   = ../webngl/obj
LIBDIR   =
LDFLAGS := --preload-file shaders  --preload-file models --preload-file font \
--compression /Users/jmacey/emsdk_portable/emscripten/1.13.0/third_party/lzma.js/lzma-native,/Users/jmacey/emsdk_portable/emscripten/1.13.0/third_party/lzma.js/lzma-decoder.js,LZMA.decompress

SOURCES  := ../webngl/lib/NGL.bc  ./src/NGLDraw.cpp ./src/main.cpp
INCLUDES := $(wildcard $(SRCDIR)/include/ngl/*.h) ./NGLDraw.o ./main.o
OBJECTS  := $(SOURCES:$(SRCDIR)/%.cpp=$(OBJDIR)/%.o)

BUILDLIB=WebNGL.html

%.o: %.cpp
	$(CC) -c $(CFLAGS) -o $@ $<


$(BUILDLIB): $(OBJECTS)
	$(CC) $(LDFLAGS) $(OBJECTS) -o $@

.PHONY: clean

clean:
	rm -f src/*.o $(ODIR)/*.o  *.js.* *.data *.compress WebNGL.html

