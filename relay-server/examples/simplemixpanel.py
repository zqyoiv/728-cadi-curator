
import requests
import json
import base64
import uuid
from datetime import datetime

def send_mixpanel_event(event_name, properties=None, distinct_id=None, token=None):
    """
    Send an event to Mixpanel using their HTTP API
    
    Args:
        event_name (str): Name of the event to track
        properties (dict): Event properties to send
        distinct_id (str): Unique identifier for the user
        token (str): Mixpanel project token
    
    Returns:
        bool: True if successful, False otherwise
    """
    # Default token - replace with your actual Mixpanel project token
    if not token:
        token = "8f1255a44f049242c9e18330c539d156"
    
    # Default distinct_id if not provided
    if not distinct_id:
        distinct_id = str(uuid.uuid4())
    
    # Default properties
    if not properties:
        properties = {}
    
    # Add required token to properties
    properties['token'] = token
    properties['time'] = int(datetime.now().timestamp())
    
    # Prepare the event data
    event_data = {
        'event': event_name,
        'properties': properties
    }
    
    # If distinct_id is provided, add it to properties
    if distinct_id:
        event_data['properties']['distinct_id'] = distinct_id
    
    try:
        # Mixpanel expects base64 encoded JSON
        data_json = json.dumps(event_data)
        data_b64 = base64.b64encode(data_json.encode('utf-8')).decode('utf-8')
        
        # Send to Mixpanel HTTP API
        url = 'https://api.mixpanel.com/track'
        payload = {'data': data_b64}
        
        print(f"Sending event '{event_name}' to Mixpanel...")
        print(f"Event data: {json.dumps(event_data, indent=2)}")
        
        response = requests.post(url, data=payload)
        
        if response.status_code == 200 and response.text == '1':
            print("✅ Event sent successfully to Mixpanel!")
            return True
        else:
            print(f"❌ Failed to send event. Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error sending event to Mixpanel: {str(e)}")
        return False

def send_photo_booth_start(user_id=None, session_id=None, location=None):
    """
    Send a "photo booth start" event to Mixpanel
    
    Args:
        user_id (str): Optional user identifier
        session_id (str): Optional session identifier  
        location (str): Optional location where photo booth is used
    
    Returns:
        bool: True if successful, False otherwise
    """
    # Generate session ID if not provided
    if not session_id:
        session_id = f"photobooth_{int(datetime.now().timestamp())}"
    
    # Prepare event properties similar to your webapp's structure
    properties = {
        'event_type': 'photo_booth_start',
        'session_id': session_id,
        'timestamp': datetime.now().isoformat(),
        'platform': 'python_script',
        'source': 'photo_booth_app'
    }
    
    # Add optional properties
    if location:
        properties['location'] = location
    
    if user_id:
        properties['user_id'] = user_id
    
    # Use user_id as distinct_id if available, otherwise generate one
    distinct_id = user_id if user_id else session_id
    print(f"Using distinct_id: {distinct_id}")
    return send_mixpanel_event('Photo Booth Start', properties, distinct_id)

def send_social_share(platform=None, user_id=None, session_id=None, content_type=None, page=None, survey_type=None):
    """
    Send a "social share" event to Mixpanel
    
    Args:
        platform (str): Social platform name (e.g., 'tiktok', 'facebook', 'instagram')
        user_id (str): Optional user identifier
        session_id (str): Optional session identifier  
        content_type (str): Type of content being shared (e.g., 'photo', 'video', 'story')
        page (str): Page or section where share happened
    
    Returns:
        bool: True if successful, False otherwise
    """
    # Generate session ID if not provided
    if not session_id:
        session_id = f"share_{int(datetime.now().timestamp())}"
    
    # Prepare event properties similar to your webapp's structure
    properties = {
        'session_id': session_id,
        'timestamp': datetime.now().isoformat(),
    }
    
    # Add required platform property
    if platform:
        properties['platform'] = platform
    
    # Add optional properties
    if content_type:
        properties['content_type'] = content_type
    
    if page:
        properties['page'] = page
    
    if user_id:
        properties['user_id'] = user_id
    
    # Use user_id as distinct_id if available, otherwise generate one
    distinct_id = user_id if user_id else session_id
    print(f"Using distinct_id: {distinct_id}")
    return send_mixpanel_event('Share Completed', properties, distinct_id)


def main():
    """
    Main function to run when script is executed directly
    """
    print("🚀 Starting Mixpanel Photo Booth Event Sender...")
    # You can customize these values or make them interactive
    user_id = None  # Set to actual user ID if available
    location = "Demo Location"  # Set to actual location if relevant
    
    # Send the event
    success = send_social_share(
        user_id=user_id,
        platform="tiktok",
        content_type="photo",
        survey_type='cadillac_brand_perception',
        page="photo_gallery"
    )
    
    if success:
        print("🎉 Photo booth start event sent successfully!")
        print("Check your Mixpanel dashboard for the 'Photo Booth Start' event.")
    else:
        print("💥 Failed to send event. Check your token and internet connection.")

if __name__ == "__main__":
    main()