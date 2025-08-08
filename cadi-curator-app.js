let mixpanelInitialized = false;

// Function to inject Mixpanel script into document head
function injectMixpanelScript() {
    // Check if script is already loaded
    if (typeof mixpanel !== 'undefined' && mixpanel.__SV) {
        console.log('Mixpanel already properly loaded');
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        try {
            // Create the exact Mixpanel stub that matches the official snippet
            if (!window.mixpanel || !window.mixpanel.__SV) {
                window.mixpanel = window.mixpanel || [];
                window.mixpanel._i = window.mixpanel._i || [];
                
                // Initialize function that creates instances
                window.mixpanel.init = function(token, config, name) {
                    var target = window.mixpanel;
                    if (typeof name !== 'undefined') {
                        target = window.mixpanel[name] = [];
                    } else {
                        name = 'mixpanel';
                    }
                    
                    target.people = target.people || [];
                    target.toString = function(no_stub) {
                        var str = 'mixpanel';
                        if (name !== 'mixpanel') {
                            str += '.' + name;
                        }
                        if (!no_stub) {
                            str += ' (stub)';
                        }
                        return str;
                    };
                    
                    target.people.toString = function() {
                        return target.toString(1) + '.people (stub)';
                    };
                    
                    // List of methods to stub (exact from official snippet)
                    var methods = 'disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove'.split(' ');
                    
                    function stub_method(method_name) {
                        var method_parts = method_name.split('.');
                        if (method_parts.length === 2) {
                            var obj = target[method_parts[0]];
                            obj[method_parts[1]] = function() {
                                obj.push([method_parts[1]].concat(Array.prototype.slice.call(arguments, 0)));
                            };
                        } else {
                            target[method_name] = function() {
                                target.push([method_name].concat(Array.prototype.slice.call(arguments, 0)));
                            };
                        }
                    }
                    
                    for (var i = 0; i < methods.length; i++) {
                        stub_method(methods[i]);
                    }
                    
                    // Create get_group method
                    var group_methods = 'set set_once union unset remove delete'.split(' ');
                    target.get_group = function() {
                        function group_stub(method) {
                            group_obj[method] = function() {
                                var call2_args = arguments;
                                var call2 = [method].concat(Array.prototype.slice.call(call2_args, 0));
                                target.push([group_key, call2]);
                            };
                        }
                        var group_obj = {};
                        var group_key = ['get_group'].concat(Array.prototype.slice.call(arguments, 0));
                        for (var j = 0; j < group_methods.length; j++) {
                            group_stub(group_methods[j]);
                        }
                        return group_obj;
                    };
                    
                    window.mixpanel._i.push([token, config, name]);
                };
                
                // Version marker (crucial for avoiding version mismatch)
                window.mixpanel.__SV = 1.2;
                
                console.log('Official Mixpanel stub created with version 1.2');
            }
            
            // Load the real Mixpanel library
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
            
            script.onload = function() {
                console.log('Real Mixpanel library loaded from CDN');
                
                setTimeout(() => {
                    if (typeof window.mixpanel.init === 'function' && window.mixpanel.__SV) {
                        console.log('Mixpanel is ready with version:', window.mixpanel.__SV);
                        resolve();
                    } else {
                        reject(new Error('Mixpanel library loaded but not properly initialized'));
                    }
                }, 300);
            };
            
            script.onerror = function(error) {
                console.error('Failed to load Mixpanel library:', error);
                reject(error);
            };
            
            document.head.appendChild(script);
            console.log('Loading official Mixpanel library...');
            
        } catch (error) {
            console.error('Error setting up Mixpanel:', error);
            reject(error);
        }
    });
}

