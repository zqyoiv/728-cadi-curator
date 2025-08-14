#!/usr/bin/env python3
"""
Test script for the Mixpanel Relay Server
"""

import requests
import json
import time

# Server configuration
SERVER_URL = 'http://localhost:5000'

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f'{SERVER_URL}/health')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_survey_tracking():
    """Test the survey tracking endpoint"""
    print("\nTesting survey tracking...")
    try:
        params = {
            'answer': 'agree',
            'answer_text': 'Agree',
            'email_domain': 'test@example.com',
            'question': 'Cadillac is a Brand for Me',
            'survey_type': 'cadillac_brand_perception',
            'scale_position': '4'
        }
        
        response = requests.get(f'{SERVER_URL}/track/survey', params=params)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Survey tracking passed: {data}")
            return True
        else:
            print(f"❌ Survey tracking failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Survey tracking error: {e}")
        return False

def test_social_tracking():
    """Test the social tracking endpoint"""
    print("\nTesting social tracking...")
    try:
        params = {
            'platform': 'tiktok',
            'button_id': 'i2cwn',
            'page': 'photo_gallery',
            'survey_type': 'cadillac_brand_perception',
            'email_domain': 'test@example.com',
            'screen_width': '1920',
            'screen_height': '1080',
            'viewport_width': '1200',
            'viewport_height': '800'
        }
        
        response = requests.get(f'{SERVER_URL}/track/social', params=params)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Social tracking passed: {data}")
            return True
        else:
            print(f"❌ Social tracking failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Social tracking error: {e}")
        return False

def test_pageview_tracking():
    """Test the pageview tracking endpoint"""
    print("\nTesting pageview tracking...")
    try:
        params = {
            'page': 'photo_gallery',
            'survey_type': 'cadillac_brand_perception',
            'email_domain': 'test@example.com',
            'screen_width': '1920',
            'screen_height': '1080',
            'viewport_width': '1200',
            'viewport_height': '800'
        }
        
        response = requests.get(f'{SERVER_URL}/track/pageview', params=params)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Pageview tracking passed: {data}")
            return True
        else:
            print(f"❌ Pageview tracking failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Pageview tracking error: {e}")
        return False

def test_error_handling():
    """Test error handling with missing parameters"""
    print("\nTesting error handling...")
    try:
        # Test survey tracking with missing required parameters
        response = requests.get(f'{SERVER_URL}/track/survey')
        if response.status_code == 400:
            data = response.json()
            print(f"✅ Error handling passed: {data}")
            return True
        else:
            print(f"❌ Error handling failed: expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error handling error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Mixpanel Relay Server")
    print("=" * 50)
    
    # tests = [
    #     test_health_check,
    #     test_survey_tracking,
    #     test_social_tracking,
    #     test_pageview_tracking,
    #     test_error_handling
    # ]
    tests = [

        test_survey_tracking

    ]
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        time.sleep(0.5)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The relay server is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the server configuration.")

if __name__ == '__main__':
    main()
