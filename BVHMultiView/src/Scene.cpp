#include "Scene.h"
#include "Bvh.h"

Scene::Scene(ngl::TransformStack *_t, const ngl::Mat4 *_view, const ngl::Mat4 *_proj)
{
    m_numCharacters = 0;
    m_transform=_t;
    m_view=_view;
    m_proj=_proj;
    paused = false;
    m_currentAnimation=0;
}

void Scene::addCharacter(Bvh *_character)
{
    m_characters.push_back(_character);
    ++m_numCharacters;
}

void Scene::replay()
{
//    for(std::vector<Bvh *>::iterator itr = m_characters.begin(); itr!= m_characters.end(); ++itr)
//    {
//        (*itr)->replay();
//    }
  m_characters[m_currentAnimation]->replay();
}

Scene::~Scene()
{
    // we need to call the dtor for each of the particles as pointer
    // however the std::vector will clear it's self at the end
    for(std::vector<Bvh *>::iterator itr = m_characters.begin(); itr!= m_characters.end(); ++itr)
    {
        delete *itr;
    }
    m_characters.clear();
    deleteAllWalls();
}

void Scene::addNewWall(ngl::Vec3 _point, float _size, ngl::Vec3 _normal, bool _draw)
{
    Wall *newWall = new Wall;
    _normal.normalize();
    newWall->centre = _point;
    newWall->size = _size;
    newWall->a = _normal.m_x;
    newWall->b = _normal.m_y;
    newWall->c = _normal.m_z;
    newWall->d = -(newWall->a * _point.m_x + newWall->b * _point.m_y + newWall->c * _point.m_z);
    newWall->draw_flag = _draw;

    m_walls.push_back(newWall);
}

void Scene::deleteAllWalls()
{
    for(std::vector<Wall *>::const_iterator itr=m_walls.begin(); itr!= m_walls.end(); ++itr)
    {
        delete *itr;
    }
    m_walls.clear();
}

ngl::Vec3 Scene::getRotationFromY(ngl::Vec3 _vec) const
{
    ngl::Vec3 rot;
    rot.m_z = 0.0;
    if(fabs(_vec.m_y)< 0.0001)
    {
        if (_vec.m_z>= 0.0)
            rot.m_x = -90;
        else
            rot.m_x = 90;
    }
    else
        rot.m_x = atan(_vec.m_z/_vec.m_y);
    if(fabs(_vec.m_y) + fabs(_vec.m_z) < 0.0001)
    {
        if(_vec.m_x > 0)
            rot.m_y = -90;
        else
            rot.m_y = 90;
    }
    else
        rot.m_z = atan(_vec.m_x/sqrt(_vec.m_y*_vec.m_y + _vec.m_z*_vec.m_z));

    return rot;
}

void Scene::draw() const
{
    ngl::ShaderLib *shader=ngl::ShaderLib::instance();
    (*shader)["nglColourShader"]->use();

    ngl::Mat4 globalM = getTransformStack()->getGlobalTransform().getMatrix();
    for(std::vector<Wall *>::const_iterator itr = m_walls.begin(); itr!= m_walls.end(); ++itr)
    {
        if((*itr)->draw_flag)
        {
            getTransformStack()->pushTransform();
            {
                getTransformStack()->setPosition((*itr)->centre);
                getTransformStack()->setScale((*itr)->size, (*itr)->size, (*itr)->size);
                getTransformStack()->setRotation(getRotationFromY(ngl::Vec3((*itr)->a,(*itr)->b,(*itr)->c)));
                ngl::Mat4 wallM = getTransformStack()->getCurrentTransform().getMatrix();
                ngl::Mat4 vp=*m_view* *m_proj;
                ngl::Mat4 MVP=wallM*globalM*vp;//   getCamera()->getVPMatrix();
                shader->setShaderParamFromMat4("MVP",MVP);
                // get an instance of the VBO primitives for drawing
                ngl::VAOPrimitives *prim=ngl::VAOPrimitives::instance();
                prim->draw("wall");
            }
            getTransformStack()->popTransform();
        }
    }
    // call the draw method for each of the characters
//    for(std::vector<Bvh *>::const_iterator itr = m_characters.begin(); itr!= m_characters.end(); ++itr)
//    {
//        (*itr)->draw();
//    }
    m_characters[m_currentAnimation]->draw();
}

int Scene::getCurrentFrameNumber()
{
//    std::vector<Bvh *>::iterator itr = m_characters.begin();
//    return((*itr)->getCurrentFrameNumber());
return m_characters[m_currentAnimation]->getCurrentFrameNumber();
}

void Scene::forwardAnimation()
{
//    for(std::vector<Bvh *>::iterator itr = m_characters.begin(); itr!= m_characters.end(); ++itr)
//    {
//      //  (*itr)->forwardAnimation();
//    }
   m_characters[m_currentAnimation]->forwardAnimation();
}

void Scene::backwardAnimation()
{
//    for(std::vector<Bvh *>::iterator itr = m_characters.begin(); itr!= m_characters.end(); ++itr)
//    {
//        (*itr)->backwardAnimation();
//    }
  m_characters[m_currentAnimation]->backwardAnimation();
}

void Scene::update()
{
    if(paused)
        return;
    // call the update method for each particle
//    for(std::vector<Bvh *>::iterator itr = m_characters.begin(); itr!= m_characters.end(); ++itr)
//    {
//        (*itr)->update(); // update the position of each particles
//    }
m_characters[m_currentAnimation]->update();
}

void Scene::clearCharacters()
{
    // however the std::vector will clear it's self at the end
    for(std::vector<Bvh *>::iterator itr = m_characters.begin(); itr!= m_characters.end(); ++itr)
    {
        delete *itr;
    }
    // must remember to re-size the std::vector back to 0
    m_characters.clear();
    m_numCharacters=0;
}
