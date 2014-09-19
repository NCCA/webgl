
ODIR=obj
LDIR =lib

CFLAGS= -Oz  -I../webngl/include/ -I../webngl/include/ngl -Iinclude -I/usr/local/include/ \
-s FULL_ES2=1 -DNGL_DEBUG -s ALLOW_MEMORY_GROWTH=1 
CC=em++ $(CFLAGS)
SRCDIR   = src
OBJDIR   = obj
LIBDIR   =

SOURCES  := $(wildcard $(SRCDIR)/*.cpp)
INCLUDES := $(wildcard $(SRCDIR)/include/ngl/*.h)
OBJECTS  := $(SOURCES:$(SRCDIR)/%.cpp=$(OBJDIR)/%.o)


BUILDLIB=lib/NGL.bc

all : $(BUILDLIB)

obj/%.o: src/%.cpp
	$(CC) -c $(CFLAGS) -o $@ $<

$(BUILDLIB): $(OBJECTS)
	$(CC) $(LDFLAGS) $(OBJECTS) -o $@

.PHONY: clean

clean:
	rm -f src/*.o $(ODIR)/*.o lib/NGL.bc




