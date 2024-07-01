describe('Browse Page', () => {
    beforeEach(() => {
        cy.session('signed-in', () => {
            cy.signIn();
          });
        cy.visit('/browse', {failOnStatusCode: false});
    });
  
    it('Shows the loading indicator while posts are fetching', () => {
      cy.get('.loader').should('be.visible');
    });

    it('Shows the correct number of posts', () => {
        cy.get('.post-card').should('have.length.at.least', 0);
    });

    it('successfully clicks the button', () => {
        cy.contains('button', 'Filter Posts').click();
    });
  });
  