const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

beforeAll(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  await api
            .post('/api/users')
            .send({
              name: helper.initialUsers[0].name,
              username: helper.initialUsers[0].username,
              password: helper.initialUsers[0].password
            })
  
  await api
            .post('/api/users')
            .send({
              name: helper.initialUsers[1].name,
              username: helper.initialUsers[1].username,
              password: helper.initialUsers[1].password
            })
            
  const token = await helper.firstUserToken()
  
  const userResponse = await api.get('/api/users')

  await api
            .post('/api/blogs')
            .send({
                    title: helper.initialBlogs[0].title,
                    author: helper.initialBlogs[0].author,
                    url: helper.initialBlogs[0].url,
                    likes: helper.initialBlogs[0].likes,
                    user: userResponse.body[0].id
                  })
            .set("Authorization", token )
            .expect(201)
  

  await api
            .post('/api/blogs')
            .send({
                    title: helper.initialBlogs[1].title,
                    author: helper.initialBlogs[1].author,
                    url: helper.initialBlogs[1].url,
                    likes: helper.initialBlogs[1].likes,
                    user: userResponse.body[0].id
                  })
            .set("Authorization", token )
            .expect(201)

})

describe('view user list', () => {
  test('get users', async () => {
    await api
          .get('/api/users')
          .expect(200)
  })

  test('get list of users', async () => {
    const response = await api
                          .get('/api/users')
                          .expect(200)
    //console.log(response.body)
    expect(response.body).toHaveLength(2)
  })

})

describe('when there is initially some blogs saved, 200', () => {
  test('blogs are returned as json', async () => {
    const response = await api
                    .get('/api/blogs')
                    .expect(200)
                    .expect('Content-Type', /application\/json/)
    //console.log(`first `, response.body)
  }, 100000)

  test('check id exist, 200', async () => {
    const response = await api.get('/api/blogs')
                              .expect(200)
    //console.log(`second `, response.body)
    expect(response.body[0].id).toBeDefined()
  })

  test('check _id not exist', async () => {
    const response = await api.get('/api/blogs')
                              .expect(200)
    expect(response.body[0]._id).not.toBeDefined()
  })

  test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')
                              .expect(200)
    expect(response.body).toHaveLength(2)
  })

  test('check first blog', async () => {
    const response = await api.get('/api/blogs')
                              .expect(200)
    expect(response.body[0].title).toBe('first blog')
  })

})


