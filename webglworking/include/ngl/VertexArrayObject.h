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
#ifndef __VERTEXARRAYOBJECT_H__
#define __VERTEXARRAYOBJECT_H__
//----------------------------------------------------------------------------------------------------------------------
/// @file VertexArrayObject.h
/// @brief a class to store an OpenGL VAO
//----------------------------------------------------------------------------------------------------------------------


// must include types.h first for ngl::Real and GLEW if required
#include "Types.h"
#include <vector>
#include <iostream>
//----------------------------------------------------------------------------------------------------------------------
/// @file VertexArrayObject.h
/// @brief encapsulates an OpenGL VAO
/// @author Jonathan Macey
/// @version 1.0
/// @date 14/6/11 Initial version
/// Revision History :

//----------------------------------------------------------------------------------------------------------------------
namespace ngl
{

//----------------------------------------------------------------------------------------------------------------------
/// @class VertexArrayObject "include/VertexArrayObject.h"
/// @brief a class to encapsulate an OpenGL VAO
//----------------------------------------------------------------------------------------------------------------------

class VertexAttribute
{
	public :
		 VertexAttribute(
														GLuint _id,
														GLint _size,
														GLenum _type,
														GLsizei _stride,
														unsigned int _dataOffset,
														bool _normalise=GL_FALSE
													 );

