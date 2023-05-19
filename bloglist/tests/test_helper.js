const supertest = require('supertest')
const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')
const api = supertest(app)

const initialUsers = [ 
                        { 
                          username: "firstuser",
                          password: "firstpassword",
                          name: "firstname"
                        },

                        { 
                          username: "seconduser",
                          password: "secondpassword",
                          name: "secondname"
                        }
                     ]

const initialBlogs = [
    {
      title: "first blog",
      author: "first author",
      url: "first.url",
      likes: 123
    },
    {
      title: "second blog",
      author: "second author",
      url: "second.com",
      likes: 554
    },
  ]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'title not exist',
                          author: "author not exist",
                          url: "url not exist",
                          likes: 0,})
  await blog.save()
  await blog.deleteOne()

  return blog.id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const loginFirstUser = async () => {
  const response = await api
                      .post('/api/login')
                      .send({
                              username: "firstuser",
                              password: "firstpassword"
                            })
  return response.body
}

const firstUserToken = async () => {
  const response = await api
                      .post('/api/login')
                      .send({
                              username: "firstuser",
                              password: "firstpassword"
                            })
  return `Bearer ${response.body.token}`
}

const secondUserToken = async () => {
  const response = await api
                      .post('/api/login')
                      .send({
                              username: "seconduser",
                              password: "secondpassword"
                            })
  return `Bearer ${response.body.token}`
}

module.exports = {
  initialBlogs, 
  nonExistingId, 
  blogsInDb, 
  initialUsers,
  loginFirstUser,
  firstUserToken,
  secondUserToken
}