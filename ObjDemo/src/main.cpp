#include "SDL.h"
#include "SDL_image.h"
#include "NGLDraw.h"
#include <stdio.h>
#include <string.h>
#include <emscripten.h>
#include <cstdlib>

#define SDL_GetKeyState SDL_GetKeyboardState

NGLDraw *nglscene;

extern "C"
{

// Adds the given callback function to listen to the changes in browser window size.
void windowResizeHandler(void *userData, void (*handlerFunc)(int newWidth, int newHeight, void *userData));
void canvasWheelEvent(void *userData, void (*handlerFunc)(int delta, void *userData));

}

void onWindowResize(int newWidth, int newHeight, void * /*userData*/)
{
  emscripten_set_canvas_size(newWidth, newHeight);
  // This probably needs that any extra elements are removed from the default shell.html.
  nglscene->resize(newWidth,newHeight);
}

void onWheel(int delta, void * )
{
  nglscene->wheelEvent(delta);
}



void process()
{
  SDL_Event event;
  bool keypress=false;
  while(SDL_PollEvent(&event))
  {
    switch (event.type)
    {

      // this is the window x being clicked.
      // process the mouse data by passing it to ngl class
      case SDL_MOUSEMOTION :
        nglscene->mouseMoveEvent(event.motion);
      break;
      case SDL_MOUSEBUTTONDOWN :
        nglscene->mousePressEvent(event.button);
      break;
      case SDL_MOUSEBUTTONUP :
        nglscene->mouseReleaseEvent(event.button);
      break;
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
    SDL_PumpEvents();
    nglscene->keyEvent(event.key.keysym.sym);
  }

  nglscene->draw();
  SDL_GL_SwapBuffers();
}


int main(int argc, char *argv[])
{
	int width = EM_ASM_INT({return document.body.clientWidth-10 } , NULL);
	int height = EM_ASM_INT({return window.innerHeight } , NULL);

	SDL_Surface *screen;

	// Slightly different SDL initialization
	if ( SDL_Init(SDL_INIT_VIDEO) != 0 )
	{
		std::cerr<<"Unable to initialize SDL: "<<SDL_GetError();
		return EXIT_FAILURE;
	}

	SDL_GL_SetAttribute( SDL_GL_DOUBLEBUFFER, 1 );

	screen = SDL_SetVideoMode( width, height, 16, SDL_OPENGL  | SDL_RESIZABLE);
	if ( !screen )
	{
		std::cerr<<"Unable to set video mode: "<<SDL_GetError();
		return EXIT_FAILURE;
	}

	glEnable(GL_DEPTH_TEST);

	nglscene = new NGLDraw();

	nglscene->resize(width,height);
	windowResizeHandler(NULL, onWindowResize);
	canvasWheelEvent(NULL, onWheel);

	emscripten_set_main_loop (process, 0, true);


	SDL_Quit();

	return EXIT_SUCCESS;
}
