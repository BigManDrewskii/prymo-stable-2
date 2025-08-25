/**
 * TallyRedirect - Handles redirect after successful Tally form submission
 * Uses multiple methods to ensure redirection happens after form submission
 * Now integrates with AuthContext for proper authentication flow
 */

interface TallyEvent {
  type: string;
  data: {
    formId: string;
    formName?: string;
    responseId?: string;
    status?: string;
    // Add fields for form data extraction
    fields?: Array<{
      key: string;
      label: string;
      value: string;
      type: string;
    }>;
  };
}

// Global references for cleanup
let observer: MutationObserver | null = null;
let checkInterval: number | null = null;
let clickHandler: ((e: MouseEvent) => void) | null = null;
let messageHandler: ((event: MessageEvent) => void) | null = null;

// Function to extract email from Tally form data
const extractEmailFromTallyData = (tallyEvent: TallyEvent): string | null => {
  try {
    // Try to extract email from form fields
    if (tallyEvent.data.fields) {
      const emailField = tallyEvent.data.fields.find(
        field => field.type === 'email' || 
                field.key.toLowerCase().includes('email') ||
                field.label.toLowerCase().includes('email')
      );
      
      if (emailField && emailField.value) {
        return emailField.value;
      }
    }
    
    // Fallback: try to extract from DOM
    const emailInputs = document.querySelectorAll('input[type="email"]');
    for (const input of emailInputs) {
      const emailValue = (input as HTMLInputElement).value;
      if (emailValue && emailValue.includes('@')) {
        return emailValue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting email from Tally data:', error);
    return null;
  }
};

// Function to trigger authentication login
const triggerAuthLogin = (email?: string) => {
  try {
    // Try to get the auth context and login
    // Since this is a utility function, we'll dispatch a custom event
    // that the AuthContext can listen to
    const authEvent = new CustomEvent('tallyAuthSuccess', {
      detail: { email: email || 'user@example.com' }
    });
    window.dispatchEvent(authEvent);
  } catch (error) {
    console.error('Error triggering auth login:', error);
  }
};

// Cleanup function to prevent memory leaks
const cleanup = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (checkInterval !== null) {
    clearInterval(checkInterval);
    checkInterval = null;
  }

  if (clickHandler) {
    document.removeEventListener('click', clickHandler);
    clickHandler = null;
  }

  // Remove message event listener
  if (messageHandler) {
    window.removeEventListener('message', messageHandler);
    messageHandler = null;
  }
};

const redirectToApp = (email?: string) => {
  // Clean up all event listeners and observers
  cleanup();

  // Trigger authentication login with extracted email
  triggerAuthLogin(email);

  // Set a flag in localStorage to indicate we've redirected
  localStorage.setItem('tallySignupCompleted', 'true');
  
  // Store basic auth data if email is available
  if (email) {
    const authData = {
      email,
      timestamp: Date.now()
    };
    localStorage.setItem('prymo_auth', JSON.stringify(authData));
  }

  // Redirect to Index page
  console.log('Redirecting to Index page...');
  window.location.href = '/app';
};

// Check if user has completed signup previously
const checkPreviousSignup = () => {
  return localStorage.getItem('tallySignupCompleted') === 'true';
};

const setupTallyRedirect = () => {
  // If user has already signed up previously, redirect immediately
  if (window.location.pathname === '/' && checkPreviousSignup()) {
    // Redirect with a slight delay to avoid interrupting page load
    setTimeout(() => redirectToApp(), 500);
    return;
  }

  // Set up MutationObserver to watch for Tally success message
  observer = new MutationObserver((mutations) => {
    // Check if there's a success message visible
    const successMsg = document.querySelector('.tally-message-container');
    if (successMsg &&
        (successMsg.textContent?.includes('Thank') ||
         successMsg.textContent?.includes('sign') ||
         successMsg.textContent?.includes('inbox'))) {
      console.log('Tally success message detected via DOM observer');
      
      // Try to extract email from form
      const email = extractEmailFromTallyData({ 
        type: 'dom-success', 
        data: { formId: 'unknown', fields: [] } 
      });
      
      setTimeout(() => redirectToApp(email || undefined), 1000);
    }
  });

  // Start observing the entire document
  observer.observe(document.body, { childList: true, subtree: true });

  // Set up interval to check for success message as ultimate fallback
  checkInterval = setInterval(() => {
    const tallySuccess = document.querySelector('.tally-message-container');
    if (tallySuccess &&
        (tallySuccess.textContent?.includes('Thank') ||
         tallySuccess.textContent?.includes('sign') ||
         tallySuccess.textContent?.includes('inbox'))) {
      console.log('Tally success detected via interval check');
      
      // Try to extract email from form
      const email = extractEmailFromTallyData({ 
        type: 'interval-success', 
        data: { formId: 'unknown', fields: [] } 
      });
      
      redirectToApp(email || undefined);
      if (checkInterval) clearInterval(checkInterval);
    }
  }, 1000);

  // Create message handler for Tally iframe events
  messageHandler = (event: MessageEvent) => {
    // Only process messages from Tally domains
    if (event.origin.includes('tally.so')) {
      try {
        // Parse the event data
        const tallyEvent = event.data as TallyEvent;

        // Check if this is a form completion event
        if (
          tallyEvent &&
          (tallyEvent.type === 'tally-form-submit-success' ||
           tallyEvent.type === 'tally-popup-closed-success')
        ) {
          console.log('Tally form submitted successfully, redirecting to app...');

          // Extract email from the form data
          const email = extractEmailFromTallyData(tallyEvent);
          console.log('Extracted email:', email);

          // Redirect after a short delay to make sure the user sees the confirmation
          setTimeout(() => redirectToApp(email || undefined), 1500);
        }
      } catch (error) {
        console.error('Error processing Tally event:', error);
      }
    }
  };

  // Register message handler
  window.addEventListener('message', messageHandler);

  // Additional fallback method
  // This runs when the Tally popup is closed (with either success or cancel)
  clickHandler = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    // Look for clicks on the Tally close button or backdrop
    if (
      target.closest('.tally-popup-close') ||
      target.classList.contains('tally-popup-container')
    ) {
      // Check if there's a success message visible
      const successMsg = document.querySelector('.tally-message-container');
      if (successMsg &&
          (successMsg.textContent?.includes('Thank') ||
           successMsg.textContent?.includes('sign') ||
           successMsg.textContent?.includes('inbox'))) {
        console.log('Tally success detected via click handler');
        
        // Try to extract email from form
        const email = extractEmailFromTallyData({ 
          type: 'click-success', 
          data: { formId: 'unknown', fields: [] } 
        });
        
        setTimeout(() => redirectToApp(email || undefined), 500);
      }
    }
  };

  document.addEventListener('click', clickHandler);
};

export default setupTallyRedirect;