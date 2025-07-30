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
            surveyTracking.trackPageView('survey');
            console.log('Initial survey page view tracked');
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
            margin-top: min(5vh, 40px);
            max-height: 85vh;
            overflow-y: auto;
            box-sizing: border-box;
        }
        
        /* Logo Div Styles */
        .cadillac-logo {
            width: 100%;
            text-align: center;
            margin-bottom: min(5vh, 40px);
            padding: min(10vh, 30px) 0;
        }
        
        .cadillac-logo img {
            max-width: min(20vw, 400px);
            max-height: min(20vh, 150px);
            width: auto;
            height: auto;
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
         html, body, body#i1xr {
             background-color: #000000 !important;
             background: #000000 !important;
             font-family: "CadillacGothic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             margin: 0 !important;
             padding: 0 !important;
             height: 100vh !important;
             overflow: hidden !important;
         }
         
         body#i1xr .event-banner {
             display: none !important;
         }
         
         /* Logo Div for Photo Page */
         body#i1xr .cadillac-logo {
             position: fixed !important;
             top: 0 !important;
             left: 0 !important;
             width: 100% !important;
             text-align: center !important;
             padding: min(10vh, 50px) 0 !important;
             z-index: 999 !important;
             background: #000000 !important;
         }
         
         body#i1xr .cadillac-logo img {
             max-width: min(20vw, 300px) !important;
             max-height: min(15vh, 120px) !important;
             width: auto !important;
             height: auto !important;
             object-fit: contain !important;
             display: block !important;
             margin: 0 auto min(5vh, 40px) auto !important;
         }
         
         body#i1xr .photo-page-title {
             text-align: center !important;
             width: 100% !important;
             color: white !important;
         }
         
         body#i1xr .photo-page-title h1 {
             color: white !important;
             font-family: "CadillacGothicWide", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: clamp(20px, 4vw, 28px) !important;
             font-weight: normal !important;
             letter-spacing: clamp(1px, 0.3vw, 3px) !important;
             text-transform: uppercase !important;
             margin: 0 0 min(1.5vh, 10px) 0 !important;
             line-height: 1.2 !important;
             text-align: center !important;
         }
         
         body#i1xr .photo-page-title h2 {
             color: white !important;
             font-family: "CadillacGothicWide", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
             font-size: clamp(20px, 4vw, 28px) !important;
             font-weight: normal !important;
             letter-spacing: clamp(1px, 0.3vw, 3px) !important;
             text-transform: uppercase !important;
             margin: 0 0 min(3vh, 20px) 0 !important;
             line-height: 1.2 !important;
             text-align: center !important;
         }

         body#i1xr #container {
             background-color: #000000 !important;
             background: #000000 !important;
             padding-top: min(35vh, 250px) !important;
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
             background-color: #000000 !important;
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
             background-color: #000000 !important;
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
             letter-spacing: clamp(1px, 0.3vw, 3px) !important;
             text-transform: uppercase !important;
             margin: 0 auto min(2vh, 10px) auto !important;
             line-height: 1.2 !important;
             text-align: center !important;
             width: 100% !important;
             display: block !important;
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
             max-width: 70vw !important;
                max-height: 50vh !important;
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
                max-width: 85vw !important;
                max-height: 50vh !important;
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
                max-width: 85vw !important;
                max-height: 50vh !important;
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
                max-height: 80vh;
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
                max-width: 85vw !important;
                max-height: 50vh !important;
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
                max-width: 85vw !important;
                max-height: 50vh !important;
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
            <h1>THANKS FOR JOINING CADILLAC TEST</h1>
            <h2>AT THE US OPEN</h2>
        </div>
    `;
    
    // Insert at the beginning of body
    document.body.insertBefore(logoDiv, document.body.firstChild);
    
    console.log('Logo and title added to photo page');
}

// Survey functionality
function initializeSurvey() {
     // Create survey overlay
     const surveyOverlay = document.createElement('div');
     surveyOverlay.id = 'survey-overlay';
     
         surveyOverlay.innerHTML = `
        <div class="cadillac-logo">
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
         });
     });

     emailInput.addEventListener('input', function() {
         checkFormComplete();
     });

     emailInput.addEventListener('blur', function() {
         checkFormComplete();
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

             // Hide survey overlay with fade effect
             surveyOverlay.style.transition = 'opacity 0.3s ease';
             surveyOverlay.style.opacity = '0';

                         setTimeout(() => {
                surveyOverlay.remove();
                // Add logo to photo page after survey is removed
                addLogoToPhotoPage();
                // Track photo page view
                surveyTracking.trackPhotoPageView(email);
            }, 300);
         }
     });

         // Initial check
    checkFormComplete();
}

// Startup code - inject Mixpanel script and initialize everything
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        injectSurveyStyles();
        injectMixpanelScript().then(() => {
            initializeMixpanel();
            initializeSurvey();
        }).catch(error => {
            console.error('Failed to inject Mixpanel script:', error);
            // Still initialize survey even if Mixpanel fails
            initializeSurvey();
        });
    });
} else {
    // DOM is already loaded
    injectSurveyStyles();
    injectMixpanelScript().then(() => {
        initializeMixpanel();
        initializeSurvey();
    }).catch(error => {
        console.error('Failed to inject Mixpanel script:', error);
        // Still initialize survey even if Mixpanel fails
        initializeSurvey();
    });
}