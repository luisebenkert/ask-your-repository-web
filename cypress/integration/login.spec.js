context('Login', () => {
  beforeEach(() => {
    cy.resetDB();

    cy.server();
    cy.route({ method: 'POST', url: '/authentications' }).as('login');
    cy.createUser({
      username: 'jenny',
      email: 'jenny@example.com',
      password: 'secret',
    });
    cy.visit('/login');
  });

  it('authenticates the user with the given credentials', () => {
    cy.get('[data-cy=login-email-input]').type('jenny@example.com');
    cy.get('[data-cy=login-password-input]').type('secret');
    cy.get('[data-cy=login-submit-button]').click();

    cy.wait('@login');
    cy.location().should((location) => {
      expect(location.pathname).to.eq('/select-team');
    });
  });
});
