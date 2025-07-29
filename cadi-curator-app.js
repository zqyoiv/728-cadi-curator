let mixpanelInitialized = false;

// Initialize Mixpanel
function initializeMixpanel() {
    try {
      if (typeof mixpanel !== 'undefined') {
        // Use a demo/test token - replace with your actual Mixpanel project token
        mixpanel.init('demo_token', {
          debug: true,
          track_pageview: true,
          persistence: 'localStorage'
        });
        mixpanelInitialized = true;
        console.log('Mixpanel initialized successfully');
        
        // Track initial page load
        mixpanel.track('Page Load', {
          page_type: 'survey',
          survey_type: 'cadillac_brand_perception',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error initializing Mixpanel:', error);
    }
  }
    

// Simplified mixpanel tracking functions focused only on survey, email, and button clicks
const surveyTracking = {
    /**
     * Get answer text from value
     */
    getAnswerText(answer) {
        const answerMap = {
            'strongly-agree': 'Strongly agree',
            'agree': 'Agree', 
            'neutral': 'Neither Agree or Disagree',
            'disagree': 'Disagree',
            'strongly-disagree': 'Strongly Disagree'
        };
        return answerMap[answer] || answer;
    },

    /**
     * Get numeric scale position for analytics
     */
    getScalePosition(answer) {
        const scaleMap = {
            'strongly-agree': 5,
            'agree': 4,
            'neutral': 3,
            'disagree': 2,
            'strongly-disagree': 1
        };
        return scaleMap[answer] || 0;
    },

    /**
     * Track survey submission - core event
     */
    trackSurveySubmission(selectedRating, email) {
        if (mixpanelInitialized && typeof mixpanel !== 'undefined') {
            // Track the survey submission event
            mixpanel.track('Survey Submitted', {
                answer: selectedRating,
                answer_text: this.getAnswerText(selectedRating),
                email_domain: email.split('@')[1],
                question: 'Cadillac is a Brand for Me',
                survey_type: 'cadillac_brand_perception',
                scale_position: this.getScalePosition(selectedRating),
                timestamp: new Date().toISOString()
            });
            
            // Set user properties
            mixpanel.identify(email);
            mixpanel.people.set({
                $email: email,
                $last_seen: new Date(),
                latest_survey_answer: selectedRating,
                latest_survey_answer_text: this.getAnswerText(selectedRating),
                survey_completion_count: 1
            });
            
            console.log('Survey submission tracked in Mixpanel');
        }
    },

    /**
     * Track button clicks
     */
    trackButtonClick(buttonType, email = null) {
        if (mixpanelInitialized && typeof mixpanel !== 'undefined') {
            mixpanel.track('Button Clicked', {
                button_type: buttonType,
                page: 'survey',
                survey_type: 'cadillac_brand_perception',
                has_email: email ? 'yes' : 'no',
                email_domain: email ? email.split('@')[1] : null,
                timestamp: new Date().toISOString()
            });
            
            if (email) {
                mixpanel.identify(email);
                mixpanel.people.set({
                    $email: email,
                    $last_seen: new Date()
                });
                mixpanel.people.increment(`${buttonType}_clicks`, 1);
            }
            
            console.log(`${buttonType} button click tracked in Mixpanel`);
        }
    },

    /**
     * Track form field interactions
     */
    trackFormInteraction(field, action, value = null) {
        if (mixpanelInitialized && typeof mixpanel !== 'undefined') {
            mixpanel.track('Form Interaction', {
                field: field,
                action: action,
                value: value,
                page: 'survey',
                survey_type: 'cadillac_brand_perception',
                timestamp: new Date().toISOString()
            });
            
            console.log(`Form interaction tracked: ${field} ${action}`);
        }
    }
};

// Function to inject survey styles at runtime
     function injectSurveyStyles() {
         const styles = `
         /* Cadillac Gothic Font */
         @font-face {
           font-family: "CadillacGothic";
           src: url("https://cdn.jsdelivr.net/gh/zqyoiv/728-cadi-curator@main/asset/CadillacGothic-Regular.otf")
                format("opentype");
           font-weight: normal;
           font-style: normal;
           font-display: swap;
         }
         
         /* Survey Overlay Styles */
         #survey-overlay {
             position: fixed;
             top: 0;
             left: 0;
             width: 100%;
             height: 100%;
             background-color: #000000;
             background-image: url("https://cdn.jsdelivr.net/gh/zqyoiv/728-cadi-curator@main/asset/Cadillac-Logo_white.png");
             background-repeat: no-repeat;
             background-position: top;
             background-size: contain;
             z-index: 1000;
             overflow-y: auto;
             padding: 20px;
             box-sizing: border-box;
             display: flex;
             align-items: center;
             justify-content: center;
         }
         
         #survey-container {
             max-width: 600px;
             width: 100%;
             text-align: center;
             color: white;
             padding: 40px 30px;
             margin-top: 15vh;
         }
         
         .survey-header {
             margin-bottom: 40px;
         }
         
         .survey-logo {
             width: 60px;
             height: 60px;
             margin: 0 auto 30px;
             background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-family="serif" font-size="20" fill="black">CADILLAC</text></svg>') no-repeat center;
             background-size: contain;
             display: none;
         }
         
         .survey-title {
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
             font-size: 28px;
             font-weight: normal;
             color: white;
             margin: 0 0 20px 0;
             letter-spacing: 2px;
             text-transform: uppercase;
             line-height: 1.2;
         }
         
         .survey-subtitle {
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
             font-size: 16px;
             color: white;
             margin: 0 0 40px 0;
             letter-spacing: 1px;
             text-transform: uppercase;
         }
         
         .email-section {
             margin: 0 0 40px 0;
         }
         
         .email-section label {
             display: none;
         }
         
         .email-section input[type="email"] {
             width: 100%;
             max-width: 400px;
             padding: 16px 20px;
             border: 2px solid white;
             border-radius: 0;
             font-size: 16px;
             color: white;
             background: transparent;
             transition: all 0.2s ease;
             box-sizing: border-box;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
             text-align: center;
             letter-spacing: 1px;
         }
         
         .email-section input[type="email"]::placeholder {
             color: rgba(255, 255, 255, 0.7);
             text-transform: lowercase;
         }
         
         .email-section input[type="email"]:focus {
             outline: none;
             border-color: white;
             background: rgba(255, 255, 255, 0.1);
         }
         
         .survey-question {
             margin-bottom: 40px;
         }
         
         .survey-question h2 {
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
             font-size: 16px;
             font-weight: normal;
             color: white;
             margin-bottom: 30px;
             line-height: 1.4;
             text-align: center;
             letter-spacing: 1px;
         }
         
         .survey-options {
             display: flex;
             flex-direction: column;
             gap: 8px;
             max-width: 500px;
             margin: 0 auto;
         }
         
         .survey-option {
             position: relative;
         }
         
         .survey-option input[type="radio"] {
             display: none;
         }
         
         .survey-option label {
             display: block;
             padding: 16px 20px;
             background: transparent;
             border: 2px solid white;
             border-radius: 0;
             cursor: pointer;
             transition: all 0.2s ease;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
             color: white;
             font-size: 14px;
             letter-spacing: 1px;
             text-transform: uppercase;
             text-align: center;
         }
         
         .survey-option:hover label {
             background: rgba(255, 255, 255, 0.1);
         }
         
         .survey-option input[type="radio"]:checked + label {
             background: white;
             color: black;
             font-weight: normal;
         }
         
         .option-letter {
             display: none;
         }
         
         .option-text {
             font-size: 14px;
             color: inherit;
         }
         
         .submit-button {
             width: 100%;
             max-width: 400px;
             padding: 16px 24px;
             background: transparent;
             color: rgba(255, 255, 255, 0.5);
             border: 2px solid rgba(255, 255, 255, 0.5);
             border-radius: 0;
             font-size: 16px;
             font-weight: normal;
             cursor: not-allowed;
             transition: all 0.2s ease;
             margin: 20px auto 0;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
             letter-spacing: 2px;
             text-transform: uppercase;
             display: block;
         }
         
         .submit-button.enabled {
             background: transparent;
             color: white;
             border-color: white;
             cursor: pointer;
         }
         
         .submit-button.enabled:hover {
             background: white;
             color: black;
             transform: none;
         }
         
         .hidden {
             display: none !important;
         }
         
         @media (max-width: 768px) {
             #survey-container {
                 padding: 30px 20px;
             }
             
             .survey-title {
                 font-size: 24px;
                 letter-spacing: 1px;
             }
             
             .survey-subtitle {
                 font-size: 14px;
             }
             
             .survey-question h2 {
                 font-size: 14px;
             }
             
             .survey-option label {
                 padding: 14px 16px;
                 font-size: 12px;
             }
             
             .email-section input[type="email"] {
                 font-size: 14px;
                 padding: 14px 16px;
             }
             
             .submit-button {
                 font-size: 14px;
                 padding: 14px 20px;
                 letter-spacing: 1px;
             }
         }
         
         @media (max-width: 480px) {
             #survey-overlay {
                 padding: 10px;
             }
             
             #survey-container {
                 padding: 20px 15px;
             }
             
             .survey-title {
                 font-size: 20px;
             }
             
             .survey-options {
                 gap: 6px;
             }
         }
         
         /* Main Gallery Page Styles */
         body {
             background-color: #000000 !important;
             background-image: url("https://cdn.jsdelivr.net/gh/zqyoiv/728-cadi-curator@main/asset/Cadillac-Logo_white.png") !important;
             background-repeat: no-repeat !important;
             background-position: top center !important;
             background-size: contain !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
         }
         
         .event-banner {
             display: none !important;
         }
         
         #container {
             background-color: transparent !important;
             padding-top: 25vh !important;
             text-align: center !important;
         }
         
         #photo-container {
             background-color: transparent !important;
             max-width: 600px !important;
             margin: 0 auto !important;
             padding: 0 20px !important;
         }
         
         #header-container {
             background-color: transparent !important;
             padding: 0 0 30px 0 !important;
             text-align: center !important;
             margin-bottom: 20px !important;
         }
         
         #title {
             color: white !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: 28px !important;
             font-weight: normal !important;
             letter-spacing: 3px !important;
             text-transform: uppercase !important;
             margin: 0 0 10px 0 !important;
             line-height: 1.2 !important;
         }
         
         #title::before {
             content: "THANKS FOR JOINING" !important;
             display: block !important;
             margin-bottom: 10px !important;
         }
         
         #title::after {
             content: "AT THE US OPEN" !important;
             display: block !important;
             margin-top: 5px !important;
         }
         
         #time {
             color: white !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: 16px !important;
             font-weight: normal !important;
             letter-spacing: 1px !important;
             margin: 20px 0 !important;
         }
         
         #time::before {
             content: "Click below to download and share your Theme Art." !important;
         }
         
         .clv-photo {
             width: 100% !important;
             height: auto !important;
             max-width: 400px !important;
             margin: 30px auto !important;
             display: block !important;
             border-radius: 8px !important;
             box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
         }
         
         #igm34 {
             display: none !important;
         }
         
         #social-container {
             background-color: transparent !important;
             padding: 30px 20px !important;
             justify-content: center !important;
             gap: 30px !important;
             flex-wrap: wrap !important;
             margin-top: 40px !important;
         }
         
         .clv-button.circle {
             background-color: white !important;
             border: none !important;
             width: 70px !important;
             height: 70px !important;
             border-radius: 50% !important;
             display: flex !important;
             align-items: center !important;
             justify-content: center !important;
             transition: all 0.2s ease !important;
             box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
             position: relative !important;
         }
         
         .clv-button.circle:hover {
             background-color: rgba(255, 255, 255, 0.9) !important;
             transform: scale(1.1) !important;
             box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
         }
         
         .clv-button.circle div {
             display: flex !important;
             align-items: center !important;
             justify-content: center !important;
             width: 100% !important;
             height: 100% !important;
         }
         
         .clv-button.circle svg {
             width: 35px !important;
             height: 35px !important;
             fill: black !important;
             display: block !important;
             margin: 0 auto !important;
         }
         
         #iqeeok {
             background-color: transparent !important;
             color: white !important;
             text-align: center !important;
             padding: 20px !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
         }
         
         @media (max-width: 768px) {
             #container {
                 padding-top: 20vh !important;
             }
             
             #title {
                 font-size: 22px !important;
                 letter-spacing: 2px !important;
             }
             
             #time {
                 font-size: 14px !important;
             }
             
             .clv-button.circle {
                 width: 60px !important;
                 height: 60px !important;
             }
             
             .clv-button.circle svg {
                 width: 30px !important;
                 height: 30px !important;
             }
             
             #social-container {
                 gap: 20px !important;
                 padding: 20px !important;
                 margin-top: 30px !important;
             }
             
             .clv-photo {
                 max-width: 300px !important;
                 margin: 20px auto !important;
             }
         }
         
         @media (max-width: 480px) {
             #container {
                 padding-top: 15vh !important;
             }
             
             #title {
                 font-size: 18px !important;
                 letter-spacing: 1px !important;
             }
             
             #time {
                 font-size: 12px !important;
             }
             
             .clv-photo {
                 max-width: 250px !important;
             }
         }
         `;
         
         // Create style element
         const styleElement = document.createElement('style');
         styleElement.type = 'text/css';
         styleElement.id = 'survey-dynamic-styles';
         
         // Add styles to the element
         if (styleElement.styleSheet) {
             // IE support
             styleElement.styleSheet.cssText = styles;
         } else {
             styleElement.appendChild(document.createTextNode(styles));
         }
         
         // Append to head
         document.head.appendChild(styleElement);
     }
     
// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        injectSurveyStyles();
        initializeMixpanel();
        initializeSurvey();
    });
} else {
    injectSurveyStyles();
    initializeMixpanel();
    initializeSurvey();
}

