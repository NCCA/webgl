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

#include "VertexArrayObject.h"
#include <iostream>
//----------------------------------------------------------------------------------------------------------------------
/// @file VertexArrayObject.cpp
/// @brief implementation files for VertexArrayObject class
//----------------------------------------------------------------------------------------------------------------------
namespace ngl
{


VertexAttribute::VertexAttribute(
																	GLuint _id,
																	GLint _size,
																	GLenum _type,
																	GLsizei _stride,
																	unsigned int _dataOffset,
																	bool _normalise
																 )
{
	m_id=_id;
	m_size=_size;
	m_type=_type;
	m_stride=_stride;
	m_dataOffset=_dataOffset;
	m_normalise=_normalise;
//	m_indexType = GL_UNSIGNED_BYTE;

}



//----------------------------------------------------------------------------------------------------------------------
VertexArrayObject::VertexArrayObject(
																			 GLenum _mode
																		 )
{
	m_allocated=false;
	// first we create a vertex array Object

  //glGenVertexArraysOES(1, &m_id);
	m_bound=false;
	m_drawMode=_mode;
	m_indicesCount=0;
	m_indexed=false;
}

//----------------------------------------------------------------------------------------------------------------------
void VertexArrayObject::bind()
{
/*
struct vertData
{
  GLfloat u;
	GLfloat v;
	GLfloat nx;
	GLfloat ny;
	GLfloat nz;
	GLfloat x;
	GLfloat y;
	GLfloat z;
};

	//glBindVertexArrayOES(m_id);
	glBindBuffer(GL_ARRAY_BUFFER,m_id);
	glVertexAttribPointer(0,3,GL_FLOAT,GL_FALSE,sizeof(vertData),((float *)NULL + (5)));
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(1,2,GL_FLOAT,GL_FALSE,sizeof(vertData),((float *)NULL + (0)));
	glEnableVertexAttribArray(1);
	glVertexAttribPointer(2,3,GL_FLOAT,GL_FALSE,sizeof(vertData),((float *)NULL + (2)));
	glEnableVertexAttribArray(2);
*/
	m_bound=true;
}
//----------------------------------------------------------------------------------------------------------------------
void VertexArrayObject::unbind()
{
    //glBindVertexArrayOES(0);
    glEnableVertexAttribArray(0);
    glBindBuffer(GL_ARRAY_BUFFER,0);

	m_bound=false;
}
//----------------------------------------------------------------------------------------------------------------------
void VertexArrayObject::removeVOA()
{
	if(m_bound == true)
	{
		unbind();
	}
	if( m_allocated ==true)
	{
	//glDeleteVertexArraysOES(1,&m_id);
	m_allocated=false;
	}
}
//----------------------------------------------------------------------------------------------------------------------
void VertexArrayObject::setData(
																 unsigned int _size,
                                  const GLfloat &_data,
																 GLenum _mode
																)
{
	if(m_bound == false)
	{
		std::cerr<<"trying to set VOA data when unbound\n";
	}
	GLuint vboID;
	glGenBuffers(1, &vboID);
	m_vbos.push_back(vboID);
	// now we will bind an array buffer to the first one and load the data for the verts
	glBindBuffer(GL_ARRAY_BUFFER, vboID);
	glBufferData(GL_ARRAY_BUFFER, _size, &_data, _mode);
	m_allocated=true;

}

void VertexArrayObject::setIndexedData(
																			unsigned int _size,
																			const GLfloat &_data,
																			unsigned int _indexSize,
																			const GLubyte &_indexData,
																			GLenum _mode
																		 )
{

	if(m_bound == false)
	{
		std::cerr<<"trying to set VOA data when unbound\n";
	}
	GLuint vboID;
	glGenBuffers(1, &vboID);
	m_vbos.push_back(vboID);
	GLuint iboID;
	glGenBuffers(1, &iboID);
	m_ibos.push_back(iboID);

	// now we will bind an array buffer to the first one and load the data for the verts
	glBindBuffer(GL_ARRAY_BUFFER, vboID);
	glBufferData(GL_ARRAY_BUFFER, _size, &_data, _mode);

// now for the indices
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, iboID);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, _indexSize * sizeof(GLubyte), &_indexData, GL_STATIC_DRAW);

	m_allocated=true;
	m_indexed=true;

}

