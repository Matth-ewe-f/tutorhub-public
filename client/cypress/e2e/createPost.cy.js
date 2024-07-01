describe('Create Post Page', () => {
  beforeEach(() => {
    cy.session('signed-in', () => {
      cy.signIn();
    })
    cy.visit('/createPost', {failOnStatusCode: false});
  });

  it('Course information shows when course option selected', () => {
    cy.get('#option-course').click();

    cy.contains('Course Title').should('exist');
    cy.contains('Course Number').should('exist');
    cy.contains('Department').should('exist');
    cy.contains('professor').should('exist');
    cy.contains('Grade').should('exist');
    cy.contains('Semester').should('exist');
  });

  it('Activity information shows when activity option selected', () => {
    cy.get('#option-activity').click();

    cy.contains('Activity Title').should('exist');
    cy.contains('Add Tags').should('exist');
    cy.contains('Image').should('exist');
    cy.contains('Activity Description').should('exist');
  });

  it('Test course autofills', () => {
    cy.get('#option-course').click();
    cy.wait(50);

    cy.get('#title').clear().type("Linear");
    cy.contains(/^Linear Algebra$/).click();

    cy.get('#title').should('have.value', "Linear Algebra");
    cy.get('#number').should('have.value', "AS.110.201");
    cy.get('#department').should('have.value', "AS Mathematics");

    cy.get('#department').should('be.disabled');
  });

  it('Test price only accepts numbers', () => {
    cy.get('#price').clear().type("123");
    cy.get('#price').should('have.value', '$123');

    cy.get('#price').clear().type("abc123");
    cy.get('#price').should('have.value', '$123');
  });

  it('Test JHU vs non-JHU courses', () => {
    cy.get('#option-yes').click();
    cy.contains('professor').should('exist');

    cy.get('#option-no').click();
    cy.contains('another school').should('exist');
  })

  it('Test disabled submit', () => {
    cy.get('#submit').should('be.disabled');
    cy.wait(100);

    cy.get('#title').clear().type("Linear");
    cy.contains(/^Linear Algebra$/).click();
    cy.get('#submit').should('be.not.disabled');

    cy.get('#title').type("{backspace}");
    cy.get('#submit').should('be.disabled');

    cy.get('#option-activity').click();
    cy.get('#submit').should('be.not.disabled');

    cy.get('#option-course').click();
    cy.get('#submit').should('be.disabled');
  })

});