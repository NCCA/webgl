ODIR=obj
LDIR =lib

CFLAGS= -Oz  -I../webngl/include/ -I../webngl/include/ngl -I/usr/local/include/ -s FULL_ES2=1 -DNGL_DEBUG -s ALLOW_MEMORY_GROWTH=1
CC=em++ $(CFLAGS)
SRCDIR   = ../webngl/src
OBJDIR   = ../webngl/obj
LIBDIR   =

SOURCES  := $(wildcard $(SRCDIR)/*.cpp) ./NGLDraw.cpp ./main.cpp
INCLUDES := $(wildcard $(SRCDIR)/include/ngl/*.h)
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
	rm -f src/*.o $(ODIR)/*.o ../webngl/obj/*
