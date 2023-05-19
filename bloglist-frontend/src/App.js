import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Togglable from './components/Togglable'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
import NewBlogForm from './components/NewBlogForm'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const blogFormRef = useRef()
  const newBlogFormRef = useRef()
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState(null)

  const setMessageAndType = (msg, type) => {
    setMessage(msg)
    setMessageType(type)
  }

  useEffect(() => {
    blogService.getAll().then(blogs => {
      blogs.sort(sortByLikesDesc)
      setBlogs( blogs )
    }
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogUser')
    if(loggedUserJSON){
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const sortByLikesDesc = (a,b) => {
    return b.likes - a.likes
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedBlogUser', JSON.stringify(user)
      )

      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    }catch (exception) {
      setMessageAndType( 'wrong username or password', 'E' )
      setTimeout(() => {
        setMessageAndType(null, null)
      }, 5000)
    }
  }

  const handleCreateNew = (event) => {

    event.preventDefault()
    blogFormRef.current.toggleVisibility()
    const newBlogForm = newBlogFormRef.current.getNewBlog()

    const newBlog = { title: newBlogForm.title,
      author: newBlogForm.author,
      url: newBlogForm.url,
      user: user
    }

    blogService.create(newBlog)
      .then(returnedBlog => {
        const refreshBlog = blogs.concat(returnedBlog)
        refreshBlog.sort(sortByLikesDesc)
        setBlogs(refreshBlog)
        setMessageAndType( `${newBlogForm.title} by ${newBlogForm.author} added`, 'S' )
        setTimeout(() => {
          setMessageAndType(null, null)
        }, 5000)

      })
      .then( () => {
        newBlogFormRef.current.initializeBlog()
      }
      )

  }

  const handleLikes = (updateObject) => {
    blogService
      .update(updateObject.id, updateObject)
      .then(returnedBlog => {
        blogService.getAll().then(blogs => {
          blogs.sort(sortByLikesDesc)
          setBlogs( blogs )
        }
        )
        setMessageAndType( `Liked ${returnedBlog.title} by ${returnedBlog.author}`, 'S' )
        setTimeout(() => {
          setMessageAndType(null, null)
        }, 5000)
      })
  }

  const handleDelete = (deleteObject) => {
    blogService
      .deleteBlog(deleteObject.id)
      .then(() => {
        setMessageAndType( `Blog ${deleteObject.title} has removed from server`, 'S')
        setTimeout(() => {
          setMessageAndType(null,null)
        }, 5000)
        setBlogs(blogs.filter(blog => blog.id !== deleteObject.id))
      })
      .catch(() => {
        setMessageAndType( `Blog ${deleteObject.title} has already removed from server`, 'E')
        setTimeout(() => {
          setMessageAndType(null,null)
        }, 5000)
        setBlogs(setBlogs(blogs.filter(blog => blog.id !== deleteObject.id)))
      })
  }

  const handleLogout = (event) => {
    event.preventDefault()
    window.localStorage.removeItem('loggedBlogUser')
    setUser(null)
    blogService.setToken(null)
  }

  const loginForm = () => {
    return (
      <div>
        <LoginForm
          username={username}
          password={password}
          handleUsernameChange={({ target }) => setUsername(target.value)}
          handlePasswordChange={({ target }) => setPassword(target.value)}
          handleSubmit={handleLogin}
        />
      </div>
    )
  }

  const blogList = () => {
    return (
      <div>
        <h2>blogs</h2>
        <p>{user.name} logged in <button onClick={handleLogout}>logout</button> </p>
        <Togglable buttonLabel='new blog' hideButtonLabel='cancel' ref={blogFormRef}>
          <NewBlogForm handleCreateNew={handleCreateNew} ref={newBlogFormRef} />
        </Togglable>
        {blogs.map(blog =>
          <Blog key={blog.id}
            blog={blog}
            user={user}
            handleLikes={handleLikes}
            handleDelete={handleDelete}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <Notification message={message} type={messageType} />
      {!user && loginForm()}
      {user && blogList() }
    </div>
  )
}

export default App