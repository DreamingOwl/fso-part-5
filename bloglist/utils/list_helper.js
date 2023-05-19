const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, cur) => total = total + cur.likes , 0)
}
  
const favoriteBlog = (blogs) => {

  if(blogs.length === 0) return {
                                      title: '',
                                      author: '',
                                      likes: 0
                                }

  const blogWithMostLike = blogs.reduce((bestBlog, cur) => bestBlog.likes < cur.likes ? cur : bestBlog
                                        , {_id: "",
                                          title: "",
                                          author: "",
                                          url: "",
                                          likes: 0,
                                          __v: 0})

  return {
            title: blogWithMostLike.title,
            author: blogWithMostLike.author,
            likes: blogWithMostLike.likes
          }
}

const mostBlog = (blogs) => {

  if(blogs.length === 0) return {
                                      author: '',
                                      blogs: 0
                                }

  const authorWithNumberOfBlogs = (blogs.reduce((author, blog) => 
                                                author.set(blog.author, (author.get(blog.author) || 0) + 1),
                                                new Map()))

  const authorWithMostBlogs = [...authorWithNumberOfBlogs.entries()]
                                          .reduce((maxBlog, blog) => {
                                                                      if(maxBlog.blogs < blog[1]) {
                                                                        return { author: blog[0], blogs: blog[1]}
                                                                      }
                                                                      else{
                                                                        return maxBlog
                                                                      }
                                                                    }, {author: '', blogs: 0})

  return {
            author: authorWithMostBlogs.author,
            blogs: authorWithMostBlogs.blogs
          }
}

const mostLikes = (blogs) => {

  if(blogs.length === 0) return {
                                      author: '',
                                      likes: 0
                                }

  const authorWithNumberOfLikes = (blogs.reduce((author, blog) => 
                                                author.set(blog.author, (author.get(blog.author) || 0) + blog.likes),
                                                new Map()))

  const authorWithMostLikes = [...authorWithNumberOfLikes.entries()]
                                          .reduce((maxLikes, cur) => {
                                                                      if(maxLikes.likes < cur[1]) {
                                                                        return { author: cur[0], likes: cur[1]}
                                                                      }
                                                                      else{
                                                                        return maxLikes
                                                                      }
                                                                    }, {author: '', likes: 0})
                                                                   
  return {
            author: authorWithMostLikes.author,
            likes: authorWithMostLikes.likes
          }
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlog, mostLikes
}