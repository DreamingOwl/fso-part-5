describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)
    const user = {
      name: 'Matti Luukkainen',
      username: 'mluukkai',
      password: 'salainen'
    }
    cy.request('POST', `${Cypress.env('BACKEND')}/users`, user)

    const user2 = {
      name: 'Second User',
      username: 'user2',
      password: 'user2pass'
    }

    cy.request('POST', `${Cypress.env('BACKEND')}/users`, user2)

    cy.visit('')
  })

  it('Login form is shown', function() {
    cy.contains('log in to application')
  })

  describe('Login',function() {

    it('succeeds with correct credentials', function() {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()
      cy.get('html').should('contain', 'Matti Luukkainen logged in')
    })

    it('fails with wrong credentials', function() {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()

      cy.get('.error')
        .should('contain', 'wrong username or password')
        .and('have.css', 'color', 'rgb(255, 0, 0)')
        .and('have.css', 'border-style', 'solid')

      cy.get('html').should('not.contain', 'Matti Luukkainen logged in')
    })
  })

  describe('When logged in', function() {
    beforeEach(function() {
      cy.login({ username: 'mluukkai', password: 'salainen' })
    })

    it('A blog can be created', function() {
      cy.contains('new blog').click()
      cy.get('#title').type('new title')
      cy.get('#author').type('cypress')
      cy.get('#url').type('newblogbycypress.com')
      cy.get('#create-button').click()

      cy.get('.success')
        .should('contain', 'new title by cypress added')
        .and('have.css', 'color', 'rgb(0, 128, 0)')
        .and('have.css', 'border-style', 'solid')

      cy.get('.blog')
        .contains('new title cypress').as('newBlog')

      cy.get('@newBlog').find('button').as('theButton')
      cy.get('@theButton').click()

      cy.get('@newBlog')
        .should('contain', 'new title cypress')
        .and('contain', 'newblogbycypress.com')
        .and('contain', 'Matti Luukkainen')

    })

    describe('and a note exists', function () {

      beforeEach(function () {
        cy.createBlog({
          title: 'new title',
          author: 'cypress',
          url: 'newblogbycypress.com',
          likes: 0
        })
      })


      it('A blog can be liked', function() {

        cy.get('.blog')
          .contains('new title cypress').as('newBlog')

        cy.get('@newBlog').find('button').as('theButton')
        cy.get('@theButton').click()

        cy.get('@newBlog')
          .should('contain', '0')

        cy.get('@newBlog')
          .find('#like-button').as('likeButton')

        cy.get('@likeButton').click()

        cy.get('.success')
          .should('contain', 'Liked new title by cypress')
          .and('have.css', 'color', 'rgb(0, 128, 0)')
          .and('have.css', 'border-style', 'solid')

        cy.get('@newBlog')
          .should('contain', '1')

      })

      it('A blog can be delete by its creator', function() {

        cy.get('.blog')
          .contains('new title cypress').as('newBlog')

        cy.get('@newBlog').find('button').as('theButton')
        cy.get('@theButton').click()

        cy.get('@newBlog')
          .find('#delete-button').as('deleteButton')

        cy.get('@deleteButton').click()

        cy.get('.success')
          .should('contain', 'Blog new title has removed from server')
          .and('have.css', 'color', 'rgb(0, 128, 0)')
          .and('have.css', 'border-style', 'solid')

        cy.get('html').should('not.contain', 'new title cypress')
      })

      it('A blog cannot be delete by non creator', function() {

        cy.login({ username: 'user2', password: 'user2pass' })

        cy.get('.blog')
          .contains('new title cypress').as('newBlog')

        cy.get('@newBlog').find('button').as('theButton')
        cy.get('@theButton').click()

        cy.get('@newBlog').should('not.contain', 'Delete')
      })

    })

    describe('and several blogs exist', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'first title with less likes',
          author: 'cypress',
          url: 'newblogbycypress1.com',
          likes: 10
        })
        cy.createBlog({
          title: 'second title with average likes',
          author: 'cypress',
          url: 'newblogbycypress2.com',
          likes: 22
        })
        cy.createBlog({
          title: 'third title with most likes',
          author: 'cypress',
          url: 'newblogbycypress3.com',
          likes: 999
        })
      })

      it('title with most like being first', function () {
        cy.get('.blog').eq(0).should('contain', 'third title with most likes')
        cy.get('.blog').eq(1).should('contain', 'second title with average likes')
        cy.get('.blog').eq(2).should('contain', 'first title with less likes')
      })
    })


  })

})
