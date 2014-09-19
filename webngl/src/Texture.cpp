/*
  Copyright (C) 2009 Jon Macey

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
//----------------------------------------------------------------------------------------------------------------------
/// @file Texture.cpp
/// @brief implementation files for Texture class
//----------------------------------------------------------------------------------------------------------------------
#include "NGLassert.h"
#include "Texture.h"
#include "SDL.h"
#include "SDL_image.h"


namespace ngl
{

//----------------------------------------------------------------------------------------------------------------------
bool Texture::loadImage( const std::string &_fName  )
{
  std::cout<<"NGL loading texture\n";


  SDL_Surface *surface; // Gives us the information to make the texture

  surface=IMG_Load(_fName.c_str());



  if(!surface)
  {
    std::cerr<<"error loading image "<<_fName.c_str()<<"\n";
  }

  if(surface)
  {
    m_width=surface->w;
    m_height=surface->h;

    m_bpp=surface->format->BytesPerPixel;

    if(m_bpp == 4)
    {
      m_bpp=4;
      m_format = GL_RGBA;
    }
    else
    {
      m_bpp=3;
      m_format = GL_RGB;
    }

    m_data = new unsigned char[ m_width*m_height*m_bpp];
    memcpy(m_data,surface->pixels,m_width*m_height*m_bpp);
    std::cout<<"Image size ="<<m_width<<"x"<<m_height<<std::endl;
    std::cout<<"has alpha = "<<m_hasAlpha<<std::endl;
    std::cout<<"bpp = "<<m_bpp<<std::endl;
    return true;

  }

  else return false;
}

//----------------------------------------------------------------------------------------------------------------------
Texture::Texture()
{
	m_width=0;
	m_height=0;
	m_data=0;
	m_multiTextureID=0;
	m_hasAlpha=false;
}

//----------------------------------------------------------------------------------------------------------------------
Texture::Texture( const std::string &_fName  )
{
	m_width=0;
	m_height=0;
	m_data=NULL;
	m_multiTextureID=0;
	loadImage(_fName);
}


//----------------------------------------------------------------------------------------------------------------------
Texture::~Texture()
{
  if(m_data !=0)
  {
    delete [] m_data;
  }

}

//----------------------------------------------------------------------------------------------------------------------
double Texture::getFromXY(	const GLuint _x, const GLuint _y  ) const
{
// make sure were in the image range
	NGL_ASSERT(_x<=m_width && _y<=m_height);
	if (m_data !=0)
	{
		return m_data[_x*4+((_y)*m_width*4)];
	}
	else
	{
		return 0;
	}
}
//----------------------------------------------------------------------------------------------------------------------

/// @note this is really inflexible at the moment needs to be made more generic and give more
/// control over the OpenGL texture types etc
/// Could actually be worth creating a texture manager class at some stage along the lines of the
/// Shader manager class, or even a generic manager framework which we could then add items to

GLuint Texture::setTextureGL() const
{
  GLuint textureName;
  glGenTextures(1,&textureName);
  glActiveTexture(GL_TEXTURE0+m_multiTextureID);
  glBindTexture(GL_TEXTURE_2D,textureName);
  glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_LINEAR);
  glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_LINEAR);
  glTexImage2D(GL_TEXTURE_2D,0,m_format,m_width,m_height,0,m_format,GL_UNSIGNED_BYTE,m_data);
  std::cout<<"texture GL set "<<textureName<<"\n";
  glGenerateMipmap(GL_TEXTURE_2D);
  return textureName;
}
//----------------------------------------------------------------------------------------------------------------------

void Texture::setMultiTexture( const GLint _id  )
{
 m_multiTextureID=_id;
}

Colour Texture::getColourFromXY(const GLuint _x,const GLuint _y ) const
{
// make sure were in the image range
	NGL_ASSERT(_x<=m_width && _y<=m_height);
	if (m_data !=0)
	{
		int Offset=_x*4+((_y)*m_width*4);
		return Colour(m_data[Offset],m_data[Offset+1],m_data[Offset+2],m_data[Offset+3]);
	}
	else
	{
		return Colour(0,0,0,0);
	}
}


Colour Texture::getColour(const Real _uvX, const Real _uvY ) const
{

  GLuint xx = _uvX * (m_width-1);
  GLuint yy = _uvY * (m_height-1);

  NGL_ASSERT(xx<m_width && yy<m_height);

  if(m_data!=0)
  {
    int offset = xx * m_bpp + (yy * m_width * m_bpp );
    if(m_bpp == 4)
    {
      return Colour(m_data[offset],m_data[offset+1],m_data[offset+2],m_data[offset+3]);
    }
    else
    {
      return Colour(m_data[offset],m_data[offset+1],m_data[offset+2],1.0);
    }
  }
  else
  {
    return Colour(0,0,0,0);
  }
}


} // end namespace ngl;

//----------------------------------------------------------------------------------------------------------------------

