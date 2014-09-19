#include "SDL.h"
#include "SDL_image.h"
#include "NGLDraw.h"
#include <cstdio>
#include <emscripten.h>
#include <cstdlib>
// bug - SDL_GetKeyboardState doesn't return scancodes, it returns keycodes, so acts exactly like
// SDL_GetKeyState instead
#define SDL_GetKeyState SDL_GetKeyboardState
NGLDraw *nglscene;

void process()
{
		bool keypress=false;
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
					keypress=true;
        } // end of keydown

        default : break;
      } // end of event switch
    } // end of poll events


	if(keypress == true)
	{
		const Uint8 *keys = SDL_GetKeyState(NULL);
		SDL_PumpEvents();
		nglscene->keyEvent(event.key.keysym.sym);
	}

	nglscene->timerEvent();
	nglscene->draw();
	SDL_GL_SwapBuffers();
}

int main(int argc, char *argv[])
{

    SDL_Surface *screen;

    // Slightly different SDL initialization
    if ( SDL_Init(SDL_INIT_VIDEO) != 0 ) 
    {
        std::cerr<<"Unable to initialize SDL There is a good change your browser doesn't support webGL <<" <<SDL_GetError()<<"\n";
        return EXIT_FAILURE;
    }

    SDL_GL_SetAttribute( SDL_GL_DOUBLEBUFFER, 1 );

    screen = SDL_SetVideoMode( 720, 576, 16, SDL_OPENGL ); // *changed*
    if ( !screen ) 
    {
        std::cerr<<"Unable to set video mode: "<< SDL_GetError()<<"\n";
        return EXIT_FAILURE;
    }

		glEnable(GL_DEPTH_TEST);

		nglscene = new NGLDraw();

		nglscene->resize(720,576);

		emscripten_set_main_loop (process, 0, true);


    SDL_Quit();

    return EXIT_SUCCESS;
}
