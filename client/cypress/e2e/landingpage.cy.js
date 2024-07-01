describe('Landing Page', () => {
    beforeEach(() => {
        cy.session('signed-in', () => {
          cy.signIn();
        })
        cy.visit('/', {failOnStatusCode: false});
      });
  
    it('Test if header displays correctly', () => {
      cy.get('.header .title').should('contain', 'Welcome to TutorHub');
      cy.get('.header .subtitle').should('contain', 'Comprehensive Tutoring/Learning Platform for BlueJays');
    });

    it('Test if header displays correctly', () => {
        cy.get('.header .title').should('contain', 'Welcome to TutorHub');
        cy.get('.header .subtitle').should('contain', 'Comprehensive Tutoring/Learning Platform for BlueJays');
      });
    
      it('Test if typewriter animation exists', () => {
        cy.get('.typewriter .slide').should('exist');
        cy.get('.typewriter .paper').should('exist');
        cy.get('.typewriter .keyboard').should('exist');
      });
    
      it('Test description text', () => {
        cy.get('.content .description').should('contain', 'Find someone at Hopkins who wants to teach exactly what you want to learn.');
      });
    
      it('Test navigation to Browse page', () => {
        cy.get('.content .startButton').click();
        cy.url().should('include', '/browse');
      });
 
  });
  