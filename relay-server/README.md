# Mixpanel Relay Server

A simple Flask server that acts as a relay for sending tracking data to Mixpanel. This server handles survey submissions, social media button clicks, and page views from the Cadillac Curator application.

## Features

- **Survey Tracking**: Handles survey submission data
- **Social Media Tracking**: Tracks social media button clicks
- **Page View Tracking**: Tracks page view events
- **User Profile Updates**: Updates Mixpanel user profiles with engagement data
- **Health Check**: Provides a health check endpoint

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server**:
   ```bash
   python app.py
   ```

   The server will start on port 5000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### 1. Survey Tracking
**GET** `/track/survey`

Tracks survey submission data.

**Query Parameters**:
- `answer` (required): Survey answer value
- `answer_text` (optional): Human readable answer text
- `email_domain` (required): User's email
- `question` (optional): Survey question (default: "Cadillac is a Brand for Me")
- `survey_type` (optional): Type of survey (default: "cadillac_brand_perception")
- `scale_position` (optional): Numeric position on scale

**Example**:
```
GET /track/survey?answer=agree&answer_text=Agree&email_domain=user@example.com&scale_position=4
```

### 2. Social Media Tracking
**GET** `/track/social`

Tracks social media button clicks.

**Query Parameters**:
- `platform` (required): Social platform name (e.g., "tiktok", "instagram", "x_twitter", "download")
- `button_id` (optional): Button identifier
- `page` (optional): Current page (default: "photo_gallery")
- `survey_type` (optional): Type of survey (default: "cadillac_brand_perception")
- `email_domain` (optional): User's email
- `screen_width`, `screen_height`, `viewport_width`, `viewport_height` (optional): Screen/viewport dimensions

**Example**:
```
GET /track/social?platform=tiktok&button_id=i2cwn&email_domain=user@example.com
```

### 3. Page View Tracking
**GET** `/track/pageview`

Tracks page view events.

**Query Parameters**:
- `page` (required): Page type (e.g., "survey", "photo_gallery")
- `survey_type` (optional): Type of survey (default: "cadillac_brand_perception")
- `email_domain` (optional): User's email
- `screen_width`, `screen_height`, `viewport_width`, `viewport_height` (optional): Screen/viewport dimensions

**Example**:
```
GET /track/pageview?page=photo_gallery&email_domain=user@example.com
```

### 4. Health Check
**GET** `/health`

Returns server health status.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00",
  "service": "mixpanel-relay-server"
}
```

## Configuration

The server uses the following Mixpanel configuration:
- **Token**: `8f1255a44f049242c9e18330c539d156`
- **API URL**: `https://api.mixpanel.com/track`

## Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing required parameters)
- `500`: Internal Server Error

## Logging

The server logs all requests and errors to help with debugging and monitoring.

## Security Considerations

- The server acts as a relay to avoid exposing Mixpanel tokens in client-side code
- All requests are logged for monitoring purposes
- Input validation is performed on all parameters
- Timeouts are set for external API calls to prevent hanging requests
