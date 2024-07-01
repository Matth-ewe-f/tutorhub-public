describe('Profile Page', () => {
  beforeEach(() => {
    cy.session('signed-in', () => {
      cy.signIn();
    })
  });

  it('Created post appears on profile', () => {
    cy.visit('/createPost', {failOnStatusCode: false});
    
    cy.get('#option-activity').click();
    cy.wait(50);

    cy.get('#title').clear().type("Test");
    cy.get('#price').clear().type('10');
    cy.get('#description').clear().type('Test');
    cy.get('#submit').click();
    
    cy.contains('Test').should('exist');
  });

  it('Cannot review own post', () => {
    cy.visit('/profile', {failOnStatusCode: false});

    cy.get('[id^="post-"]').click();
    cy.get('[id^="post-"]').click();
    cy.contains('Post Comment').should('be.disabled');
  });

  it('Delete a post', () => {
    cy.visit('/profile', {failOnStatusCode: false});

    cy.get('[id^="post-"]').click();
    cy.get('[id^="post-"]').click();
    cy.contains('Delete Post').click();
    cy.contains('Test').should('not.exist');
  });

  it('Edit Profile', () => {
    cy.visit('/profile', {failOnStatusCode: false});

    cy.contains('Edit Your Profile').click();
    cy.get('#about').clear().type("Biography!");

    cy.contains('Finish').click();
    cy.contains('Biography!').should('exist');
  })

});