		~VertexAttribute(){glDisableVertexAttribArray(m_id);}
		void bind()const
		{
			glVertexAttribPointer(m_id,m_size,m_type,m_normalise,m_stride,((float *)NULL + (m_dataOffset)));
			glEnableVertexAttribArray(m_id);
		}
	  void unbind()const
	  {
			 glDisableVertexAttribArray(m_id);
		 }
		inline GLint getSize() const {return m_size;}
	private :
		#pragma pack(push,1)
		GLuint m_id;
		GLint m_size;
		GLenum m_type;
		GLsizei m_stride;
		unsigned int m_dataOffset;
		bool m_normalise;
		#pragma pack(pop)
};




class  VertexArrayObject
{

public:
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief method to return a newVOA object
	/// @returns a new VOA object
	//----------------------------------------------------------------------------------------------------------------------
	inline static VertexArrayObject * createVOA(
																								GLenum _mode
																							)
																							 {
																								 return new VertexArrayObject(_mode);
																							 }
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief bind this VOA to make it active
	//----------------------------------------------------------------------------------------------------------------------
	void bind();
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief unbind the VOA and set 0 to be the active VOA
	//----------------------------------------------------------------------------------------------------------------------
	void unbind();
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief delete the VOA (using OpenGL calls to clear data etc)
	//----------------------------------------------------------------------------------------------------------------------
	void removeVOA();
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief accesor for the VOA id
	/// @brief returns the VOA id
	//----------------------------------------------------------------------------------------------------------------------
	inline GLuint getID()const {return m_id;}
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief accesor to see if VOA is bound
	/// @brief returns the bind state (true for bound)
	//----------------------------------------------------------------------------------------------------------------------
	inline bool isBound()const {return m_bound;}
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief accesor to see if VOA has allocated data
	/// @brief returns the allocated state (true for allocated)
	//----------------------------------------------------------------------------------------------------------------------
	inline bool isAllocated()const {return m_allocated;}
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief allocate our data using raw face values (for example tri's) data, attributes must be bound to match at
	/// a different level of code (usually in the client as part of the shader loading, see VAO examples for more details
	/// @param _size the size of the raw data passed
	/// @param _data the actual data to set for the VOA
	/// @param _mode the draw mode hint used by GL
	//----------------------------------------------------------------------------------------------------------------------
	void setData(
								unsigned int _size,
	              const GLfloat &_data,
							  GLenum _mode=GL_STATIC_DRAW
							);
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief allocate our data using raw face values (for example tri's) data, attributes must be bound to match at
	/// a different level of code (usually in the client as part of the shader loading, see VAO examples for more details
	/// This value uses an index array to point to series of data to store
	/// @param _size the size of the raw data passed
	/// @param _data the actual data to set for the VOA
	/// @param _indexSize the size of the index array passed
	/// @param _indexData the actual data to set for the VOA indexes (only GLubyte data at present need to write more methods
	/// but usually only use this
	/// @param _mode the draw mode hint used by GL
	//----------------------------------------------------------------------------------------------------------------------
	void setIndexedData(
											unsigned int _size,
											const GLfloat &_data,
											unsigned int _indexSize,
											const GLubyte &_indexData,
											GLenum _mode=GL_STATIC_DRAW

										 );
	//----------------------------------------------------------------------------------------------------------------------
		/// @brief allocate our data
		/// @param _size the size of the raw data passed (not counting sizeof(GL_FLOAT))
		/// @param _type the data type of the Pointer (eg GL_FLOAT)
		/// @param _stride the step between data values (need *sizeof _type) e.g. 10*sizeof(GLfloat)
		/// @param _dataOffset Specifies a pointer to the first component of the first generic vertex attribute
		/// in the array. The initial value is 0. and is calculated as ((float *)NULL + (_dataOffset))
		/// @param _normalise specifies whether fixed-point data values should be normalized (GL_TRUE) or converted directly as fixed-point values
		/// (GL_FALSE) when they are accessed.
		//----------------------------------------------------------------------------------------------------------------------
		void setVertexAttributePointer(
																	GLuint _id,
																	GLint _size,
																	GLenum _type,
																	GLsizei _stride,
																	unsigned int _dataOffset,
																	bool _normalise=GL_FALSE
																);
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief draw the VOA
	//----------------------------------------------------------------------------------------------------------------------
	void draw() const;
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief draw the VOA
	/// @param[in] _mode the mode to draw with
	//----------------------------------------------------------------------------------------------------------------------
	void draw(GLenum _mode) const;
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief draw the VOA
	/// @param [in] _start start Index
	/// @param [in] _numVerts the number to draw
	/// @param[in] _mode the mode to draw with
	//----------------------------------------------------------------------------------------------------------------------
	void draw(unsigned int _startIndex,	unsigned int _numVerts,	GLenum _mode=GL_TRIANGLES	) const;
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief get the VBO id for the data mapped at index _index
	/// basically this will be the vbo for the setData called, so if it has been called
	/// 3 times 0 would be first call 1, 2nd etc.
	/// @param[in] _index the index to get the id for
	/// @returns 0 if not found else the vbo id
	//----------------------------------------------------------------------------------------------------------------------
		GLuint getVBOid(unsigned int _index );

	//----------------------------------------------------------------------------------------------------------------------
	/// @brief set the number of faces to draw
	/// @param _n the number of indices to draw in glDrawArray (param 3 count)
	//----------------------------------------------------------------------------------------------------------------------
	inline void setNumIndices(GLuint _n){m_indicesCount=_n;}
	inline void setDrawMode(GLenum _mode){m_drawMode=_mode;}
	 //----------------------------------------------------------------------------------------------------------------------
  /// @brief grab a pointer to the first block of the data
  /// @param[in] _vbo the vbo number of the block you wish to grab the data for
  /// @param[in] _accessMode the mode to access the data, this is default to
  /// GL_READ_WRITE but we could change this to GL_READ to make access quicker for
  /// just reading the values or GL_WRITE for just writing values etc.
  /// @returns a pointer to the data
  //----------------------------------------------------------------------------------------------------------------------
  Real *getDataPointer(unsigned int _vbo,GLenum _accessMode);
  //----------------------------------------------------------------------------------------------------------------------
  /// @brief unmap the data pointer
  //----------------------------------------------------------------------------------------------------------------------
  void freeDataPointer();
protected :
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief the draw mode of the VAO e.g. GL_TRIANGLES
	//----------------------------------------------------------------------------------------------------------------------
	GLenum m_drawMode;
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief the number of faces to draw
	//----------------------------------------------------------------------------------------------------------------------
	GLenum m_indicesCount;
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief the id of the VAO allocated by OpenGL
	//----------------------------------------------------------------------------------------------------------------------
	GLuint m_id;
	std::vector <GLuint> m_vbos;
	std::vector <GLuint> m_ibos;
	std::vector <VertexAttribute>m_attributes;

	//----------------------------------------------------------------------------------------------------------------------
	/// @brief flag to indicate if we have allocated the data to the VAO
	//----------------------------------------------------------------------------------------------------------------------
	bool m_allocated;
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief flag to indicate if we have an index or non index vao to draw
	//----------------------------------------------------------------------------------------------------------------------
	bool m_indexed;
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief Specifies the type of the values in the indices buffer. Must be one of GL_UNSIGNED_BYTE, GL_UNSIGNED_SHORT, or
	///  GL_UNSIGNED_INT.
	//----------------------------------------------------------------------------------------------------------------------
	GLenum m_indexType;
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief an array of VBO associated with this VAO
	//----------------------------------------------------------------------------------------------------------------------
	std::vector <GLuint> m_vboIDs;

	//----------------------------------------------------------------------------------------------------------------------
	/// @brief flag to indicate if we are bound
	//----------------------------------------------------------------------------------------------------------------------
	bool m_bound;
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief hide the ctor as we want to create static factory only
	//----------------------------------------------------------------------------------------------------------------------
	VertexArrayObject(GLenum _mode);
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief hide the copy ctor as we want to create static factory only
	//----------------------------------------------------------------------------------------------------------------------
	VertexArrayObject(const VertexArrayObject &_v);
	//----------------------------------------------------------------------------------------------------------------------
	/// @brief hide the dtor as we want to create static factory only
	//----------------------------------------------------------------------------------------------------------------------
	~VertexArrayObject(){;}

};


}
#endif

//----------------------------------------------------------------------------------------------------------------------