// Survey functionality
function initializeSurvey() {
     // Create survey overlay
     const surveyOverlay = document.createElement('div');
     surveyOverlay.id = 'survey-overlay';

     surveyOverlay.innerHTML = `
         <div id="survey-container">
             <div class="survey-header">
                 <div class="survey-logo"></div>
                 <h1 class="survey-title">Quick Survey</h1>
                 <p class="survey-subtitle">We'd love to hear your opinion!</p>
             </div>

             <div class="survey-question">
                 <h2>Please rate the extent to which you agree with the following: 'Cadillac is a Brand for Me':</h2>
                 <div class="survey-options">
                     <div class="survey-option">
                         <input type="radio" id="strongly-agree" name="brand-rating" value="strongly-agree">
                         <label for="strongly-agree">
                             <div class="option-letter">A</div>
                             <div class="option-text">Strongly agree</div>
                         </label>
                     </div>
                     <div class="survey-option">
                         <input type="radio" id="agree" name="brand-rating" value="agree">
                         <label for="agree">
                             <div class="option-letter">B</div>
                             <div class="option-text">Agree</div>
                         </label>
                     </div>
                     <div class="survey-option">
                         <input type="radio" id="neutral" name="brand-rating" value="neutral">
                         <label for="neutral">
                             <div class="option-letter">C</div>
                             <div class="option-text">Neither Agree or Disagree</div>
                         </label>
                     </div>
                     <div class="survey-option">
                         <input type="radio" id="disagree" name="brand-rating" value="disagree">
                         <label for="disagree">
                             <div class="option-letter">D</div>
                             <div class="option-text">Disagree</div>
                         </label>
                     </div>
                     <div class="survey-option">
                         <input type="radio" id="strongly-disagree" name="brand-rating" value="strongly-disagree">
                         <label for="strongly-disagree">
                             <div class="option-letter">E</div>
                             <div class="option-text">Strongly Disagree</div>
                         </label>
                     </div>
                 </div>
             </div>

             <div class="email-section">
                 <label for="email-input">Your Email Address:</label>
                 <input type="email" id="email-input" placeholder="example@email.com">
             </div>

             <button type="button" class="submit-button" id="submit-survey">Submit Survey →</button>
         </div>
     `;

     // Add survey to page
     document.body.appendChild(surveyOverlay);

     // Get form elements
     const radioButtons = surveyOverlay.querySelectorAll('input[name="brand-rating"]');
     const emailInput = surveyOverlay.querySelector('#email-input');
     const submitButton = surveyOverlay.querySelector('#submit-survey');

     // Function to check if form is complete
     function checkFormComplete() {
         const hasSelection = Array.from(radioButtons).some(radio => radio.checked);
         const hasEmail = emailInput.value.trim() !== '' && emailInput.validity.valid;

         if (hasSelection && hasEmail) {
             submitButton.classList.add('enabled');
             submitButton.disabled = false;
         } else {
             submitButton.classList.remove('enabled');
             submitButton.disabled = true;
         }
     }

     // Add event listeners
     radioButtons.forEach(radio => {
         radio.addEventListener('change', function() {
             checkFormComplete();
             // Track radio button selection
             surveyTracking.trackOptionSelection(radio.value);
         });
     });

     emailInput.addEventListener('input', function() {
         checkFormComplete();
         // Track email input (but don't log the actual email content)
         if (emailInput.value.length > 0) {
             surveyTracking.trackEmailInteraction('input');
         }
     });

     emailInput.addEventListener('blur', function() {
         checkFormComplete();
         // Track email field completion
         if (emailInput.value.trim() !== '' && emailInput.validity.valid) {
             surveyTracking.trackEmailInteraction('completed', emailInput.value.trim());
         }
     });

     // Handle survey submission
     submitButton.addEventListener('click', function() {
         if (submitButton.classList.contains('enabled')) {
             // Get selected values
             const selectedRating = Array.from(radioButtons).find(radio => radio.checked)?.value;
             const email = emailInput.value.trim();

             // Track submit button click
             surveyTracking.trackButtonClick('submit', email);

             // Track survey submission to mixpanel
             surveyTracking.trackSurveySubmission(selectedRating, email);

             console.log('Survey submitted:', { rating: selectedRating, email: email });

             // Hide survey overlay with fade effect
             surveyOverlay.style.transition = 'opacity 0.3s ease';
             surveyOverlay.style.opacity = '0';

             setTimeout(() => {
                 surveyOverlay.remove();
             }, 300);
         }
     });

     // Initial check
     checkFormComplete();
}