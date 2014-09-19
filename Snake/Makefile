ODIR=obj
LDIR =lib

CFLAGS= -Oz  -I../webngl/include/ -I../webngl/include/ngl -I/usr/local/include/ -s FULL_ES2=1 -DNGL_DEBUG -s ALLOW_MEMORY_GROWTH=1
CC=em++ $(CFLAGS)
SRCDIR   = ../webngl/src
OBJDIR   = ../webngl/obj
LIBDIR   =
LDFLAGS := --preload-file shaders  --preload-file models
SOURCES  := $(wildcard $(SRCDIR)/*.cpp) ./NGLDraw.cpp ./main.cpp Body.cpp    Fruit.cpp   Head.cpp
INCLUDES := $(wildcard $(SRCDIR)/include/ngl/*.h) ./NGLDraw.o ./main.o
OBJECTS  := $(SOURCES:$(SRCDIR)/%.cpp=$(OBJDIR)/%.o)

BUILDLIB=WebNGL.js

../webngl/obj/%.o: ../webngl/src/%.cpp
	$(CC) -c $(CFLAGS) -o $@ $<

%.o: %.cpp
	$(CC) -c $(CFLAGS) -o $@ $<


$(BUILDLIB): $(OBJECTS)
	$(CC) $(LDFLAGS) $(OBJECTS) -o $@

.PHONY: clean

clean:
	rm -f src/*.o $(ODIR)/*.o ../webngl/obj/* *.js.* *.data *.js

