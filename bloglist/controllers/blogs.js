const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {

  const blogs = await Blog.find({})
                          .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
                         .populate('user', { username: 1, name: 1 })
  if(blog){
    response.json(blog)
  }
  else{
    response.status(404).end()
  }
})

blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const body = request.body

  const blog = {  title: body.title,
                  author: body.author,
                  url: body.url,
                  likes: body.likes
              }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })

  if(updatedBlog){
    response.json(updatedBlog)
  }
  else{
    response.status(400).end()
  }
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
    
    const user = request.user
    
    if(typeof request.body.title === 'undefined' || typeof request.body.url === 'undefined'){
      response.status(400).end()
    }
    else{
      const blog = new Blog(
                            {title: request.body.title,
                            author: request.body.author,
                            url: request.body.url,
                            likes: request.body.likes,
                            user: user._id})

      const newBlog = await blog.save()
      user.blogs = user.blogs.concat(newBlog._id)
      await user.save()
      const responseBlog = await Blog.findById(newBlog._id)
                                     .populate('user', { username: 1, name: 1 })
      response.status(201).json(responseBlog)
    }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

  const user = request.user

  const blogToDelete = await Blog.findById(request.params.id)

  if(blogToDelete){
    if(blogToDelete.user.toString() === user._id.toString()){
      await Blog.findByIdAndRemove(request.params.id)
      return response.status(204).end()
    }
    else{
      return response.status(401).json({ error: 'unathorize to delete blog' })
    }
  }
  else{
    return response.status(204).end()
  }

})

module.exports = blogsRouter