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

   /*          case SDL_VIDEORESIZE: 
             {
        SDL_ResizeEvent *r = (SDL_ResizeEvent*)&event;
        printf("resize event! %d:%d\n", r->w, r->h);
        nglscene->resize(r->w,r->h);
	    }*/
        default : break;

/*
        case SDL_WINDOWEVENT:
				std::cout<<"window event\n";
				switch (event.window.event)
				{

						case SDL_WINDOWEVENT_RESIZED:
								std::cout<<"resize event \n";
								nglscene->resize(event.window.data1, event.window.data2);
								break;
						default:
								break;
				}

				break;

*/


      } // end of event switch
    } // end of poll events

int x = EM_ASM_INT({return $("#slider1").slider("value") } , NULL);
int y = EM_ASM_INT({return $("#slider2").slider("value") } , NULL);
int z = EM_ASM_INT({return $("#slider3").slider("value") } , NULL);

	nglscene->rotate(x,y,z);
//	EM_ASM_INT({$("#slider1").slider("value" , $0)  },nglscene->getXRot() );
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

    screen = SDL_SetVideoMode( 720, 576, 16, SDL_OPENGL  | SDL_RESIZABLE); // *changed*
    if ( !screen ) {
        printf("Unable to set video mode: %s\n", SDL_GetError());
        return 1;
    }

		glEnable(GL_DEPTH_TEST);

		nglscene = new NGLDraw();

		nglscene->resize(720,576);

		emscripten_set_main_loop (process, 0, true);


    SDL_Quit();

    return 0;
}
