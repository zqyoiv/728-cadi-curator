// Function to inject survey styles at runtime
     function injectSurveyStyles() {
         const styles = `
         /* Survey Overlay Styles */
         #survey-overlay {
             position: fixed;
             top: 0;
             left: 0;
             width: 100%;
             height: 100%;
             background-color: #f8f9fa;
             z-index: 1000;
             overflow-y: auto;
             padding: 20px;
             box-sizing: border-box;
         }
         
         #survey-container {
             max-width: 500px;
             margin: 0 auto;
             background: white;
             border-radius: 16px;
             padding: 40px 30px;
             box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
         }
         
         .survey-header {
             text-align: center;
             margin-bottom: 40px;
         }
         
         .survey-logo {
             width: 40px;
             height: 40px;
             background: linear-gradient(45deg, #4facfe, #00f2fe);
             border-radius: 8px;
             margin: 0 auto 16px;
             display: flex;
             align-items: center;
             justify-content: center;
         }
         
         .survey-logo::before {
             content: "📊";
             font-size: 20px;
         }
         
         .survey-title {
             font-size: 32px;
             font-weight: 700;
             color: #333;
             margin: 0 0 8px 0;
             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
         }
         
         .survey-subtitle {
             font-size: 16px;
             color: #666;
             margin: 0;
             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
         }
         
         .survey-question {
             margin-bottom: 30px;
         }
         
         .survey-question h2 {
             font-size: 18px;
             font-weight: 600;
             color: #333;
             margin-bottom: 24px;
             line-height: 1.4;
             text-align: center;
             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
         }
         
         .survey-options {
             display: flex;
             flex-direction: column;
             gap: 12px;
         }
         
         .survey-option {
             position: relative;
         }
         
         .survey-option input[type="radio"] {
             display: none;
         }
         
         .survey-option label {
             display: flex;
             align-items: center;
             padding: 16px 20px;
             background: #f8f9fa;
             border: 2px solid #e9ecef;
             border-radius: 12px;
             cursor: pointer;
             transition: all 0.2s ease;
             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
         }
         
         .survey-option:hover label {
             border-color: #007bff;
             background: #f0f8ff;
         }
         
         .survey-option input[type="radio"]:checked + label {
             border-color: #007bff;
             background: #f0f8ff;
             color: #007bff;
             font-weight: 600;
         }
         
         .option-letter {
             width: 32px;
             height: 32px;
             background: #e9ecef;
             border-radius: 50%;
             display: flex;
             align-items: center;
             justify-content: center;
             font-weight: 600;
             font-size: 14px;
             margin-right: 16px;
             color: #666;
             transition: all 0.2s ease;
         }
         
         .survey-option input[type="radio"]:checked + label .option-letter {
             background: #007bff;
             color: white;
         }
         
         .option-text {
             font-size: 16px;
             color: #333;
         }
         
         .email-section {
             margin: 30px 0;
         }
         
         .email-section label {
             display: block;
             font-size: 16px;
             font-weight: 600;
             color: #333;
             margin-bottom: 12px;
             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
         }
         
         .email-section input[type="email"] {
             width: 100%;
             padding: 16px 20px;
             border: 2px solid #e9ecef;
             border-radius: 12px;
             font-size: 16px;
             color: #333;
             background: #f8f9fa;
             transition: all 0.2s ease;
             box-sizing: border-box;
             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
         }
         
         .email-section input[type="email"]:focus {
             outline: none;
             border-color: #007bff;
             background: white;
             box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
         }
         
         .submit-button {
             width: 100%;
             padding: 16px 24px;
             background: #d6d6d6;
             color: #666;
             border: none;
             border-radius: 12px;
             font-size: 16px;
             font-weight: 600;
             cursor: not-allowed;
             transition: all 0.2s ease;
             margin-top: 20px;
             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
         }
         
         .submit-button.enabled {
             background: #007bff;
             color: white;
             cursor: pointer;
         }
         
         .submit-button.enabled:hover {
             background: #0056b3;
             transform: translateY(-1px);
         }
         
         .hidden {
             display: none !important;
         }
         
         @media (max-width: 480px) {
             #survey-container {
                 padding: 30px 20px;
                 margin: 10px;
             }
             
             .survey-title {
                 font-size: 28px;
             }
             
             .survey-question h2 {
                 font-size: 16px;
             }
             
             .survey-option label {
                 padding: 14px 16px;
             }
             
             .option-letter {
                 width: 28px;
                 height: 28px;
                 margin-right: 12px;
                 font-size: 12px;
             }
             
             .option-text {
                 font-size: 14px;
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
     
     // Inject styles when DOM is ready
     if (document.readyState === 'loading') {
         document.addEventListener('DOMContentLoaded', injectSurveyStyles);
     } else {
         injectSurveyStyles();
     }
     
// Survey functionality
 document.addEventListener('DOMContentLoaded', function() {
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
         radio.addEventListener('change', checkFormComplete);
     });

     emailInput.addEventListener('input', checkFormComplete);
     emailInput.addEventListener('blur', checkFormComplete);

     // Handle survey submission
     submitButton.addEventListener('click', function() {
         if (submitButton.classList.contains('enabled')) {
             // Get selected values
             const selectedRating = Array.from(radioButtons).find(radio => radio.checked)?.value;
             const email = emailInput.value.trim();

             // Here you could send the data to your server
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


 });