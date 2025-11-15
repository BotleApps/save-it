// Polyfill for error handling in the web platform
// This file helps prevent "Uncaught SyntaxError: Unexpected identifier 'ErrorHandler'" on web

if (typeof window !== 'undefined') {
  // Define a simple error handler for web
  window.ErrorHandler = {
    reportError: (error) => {
      console.error('Error reported:', error);
    },
    reportFatalError: (error) => {
      console.error('Fatal error reported:', error);
    }
  };
}

export default {};
