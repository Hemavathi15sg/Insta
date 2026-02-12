describe('Feed - Post Tags', () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!'
  };

  before(() => {
    // Register a new user for testing
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/api/auth/register`,
      body: testUser,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 201) {
        window.localStorage.setItem('token', response.body.token);
        window.localStorage.setItem('user', JSON.stringify(response.body.user));
      }
    });
  });

  beforeEach(() => {
    // Set up authentication before each test
    cy.login(testUser.email, testUser.password);
    cy.visit('/');
  });

  it('should display a tag on a post when tag is set', () => {
    // Navigate to create post (assuming there's a create post button or route)
    cy.visit('/create'); // Adjust route as needed
    
    // Fill in post creation form
    cy.get('input[type="file"]').should('exist'); // Image upload input
    
    // Create a test file for upload
    const fileName = 'test-image.jpg';
    const fileType = 'image/jpeg';
    
    cy.fixture('test-image.jpg', 'binary').then((fileContent) => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent, fileType);
      const file = new File([blob], fileName, { type: fileType });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      cy.get('input[type="file"]').then((input) => {
        // @ts-ignore
        input[0].files = dataTransfer.files;
        // Trigger change event
        cy.wrap(input).trigger('change', { force: true });
      });
    }).catch(() => {
      // If fixture doesn't exist, skip file upload for this test
      cy.log('No test fixture available, skipping file upload');
    });

    // Fill in caption
    cy.get('textarea[placeholder*="caption" i], input[placeholder*="caption" i]')
      .should('exist')
      .type('Beautiful sunset by the beach');

    // Fill in tag
    cy.get('input[placeholder*="tag" i], input[name="tag"]')
      .should('exist')
      .type('sunset');

    // Submit the form
    cy.contains('button', /post|create|submit/i).click();

    // Wait for navigation or success message
    cy.url().should('include', '/'); // Should navigate back to feed
    
    // Verify the post appears in the feed with the tag
    cy.contains('Beautiful sunset by the beach').should('be.visible');
    cy.contains('sunset').should('be.visible');
    
    // More specific: verify tag is displayed near the post
    cy.contains('Beautiful sunset by the beach')
      .parent()
      .parent()
      .within(() => {
        cy.contains('sunset').should('be.visible');
      });
  });

  it('should display posts without tags correctly', () => {
    // Navigate to create post
    cy.visit('/create');
    
    // Fill in caption only, no tag
    cy.get('textarea[placeholder*="caption" i], input[placeholder*="caption" i]')
      .should('exist')
      .type('Post without any tag');

    // Leave tag field empty
    cy.get('input[placeholder*="tag" i], input[name="tag"]')
      .should('exist')
      .should('have.value', '');

    // Submit the form (may need to select image first)
    cy.get('input[type="file"]').should('exist');
    
    cy.contains('button', /post|create|submit/i).click();

    // Verify the post appears without a tag
    cy.contains('Post without any tag').should('be.visible');
  });

  it('should truncate tags longer than 20 characters', () => {
    cy.visit('/create');
    
    const longTag = 'this_is_a_very_long_tag_exceeding_twenty_chars';
    const expectedTag = 'this_is_a_very_long_'; // First 20 chars
    
    cy.get('textarea[placeholder*="caption" i], input[placeholder*="caption" i]')
      .should('exist')
      .type('Post with long tag');

    cy.get('input[placeholder*="tag" i], input[name="tag"]')
      .should('exist')
      .type(longTag);

    cy.contains('button', /post|create|submit/i).click();

    // Verify the truncated tag appears
    cy.contains('Post with long tag').should('be.visible');
    cy.contains(expectedTag).should('be.visible');
  });

  it('should allow updating a post tag', () => {
    // First create a post with a tag
    cy.visit('/create');
    
    cy.get('textarea[placeholder*="caption" i], input[placeholder*="caption" i]')
      .should('exist')
      .type('Post to update tag');

    cy.get('input[placeholder*="tag" i], input[name="tag"]')
      .should('exist')
      .type('original');

    cy.contains('button', /post|create|submit/i).click();

    cy.url().should('include', '/');
    cy.contains('Post to update tag').should('be.visible');
    
    // Find and click edit button (adjust selector as needed)
    cy.contains('Post to update tag')
      .parent()
      .parent()
      .within(() => {
        cy.contains('original').should('be.visible');
        cy.get('button[aria-label*="edit" i], button[title*="edit" i]').click();
      });

    // Update the tag
    cy.get('input[placeholder*="tag" i], input[name="tag"]')
      .clear()
      .type('updated');

    cy.contains('button', /save|update/i).click();

    // Verify updated tag appears
    cy.contains('Post to update tag')
      .parent()
      .parent()
      .within(() => {
        cy.contains('updated').should('be.visible');
        cy.contains('original').should('not.exist');
      });
  });

  it('should display multiple posts with different tags', () => {
    // Create first post
    cy.visit('/create');
    cy.get('textarea[placeholder*="caption" i], input[placeholder*="caption" i]').type('Nature post');
    cy.get('input[placeholder*="tag" i], input[name="tag"]').type('nature');
    cy.contains('button', /post|create|submit/i).click();

    // Create second post
    cy.visit('/create');
    cy.get('textarea[placeholder*="caption" i], input[placeholder*="caption" i]').type('Travel post');
    cy.get('input[placeholder*="tag" i], input[name="tag"]').type('travel');
    cy.contains('button', /post|create|submit/i).click();

    // Verify both posts and tags appear in feed
    cy.visit('/');
    cy.contains('Nature post').should('be.visible');
    cy.contains('nature').should('be.visible');
    cy.contains('Travel post').should('be.visible');
    cy.contains('travel').should('be.visible');
  });
});
