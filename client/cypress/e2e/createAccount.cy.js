describe('Create Account Page', () => {
  before(() => {
    // delete the test user so that account creation page can be accessed
    const profiles = `http://localhost:6300/profiles/`;
    cy.request('GET', `${profiles}getByEmail/${Cypress.env('test_email')}`)
    .then((response) => {
      if (response.body.data.length > 0) {
        const id = response.body.data[0]._id;

        cy.request('DELETE', `${profiles}${id}`);
      }
    })
  });

  beforeEach(() => {
    cy.session('signed-in', () => {
      cy.signIn();
    })
  });

  it('Test visiting account creation page', () => {
    cy.visit('/createAccount', {failOnStatusCode: false});
  });

  it('Test leaving fields blank', () => {
    cy.visit('/createAccount', {failOnStatusCode: false});

    cy.get('#submit').click();
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Please fill out all required fields');
    });
    cy.url().should('include', 'createAccount');

    cy.get('#firstName').type("Matthew");
    cy.get('#submit').click();
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Please fill out all required fields');
    });
    cy.url().should('include', 'createAccount');

    cy.get('#firstName').clear().type("Matthew");
    cy.get('#lastName').clear().type("Flynn");
    cy.get('#submit').click();
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Please fill out all required fields');
    });
    cy.url().should('include', 'createAccount');
  });

  it('Test inability to edit email', () => {
    cy.visit('/createAccount', {failOnStatusCode: false});

    cy.get('#email').should('be.disabled');
  });

  it('Test impossible graduation years', () => {
    cy.visit('/createAccount', {failOnStatusCode: false});

    cy.get('#year').clear();
    cy.get('#year').type(3000);
    cy.get('#year').blur();
    cy.get('#year').should("have.value", "2030");

    cy.get('#year').clear();
    cy.get('#year').type(1);
    cy.get('#year').blur();
    cy.get('#year').should("have.value", "2020");
  });

  it('Test graduation year invisibility for non-students', () => {
    cy.visit('/createAccount', {failOnStatusCode: false});

    cy.get('#option-student').click();
    cy.get('#year').should('exist');
    
    cy.get('#option-faculty').click();
    cy.get('#year').should('not.exist');
  });

  it('Test provided information appears in profile page', () => {
    cy.visit('/createAccount', {failOnStatusCode: false});

    cy.get('#firstName').clear().type("Matthew");
    cy.get('#lastName').clear().type("Flynn");
    cy.get('#about').clear().type("Test Biography");
    cy.get('#option-student').click();
    cy.get('#department').click();
    cy.contains('Computer Science').click();
    cy.get('#year').clear().type('2024');
    cy.get('#submit').click();

    cy.url().should('include', 'profile');
    cy.get('body').should('include.text', "Matthew Flynn");
    cy.get('body').should('include.text', "computer science");
    cy.get('body').should('include.text', "2024");
    cy.get('body').should('include.text', "Test Biography");
  });

  it('Test account creation page is inaccessible after already created', () => {
    cy.visit('/createAccount', {failOnStatusCode: false});

    cy.url().should('not.include', 'createAccount');
    cy.url().should('include', 'profile');
  })

});