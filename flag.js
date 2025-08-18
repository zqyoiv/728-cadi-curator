// Debug configuration flags
// This file can be easily modified to enable/disable debug mode without touching the main application

// Set to true to enable debug mode (disables Mixpanel tracking)
// Set to false for production mode (enables Mixpanel tracking)
const hardcodedDebug = true;

// Export for use in other files
window.AppFlags = {
    hardcodedDebug: hardcodedDebug
};

console.log('🏁 Flag.js loaded - hardcodedDebug:', hardcodedDebug);