describe('viewing a specific blog', () => {
  
  test('succeeds with a valid id, 200', async () => {
    const blogsAtStart = await helper.blogsInDb()
    
    const AllBlogs = await api
                          .get(`/api/blogs`)
                          .expect(200)
                          .expect('Content-Type', /application\/json/)

    const blogToView = AllBlogs.body[0]

    const resultBlog = await api
                            .get(`/api/blogs/${blogToView.id}`)
                            .expect(200)
                            .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da5@9070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new blog', () => {

  test('add a valid blog, 201', async () => {

    const allUsers = await api.get(`/api/users`)
                              .expect(200)

    const token = await helper.firstUserToken()

    const newBlog = {
                      title: "new blog",
                      author: "new author",
                      url: "new url",
                      likes: 42,
                      user: allUsers.body[0].id
                    }
    
    const beforeAddBlogs= await api
                                    .get(`/api/blogs`)
                                    .expect(200)
                                    .expect('Content-Type', /application\/json/)

    const responseAddBlog = await api
                                  .post('/api/blogs')
                                  .send(newBlog)
                                  .set("Authorization", token)
                                  .expect(201)
                                  .expect('Content-Type', /application\/json/)

    const afterAddBlogs = await api
                                .get(`/api/blogs`)
                                .expect(200)
                                .expect('Content-Type', /application\/json/)

    expect(afterAddBlogs.body.length).toBe(beforeAddBlogs.body.length + 1)
    
    const matchBlogId = afterAddBlogs.body.reduce((id, blog) => { 
                                                                  if (blog.id.toString() === responseAddBlog.body.id.toString()) {
                                                                    return blog.id
                                                                  }
                                                                }
                                                                , null)

    
    expect(matchBlogId).toEqual(responseAddBlog.body.id)

  })

  test('add a valid blog but without token, 401', async () => {

    const allUsers = await api.get(`/api/users`)
                              .expect(200)
    const newBlog = {
                      title: "new blog 401",
                      author: "new author 401",
                      url: "new url 401",
                      likes: 401,
                      user: allUsers.body[0].id
                    }
   
    await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
  })

  test('add a valid blog without likes properties, 201', async () => {

    const allUsers = await api.get(`/api/users`)
                              .expect(200)

    const token = await helper.firstUserToken()

    const newBlog = {
                      title: "new blog 2",
                      author: "new author 2",
                      url: "new url 2",
                      user: allUsers.body[0].id
                    }
    
    const beforeAddBlogs= await api
                                    .get(`/api/blogs`)
                                    .expect(200)
                                    .expect('Content-Type', /application\/json/)

    const responseAddBlog = await api
                                  .post('/api/blogs')
                                  .send(newBlog)
                                  .set("Authorization", token)
                                  .expect(201)
                                  .expect('Content-Type', /application\/json/)

    const afterAddBlogs = await api
                                .get(`/api/blogs`)
                                .expect(200)
                                .expect('Content-Type', /application\/json/)

    expect(afterAddBlogs.body.length).toBe(beforeAddBlogs.body.length + 1)
    
    const matchBlogId = afterAddBlogs.body.reduce((id, blog) => { 
                                                                  if (blog.id.toString() === responseAddBlog.body.id.toString()) {
                                                                    return blog.id
                                                                  }
                                                                }
                                                                , null)

    
    expect(matchBlogId).toEqual(responseAddBlog.body.id)

  })

  test('add a invalid blog without title properties, 400', async () => {

    const allUsers = await api.get(`/api/users`)
                              .expect(200)

    const token = await helper.firstUserToken()

    const newBlog = {
                      author: "new author 3",
                      url: "new url 3",
                      likes: 42,
                      user: allUsers.body[0].id
                    }
    
    const beforeAddBlogs= await api
                                    .get(`/api/blogs`)
                                    .expect(200)
                                    .expect('Content-Type', /application\/json/)

    await api
            .post('/api/blogs')
            .send(newBlog)
            .set("Authorization", token)
            .expect(400)

    const afterAddBlogs = await api
                                .get(`/api/blogs`)
                                .expect(200)
                                .expect('Content-Type', /application\/json/)

    expect(afterAddBlogs.body.length).toBe(beforeAddBlogs.body.length)

  })
  
})

describe('deletion of a blog', () => {

  test('delete existing blog (same user as the blog creator), 204', async () => {

    const token = await helper.firstUserToken()

    const beforeDeleteBlogs= await api
                                    .get(`/api/blogs`)
                                    .expect(200)
                                    .expect('Content-Type', /application\/json/)
    const blogToDelete = beforeDeleteBlogs.body[0]
    
    await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set("Authorization", token)
            .expect(204)

    const afterDeleteBlogs= await api
                                  .get(`/api/blogs`)
                                  .expect(200)
                                  .expect('Content-Type', /application\/json/)

    expect(afterDeleteBlogs.body.length).toBe(beforeDeleteBlogs.body.length - 1)

  })

  test('delete existing blog (different user as the blog creator), 401', async () => {

    const token = await helper.secondUserToken()

    const beforeDeleteBlogs= await api
                                    .get(`/api/blogs`)
                                    .expect(200)
                                    .expect('Content-Type', /application\/json/)
    const blogToDelete = beforeDeleteBlogs.body[0]
    
    await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set("Authorization", token)
            .expect(401)

    const afterDeleteBlogs= await api
                                  .get(`/api/blogs`)
                                  .expect(200)
                                  .expect('Content-Type', /application\/json/)

    expect(afterDeleteBlogs.body.length).toBe(beforeDeleteBlogs.body.length)

  })

  test('delete a non existing blog, 204', async () => {
    const token = await helper.firstUserToken()
    const nonExistingId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${nonExistingId}`)
      .set("Authorization", token)
      .expect(204)
  })
})

describe('update a blog', () => {
  test('update existing blog, 200', async () => {
    const token = await helper.firstUserToken()

    const beforeUpdateBlogs= await api
                                    .get(`/api/blogs`)
                                    .expect(200)
                                    .expect('Content-Type', /application\/json/)

    const blogToUpdate = beforeUpdateBlogs.body[0]
    blogToUpdate.likes = 99

    const resultBody = await api
                                .put(`/api/blogs/${blogToUpdate.id}`)
                                .set('Authorization', token)
                                .send(blogToUpdate)
                                .expect(200)
                                .expect('Content-Type', /application\/json/)
    
    expect(resultBody.body.likes).toEqual(blogToUpdate.likes)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})