// Initialize Mixpanel
function initializeMixpanel() {
    try {
      if (typeof mixpanel !== 'undefined') {
        // Use a demo/test token - replace with your actual Mixpanel project token
        mixpanel.init('8f1255a44f049242c9e18330c539d156', {
          debug: true,
          track_pageview: false, // Disable automatic pageview tracking
          persistence: 'localStorage',
          // Disable geolocation to avoid data format issues
          ip: false,
          // Additional config for reliability
          ignore_dnt: false,
          // Remove property_blacklist as it can cause issues
          batch_requests: false, // Send requests one by one, not batched
          cross_subdomain_cookie: false
        });
        mixpanelInitialized = true;
        console.log('Mixpanel initialized successfully');
        
        // Track initial page load with comprehensive data - delay to ensure Mixpanel is fully ready
        setTimeout(() => {
          try {
            // Check if survey overlay exists to determine which page to track
            const surveyOverlay = document.getElementById('survey-overlay');
            if (surveyOverlay && surveyOverlay.style.display !== 'none') {
              surveyTracking.trackPageView('survey');
              console.log('Initial survey page view tracked');
            } else {
              // If no survey, assume we're on photo page
              surveyTracking.trackPageView('photo_gallery');
              console.log('Initial photo gallery page view tracked');
            }
          } catch (error) {
            console.error('Error tracking initial page view:', error);
          }
        }, 1000); // Increased delay to 1000ms
        
        // Add error callback for better debugging
        mixpanel.set_config({
          error: function(msg) {
            console.error('Mixpanel configuration error:', msg);
          }
        });
      }
    } catch (error) {
      console.error('Error initializing Mixpanel:', error);
      // Check if it's a network connectivity issue
      if (error && error.status === 0) {
        console.warn('Network error detected. This might be due to:');
        console.warn('1. Ad blocker blocking Mixpanel requests');
        console.warn('2. Network connectivity issues');
        console.warn('3. CORS or firewall blocking');
        console.warn('Consider setting up a proxy server as per Mixpanel docs');
      }
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
     * Sanitize property values for Mixpanel
     */
    sanitizeValue(value) {
        if (value === null || value === undefined) {
            return null;
        }
        
        // Convert to string and limit length
        const stringValue = String(value);
        if (stringValue.length > 255) {
            return stringValue.substring(0, 255);
        }
        
        // Remove any problematic characters
        return stringValue.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    },

    /**
     * Track survey submission - core event
     */
    trackSurveySubmission(selectedRating, email) {
        if (mixpanelInitialized && typeof mixpanel !== 'undefined') {
            try {
                // Validate input data
                if (!selectedRating || !email || !email.includes('@')) {
                    console.error('Invalid data for survey submission:', { selectedRating, email });
                    return;
                }
                
                // Track the survey submission event with cleaned data
                const eventProperties = {
                    answer: this.sanitizeValue(selectedRating),
                    answer_text: this.sanitizeValue(this.getAnswerText(selectedRating)),
                    email_domain: this.sanitizeValue(email),
                    question: 'Cadillac is a Brand for Me',
                    survey_type: 'cadillac_brand_perception',
                    scale_position: this.getScalePosition(selectedRating)
                };
                
                mixpanel.track('Survey Submitted', eventProperties);
                
                // Set user properties with minimal, safe data
                mixpanel.identify(email);
                mixpanel.people.set({
                    '$email': email,
                    'latest_survey_answer': this.sanitizeValue(selectedRating),
                    'latest_survey_answer_text': this.sanitizeValue(this.getAnswerText(selectedRating))
                });
                
                // Increment survey completion count
                mixpanel.people.increment('survey_completion_count', 1);
                
                console.log('Survey submission tracked in Mixpanel');
            } catch (error) {
                console.error('Error tracking survey submission:', error);
                if (error && error.status === 0) {
                    console.warn('Network error - check ad blockers, proxy setup, or connectivity');
                } else if (error && error.status === 1) {
                    console.warn('Data format error - check property names, values, and data types');
                    console.warn('Common causes: invalid dates, reserved property names, oversized data');
                }
            }
        }
    },

    /**
     * Track page view events
     */
    trackPageView(pageType, userEmail = null) {
        if (mixpanelInitialized && typeof mixpanel !== 'undefined') {
            try {
                const pageViewData = {
                    page: this.sanitizeValue(pageType),
                    survey_type: 'cadillac_brand_perception',
                    page_type: this.sanitizeValue(pageType),
                    user_agent: this.sanitizeValue(navigator.userAgent),
                    screen_width: window.screen.width,
                    screen_height: window.screen.height,
                    viewport_width: window.innerWidth,
                    viewport_height: window.innerHeight,
                    has_email: userEmail ? 'yes' : 'no'
                };

                // Add email if available
                if (userEmail && userEmail.includes('@')) {
                    pageViewData.email_domain = this.sanitizeValue(userEmail);
                }

                mixpanel.track('Page View', pageViewData);

                // Update user profile if email available
                if (userEmail && userEmail.includes('@')) {
                    mixpanel.identify(userEmail);
                    mixpanel.people.set({
                        '$email': userEmail
                    });
                    mixpanel.people.increment(`${pageType}_page_views`, 1);
                    mixpanel.people.increment('total_page_views', 1);
                }

                console.log(`${pageType} page view tracked in Mixpanel`);
            } catch (error) {
                console.error('Error tracking page view:', error);
                if (error && error.status === 0) {
                    console.warn('Network error - check ad blockers, proxy setup, or connectivity');
                } else if (error && error.status === 1) {
                    console.warn('Data format error in page view - check property names, values, and data types');
                }
            }
        }
    },

    /**
     * Track photo gallery page view 
     */
    trackPhotoPageView(userEmail) {
        this.trackPageView('photo_gallery', userEmail);
    },

    /**
     * Track survey page view
     */
    trackSurveyPageView() {
        this.trackPageView('survey');
    },

    /**
     * Track social media button clicks
     */
    trackSocialButtonClick(platform, userEmail = null, buttonId = null) {
        if (mixpanelInitialized && typeof mixpanel !== 'undefined') {
            try {
                const socialClickData = {
                    platform: this.sanitizeValue(platform),
                    button_id: this.sanitizeValue(buttonId),
                    page: 'photo_gallery',
                    survey_type: 'cadillac_brand_perception',
                    user_agent: this.sanitizeValue(navigator.userAgent),
                    screen_width: window.screen.width,
                    screen_height: window.screen.height,
                    viewport_width: window.innerWidth,
                    viewport_height: window.innerHeight,
                    has_email: userEmail ? 'yes' : 'no',
                    timestamp: new Date().toISOString()
                };

                // Add email if available
                if (userEmail && userEmail.includes('@')) {
                    socialClickData.email_domain = this.sanitizeValue(userEmail);
                }

                mixpanel.track('Share Completed', socialClickData);

                // Update user profile if email available
                if (userEmail && userEmail.includes('@')) {
                    mixpanel.identify(userEmail);
                    mixpanel.people.set({
                        '$email': userEmail,
                        '$last_seen': new Date()
                    });
                    mixpanel.people.increment(`${platform}_clicks`, 1);
                    mixpanel.people.increment('total_social_clicks', 1);
                }

                console.log(`${platform} button click tracked in Mixpanel`);
            } catch (error) {
                console.error('Error tracking social button click:', error);
                if (error && error.status === 0) {
                    console.warn('Network error - check ad blockers, proxy setup, or connectivity');
                } else if (error && error.status === 1) {
                    console.warn('Data format error in social tracking - check property names, values, and data types');
                }
            }
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

        /* modern browsers (iOS 15.4+, Chrome 108+, Firefox 109+) */
        #container{
            height: 100dvh;          /* dynamic viewport height – tracks bar show/hide */
            /* ↓ graceful fallback for anything that doesn’t understand dvh */
            height: 100vh;           
            overflow: hidden;        /* prevent the stray scroll */
        }

        /* if you use vh elsewhere, switch those too */
        #container{
            margin-top: 25vh !important;
        }
         
        /* Survey Overlay Styles */
        #survey-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000000;
            z-index: 100;
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
            margin-top: 0;
            max-height: 100vh;
            overflow: hidden;
            box-sizing: border-box;
        }
        
        /* Logo Div Styles */
        .cadillac-logo {
            width: 100%;
            text-align: center;
            margin-bottom: min(2vh, 20px);
            padding: min(3vh, 20px) 0;
        }
        
        .cadillac-logo img {
            object-fit: contain;
            display: block;
            margin: 0 auto;
        }
         
         #survey-overlay .survey-header {
             margin-bottom: min(5vh, 40px);
         }
         
         #survey-overlay .survey-logo {
             width: min(8vw, 60px);
             height: min(8vw, 60px);
             margin: 0 auto min(4vh, 30px);
             background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-family="serif" font-size="20" fill="white">CADILLAC</text></svg>') no-repeat center;
             background-size: contain;
             display: none;
         }
         
         #survey-overlay .survey-title {
             font-family: "CadillacGothicWide", "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: 14px !important;
             letter-spacing: 5px !important;
             font-weight: 100 !important;
             color: #cccccc !important;
             margin: 0 0 min(3vh, 20px) 0 !important;
             text-transform: uppercase !important;
             line-height: 1.2 !important;
         }
         
         #survey-overlay .survey-subtitle {
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: 12px !important;
             letter-spacing: 4px !important;
             color: #cccccc !important;
             margin: 0 0 min(2vh, 20px) 0 !important;
             text-transform: uppercase !important;
         }
         
         #survey-overlay .email-section {
             margin: 0 0 30px 0 !important;
         }
         
         #survey-overlay .email-section label {
             display: none !important;
         }
         
         #survey-overlay .email-section input[type="email"] {
             width: 100% !important;
             max-width: min(65vw, 350px) !important;
             font-size: 12px !important;
             padding: 6px !important;
             border: 2px solid white !important;
             border-radius: 0 !important;
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
        
        #survey-overlay .email-section input[type="email"].has-content {
            background: rgba(255, 255, 255, 0.2) !important;
        }
         
         #survey-overlay .survey-question {
             margin-bottom: min(2vh, 20px) !important;
         }
         
         #survey-overlay .survey-question h2 {
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: 12px !important;
             font-weight: normal !important;
             color: #cccccc !important;
             line-height: 1.4 !important;
             width: 30vw !important;
             text-align: center !important;
             margin: 0 auto 2vh auto !important;
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
             font-size: 12px !important;
             padding: 6px !important;
             background: transparent !important;
             border: 2px solid white !important;
             border-radius: 0 !important;
             cursor: pointer !important;
             transition: all 0.2s ease !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             color: white !important;
             letter-spacing: clamp(0.5px, 0.2vw, 1px) !important;
             text-align: center !important;
             width: 100% !important;
             max-width: min(65vw, 350px) !important;
             margin: 0 auto !important;
             margin-bottom: 15px !important;
             box-sizing: border-box !important;
         }
         
                 #survey-overlay .survey-option:hover label {
            background: rgba(255, 255, 255, 0.1) !important;
            opacity: 0.8 !important;
        }
        
        #survey-overlay .survey-option:active label {
            opacity: 0.8 !important;
        }
         
        #survey-overlay .survey-option input[type="radio"]:checked + label {
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
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
            width: 100% !important;
            max-width: min(85vw, 500px) !important;
            padding: min(2vh, 15px) min(4vw, 25px) !important;
            background: transparent !important;
            color: rgba(255, 255, 255, 0.5) !important;
            border: 2px solid rgba(255, 255, 255, 0.5) !important;
            border-radius: 0 !important;
            font-size: 11px !important;
            font-weight: normal !important;
            cursor: not-allowed !important;
            transition: all 0.2s ease !important;
            margin: min(2vh, 15px) auto 0 !important;
            font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            letter-spacing: 2px !important;
            text-transform: uppercase !important;
            display: block !important;
        }
        
        #survey-overlay .submit-button.enabled {
            background: transparent !important;
            color: white !important;
            border-color: white !important;
            cursor: pointer !important;
        }
        
        #survey-overlay .submit-button.enabled:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            transform: none !important;
        }
        
        #survey-overlay .submit-button.enabled:active {
            opacity: 0.8 !important;
        }
        
        /* Animation for submit button click */
        #survey-overlay .submit-button.submitting,
        #survey-overlay .submit-button.submitting:hover {
            background: white !important;
            opacity: 1 !important;
            color: black !important;
            border-color: white !important;
            transition: all 0.3s ease !important;
            cursor: wait !important;
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
            z-index: 101 !important;
            box-sizing: border-box !important;
            max-height: 15vh !important;
            overflow: hidden !important;
        }
        
        #survey-overlay .hidden {
            display: none !important;
        }
         
         /* Main Gallery Page Styles */
         html, body, body#i1xr {
             background: #000000 !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             margin: 0 !important;
             padding: 0 !important;
             height: 100vh !important;
             overflow: hidden !important;
         }
         
         body#i1xr {
            display: flex !important;
            flex-direction: column !important;
            height: 100dvh !important;
            overflow: hidden !important;
         }

         body#i1xr .event-banner {
             display: none !important;
         }
         
         /* Logo Div for Photo Page */
         body#i1xr .cadillac-logo {
             top: 0 !important;
             left: 0 !important;
             width: 100% !important;
             text-align: center !important;
             padding: min(10vh, 50px) 0 !important;
             z-index: 101 !important;
         }

         body#i1xr .cadillac-logo-survey {
             position: fixed !important;
             top: 0 !important;
             left: 0 !important;
             width: 100% !important;
             background-size: min(80vw, 200px) !important;
        }
         
         body#i1xr .cadillac-logo-survey img,
         body#i1xr .cadillac-logo img {
             width: 100px !important;
             object-fit: contain !important;
             display: block !important;
             margin: 2vh auto 0 auto !important;
         }
         
         body#i1xr .photo-page-title {
             text-align: center !important;
             width: 100% !important;
             color: white !important;
         }
         
         body#i1xr .photo-page-title h1 {
             color: #eeeeee !important;
             font-family: "CadillacGothicWide", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: 14px !important;
             font-weight: normal !important;
             letter-spacing: 3px !important;
             text-transform: uppercase !important;
             margin: 0 0 min(1vh, 10px) 0 !important;
             line-height: 1.2 !important;
             text-align: center !important;
         }
         
         body#i1xr .photo-page-title h2 {
             color: #eeeeee !important;
             font-family: "CadillacGothicWide", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: 14px !important;
             font-weight: normal !important;
             letter-spacing: 3px !important;
             text-transform: uppercase !important;
             margin: 0 0 min(3vh, 20px) 0 !important;
             line-height: 1.2 !important;
             text-align: center !important;
         }

         body#i1xr #container {
             background: #000000 !important;
             text-align: center !important;
             width: 100% !important;
             margin: 0 auto !important;
             display: flex !important;
             flex-direction: column !important;
             align-items: center !important;
             justify-content: flex-start !important;
             overflow-y: hidden !important;
             box-sizing: content-box !important;
         }
         
         body#i1xr #photo-container {
             background: #000000 !important;
             max-width: min(90vw, 600px) !important;
             margin: 0 auto !important;
             padding: 0 min(3vw, 20px) !important;
             text-align: center !important;
             width: 100% !important;
             box-sizing: border-box !important;
             flex-shrink: 0 !important;
         }
         
         body#i1xr #header-container {
             background: #000000 !important;
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
             letter-spacing: 0 !important;
             text-transform: uppercase !important;
             margin: 0 auto min(2vh, 10px) auto !important;
             line-height: 1.2 !important;
             text-align: center !important;
             width: 100% !important;
             display: block !important;
         }
         
         body#i1xr #time {
             color: transparent !important; /* Hide original content */
             font-size: 0 !important; /* Hide original content */
             overflow: hidden !important; /* Hide original content */
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             margin: min(3vh, 20px) auto !important;
             text-align: center !important;
             width: 100% !important;
             display: block !important;
         }
         
         body#i1xr #time::before {
             content: "Click below" !important;
             color: white !important;
             font-size: 12px !important;
             font-weight: bold !important;
             text-align: center !important;
             display: inline !important;
         }
         
         body#i1xr #time::after {
             content: " to download and share your Theme Art." !important;
             color: white !important;
             font-size: 12px !important;
             font-weight: normal !important;
             text-align: center !important;
             display: inline !important;
         }
         
         body#i1xr .clv-photo {
             width: 100% !important;
             height: auto !important;
             max-width: 70vw !important;
                max-height: 50vh !important;
             margin: min(4vh, 30px) auto !important;
             display: block !important;
             border-radius: clamp(4px, 1vw, 8px) !important;
 
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
             background-color: black !important;
             background: black !important;
             border: none !important;
             width: min(12vw, 70px) !important;
             height: min(12vw, 70px) !important;
             min-width: 50px !important;
             min-height: 50px !important;
             border-radius: 50% !important;
             align-items: center !important;
             justify-content: center !important;
             transition: all 0.2s ease !important;
 
             position: relative !important;
             text-decoration: none !important;
         }
         
         body#i1xr .clv-button.circle:hover,
         body#i1xr a.clv-button.circle:hover {
             background-color: rgba(0, 0, 0, 0.8) !important;
             background: rgba(0, 0, 0, 0.8) !important;
             transform: scale(1.1) !important;
 
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
             fill: white !important;
             color: white !important;
             display: block !important;
             margin: 0 auto !important;
             background: transparent !important;
         }
         
                 body#i1xr .clv-button.circle svg path,
        body#i1xr a.clv-button.circle svg path,
        body#i1xr .clv-button.circle div svg path,
        body#i1xr a.clv-button.circle div svg path {
            fill: white !important;
            color: white !important;
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
        
        @media (max-width: 450px) {
            body#i1xr .cadillac-logo {
                padding: 0 !important;
            }

            body#i1xr .cadillac-logo-survey img,
            body#i1xr .cadillac-logo img {
                padding: 0 !important;
                margin: 7vh auto 0 auto !important;
            }
            
            #survey-overlay {
                background-size: min(95vw, 250px);
                padding: 1vh 1vw;
            }
            
            body#i1xr {
                background-size: min(80vw, 200px) !important;
            }
            
            
            body#i1xr #header-container {
                background: #000000 !important;
                padding: 0 !important;
                text-align: center !important;
                width: 100% !important;
                display: block !important;
            }
            body#i1xr #header-container.clv-row {
               min-height: 40px !important;
            }

            body#i1xr #photo-container {
                padding: 0 min(2vw, 15px) !important;
            }
            
            body#i1xr #survey-overlay .survey-header {
                margin-bottom: min(3vh, 40px) !important;
            }
            
            body#i1xr #title {
                font-size: 14px !important;
                letter-spacing: clamp(0.5px, 0.1vw, 1px) !important;
            }

            body#i1xr .photo-page-title {
                margin-top: 9vh !important;
            }
            
            body#i1xr #time {
                font-size:12px !important;
                margin: min(1.5vh, 12px) auto !important;
            }
            
            body#i1xr .clv-photo {
                max-width: 85vw !important;
                max-height: 45Svh !important;
                margin: 0 !important;
            }
            
            body#i1xr #social-container {
                gap: 0 !important;
                padding: 0 !important;
                margin-top: 2vh !important;
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
                width: min(10vw, 30px) !important;
                height: min(10vw, 30px) !important;
                min-width: 15px !important;
                min-height: 15px !important;
            }
            
            body#i1xr #iqeeok {
                font-size: clamp(10px, 3vw, 14px) !important;
                padding: min(2vh, 15px) !important;
            }
            
            #survey-container {
                padding-top: 30px !important;
                max-height: 85vh;
            }
            
            #survey-overlay .survey-title {
                font-size: 14px !important;
                letter-spacing: 5px !important;
                font-weight: 100 !important;
                color: #eeeeee !important;
                line-height: 1.5em !important;
            }
            
            #survey-overlay .survey-subtitle {
                font-size: 12px !important;
                letter-spacing: 4px !important;
                color: #eeeeee !important;
            }
            
            #survey-overlay .survey-question h2 {
                font-size: 12px !important;
                width: 60vw !important;
                text-align: center !important;
                margin: 0 auto 2vh auto !important;
            }
            
            #survey-overlay .survey-options {
                gap: min(0.8vh, 6px) !important;
                max-width: min(70vw, 300px) !important;
            }
            
            #survey-overlay .survey-option label {
                font-size: 12px !important;
                padding: 5px !important;
                max-width: min(70vw, 280px) !important;
                margin-bottom: 10px !important;
            }
            
            #survey-overlay .email-section input[type="email"] {
                font-size: 12px !important;
                padding: 5px !important;
                max-width: min(70vw, 300px) !important;
                border: 2px solid #ffffff !important;
            }
            
            #survey-overlay .submit-button {
                font-size: 12px !important;
                padding: min(1.5vh, 15px) min(3vw, 20px) !important;
                letter-spacing: 3px !important;
                max-width: min(80vw, 400px) !important;
                margin-top: 4vh !important;
                border: 2px solid rgba(255, 255, 255, 0.5) !important;
            }
            
            #survey-overlay .survey-disclaimer {
                font-size: clamp(6px, 2.5vw, 8px) !important;
                padding: min(1vh, 10px) min(1.5vw, 12px) !important;
                max-height: 10vh !important;
                line-height: 1.2 !important;
            }
        }

        @media (max-aspect-ratio: 9/16) {
            body#i1xr .cadillac-logo-survey img,
            body#i1xr .cadillac-logo img {
                margin: 7vh auto 0 auto !important;
            }
        }

        @media (max-width: 400px) and (max-aspect-ratio: 3/4) {
            body#i1xr .cadillac-logo-survey img,
            body#i1xr .cadillac-logo img {
                margin: 3vh auto 0 auto !important;
            }
        }
        
        
        /* Force Hide Title Element */
        #title,
        .event-name,
        div#title.event-name {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            left: -9999px !important;
            z-index: -1 !important;
        }
        
        /* Force Web-Share Button to Display */
        [clv-click-id="web-share"],
        .social-share {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            background: rgba(255, 255, 255, 0.1) !important;
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 50% !important;
            width: 60px !important;
            height: 60px !important;
            position: relative !important;
            align-items: center !important;
            justify-content: center !important;
        }
        
        [clv-click-id="web-share"]:hover,
        .social-share:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
            transform: scale(1.1) !important;
            transition: all 0.3s ease !important;
        }
        
        [clv-click-id="web-share"] svg,
        .social-share svg {
            width: 30px !important;
            height: 30px !important;
        }
        
        /* Force Download Button to Display */
        #ip0zp,
        .social-download {
            display: flex !important;
            visibility: visible !important;
        }
        
        #ip0zp:hover,
        .social-download:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
            transform: scale(1.1) !important;
            transition: all 0.3s ease !important;
        }
        
        #ip0zp svg,
        .social-download svg {
            fill: white !important;
            width: 30px !important;
            height: 30px !important;
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

// Function to add logo to photo page
function addLogoToPhotoPage() {
    // Check if logo already exists
    if (document.querySelector('.cadillac-logo')) {
        return;
    }
    
    // Create logo and title container
    const logoDiv = document.createElement('div');
    logoDiv.className = 'cadillac-logo';
    logoDiv.innerHTML = `
        <img src="https://cdn.jsdelivr.net/gh/zqyoiv/728-cadi-curator@main/asset/Cadillac-Logo_white_small.png" alt="Cadillac Logo">
        <div class="photo-page-title">
            <h1>THANKS FOR JOINING</h1>
            <h2>CADILLAC AT THE US OPEN</h2>
        </div>
    `;
    
    // Insert at the beginning of body
    document.body.insertBefore(logoDiv, document.body.firstChild);
    
    console.log('Logo and title added to photo page');
}

// Function to clear time div content and let CSS handle the text
function clearTimeContent() {
    const timeElement = document.getElementById('time');
    if (timeElement) {
        // Clear all text content from the time div
        timeElement.innerHTML = '';
        timeElement.textContent = '';
        console.log('Time div content cleared - CSS ::before and ::after will handle text');
    }
}

// Function to set up initial video state (paused at frame 1)
function setupInitialVideoState() {
    const video = document.querySelector('video.clv-photo');
    if (video) {
        // Override autoplay and loop attributes
        video.autoplay = false;
        video.loop = false;
        video.removeAttribute('autoplay');
        video.removeAttribute('loop');
        
        // Pause the video and set to first frame
        video.pause();
        video.currentTime = 0;
        
        console.log('Video set to initial state: paused at frame 1, no autoplay, no loop');
    } else {
        console.log('Video element with class clv-photo not found for initial setup');
    }
}

// Function to control video playback (called when submit button is clicked)
function setupVideoControls() {
    const video = document.querySelector('video.clv-photo');
    if (video) {
        // Remove loop attribute and set controls
        video.loop = false;
        video.removeAttribute('loop');
        
        // Add event listener for when video ends
        video.addEventListener('ended', function() {
            video.pause();
            console.log('Video ended and paused');
            video.currentTime = video.duration;   // keep last frame (iOS quirk-safe)
            video.removeAttribute('controls');  // hide native UI
        });
        
        // Restart the video
        video.currentTime = 0;
        video.play().catch(error => {
            console.log('Video play failed:', error);
        });
        
        console.log('Video controls setup: no loop, will pause when ended, restarted playback');
    } else {
        console.log('Video element with class clv-photo not found');
    }
}

// Function to add viewport meta tag
function addViewportMetaTag() {
    // Check if viewport meta tag already exists
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (existingViewport) {
        // Update existing meta tag
        existingViewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        console.log('Updated existing viewport meta tag');
    } else {
        // Create new viewport meta tag
        const metaTag = document.createElement('meta');
        metaTag.name = 'viewport';
        metaTag.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
        
        // Insert into document head
        document.head.appendChild(metaTag);
        console.log('Added new viewport meta tag');
    }
}

// Survey functionality
function initializeSurvey() {
     // Create survey overlay
     const surveyOverlay = document.createElement('div');
     surveyOverlay.id = 'survey-overlay';
     
         surveyOverlay.innerHTML = `
        <div class="cadillac-logo-survey">
            <img src="https://cdn.jsdelivr.net/gh/zqyoiv/728-cadi-curator@main/asset/Cadillac-Logo_white_small.png" alt="Cadillac Logo">
        </div>
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
                 <h2>Please rate the extent to which you agree with the following: <br><b>'Cadillac is a brand for me'</b></h2>
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
                 Your email will not be shared with third parties or used for marketing or promotional purposes. Your US Open theme artwork will not be used for marketing or promotional purposes, and will be available until September 14, 2025.
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
         });
     });

                 emailInput.addEventListener('input', function() {
       // Toggle background based on whether there's content
       if (emailInput.value.trim() !== '') {
           emailInput.classList.add('has-content');
       } else {
           emailInput.classList.remove('has-content');
       }
       checkFormComplete();
   });

    emailInput.addEventListener('blur', function() {
        checkFormComplete();
    });

    // Add click event listener to trigger handleFileDownload callback
    emailInput.addEventListener('click', async function() {
        try {
            console.log('Email input clicked - calling Curator handleFileDownload()');
            // Call the existing Curator handleFileDownload function
            if (typeof handleFileDownload === 'function' && typeof photo !== 'undefined' && photo.download) {
                await handleFileDownload(photo.download, {
                    onProgress: ({ chunkLength, receivedLength, contentLength }) => {
                        console.log(`Download progress: ${receivedLength}/${contentLength} bytes (${Math.round(receivedLength/contentLength*100)}%)`);
                    }
                });
                console.log('File download completed');
            } else {
                console.warn('handleFileDownload function or photo.download not available');
            }
            
        } catch (error) {
            console.error('Error in email input click handler:', error);
        }
    });

         // Handle survey submission
    submitButton.addEventListener('click', function() {
        if (submitButton.classList.contains('enabled')) {
            // Get selected values
            const selectedRating = Array.from(radioButtons).find(radio => radio.checked)?.value;
            const email = emailInput.value.trim();

            // Track only the completed survey submission to mixpanel
            surveyTracking.trackSurveySubmission(selectedRating, email);

            console.log('Survey submitted:', { rating: selectedRating, email: email });

            // Add submitting animation class
            submitButton.classList.add('submitting');
            
            // Wait 2 seconds for animation, then proceed with redirect
            setTimeout(() => {
                // Hide survey overlay with fade effect
                surveyOverlay.style.transition = 'opacity 0.3s ease';
                surveyOverlay.style.opacity = '0';

                setTimeout(() => {
                    surveyOverlay.remove();
                    // Add logo to photo page after survey is removed
                    addLogoToPhotoPage();
                    // Clear time div content so CSS can handle the text
                    clearTimeContent();
                    // Setup video controls (restart, no loop, pause when ended)
                    setupVideoControls();
                    // Track photo page view
                    surveyTracking.trackPhotoPageView(email);
                    // Setup social media button tracking
                    setupSocialMediaTracking(email);
                }, 300);
            }, 1000); // 1 second delay for animation
        }
    });

         // Initial check
    checkFormComplete();
}

// Startup code - inject Mixpanel script and initialize everything
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Add viewport meta tag first
        addViewportMetaTag();
        injectSurveyStyles();
        
        // Set up initial video state (paused at frame 1)
        setTimeout(setupInitialVideoState, 100);
        
        injectMixpanelScript().then(() => {
            initializeMixpanel();
            initializeSurvey();
        }).catch(error => {
            console.error('Failed to inject Mixpanel script:', error);
            // Still initialize survey even if Mixpanel fails
            initializeSurvey();
        });

        // Replace social media icons with black background, white fill versions
        replaceSocialIcons();
        
        // Clear time div content after a delay to ensure DOM is ready
        setTimeout(clearTimeContent, 500);
        
        // Setup social media tracking with delay for direct photo page loads
        setTimeout(() => {
            const surveyOverlay = document.getElementById('survey-overlay');
            if (!surveyOverlay || surveyOverlay.style.display === 'none') {
                // If we're on photo page directly, setup social tracking
                setupSocialMediaTracking();
            }
        }, 2000);
    });
} else {
    // DOM is already loaded
    // Add viewport meta tag first
    addViewportMetaTag();
    injectSurveyStyles();
    
    // Set up initial video state (paused at frame 1)
    setTimeout(setupInitialVideoState, 100);
    
    injectMixpanelScript().then(() => {
        initializeMixpanel();
        initializeSurvey();
    }).catch(error => {
        console.error('Failed to inject Mixpanel script:', error);
        // Still initialize survey even if Mixpanel fails
        initializeSurvey();
    });

    // Replace social media icons with black background, white fill versions
    replaceSocialIcons();
    
    // Clear time div content after a delay to ensure DOM is ready
    setTimeout(clearTimeContent, 500);
    
    // Setup social media tracking with delay for direct photo page loads
    setTimeout(() => {
        const surveyOverlay = document.getElementById('survey-overlay');
        if (!surveyOverlay || surveyOverlay.style.display === 'none') {
            // If we're on photo page directly, setup social tracking
            setupSocialMediaTracking();
        }
    }, 2000);
}

// Function to set up social media button tracking
function setupSocialMediaTracking(userEmailFromSurvey = null) {
    // Store user email from survey for tracking purposes
    let userEmail = userEmailFromSurvey;
    
    // If no email provided, try to get from survey input
    if (!userEmail) {
        try {
            const emailInput = document.querySelector('#email-input');
            if (emailInput && emailInput.value) {
                userEmail = emailInput.value.trim();
            }
        } catch (error) {
            console.log('Could not retrieve user email for social tracking');
        }
    }
    
    // Add click event listeners for social media buttons
    setTimeout(() => {
        // TikTok button (i2cwn)
        const tiktokButton = document.getElementById('i2cwn');
        if (tiktokButton && !tiktokButton.dataset.trackingAdded) {
            tiktokButton.addEventListener('click', function() {
                surveyTracking.trackSocialButtonClick('tiktok', userEmail, 'i2cwn');
            });
            tiktokButton.dataset.trackingAdded = 'true';
            console.log('TikTok button tracking added');
        }
        
        // Instagram button (iok7r)
        const instagramButton = document.getElementById('iok7r');
        if (instagramButton && !instagramButton.dataset.trackingAdded) {
            instagramButton.addEventListener('click', function() {
                surveyTracking.trackSocialButtonClick('instagram', userEmail, 'iok7r');
            });
            instagramButton.dataset.trackingAdded = 'true';
            console.log('Instagram button tracking added');
        }
        
        // X (Twitter) button (i5jm2)
        const xButton = document.getElementById('i5jm2');
        if (xButton && !xButton.dataset.trackingAdded) {
            xButton.addEventListener('click', function() {
                surveyTracking.trackSocialButtonClick('x_twitter', userEmail, 'i5jm2');
            });
            xButton.dataset.trackingAdded = 'true';
            console.log('X/Twitter button tracking added');
        }
        
        // Download button (ip0zp)
        const downloadButton = document.getElementById('ip0zp');
        if (downloadButton && !downloadButton.dataset.trackingAdded) {
            downloadButton.addEventListener('click', function() {
                surveyTracking.trackSocialButtonClick('download', userEmail, 'ip0zp');
            });
            downloadButton.dataset.trackingAdded = 'true';
            console.log('Download button tracking added');
        }
        
        // Web Share button (clv-click-id="web-share")
        const webShareButton = document.querySelector('[clv-click-id="web-share"]');
        if (webShareButton && !webShareButton.dataset.trackingAdded) {
            webShareButton.addEventListener('click', function() {
                surveyTracking.trackSocialButtonClick('web_share', userEmail, 'web-share');
            });
            webShareButton.dataset.trackingAdded = 'true';
            console.log('Web Share button tracking added');
        }
    }, 1000); // Delay to ensure buttons are rendered
}

// Function to replace Instagram, X, and Facebook icons with black background, white fill versions
function replaceSocialIcons() {
    // Check for web-share button and add if missing
    let webShareButton = document.querySelector('[clv-click-id="web-share"]');
    
    if (!webShareButton) {
        // Add web-share button at the top of social container
        const socialContainer = document.getElementById('social-container');
        if (socialContainer) {
            const webShareElement = document.createElement('a');
            webShareElement.setAttribute('clv-click-id', 'web-share');
            webShareElement.setAttribute('title', 'Web Share');
            webShareElement.setAttribute('share-title', '📷');
            webShareElement.setAttribute('share-message', 'Take a look at my photo!');
            webShareElement.setAttribute('onclick', 'share(this)');
            webShareElement.className = 'clv-button circle social social-share';
            webShareElement.innerHTML = '<div src="https://cdn.curatorlive.com/svgs/g2/icons8-share-50-2.svg"></div>';
            
            // Insert at the beginning of social container
            socialContainer.insertBefore(webShareElement, socialContainer.firstChild);
            webShareButton = webShareElement;
        }
    }
    
    // Update web-share button SVG (whether it was just created or already existed)
    if (webShareButton) {
        const webShareDiv = webShareButton.querySelector('div');
        if (webShareDiv) {
            webShareDiv.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 96 96" fill="none">
                    <rect width="96" height="96" rx="21" fill="black"></rect>
                    <path d="M73.31 25.7456C72.785 25.4743 72.274 25.1769 71.7788 24.8545C70.3389 23.9025 69.0186 22.7808 67.8465 21.5135C64.9139 18.158 63.8186 14.7538 63.4151 12.3705H63.4313C63.0943 10.3921 63.2337 9.11214 63.2547 9.11214H49.8974V60.7624C49.8974 61.4558 49.8974 62.1412 49.8682 62.8185C49.8682 62.9027 49.8601 62.9805 49.8553 63.0712C49.8553 63.1085 49.8553 63.1474 49.8472 63.1863C49.8472 63.196 49.8472 63.2057 49.8472 63.2154C49.7064 65.0686 49.1123 66.8588 48.1173 68.4286C47.1222 69.9983 45.7566 71.2994 44.1407 72.2175C42.4565 73.1757 40.5517 73.6782 38.614 73.6757C32.3906 73.6757 27.3468 68.6011 27.3468 62.334C27.3468 56.0669 32.3906 50.9923 38.614 50.9923C39.7921 50.9912 40.9629 51.1766 42.083 51.5415L42.0992 37.9412C38.6989 37.502 35.2444 37.7722 31.9538 38.7348C28.6631 39.6975 25.6077 41.3317 22.9802 43.5343C20.678 45.5346 18.7425 47.9214 17.2608 50.5872C16.6969 51.5594 14.5695 55.4658 14.3119 61.8058C14.1499 65.4044 15.2306 69.1326 15.7458 70.6734V70.7058C16.0699 71.6132 17.3256 74.7094 19.372 77.3197C21.0221 79.4135 22.9716 81.2527 25.1579 82.7783V82.7459L25.1903 82.7783C31.6567 87.1724 38.8263 86.884 38.8263 86.884C40.0674 86.8338 44.2249 86.884 48.9463 84.6464C54.183 82.1658 57.1642 78.47 57.1642 78.47C59.0688 76.2618 60.5832 73.7452 61.6426 71.0282C62.8513 67.8509 63.2547 64.0401 63.2547 62.5171V35.1155C63.4168 35.2127 65.5749 36.6401 65.5749 36.6401C65.5749 36.6401 68.6842 38.633 73.5352 39.9309C77.0155 40.8544 81.7045 41.0488 81.7045 41.0488V27.7887C80.0615 27.9669 76.7255 27.4485 73.31 25.7456Z" fill="white"></path>
                </svg>
            `;
        }
    }

    // Replace Instagram icon
    const instagramButton = document.getElementById('iok7r');
    if (instagramButton) {
        const instagramDiv = instagramButton.querySelector('div');
        if (instagramDiv) {
            instagramDiv.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" version="1.1" viewBox="0 0 72 72" width="50px" height="50px">
                    <defs>
                        <style>
                            .st0 {
                                fill: #fff;
                            }
                        </style>
                    </defs>
                    <path class="st0" d="M36,1.83c-9.29,0-10.45.04-14.1.21-3.64.17-6.13.74-8.3,1.59-2.25.87-4.16,2.04-6.06,3.94-1.9,1.9-3.07,3.81-3.95,6.05-.85,2.17-1.43,4.66-1.59,8.29-.16,3.65-.21,4.81-.21,14.09s.04,10.44.21,14.09c.17,3.64.74,6.12,1.59,8.29.87,2.25,2.04,4.15,3.94,6.05,1.9,1.9,3.81,3.07,6.06,3.94,2.18.85,4.66,1.42,8.3,1.59,3.65.17,4.81.21,14.1.21s10.45-.04,14.1-.21c3.64-.17,6.13-.74,8.3-1.59,2.25-.87,4.15-2.04,6.05-3.94,1.9-1.9,3.07-3.81,3.95-6.05.84-2.17,1.42-4.66,1.59-8.29.16-3.65.21-4.81.21-14.09s-.04-10.45-.21-14.09c-.17-3.64-.75-6.12-1.59-8.29-.88-2.25-2.04-4.15-3.95-6.05-1.9-1.9-3.8-3.07-6.06-3.94-2.18-.85-4.67-1.42-8.31-1.59-3.65-.17-4.81-.21-14.1-.21h.01ZM32.94,7.98c.91,0,1.93,0,3.07,0,9.13,0,10.21.03,13.82.2,3.33.15,5.14.71,6.35,1.18,1.6.62,2.73,1.36,3.93,2.56,1.2,1.2,1.94,2.34,2.56,3.93.47,1.2,1.03,3.01,1.18,6.34.16,3.6.2,4.68.2,13.81s-.04,10.2-.2,13.81c-.15,3.33-.71,5.14-1.18,6.34-.62,1.59-1.36,2.73-2.56,3.93-1.2,1.2-2.33,1.94-3.93,2.56-1.2.47-3.02,1.03-6.35,1.18-3.61.16-4.69.2-13.82.2s-10.21-.04-13.82-.2c-3.33-.15-5.14-.71-6.35-1.18-1.6-.62-2.74-1.36-3.93-2.56-1.2-1.2-1.94-2.33-2.56-3.93-.47-1.2-1.03-3.01-1.18-6.34-.16-3.6-.2-4.68-.2-13.81s.03-10.2.2-13.81c.15-3.33.71-5.14,1.18-6.35.62-1.59,1.36-2.73,2.56-3.93,1.2-1.2,2.34-1.94,3.93-2.56,1.21-.47,3.02-1.03,6.35-1.18,3.15-.14,4.38-.19,10.75-.19h0ZM54.26,13.66c-2.27,0-4.1,1.83-4.1,4.1s1.84,4.1,4.1,4.1,4.1-1.84,4.1-4.1-1.84-4.1-4.1-4.1h0ZM36,18.45c-9.7,0-17.56,7.86-17.56,17.55s7.86,17.55,17.56,17.55,17.56-7.85,17.56-17.55-7.86-17.55-17.56-17.55h0ZM36,24.61c6.3,0,11.4,5.1,11.4,11.39s-5.1,11.39-11.4,11.39-11.4-5.1-11.4-11.39,5.1-11.39,11.4-11.39h0Z"/>
                </svg>
            `;
        }
    }

    // Replace X icon
    const xButton = document.getElementById('i5jm2');
    if (xButton) {
        const xDiv = xButton.querySelector('div');
        if (xDiv) {
            xDiv.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" version="1.1" viewBox="0 0 72 72" width="50px" height="50px">
                    <defs>
                        <style>
                            .st0 {
                                fill: #fff;
                            }
                        </style>
                    </defs>
                    <path class="st0" d="M55.84,5.12h10.48l-23.02,26.21,26.9,35.56h-21.11l-16.52-21.61-18.92,21.61H3.17l24.39-28.03L1.8,5.12h21.63l14.93,19.74L55.84,5.12ZM52.17,60.73h5.81L20.38,11.04h-6.25l38.04,49.69Z"/>
                </svg>
            `;
        }
    }



    // Replace Download icon
    const downloadButton = document.getElementById('ip0zp');
    if (downloadButton) {
        const downloadDiv = downloadButton.querySelector('div');
        if (downloadDiv) {
            downloadDiv.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" version="1.1" viewBox="0 0 72 72" width="50px" height="50px">
                    <defs>
                        <style>
                            .st0 {
                                fill: #fff;
                            }
                        </style>
                    </defs>
                    <path class="st0" d="M39.39,1.8c.56.18,1.6,1.06,1.6,1.67v28.25h9.02s.77.38.88.46c.85.66,1.05,2.06.37,2.92l-14.74,16.92c-1.13,1.42-2.75,1.42-3.88,0l-14.74-16.92c-.65-.84-.51-2.18.31-2.85.1-.08.88-.53.94-.53h9.02V3.47c0-.61,1.04-1.49,1.6-1.67h9.62Z"/>
                    <path class="st0" d="M11.07,48.82v12.82h47.02v-12.82h8.55v17.7c0,1.73-2.44,3.81-4.2,3.68H6.47c-1.66,0-3.94-2.03-3.94-3.68v-17.7h8.55Z"/>
                </svg>
            `;
        }
    }

    // Replace Email icon with TikTok icon
    const emailButton = document.getElementById('i2cwn');
    if (emailButton) {
        const emailDiv = emailButton.querySelector('div');
        if (emailDiv) {
            emailDiv.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" version="1.1" viewBox="0 0 72 72" width="50px" height="50px">
                    <defs>
                        <style>
                            .st0 {
                                fill: #fff;
                                fill-rule: evenodd;
                            }
                        </style>
                    </defs>
                    <path class="st0" d="M49.65,20.13v1.89h0v25.41c0,6.06-2.39,11.82-6.67,16.1-4.28,4.28-10.04,6.67-16.1,6.67s-11.82-2.38-16.1-6.67c-4.28-4.28-6.67-10.04-6.67-16.1s2.39-11.82,6.67-16.1c4.28-4.28,10.04-6.67,16.1-6.67h4.23v11.97h-4.23c-2.88,0-5.6,1.13-7.64,3.16-2.03,2.03-3.16,4.76-3.16,7.64s1.13,5.6,3.16,7.64c2.03,2.03,4.76,3.16,7.64,3.16s5.6-1.13,7.64-3.16c2.03-2.03,3.16-4.76,3.16-7.61V1.8h11.92l.6,1.11c1.86,3.44,4.36,6.7,7.46,9.11,2.4,1.86,5.12,3.17,8.12,3.7l2.12.37-2.28,11.54-2.04-.36c-2.43-.43-4.81-1.17-7.05-2.22-2.56-1.21-4.94-2.84-6.89-4.9h0Z"/>
                </svg>
            `;
        }
    }

    console.log('Social media icons replaced with black background, white fill versions');
}