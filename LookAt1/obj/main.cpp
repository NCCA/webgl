#include "SDL.h"
#include "SDL_image.h"
#include "NGLDraw.h"
#include <stdio.h>
#include <string.h>
#include <emscripten.h>

NGLDraw *nglscene;

void process()
{
		SDL_Event event;
    while(SDL_PollEvent(&event))
    {
    switch (event.type)
    {

        // this is the window x being clicked.
        // process the mouse data by passing it to ngl class
        case SDL_MOUSEMOTION :
        nglscene->mouseMoveEvent(event.motion); break;
        case SDL_MOUSEBUTTONDOWN :
        nglscene->mousePressEvent(event.button); break;
        case SDL_MOUSEBUTTONUP :
        nglscene->mouseReleaseEvent(event.button); break;

        // now we look for a keydown event
        case SDL_KEYDOWN:
        {
          switch( event.key.keysym.sym )
          {
            // if it's the escape key quit
            default : break;
          } // end of key process
        } // end of keydown

        default : break;
      } // end of event switch
    } // end of poll events


	nglscene->draw();
	SDL_GL_SwapBuffers();
}

int main(int argc, char *argv[])
{

    SDL_Surface *screen;

    // Slightly different SDL initialization
    if ( SDL_Init(SDL_INIT_VIDEO) != 0 ) {
        printf("Unable to initialize SDL: %s\n", SDL_GetError());
        return 1;
    }

    SDL_GL_SetAttribute( SDL_GL_DOUBLEBUFFER, 1 );

    screen = SDL_SetVideoMode( 720, 576, 16, SDL_OPENGL ); // *changed*
    if ( !screen ) {
        printf("Unable to set video mode: %s\n", SDL_GetError());
        return 1;
    }

		glEnable(GL_DEPTH_TEST);

		nglscene = new NGLDraw();

		nglscene->resize(720,576);

		emscripten_set_main_loop (process, 30, true);


    SDL_Quit();

    return 0;
}