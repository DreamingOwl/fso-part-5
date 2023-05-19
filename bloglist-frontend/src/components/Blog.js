import { useState } from 'react'

const Blog = ({ blog, user, handleLikes, handleDelete } ) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const addLikes = () => {
    const updateObject = { ...blog,
      user: blog.user.id,
      likes: blog.likes + 1
    }
    handleLikes(updateObject)
  }

  const checkDelete = () => {

    if(window.confirm(`Remove blog ${blog.title} by ${blog.author}`)){
      handleDelete(blog)
    }

  }

  if(visible){
    if(blog.user.id === user.id){
      return (
        <div style={blogStyle} className='blog'>
          {blog.title} {blog.author} <button onClick={toggleVisibility}>hide</button><br/>
          {blog.url}  <br/>
          {blog.likes} <button id='like-button' onClick={addLikes}>Likes</button><br/>
          {blog.user.name} <br/>
          <button id='delete-button' onClick={checkDelete}>Delete</button><br/>
        </div>
      )
    }
    else{
      return (
        <div style={blogStyle} className='blog'>
          {blog.title} {blog.author} <button onClick={toggleVisibility}>hide</button><br/>
          {blog.url}  <br/>
          {blog.likes} <button id='like-button' onClick={addLikes}>Likes</button><br/>
          {blog.user.name} <br/>
        </div>
      )
    }
  }
  else{
    return (
      <div style={blogStyle} className='blog'>
        {blog.title} {blog.author} <button onClick={toggleVisibility}>view</button>
      </div>
    )
  }
}

export default Blog