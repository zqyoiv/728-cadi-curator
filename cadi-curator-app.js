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
         
         @font-face {
           font-family: 'CadillacGothicWide';
           src: url('https://cdn.jsdelivr.net/gh/zqyoiv/728-cadi-curator@main/asset/CadillacGothic-WideRegular.otf')
                format('opentype');
           font-weight: 400;
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
             background-position: top center;
             background-size: min(80vw, 400px);
             z-index: 1000;
             overflow: hidden;
             padding: 2vh 2vw;
             box-sizing: border-box;
             display: flex;
             align-items: center;
             justify-content: center;
         }
         
         #survey-container {
             max-width: min(90vw, 600px);
             width: 100%;
             text-align: center;
             color: white;
             padding: 2vh 2vw;
             margin-top: min(15vh, 120px);
             max-height: 85vh;
             overflow-y: auto;
             box-sizing: border-box;
         }
         
         #survey-overlay .survey-header {
             margin-bottom: min(5vh, 40px);
         }
         
         #survey-overlay .survey-logo {
             width: min(8vw, 60px);
             height: min(8vw, 60px);
             margin: 0 auto min(4vh, 30px);
             background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-family="serif" font-size="20" fill="black">CADILLAC</text></svg>') no-repeat center;
             background-size: contain;
             display: none;
         }
         
         #survey-overlay .survey-title {
             font-family: "CadillacGothicWide", "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: clamp(18px, 4vw, 24px) !important;
             font-weight: 400 !important;
             color: white !important;
             margin: 0 0 min(3vh, 20px) 0 !important;
             letter-spacing: clamp(1px, 0.3vw, 2px) !important;
             text-transform: uppercase !important;
             line-height: 1.2 !important;
         }
         
         #survey-overlay .survey-subtitle {
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: clamp(14px, 2.5vw, 16px) !important;
             color: white !important;
             margin: 0 0 min(5vh, 40px) 0 !important;
             letter-spacing: clamp(0.5px, 0.2vw, 1px) !important;
             text-transform: uppercase !important;
         }
         
         #survey-overlay .email-section {
             margin: 0 0 min(5vh, 40px) 0 !important;
         }
         
         #survey-overlay .email-section label {
             display: none !important;
         }
         
         #survey-overlay .email-section input[type="email"] {
             width: 100% !important;
             max-width: min(80vw, 400px) !important;
             padding: min(2vh, 16px) min(3vw, 20px) !important;
             border: 2px solid white !important;
             border-radius: 0 !important;
             font-size: clamp(14px, 2.5vw, 16px) !important;
             color: white !important;
             background: transparent !important;
             transition: all 0.2s ease !important;
             box-sizing: border-box !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             text-align: center !important;
             letter-spacing: clamp(0.5px, 0.2vw, 1px) !important;
         }
         
         #survey-overlay .email-section input[type="email"]::placeholder {
             color: rgba(255, 255, 255, 0.7) !important;
             text-transform: lowercase !important;
         }
         
         #survey-overlay .email-section input[type="email"]:focus {
             outline: none !important;
             border-color: white !important;
             background: rgba(255, 255, 255, 0.1) !important;
         }
         
         #survey-overlay .survey-question {
             margin-bottom: min(5vh, 40px) !important;
         }
         
         #survey-overlay .survey-question h2 {
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: clamp(13px, 2.2vw, 16px) !important;
             font-weight: normal !important;
             color: white !important;
             margin-bottom: min(4vh, 30px) !important;
             line-height: 1.4 !important;
             text-align: center !important;
             letter-spacing: clamp(0.5px, 0.2vw, 1px) !important;
         }
         
         #survey-overlay .survey-options {
             display: flex !important;
             flex-direction: column !important;
             gap: min(1.5vh, 8px) !important;
             max-width: min(70vw, 400px) !important;
             margin: 0 auto !important;
         }
         
         #survey-overlay .survey-option {
             position: relative !important;
         }
         
         #survey-overlay .survey-option input[type="radio"] {
             display: none !important;
         }
         
         #survey-overlay .survey-option label {
             display: block !important;
             padding: min(2vh, 16px) min(3vw, 20px) !important;
             background: transparent !important;
             border: 2px solid white !important;
             border-radius: 0 !important;
             cursor: pointer !important;
             transition: all 0.2s ease !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             color: white !important;
             font-size: clamp(12px, 2vw, 14px) !important;
             letter-spacing: clamp(0.5px, 0.2vw, 1px) !important;
             text-transform: uppercase !important;
             text-align: center !important;
             width: 100% !important;
             max-width: min(65vw, 350px) !important;
             margin: 0 auto !important;
             box-sizing: border-box !important;
         }
         
         #survey-overlay .survey-option:hover label {
             background: rgba(255, 255, 255, 0.1) !important;
         }
         
         #survey-overlay .survey-option input[type="radio"]:checked + label {
             background: white !important;
             color: black !important;
             font-weight: normal !important;
         }
         
         #survey-overlay .option-letter {
             display: none !important;
         }
         
         #survey-overlay .option-text {
             font-size: clamp(12px, 2vw, 14px) !important;
             color: inherit !important;
         }
         
         #survey-overlay .submit-button {
            position: relative !important;
            width: 100% !important;
            max-width: min(85vw, 500px) !important;
            padding: min(2.5vh, 18px) min(5vw, 32px) !important;
            background: transparent !important;
            color: rgba(255, 255, 255, 0.5) !important;
            border: 2px solid rgba(255, 255, 255, 0.5) !important;
            border-radius: 0 !important;
            font-size: clamp(14px, 2.5vw, 16px) !important;
            font-weight: normal !important;
            cursor: not-allowed !important;
            transition: all 0.2s ease !important;
            margin: min(3vh, 20px) auto 0 !important;
            font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            letter-spacing: clamp(1px, 0.3vw, 2px) !important;
            text-transform: uppercase !important;
            display: block !important;
            z-index: 2 !important;
        }
        
        #survey-overlay .submit-button::before {
            content: '' !important;
            position: absolute !important;
            top: min(-1vh, -8px) !important;
            left: min(-1vh, -8px) !important;
            right: min(-1vh, -8px) !important;
            bottom: min(-1vh, -8px) !important;
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 0 !important;
            z-index: -1 !important;
            transition: all 0.2s ease !important;
            background: transparent !important;
        }
        
        #survey-overlay .submit-button.enabled {
            background: transparent !important;
            color: white !important;
            border-color: white !important;
            cursor: pointer !important;
        }
        
        #survey-overlay .submit-button.enabled::before {
            border-color: white !important;
        }
        
        #survey-overlay .submit-button.enabled:hover {
            background: white !important;
            color: black !important;
            transform: none !important;
        }
        
        #survey-overlay .submit-button.enabled:hover::before {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: white !important;
        }
        
        #survey-overlay .survey-disclaimer {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: clamp(8px, 1.5vw, 10px) !important;
            color: rgba(255, 255, 255, 0.7) !important;
            background: rgba(0, 0, 0, 0.8) !important;
            padding: min(2vh, 15px) min(3vw, 20px) !important;
            line-height: 1.3 !important;
            text-align: center !important;
            margin: 0 !important;
            z-index: 1001 !important;
            box-sizing: border-box !important;
            max-height: 15vh !important;
            overflow: hidden !important;
        }
        
        #survey-overlay .hidden {
            display: none !important;
        }
         
         /* Main Gallery Page Styles */
         body#i1xr {
             background-color: #000000 !important;
             background-image: url("https://cdn.jsdelivr.net/gh/zqyoiv/728-cadi-curator@main/asset/Cadillac-Logo_white.png") !important;
             background-repeat: no-repeat !important;
             background-position: top center !important;
             background-size: min(60vw, 300px) !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             margin: 0 !important;
             padding: 0 !important;
             height: 100vh !important;
             overflow: hidden !important;
         }
         
         body#i1xr .event-banner {
             display: none !important;
         }
         
         body#i1xr #container {
             background-color: transparent !important;
             padding-top: min(20vh, 150px) !important;
             text-align: center !important;
             width: 100% !important;
             margin: 0 auto !important;
             display: flex !important;
             flex-direction: column !important;
             align-items: center !important;
             justify-content: flex-start !important;
             height: 100vh !important;
             overflow-y: auto !important;
             box-sizing: border-box !important;
         }
         
         body#i1xr #photo-container {
             background-color: transparent !important;
             max-width: min(90vw, 600px) !important;
             margin: 0 auto !important;
             padding: 0 min(3vw, 20px) !important;
             text-align: center !important;
             width: 100% !important;
             box-sizing: border-box !important;
             flex-shrink: 0 !important;
         }
         
         body#i1xr #header-container {
             background-color: transparent !important;
             padding: 0 0 min(4vh, 30px) 0 !important;
             text-align: center !important;
             margin-bottom: min(3vh, 20px) !important;
             width: 100% !important;
             display: block !important;
         }
         
         body#i1xr #title {
             color: white !important;
             font-family: "CadillacGothicWide", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: clamp(20px, 4vw, 28px) !important;
             font-weight: normal !important;
             letter-spacing: clamp(1px, 0.3vw, 3px) !important;
             text-transform: uppercase !important;
             margin: 0 auto min(2vh, 10px) auto !important;
             line-height: 1.2 !important;
             text-align: center !important;
             width: 100% !important;
             display: block !important;
         }
         
         body#i1xr #title::before {
             content: "THANKS FOR JOINING" !important;
             display: block !important;
             margin-bottom: min(1.5vh, 10px) !important;
             text-align: center !important;
             width: 100% !important;
         }
         
         body#i1xr #title::after {
             content: "AT THE US OPEN" !important;
             display: block !important;
             margin-top: min(1vh, 5px) !important;
             text-align: center !important;
             width: 100% !important;
         }
         
         body#i1xr #time {
             color: white !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: clamp(12px, 2.5vw, 16px) !important;
             font-weight: normal !important;
             letter-spacing: clamp(0.5px, 0.2vw, 1px) !important;
             margin: min(3vh, 20px) auto !important;
             text-align: center !important;
             width: 100% !important;
             display: block !important;
         }
         
         body#i1xr #time::before {
             content: "Click below to download and share your Theme Art." !important;
             text-align: center !important;
             display: block !important;
             width: 100% !important;
         }
         
         body#i1xr .clv-photo {
             width: 100% !important;
             height: auto !important;
             max-width: min(70vw, 400px) !important;
             max-height: min(40vh, 300px) !important;
             margin: min(4vh, 30px) auto !important;
             display: block !important;
             border-radius: clamp(4px, 1vw, 8px) !important;
             box-shadow: 0 min(1vh, 8px) min(3vh, 25px) rgba(0, 0, 0, 0.3) !important;
             object-fit: contain !important;
         }
         
         body#i1xr #igm34 {
             display: none !important;
         }
         
         body#i1xr #social-container {
             background-color: transparent !important;
             padding: min(4vh, 30px) min(3vw, 20px) !important;
             justify-content: center !important;
             gap: min(4vw, 30px) !important;
             flex-wrap: wrap !important;
             margin-top: min(5vh, 40px) !important;
             display: flex !important;
             width: 100% !important;
             text-align: center !important;
             align-items: center !important;
             flex-shrink: 0 !important;
         }
         
         body#i1xr .clv-button.circle,
         body#i1xr a.clv-button.circle {
             background-color: white !important;
             background: white !important;
             border: none !important;
             width: min(12vw, 70px) !important;
             height: min(12vw, 70px) !important;
             min-width: 50px !important;
             min-height: 50px !important;
             border-radius: 50% !important;
             align-items: center !important;
             justify-content: center !important;
             transition: all 0.2s ease !important;
             box-shadow: 0 min(0.5vh, 4px) min(2vh, 15px) rgba(0, 0, 0, 0.2) !important;
             position: relative !important;
             text-decoration: none !important;
         }
         
         body#i1xr .clv-button.circle:hover,
         body#i1xr a.clv-button.circle:hover {
             background-color: rgba(255, 255, 255, 0.9) !important;
             background: rgba(255, 255, 255, 0.9) !important;
             transform: scale(1.1) !important;
             box-shadow: 0 min(1vh, 6px) min(3vh, 20px) rgba(0, 0, 0, 0.3) !important;
         }
         
         body#i1xr .clv-button.circle div,
         body#i1xr a.clv-button.circle div {
             display: flex !important;
             align-items: center !important;
             justify-content: center !important;
             width: 100% !important;
             height: 100% !important;
             background: transparent !important;
         }
         
         body#i1xr .clv-button.circle svg,
         body#i1xr a.clv-button.circle svg,
         body#i1xr .clv-button.circle div svg,
         body#i1xr a.clv-button.circle div svg {
             width: min(6vw, 35px) !important;
             height: min(6vw, 35px) !important;
             min-width: 20px !important;
             min-height: 20px !important;
             fill: black !important;
             color: black !important;
             display: block !important;
             margin: 0 auto !important;
             background: transparent !important;
         }
         
         body#i1xr .clv-button.circle svg path,
         body#i1xr a.clv-button.circle svg path,
         body#i1xr .clv-button.circle div svg path,
         body#i1xr a.clv-button.circle div svg path {
             fill: black !important;
             color: black !important;
         }
         
         body#i1xr #iqeeok {
             background-color: transparent !important;
             color: white !important;
             text-align: center !important;
             padding: min(3vh, 20px) !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             width: 100% !important;
             margin: 0 auto !important;
             font-size: clamp(12px, 2.5vw, 16px) !important;
             flex-shrink: 0 !important;
         }
         
         @media (max-width: 768px) {
            #survey-overlay {
                background-size: min(90vw, 300px);
            }
            
            body#i1xr {
                background-size: min(70vw, 250px) !important;
            }
            
            body#i1xr #container {
                padding-top: min(15vh, 100px) !important;
            }
            
            body#i1xr #title {
                font-size: clamp(18px, 5vw, 24px) !important;
                letter-spacing: clamp(0.5px, 0.2vw, 2px) !important;
            }
            
            body#i1xr #time {
                font-size: clamp(10px, 3vw, 14px) !important;
                margin: min(2vh, 15px) auto !important;
            }
            
            body#i1xr .clv-photo {
                max-width: min(80vw, 350px) !important;
                max-height: min(35vh, 250px) !important;
                margin: min(3vh, 20px) auto !important;
            }
            
            body#i1xr #social-container {
                gap: min(5vw, 25px) !important;
                padding: min(3vh, 20px) min(2vw, 15px) !important;
                margin-top: min(4vh, 30px) !important;
            }
            
            body#i1xr .clv-button.circle,
            body#i1xr a.clv-button.circle {
                width: min(15vw, 60px) !important;
                height: min(15vw, 60px) !important;
                min-width: 45px !important;
                min-height: 45px !important;
            }
            
            body#i1xr .clv-button.circle svg,
            body#i1xr a.clv-button.circle svg,
            body#i1xr .clv-button.circle div svg,
            body#i1xr a.clv-button.circle div svg {
                width: min(8vw, 30px) !important;
                height: min(8vw, 30px) !important;
                min-width: 18px !important;
                min-height: 18px !important;
            }
            
            #survey-container {
                padding: 1.5vh 1.5vw;
                margin-top: min(12vh, 80px);
                max-height: 88vh;
            }
            
            #survey-overlay .survey-title {
                font-size: clamp(16px, 5vw, 22px) !important;
                margin-bottom: min(2vh, 15px) !important;
            }
            
            #survey-overlay .survey-subtitle {
                font-size: clamp(12px, 3vw, 14px) !important;
                margin-bottom: min(4vh, 30px) !important;
            }
            
            #survey-overlay .survey-question h2 {
                font-size: clamp(11px, 3vw, 14px) !important;
                margin-bottom: min(3vh, 20px) !important;
            }
            
            #survey-overlay .survey-options {
                gap: min(1vh, 6px) !important;
                max-width: min(80vw, 350px) !important;
            }
            
            #survey-overlay .survey-option label {
                padding: min(1.5vh, 14px) min(2vw, 16px) !important;
                font-size: clamp(10px, 2.5vw, 12px) !important;
                max-width: min(75vw, 300px) !important;
            }
            
            #survey-overlay .email-section input[type="email"] {
                font-size: clamp(12px, 3vw, 14px) !important;
                padding: min(1.5vh, 14px) min(2vw, 16px) !important;
                max-width: min(85vw, 350px) !important;
            }
            
            #survey-overlay .submit-button {
                font-size: clamp(12px, 3vw, 14px) !important;
                padding: min(2vh, 16px) min(4vw, 24px) !important;
                letter-spacing: clamp(0.5px, 0.2vw, 1px) !important;
                max-width: min(90vw, 450px) !important;
            }
            
            #survey-overlay .survey-disclaimer {
                font-size: clamp(7px, 2vw, 9px) !important;
                padding: min(1.5vh, 12px) min(2vw, 15px) !important;
                max-height: 12vh !important;
            }
        }
        
        @media (max-width: 480px) {
            #survey-overlay {
                background-size: min(95vw, 250px);
                padding: 1vh 1vw;
            }
            
            body#i1xr {
                background-size: min(80vw, 200px) !important;
            }
            
            body#i1xr #container {
                padding-top: min(12vh, 80px) !important;
            }
            
            body#i1xr #photo-container {
                padding: 0 min(2vw, 15px) !important;
            }
            
            body#i1xr #title {
                font-size: clamp(16px, 6vw, 20px) !important;
                letter-spacing: clamp(0.5px, 0.1vw, 1px) !important;
            }
            
            body#i1xr #time {
                font-size: clamp(9px, 3.5vw, 12px) !important;
                margin: min(1.5vh, 12px) auto !important;
            }
            
            body#i1xr .clv-photo {
                max-width: min(85vw, 300px) !important;
                max-height: min(30vh, 200px) !important;
                margin: min(2vh, 15px) auto !important;
            }
            
            body#i1xr #social-container {
                gap: min(6vw, 20px) !important;
                padding: min(2vh, 15px) min(1.5vw, 12px) !important;
                margin-top: min(3vh, 20px) !important;
            }
            
            body#i1xr .clv-button.circle,
            body#i1xr a.clv-button.circle {
                width: min(18vw, 55px) !important;
                height: min(18vw, 55px) !important;
                min-width: 40px !important;
                min-height: 40px !important;
            }
            
            body#i1xr .clv-button.circle svg,
            body#i1xr a.clv-button.circle svg,
            body#i1xr .clv-button.circle div svg,
            body#i1xr a.clv-button.circle div svg {
                width: min(10vw, 25px) !important;
                height: min(10vw, 25px) !important;
                min-width: 15px !important;
                min-height: 15px !important;
            }
            
            body#i1xr #iqeeok {
                font-size: clamp(10px, 3vw, 14px) !important;
                padding: min(2vh, 15px) !important;
            }
            
            #survey-container {
                padding: 1vh 1vw;
                margin-top: min(10vh, 60px);
                max-height: 90vh;
            }
            
            #survey-overlay .survey-title {
                font-size: clamp(14px, 6vw, 20px) !important;
                letter-spacing: clamp(0.5px, 0.2vw, 1px) !important;
            }
            
            #survey-overlay .survey-subtitle {
                font-size: clamp(10px, 3.5vw, 13px) !important;
            }
            
            #survey-overlay .survey-question h2 {
                font-size: clamp(10px, 3.5vw, 13px) !important;
                margin-bottom: min(2vh, 15px) !important;
            }
            
            #survey-overlay .survey-options {
                gap: min(0.8vh, 6px) !important;
                max-width: min(90vw, 300px) !important;
            }
            
            #survey-overlay .survey-option label {
                padding: min(1vh, 12px) min(1.5vw, 12px) !important;
                font-size: clamp(9px, 3vw, 11px) !important;
                max-width: min(85vw, 280px) !important;
            }
            
            #survey-overlay .email-section input[type="email"] {
                font-size: clamp(11px, 3.5vw, 13px) !important;
                padding: min(1vh, 12px) min(1.5vw, 12px) !important;
                max-width: min(90vw, 320px) !important;
            }
            
            #survey-overlay .submit-button {
                font-size: clamp(11px, 3.5vw, 13px) !important;
                padding: min(1.5vh, 15px) min(3vw, 20px) !important;
                letter-spacing: clamp(0.5px, 0.1vw, 1px) !important;
                max-width: min(95vw, 400px) !important;
            }
            
            #survey-overlay .submit-button::before {
                top: min(-0.5vh, -6px) !important;
                left: min(-0.5vh, -6px) !important;
                right: min(-0.5vh, -6px) !important;
                bottom: min(-0.5vh, -6px) !important;
            }
            
            #survey-overlay .survey-disclaimer {
                font-size: clamp(6px, 2.5vw, 8px) !important;
                padding: min(1vh, 10px) min(1.5vw, 12px) !important;
                max-height: 10vh !important;
                line-height: 1.2 !important;
            }
        }
        
        @media (max-height: 600px) {
            body#i1xr #container {
                padding-top: min(8vh, 50px) !important;
            }
            
            body#i1xr #header-container {
                padding-bottom: min(2vh, 15px) !important;
                margin-bottom: min(1vh, 10px) !important;
            }
            
            body#i1xr .clv-photo {
                max-height: min(25vh, 150px) !important;
                margin: min(2vh, 12px) auto !important;
            }
            
            body#i1xr #social-container {
                margin-top: min(2vh, 15px) !important;
                padding: min(2vh, 15px) min(2vw, 15px) !important;
            }
            
            #survey-container {
                margin-top: 5vh;
                max-height: 80vh;
            }
            
            #survey-overlay .survey-header {
                margin-bottom: 2vh;
            }
            
            #survey-overlay .email-section,
            #survey-overlay .survey-question {
                margin-bottom: 2vh !important;
            }
            
            #survey-overlay .survey-options {
                gap: 0.5vh !important;
            }
            
            #survey-overlay .survey-disclaimer {
                max-height: 8vh !important;
                font-size: clamp(6px, 1.2vw, 8px) !important;
            }
        }
        
        @media (max-height: 500px) {
            body#i1xr #container {
                padding-top: min(5vh, 30px) !important;
            }
            
            body#i1xr #title {
                font-size: clamp(14px, 4vw, 18px) !important;
            }
            
            body#i1xr .clv-photo {
                max-height: min(20vh, 100px) !important;
                margin: min(1vh, 8px) auto !important;
            }
            
            body#i1xr #social-container {
                gap: min(3vw, 15px) !important;
                margin-top: min(1vh, 8px) !important;
            }
            
            body#i1xr .clv-button.circle,
            body#i1xr a.clv-button.circle {
                width: min(10vw, 40px) !important;
                height: min(10vw, 40px) !important;
                min-width: 30px !important;
                min-height: 30px !important;
            }
            
            body#i1xr .clv-button.circle svg,
            body#i1xr a.clv-button.circle svg,
            body#i1xr .clv-button.circle div svg,
            body#i1xr a.clv-button.circle div svg {
                width: min(5vw, 20px) !important;
                height: min(5vw, 20px) !important;
                min-width: 12px !important;
                min-height: 12px !important;
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
                 <h1 class="survey-title">Your US Open<br>Theme Art Is Ready</h1>
                 <p class="survey-subtitle">Please enter your email</p>
             </div>

             <div class="email-section">
                 <input type="email" id="email-input" placeholder="example@info.com">
             </div>

             <div class="survey-question">
                 <h2>Please rate the extent to which you agree with the following: 'Cadillac is a Brand for Me':</h2>
                 <div class="survey-options">
                     <div class="survey-option">
                         <input type="radio" id="strongly-agree" name="brand-rating" value="strongly-agree">
                         <label for="strongly-agree">Strongly Agree</label>
                     </div>
                     <div class="survey-option">
                         <input type="radio" id="agree" name="brand-rating" value="agree">
                         <label for="agree">Agree</label>
                     </div>
                     <div class="survey-option">
                         <input type="radio" id="neutral" name="brand-rating" value="neutral">
                         <label for="neutral">Neither Agree or Disagree</label>
                     </div>
                     <div class="survey-option">
                         <input type="radio" id="disagree" name="brand-rating" value="disagree">
                         <label for="disagree">Disagree</label>
                     </div>
                     <div class="survey-option">
                         <input type="radio" id="strongly-disagree" name="brand-rating" value="strongly-disagree">
                         <label for="strongly-disagree">Strongly Disagree</label>
                     </div>
                 </div>
             </div>

             <button type="button" class="submit-button" id="submit-survey">Submit and View Theme Art</button>
             
             <div class="survey-disclaimer">
                 Your email will not be shared with third parties or used for marketing or promotional purposes. Your US Open theme artwork will not be used for marketing or promotional purposes, and will only be available until December 31, 2025.
             </div>
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