//----------------------------------------------------------------------------------------------------------------------
void VertexArrayObject::setVertexAttributePointer(
																										GLuint _id,
																										GLint _size,
																										GLenum _type,
																										GLsizei _stride,
																										unsigned int _dataOffset,
																										bool _normalise
																									)
{
	if(m_bound !=true)
	{
		std::cerr<<"Warning trying to set attribute  on Unbound VOA\n";
	}

	m_attributes.push_back(VertexAttribute(_id,_size,_type,_stride,_dataOffset,GL_FALSE));


}

//----------------------------------------------------------------------------------------------------------------------
void VertexArrayObject::draw() const
{
struct vertData
{
  GLfloat u;
	GLfloat v;
	GLfloat nx;
	GLfloat ny;
	GLfloat nz;
	GLfloat x;
	GLfloat y;
	GLfloat z;
};
	if(m_allocated == false)
	{
		std::cerr<<"Warning trying to draw an unallocated VOA\n";
	}
	if(m_bound == false)
	{
		std::cerr<<"Warning trying to draw an unbound VOA\n";
	}

	if(m_indexed == false)
	{
		for(unsigned int i=0; i<m_vbos.size(); ++i)
		{
			//glBindVertexArrayOES(m_id);
			glBindBuffer(GL_ARRAY_BUFFER,m_vbos[i]);
			for(unsigned int a=0; a<m_attributes.size(); ++a)
			{
				m_attributes[a].bind();
			}
			glDrawArrays(m_drawMode, 0, m_indicesCount);	// draw first object
		}
	}
	else
	{
			std::cout<<"draw el num vbo "<<m_vbos.size()<<"\n";
		for(unsigned int i=0; i<m_vbos.size(); ++i)
		{
			//glBindVertexArrayOES(m_id);
			glBindBuffer(GL_ARRAY_BUFFER,m_vbos[i]);
			glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_ibos[i]);

			for(unsigned int a=0; a<m_attributes.size(); ++a)
			{
				m_attributes[a].bind();
			}
			glDrawElements(m_drawMode,m_indicesCount,GL_UNSIGNED_BYTE,0);
		}
	}
}
//----------------------------------------------------------------------------------------------------------------------
void VertexArrayObject::draw(unsigned int _startIndex, unsigned int _numVerts, GLenum _mode  ) const
{
  if(m_allocated == false)
  {
    std::cerr<<"Warning trying to draw an unallocated VOA\n";
  }
  if(m_bound == false)
  {
    std::cerr<<"Warning trying to draw an unbound VOA\n";
  }
  glDrawArrays(_mode, _startIndex, _numVerts);	// draw first object
}

void VertexArrayObject::draw(GLenum _mode) const
{
  if(m_allocated == false)
  {
    std::cerr<<"Warning trying to draw an unallocated VOA\n";
  }
  if(m_bound == false)
  {
    std::cerr<<"Warning trying to draw an unbound VOA\n";
  }

  if(m_indexed == false)
  {
    glDrawArrays(_mode, 0, m_indicesCount);	// draw first object
  }
  else
  {
    glDrawElements(m_drawMode,m_indicesCount,m_indexType,(GLvoid*)((char*)NULL));
  }
}

GLuint VertexArrayObject::getVBOid(unsigned int _index)
{
  GLuint id=0;
  /// _index >=0 && picked up by g++4.3 so removed from below
  if(_index<m_vboIDs.size())
  {
    id=m_vboIDs[_index];
  }
  return id;
}
//----------------------------------------------------------------------------------------------------------------------
Real *VertexArrayObject::getDataPointer(unsigned int _vbo, GLenum _accessMode)
{
  Real *ptr=0;
//  code was this but g++ 4.2 gives warning about it always being true
// removed the first test as change to uint so should be ok
//  if(_vbo >=0 && _vbo<m_vboIDs.size())
//
  if(_vbo<m_vboIDs.size())
  {
    bind();
    glBindBuffer(GL_ARRAY_BUFFER, m_vboIDs[_vbo]);
   // ptr = (Real*)glMapBufferOES(GL_ARRAY_BUFFER, GL_WRITE_ONLY_OES);
   // ptr = glMapBufferRange(GL_ARRAY_BUFFER, 0, m_attributes[_vbo].getSize(), GL_WRITE_ONLY_OES);

  }
  return ptr;
}

void VertexArrayObject::freeDataPointer()
{
  glUnmapBufferOES(GL_ARRAY_BUFFER); // unmap it after use
}




//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------

} // end namspace ngl



