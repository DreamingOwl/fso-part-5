import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import NewBlogForm from './NewBlogForm'

describe('<Blog />', () => {
  let container

  const blog = {
    title: 'first blog',
    author: 'first author',
    url: 'first.url',
    likes: 123,
    user: { id: '6789789' }
  }

  const user = { id: '6789789' }

  const handleLikes = jest.fn()
  const handleDelete = jest.fn()

  beforeEach(() => {
    container = render(
      <Blog blog={blog} user={user} handleLikes={handleLikes} handleDelete={handleDelete} />
    ).container
  })

  test('5.13: renders blog (without detail)', async () => {

    const titleElement = screen.queryByText('first blog', { exact: false })
    expect(titleElement).toBeDefined()

    const authorElement = screen.queryByText('first author', { exact: false })
    expect(authorElement).toBeDefined()

    const urlElement = screen.queryByText('first url', { exact: false })
    expect(urlElement).toBeNull()

    const likesElement = screen.queryByText('123', { exact: false })
    expect(likesElement).toBeNull()

  })

  test('5.14: renders blog with detail after clicked', async () => {

    const user = userEvent.setup()
    const sendButton = screen.getByText('view')
    await user.click(sendButton)

    const titleElement = screen.queryByText('first blog', { exact: false })
    expect(titleElement).toBeDefined()

    const authorElement = screen.queryByText('first author', { exact: false })
    expect(authorElement).toBeDefined()

    const urlElement = screen.queryByText('first url', { exact: false })
    expect(urlElement).toBeDefined()

    const likesElement = screen.queryByText('123', { exact: false })
    expect(likesElement).toBeDefined()
  })

  test('5.15: checked event called twice when the like button clicked twice', async () => {

    const user = userEvent.setup()
    const sendButton = screen.getByText('view')
    await user.click(sendButton)

    const likesButton = screen.getByText('Likes')
    await user.click(likesButton)
    await user.click(likesButton)

    expect(handleLikes.mock.calls).toHaveLength(2)

  })

})

describe('<NewBlogForm />', () => {

  test('5.16: checked new form input and event called', async () => {

    const createBlog = jest.fn(e => e.preventDefault())
    const user = userEvent.setup()

    render(<NewBlogForm handleCreateNew={createBlog} />)

    const titleInput = screen.getByPlaceholderText('title')
    const authorInput = screen.getByPlaceholderText('author')
    const urlInput = screen.getByPlaceholderText('url')
    const sendButton = screen.getByPlaceholderText('createButton')

    expect(titleInput).toBeDefined()
    expect(authorInput).toBeDefined()
    expect(urlInput).toBeDefined()

    await user.type(titleInput, 'new Title')
    await user.type(authorInput, 'new Author')
    await user.type(urlInput, 'new Url')
    await user.click(sendButton)

    expect(titleInput.value).toBe('new Title')
    expect(authorInput.value).toBe('new Author')
    expect(urlInput.value).toBe('new Url')

    expect(createBlog.mock.calls).toHaveLength(1)
  })

})