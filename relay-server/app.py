from flask import Flask, request, jsonify
import requests
import os
from datetime import datetime
import logging

import requests
import json
import base64
import uuid
from datetime import datetime
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mixpanel configuration
MIXPANEL_TOKEN = '8f1255a44f049242c9e18330c539d156'
MIXPANEL_API_URL = 'https://api.mixpanel.com/track'

def send_to_mixpanel(event_name, properties):
    """
    Send event data to Mixpanel using the correct API format
    """
    try:
        # Add timestamp if not present
        if 'time' not in properties:
            properties['time'] = int(datetime.now().timestamp())
        
        # Add token to properties
        properties['token'] = MIXPANEL_TOKEN
        
        # Prepare the data
        data = {
            'event': event_name,
            'properties': properties
        }
        
        # Mixpanel expects base64 encoded JSON
        data_json = json.dumps(data)
        data_b64 = base64.b64encode(data_json.encode('utf-8')).decode('utf-8')
        
        # Send to Mixpanel HTTP API
        url = 'https://api.mixpanel.com/track'
        payload = {'data': data_b64}
        
        logger.info(f"Sending event '{event_name}' to Mixpanel...")
        logger.info(f"Event data: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, data=payload)
        
        if response.status_code == 200 and response.text == '1':
            logger.info(f"✅ Successfully sent {event_name} to Mixpanel!")
            return True
        else:
            logger.error(f"❌ Failed to send to Mixpanel: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error sending to Mixpanel: {str(e)}")
        return False

@app.route('/track/survey', methods=['GET'])
def track_survey():
    """
    Track survey submission
    Expected query parameters:
    - answer: survey answer value
    - answer_text: human readable answer text
    - email_domain: user's email
    - question: survey question
    - survey_type: type of survey
    - scale_position: numeric position on scale
    """
    try:
        # Get parameters from query string
        answer = request.args.get('answer')
        answer_text = request.args.get('answer_text')
        email_domain = request.args.get('email_domain')
        question = request.args.get('question', 'Cadillac is a Brand for Me')
        survey_type = request.args.get('survey_type', 'cadillac_brand_perception')
        scale_position = request.args.get('scale_position')
        
        # Validate required parameters
        if not answer or not email_domain:
            return jsonify({'error': 'Missing required parameters: answer and email_domain'}), 400
        
        # Prepare properties for Mixpanel
        properties = {
            'answer': answer,
            'answer_text': answer_text,
            'email_domain': email_domain,
            'question': question,
            'survey_type': survey_type,
            'scale_position': int(scale_position) if scale_position else None,
            'user_agent': request.headers.get('User-Agent', ''),
            'ip_address': request.remote_addr,
            'timestamp': datetime.now().isoformat()
        }
        
        # Send to Mixpanel
        success = send_to_mixpanel('Survey Submitted', properties)
        
        if success:
            # Also set user properties in Mixpanel
            user_properties = {
                '$email': email_domain,
                'latest_survey_answer': answer,
                'latest_survey_answer_text': answer_text,
                'survey_completion_count': 1  # This will be incremented by Mixpanel
            }
            
            # Send user profile update
            profile_data = {
                '$token': MIXPANEL_TOKEN,
                '$distinct_id': email_domain,
                '$set': user_properties,
                '$add': {'survey_completion_count': 1}
            }
            
            profile_response = requests.post(
                'https://api.mixpanel.com/engage',
                data=profile_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if profile_response.status_code != 200:
                logger.warning(f"Failed to update user profile: {profile_response.status_code}")
        
        return jsonify({
            'success': success,
            'message': 'Survey data processed',
            'event': 'Survey Submitted'
        })
        
    except Exception as e:
        logger.error(f"Error processing survey tracking: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/track/social', methods=['GET'])
def track_social():
    """
    Track social media button clicks
    Expected query parameters:
    - platform: social platform name
    - button_id: button identifier
    - page: current page
    - survey_type: type of survey
    - email_domain: user's email (optional)
    """
    try:
        # Get parameters from query string
        platform = request.args.get('platform')
        button_id = request.args.get('button_id')
        page = request.args.get('page', 'photo_gallery')
        survey_type = request.args.get('survey_type', 'cadillac_brand_perception')
        email_domain = request.args.get('email_domain')
        print(request.args)
        # Validate required parameters
        if not platform:
            return jsonify({'error': 'Missing required parameter: platform'}), 400
        
        # Prepare properties for Mixpanel
        properties = {
            'platform': platform,
            'timestamp': datetime.now().isoformat()
        }
        
        # Add email if available
        if email_domain:
            properties['email_domain'] = email_domain
        
        # Send to Mixpanel
        success = send_to_mixpanel('Share Completed', properties)
        
        if success and email_domain:
            # Update user profile if email is available
            user_properties = {
                '$email': email_domain,
                '$last_seen': datetime.now().isoformat(),
                f'{platform}_clicks': 1,
                'total_social_clicks': 1
            }
            
            profile_data = {
                '$token': MIXPANEL_TOKEN,
                '$distinct_id': email_domain,
                '$set': user_properties,
                '$add': {f'{platform}_clicks': 1, 'total_social_clicks': 1}
            }
            
            profile_response = requests.post(
                'https://api.mixpanel.com/engage',
                data=profile_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if profile_response.status_code != 200:
                logger.warning(f"Failed to update user profile: {profile_response.status_code}")
        
        return jsonify({
            'success': success,
            'message': 'Social click data processed',
            'event': 'Share Completed'
        })
        
    except Exception as e:
        logger.error(f"Error processing social tracking: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/track/pageview', methods=['GET'])
def track_pageview():
    """
    Track page view events
    Expected query parameters:
    - page: page type
    - survey_type: type of survey
    - email_domain: user's email (optional)
    """
    try:
        # Get parameters from query string
        page = request.args.get('page')
        survey_type = request.args.get('survey_type', 'cadillac_brand_perception')
        email_domain = request.args.get('email_domain')
        
        # Validate required parameters
        if not page:
            return jsonify({'error': 'Missing required parameter: page'}), 400
        
        # Prepare properties for Mixpanel
        properties = {
            'page': page,
            'survey_type': survey_type,
            'page_type': page,
            'user_agent': request.headers.get('User-Agent', ''),
            'screen_width': request.args.get('screen_width'),
            'screen_height': request.args.get('screen_height'),
            'viewport_width': request.args.get('viewport_width'),
            'viewport_height': request.args.get('viewport_height'),
            'has_email': 'yes' if email_domain else 'no',
            'ip_address': request.remote_addr,
            'timestamp': datetime.now().isoformat()
        }
        
        # Add email if available
        if email_domain:
            properties['email_domain'] = email_domain
        
        # Send to Mixpanel
        success = send_to_mixpanel('Page View', properties)
        
        if success and email_domain:
            # Update user profile if email is available
            user_properties = {
                '$email': email_domain,
                f'{page}_page_views': 1,
                'total_page_views': 1
            }
            
            profile_data = {
                '$token': MIXPANEL_TOKEN,
                '$distinct_id': email_domain,
                '$set': user_properties,
                '$add': {f'{page}_page_views': 1, 'total_page_views': 1}
            }
            
            profile_response = requests.post(
                'https://api.mixpanel.com/engage',
                data=profile_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if profile_response.status_code != 200:
                logger.warning(f"Failed to update user profile: {profile_response.status_code}")
        
        return jsonify({
            'success': success,
            'message': 'Page view data processed',
            'event': 'Page View'
        })
        
    except Exception as e:
        logger.error(f"Error processing page view tracking: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'mixpanel-relay-server'
    })

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False  # Set to True for development
    )
