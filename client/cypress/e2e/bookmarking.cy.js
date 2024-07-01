describe('Bookmarking', () => {
  beforeEach(() => {
    cy.session('signed-in', () => {
      cy.signIn();
    })
  });

  it('Bookmark and unbookmark a post', () => {
    cy.visit('/browse', {failOnStatusCode: false});

    cy.contains("Object Oriented").parent().parent().parent()
      .find('[id^="bookmark-"]').click()
    cy.get('#bookmarks-nav').click();
    cy.contains("Object Oriented").should('exist');

    cy.contains("Object Oriented").parent().parent().parent()
      .find('[id^="bookmark-"]').click()
    cy.contains("Object Oriented").should('not.exist');
  });

});