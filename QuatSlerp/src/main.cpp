#include "SDL.h"
#include "SDL_image.h"
#include "NGLDraw.h"
#include <stdio.h>
#include <string.h>
#include <emscripten.h>
#include <ngl/Vec3.h>
NGLDraw *nglscene;
// these are actually external j-script functions 
extern "C" 
{ 
	extern void setStartText(const char *text);
	extern void setEndText(const char *text);
	extern void setInterpText(const char *text);
	extern void setRotMatrix(const char *text);

}
void getDataFromJQuery()
{
	float x,y,z;
	x = EM_ASM_DOUBLE({return $("#startX").spinner("value") } , NULL);
	y = EM_ASM_DOUBLE({return $("#startY").spinner("value") } , NULL);
	z = EM_ASM_DOUBLE({return $("#startZ").spinner("value") } , NULL);
	nglscene->setStartRotation(ngl::Vec3(x,y,z));
	x = EM_ASM_DOUBLE({return $("#endX").spinner("value") } , NULL);
	y = EM_ASM_DOUBLE({return $("#endY").spinner("value") } , NULL);
	z = EM_ASM_DOUBLE({return $("#endZ").spinner("value") } , NULL);
	nglscene->setEndRotation(ngl::Vec3(x,y,z));
	int interp = EM_ASM_INT({return $("#interpValue").slider("value") } , NULL);
	nglscene->setInterpolation(float(interp/1000.0));
	
}

void sendDataToForm()
{
	setStartText(nglscene->getStartQuatText().c_str());
	setEndText(nglscene->getEndQuatText().c_str());
	setInterpText(nglscene->getInterpQuatText().c_str());
	setRotMatrix(nglscene->getRotMatrixText().c_str());

}


void process()
{
	getDataFromJQuery();
	sendDataToForm();
	nglscene->draw();

	SDL_GL_SwapBuffers();
}

int main(int argc, char *argv[])
{

    SDL_Surface *screen;

    // Slightly different SDL initialization
    if ( SDL_Init(SDL_INIT_VIDEO) != 0 ) 
    {
        std::cerr<<"Unable to initialize SDL: "<<SDL_GetError()<<"\n";
        return 1;
    }

    SDL_GL_SetAttribute( SDL_GL_DOUBLEBUFFER, 1 );

    screen = SDL_SetVideoMode( 720, 576, 16, SDL_OPENGL ); // *changed*
    if ( !screen )
    {
        std::cerr<<"Unable to set video mode:"<<SDL_GetError()<<"\n";
        return 1;
    }

		glEnable(GL_DEPTH_TEST);

		nglscene = new NGLDraw();

		nglscene->resize(720,576);
		emscripten_set_main_loop (process, 0, true);


    SDL_Quit();

    return 0;
}
