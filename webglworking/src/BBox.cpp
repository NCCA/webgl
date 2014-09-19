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
/// @file BBox.cpp
/// @brief a simple bounding box class
//----------------------------------------------------------------------------------------------------------------------
#include "BBox.h"
#include "VertexArrayObject.h"
namespace ngl
{
const static GLubyte indices[]=  {
                                    0,1,5,0,4,5, // back
                                    3,2,6,7,6,3, // front
                                    0,1,2,3,2,0, // top
                                      4,5,6,7,6,4, // bottom
                                      0,3,4,4,7,3,
                                      1,5,2,2,6,5

                                 };
// indices for line loop
const static GLubyte lindices[]=  {
                                    0,3,7,4,0, /// Left
                                    0,1,5,4,0, /// back quad
                                    1,2,6,5,1, // right
                                    0,1,2,3,0,
                                    4,5,6,7,4
                                 };

//----------------------------------------------------------------------------------------------------------------------
BBox::BBox(
           const Vec3& _center,
           const Real& _width,
           const Real& _height,
           const Real& _depth
          )
{
	// Calculate the Vertices based on the w,h,d params passed in the box is asumed
	// to be centered on the _center with equal w / h / d
	// -x +y -z

	m_vert[0].m_x=_center.m_x-(_width/2.0f); m_vert[0].m_y=_center.m_y+(_height/2.0f); m_vert[0].m_z=_center.m_z-(_depth/2.0f);
	// + x -y -z
	m_vert[1].m_x=_center.m_x+(_width/2.0f); m_vert[1].m_y=_center.m_y+(_height/2.0f); m_vert[1].m_z=_center.m_z-(_depth/2.0f);
	m_vert[2].m_x=_center.m_x+(_width/2.0f); m_vert[2].m_y=_center.m_y+(_height/2.0f); m_vert[2].m_z=_center.m_z+(_depth/2.0f);
	m_vert[3].m_x=_center.m_x-(_width/2.0f); m_vert[3].m_y=_center.m_y+(_height/2.0f); m_vert[3].m_z=_center.m_z+(_depth/2.0f);
	m_vert[4].m_x=_center.m_x-(_width/2.0f); m_vert[4].m_y=_center.m_y-(_height/2.0f); m_vert[4].m_z=_center.m_z-(_depth/2.0f);
	m_vert[5].m_x=_center.m_x+(_width/2.0f); m_vert[5].m_y=_center.m_y-(_height/2.0f); m_vert[5].m_z=_center.m_z-(_depth/2.0f);
	m_vert[6].m_x=_center.m_x+(_width/2.0f); m_vert[6].m_y=_center.m_y-(_height/2.0f); m_vert[6].m_z=_center.m_z+(_depth/2.0f);
	m_vert[7].m_x=_center.m_x-(_width/2.0f); m_vert[7].m_y=_center.m_y-(_height/2.0f); m_vert[7].m_z=_center.m_z+(_depth/2.0f);

	//Store the _center
	m_center=_center;
	// Setup the Plane Normals for Collision Detection
	m_norm[0].set(0.0f,1.0f,0.0f);
	m_norm[1].set(0.0f,-1.0f,0.0f);
	m_norm[2].set(1.0f,0.0f,0.0f);
	m_norm[3].set(-1.0f,0.0f,0.0f);
	m_norm[4].set(0.0f,0.0f,1.0f);
	m_norm[5].set(0.0f,0.0f,-1.0f);
	// store width height and depth
	m_width=_width;
	m_height=_height;
	m_depth=_depth;
	m_drawMode=GL_LINES;
	m_vao=0;
	setVAO();
}


//----------------------------------------------------------------------------------------------------------------------
BBox::BBox()
{
	//default constructor creates a unit BBox
	ngl::Vec3 c(0.0f,0.0f,0.0f);
	//ngl::BBox(c,1.0f,1.0f,1.0f);
	m_center.m_x=m_center.m_y=m_center.m_z=0.0f;
	m_drawMode=GL_LINES;
  m_width=2.0;
  m_height=2.0;
  m_depth=2.0;
	m_vao=0;
	setVAO();
}
//----------------------------------------------------------------------------------------------------------------------
BBox::BBox(
           const Real& _minX,
           const Real& _maxX,
           const Real& _minY,
           const Real& _maxY,
           const Real& _minZ,
           const Real& _maxZ
          )
{

	m_minX=_minX;
	m_maxX=_maxX;
	m_minY=_minY;
	m_maxY=_maxY;
	m_minZ=_minZ;
	m_maxZ=_maxZ;


	m_center.set(0,0,0);

	m_vert[0].m_x=_minX; m_vert[0].m_y=_maxY; m_vert[0].m_z=_minZ;
	m_vert[1].m_x=_maxX; m_vert[1].m_y=_maxY; m_vert[1].m_z=_minZ;
	m_vert[2].m_x=_maxX; m_vert[2].m_y=_maxY; m_vert[2].m_z=_maxZ;
	m_vert[3].m_x=_minX; m_vert[3].m_y=_maxY; m_vert[3].m_z=_maxZ;

	m_vert[4].m_x=_minX; m_vert[4].m_y=_minY; m_vert[4].m_z=_minZ;
	m_vert[5].m_x=_maxX; m_vert[5].m_y=_minY; m_vert[5].m_z=_minZ;
	m_vert[6].m_x=_maxX; m_vert[6].m_y=_minY; m_vert[6].m_z=_maxZ;
	m_vert[7].m_x=_minX; m_vert[7].m_y=_minY; m_vert[7].m_z=_maxZ;
	m_drawMode=GL_LINES;
  m_width=m_maxX-m_minX;
  m_height=m_maxY-m_minY;
  m_depth=m_maxZ-m_minZ;
	m_vao=0;
	setVAO();

}

//----------------------------------------------------------------------------------------------------------------------
void BBox::setDrawMode(
                         const GLenum& _mode
                        )
{
  m_drawMode=_mode;
  setVAO();
}

void BBox::setVAO()
{
	// if we change the size we re-do the VAO
	if( m_vao != 0 )
	{
		std::cout<<"VAO already exists so delete and re-create\n";
		GLuint id=m_vao->getID();
		//glDeleteVertexArraysOES(1,&id);
	}
  // if were not doing line drawing then use tris
  if(m_drawMode !=GL_LINES)
  {
    m_vao=VertexArrayObject::createVOA(GL_TRIANGLES);

    // now we have our data add it to the VAO, we need to tell the VAO the following
    // how much (in bytes) data we are copying
    // a pointer to the first element of data (in this case the address of the first element of the
    // std::vector
    m_vao->bind();
    m_vao->setIndexedData(8*sizeof(Vec3),m_vert[0].m_x,sizeof(indices),indices[0]);

    m_vao->setVertexAttributePointer(0,3,GL_FLOAT,sizeof(Vec3),0);

    m_vao->setNumIndices(sizeof(indices));
    // finally we have finished for now so time to unbind the VAO
    m_vao->unbind();
  }
  else // we just need to draw the lines
  {
    m_vao=VertexArrayObject::createVOA(GL_LINE_LOOP);

    // now we have our data add it to the VAO, we need to tell the VAO the following
    // how much (in bytes) data we are copying
    // a pointer to the first element of data (in this case the address of the first element of the


    m_vao->bind();
    m_vao->setIndexedData(8*sizeof(Vec3),m_vert[0].m_x,sizeof(lindices),lindices[0]);

    m_vao->setVertexAttributePointer(0,3,GL_FLOAT,sizeof(Vec3),0);

    m_vao->setNumIndices(sizeof(lindices));
    // finally we have finished for now so time to unbind the VAO
    m_vao->unbind();


  }


}


//----------------------------------------------------------------------------------------------------------------------
void BBox::draw() const
{
 // glPolygonMode(GL_FRONT_AND_BACK,m_drawMode);
  m_vao->bind();
	m_vao->draw();
	m_vao->unbind();
  //glPolygonMode(GL_FRONT_AND_BACK,GL_FILL);
}
//----------------------------------------------------------------------------------------------------------------------

void BBox::setCenter(
										  ngl::Vec3 &_center
										 )
{
	// Calculate the Vertices based on the w,h,d params passed in the box is asumed
	// to be centered on the _center with equal w / h / d
	// -x +y -z
	m_center=_center;
	m_vert[0].m_x=_center.m_x-(m_width/2.0f); m_vert[0].m_y=_center.m_y+(m_height/2.0f); m_vert[0].m_z=_center.m_z-(m_depth/2.0f);
	// + x -y -z
	m_vert[1].m_x=_center.m_x+(m_width/2.0f); m_vert[1].m_y=_center.m_y+(m_height/2.0f); m_vert[1].m_z=_center.m_z-(m_depth/2.0f);
	m_vert[2].m_x=_center.m_x+(m_width/2.0f); m_vert[2].m_y=_center.m_y+(m_height/2.0f); m_vert[2].m_z=_center.m_z+(m_depth/2.0f);
	m_vert[3].m_x=_center.m_x-(m_width/2.0f); m_vert[3].m_y=_center.m_y+(m_height/2.0f); m_vert[3].m_z=_center.m_z+(m_depth/2.0f);
	m_vert[4].m_x=_center.m_x-(m_width/2.0f); m_vert[4].m_y=_center.m_y-(m_height/2.0f); m_vert[4].m_z=_center.m_z-(m_depth/2.0f);
	m_vert[5].m_x=_center.m_x+(m_width/2.0f); m_vert[5].m_y=_center.m_y-(m_height/2.0f); m_vert[5].m_z=_center.m_z-(m_depth/2.0f);
	m_vert[6].m_x=_center.m_x+(m_width/2.0f); m_vert[6].m_y=_center.m_y-(m_height/2.0f); m_vert[6].m_z=_center.m_z+(m_depth/2.0f);
	m_vert[7].m_x=_center.m_x-(m_width/2.0f); m_vert[7].m_y=_center.m_y-(m_height/2.0f); m_vert[7].m_z=_center.m_z+(m_depth/2.0f);

}



//----------------------------------------------------------------------------------------------------------------------

BBox::~BBox()
{

}
//----------------------------------------------------------------------------------------------------------------------

} // end namespace ngl



