import { useState, forwardRef, useImperativeHandle } from 'react'
import PropTypes from 'prop-types'

const NewBlogForm = forwardRef(({ handleCreateNew },refs) => {

  const [newTitle, setNewTitle]   = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl]       = useState('')

  const getNewBlog = () => {
    return (
      {
        title: newTitle,
        author: newAuthor,
        url: newUrl
      }
    )
  }

  const initializeBlog = () => {
    setNewTitle('')
    setNewAuthor('')
    setNewUrl('')
  }

  useImperativeHandle(refs, ()  => {
    return {
      getNewBlog,
      initializeBlog
    }
  })

  return (
    <div>
      <form onSubmit={handleCreateNew}>
        <h2>create new blog</h2>
            title:
        <input
          type="text"
          value={newTitle}
          name="title"
          id="title"
          placeholder="title"
          onChange={({ target }) => setNewTitle(target.value)}/><br/>
            author:
        <input
          type="text"
          value={newAuthor}
          name="author"
          id="author"
          placeholder="author"
          onChange={({ target }) => setNewAuthor(target.value)}/><br/>
            url:
        <input
          type="text"
          value={newUrl}
          name="url"
          id="url"
          placeholder="url"
          onChange={({ target }) => setNewUrl(target.value)}/><br/>
        <button type="submit" placeholder="createButton" id="create-button" >create</button>
      </form>
    </div>
  )
})

NewBlogForm.displayName = 'NewBlogForm'

NewBlogForm.propTypes = {
  handleCreateNew: PropTypes.func.isRequired
}

export default NewBlogForm