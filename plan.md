Okay, this is a comprehensive task! Here's a detailed breakdown of the migration plan for CAPI from the legacy PHP/JavaScript setup to a new NestJS package, including Sentry integration and multi-account handling. This plan is designed for a coding agent to follow.
Project: CAPI Migration to NestJS
Overall Goal: Migrate Facebook Conversion API (CAPI) event tracking from a legacy PHP/JavaScript frontend-to-PHP-backend approach to a new, abstracted NestJS package, supporting multiple CAPI accounts and integrated Sentry logging.
Phase 1: New NestJS Package Development (@juicyllama/nestjs-meta-capi)
Reference Repository: https://github.com/juicyllama/nestjs-recurly/ (Use this as a template for structure and testing setup.)
Sub-tasks:
Repository Setup:
Create a new Git repository named nestjs-meta-capi.
Initialize a new NestJS library project within this repository (e.g., nest generate library meta-capi).
Copy the foundational structure, package.json scripts, tsconfig.json, and jest.config.js from the nestjs-recurly repository to ensure a consistent setup.
Core CAPI Service (MetaCapiService):
Create a MetaCapiService responsible for interacting with the Facebook Marketing API (specifically the Conversions API).
Authentication:
The service needs to be initialized with a Facebook Pixel ID and Access Token.
Design the service to accept these credentials, possibly through a module configuration (e.g., MetaCapiModule.forRoot({ pixelId: '...', accessToken: '...' }) or forFeature for multi-account).
Initially, support a single pixel/token for testing.
Facebook API Client:
Investigate and integrate an official or community-maintained Node.js SDK for Facebook Marketing API (e.g., facebook-nodejs-business-sdk). If a suitable SDK isn't found, use axios or fetch to make direct HTTP calls to the https://graph.facebook.com/vXY.0/{pixelId}/events endpoint.
The v10.0 endpoint is used in the PHP code, ensure the NestJS implementation uses the latest stable version supported by Facebook, or v10.0 for direct parity.
Event Handling Methods:
Implement methods mirroring the standard CAPI events from the provided PHP FacebookSDK class:
trackPageView(eventData: MetaCapiEventData)
trackLead(eventData: MetaCapiEventData)
trackViewContent(eventData: MetaCapiEventData)
trackAddToCart(eventData: MetaCapiEventData) (from PHP addToCart)
trackInitiateCheckout(eventData: MetaCapiEventData)
trackPurchase(eventData: MetaCapiEventData)
trackUpsellPurchase(eventData: MetaCapiEventData)
trackRebillSuccess(eventData: MetaCapiEventData) (from PHP rebillSuccess)
trackSubscribe(eventData: MetaCapiEventData) (from PHP subscribe)
trackAddPaymentInfo(eventData: MetaCapiEventData) (from PHP addPaymentInfo)
Each method will construct the appropriate CAPI payload based on the eventData and send it to Facebook.
MetaCapiEventData Interface:
Define a TypeScript interface (MetaCapiEventData) to strongly type the event parameters (e.g., em, ph, fn, ln, ct, st, country, zp, ge, external_id, value, currency, orderId, content_ids, content_name, content_type, contents, num_items, event_source_url, event_id, fbc, fbp, fbclid, userAgent, client_ip_address).
Pay close attention to the PHP getUserData and callFacebook methods to capture all potential parameters.
Standardize Data: Ensure data normalization (e.g., hashing PII data like email and phone numbers) is applied as per Facebook's recommendations, mirroring the FacebookUtil::hash method. The MetaCapiService should handle the hashing before sending to Facebook.
Utility Functions (e.g., MetaCapiUtils):
Migrate relevant utility functions from FacebookUtil.php into a TypeScript utility class or functions within the NestJS package:
hash(data: string): For SHA256 hashing of PII.
getIpAddress(): How the NestJS backend identifies the client IP (from request headers).
getHttpUserAgent(): How the NestJS backend identifies the client User-Agent (from request headers).
getRequestUri(): How the NestJS backend identifies the current URL (from request headers/body if passed from frontend).
getFbp(params: any)
getFbc(params: any)
These utilities will be used by the MetaCapiService to prepare the user_data and other CAPI parameters.
Event ID Generation: Implement the event_id generation logic, mimicking md5($params['event_name'].session_id().$sourceUrl) or using a UUID generator if a session_id equivalent isn't readily available for server-side deduplication. Facebook recommends a unique ID for each event.
Error Handling: Implement robust error handling for API calls, distinguishing between network issues, invalid credentials, and Facebook API errors.
NestJS Module (MetaCapiModule):
Create MetaCapiModule to encapsulate the service and any configuration.
Implement forRoot and forRootAsync methods to allow for synchronous and asynchronous module configuration, especially for dynamic pixelId and accessToken.
Testing:
Set up comprehensive unit and integration tests using Jest.
Mimic the testing structure of nestjs-recurly.
Test each event tracking method with various eventData payloads.
Mock Facebook API calls to ensure the service constructs correct requests and handles responses/errors.
Test configuration options (e.g., missing pixel ID).
Phase 2: Backend (Core NestJS Application) Integration
Sub-tasks:
Sentry Integration:
Install Sentry SDK for NestJS.
Configure Sentry in the main NestJS application. This typically involves setting up a SentryModule and integrating SentryInterceptor for automatic error capture.
Ensure the DSN is configured via environment variables.
Add a custom logger service that integrates with Sentry, so all app_logger calls (or equivalents) can be captured by Sentry.
Multi-CAPI Account Configuration:
Design a configuration strategy to manage multiple Facebook Pixel IDs and Access Tokens. This could involve:
Database-driven: A database table (capi_accounts or similar) storing pixelId, accessToken, and a unique accountIdentifier (e.g., funnelName).
Environment Variables: If a limited, fixed number of accounts, use environment variables like FACEBOOK_CAPI_ACCOUNT_1_PIXEL_ID, FACEBOOK_CAPI_ACCOUNT_1_ACCESS_TOKEN, FACEBOOK_CAPI_ACCOUNT_2_PIXEL_ID, etc. (Database is preferred for scalability).
Create a MetaCapiConfigService (or similar) in the core application to retrieve the correct pixelId and accessToken based on an incoming request's funnel or accountIdentifier. This service will leverage the configured MetaCapiModule.
API Endpoint for Frontend (Next.js):
Create a new API endpoint in the core NestJS application (e.g., POST /api/capi/track-event).
This endpoint will receive event data from the Next.js frontend.
Request Body: Define a DTO (Data Transfer Object) for the incoming event data. This DTO should include:
eventType: (e.g., 'PageView', 'Lead', 'Purchase')
eventParams: The specific parameters for the event (e.g., amount, currency, em, fn).
trackingInfo: The client-side collected data (e.g., userAgent, fbclid, _fbc, _fbp, referrer_url, event_source_url).
accountIdentifier (or funnelIdentifier): A parameter from the frontend indicating which CAPI account to use for the event. This is crucial for multi-account support.
Data Validation: Implement validation for the incoming DTO to ensure data integrity and security.
Event Processing:
Upon receiving an event, the controller will:
Extract the accountIdentifier.
Use the MetaCapiConfigService to get the corresponding pixelId and accessToken.
Instantiate or retrieve a MetaCapiService instance configured for that specific account.
Call the appropriate tracking method on the MetaCapiService (e.g., metaCapiService.trackLead(payload)).
Extract IP and User-Agent: Crucially, extract the client's IP address (req.ip) and User-Agent (req.headers['user-agent']) from the NestJS request object, as these are critical for CAPI matching quality and should not be passed directly from the client-side JavaScript as they can be spoofed.
Logging: Log the incoming event data and the outcome of the CAPI call using the Sentry-integrated logger. This provides traceability.
Return a success/failure response to the frontend.
Integration with @juicyllama/nestjs-meta-capi:
Import and configure the newly created @juicyllama/nestjs-meta-capi package into the core NestJS application.
The MetaCapiModule in the core app will be responsible for providing the correct MetaCapiService instance based on the accountIdentifier. This might involve using a Map of MetaCapiService instances, or dynamically configuring the module.
Logging (Sentry):
Ensure all calls to the MetaCapiService and their responses (success or failure) are logged via the Sentry-integrated logger.
Include relevant context in Sentry events, such as eventType, accountIdentifier, and any Facebook API error details.
Testing (Backend Application):
Write integration tests for the new POST /api/capi/track-event endpoint.
Mock the MetaCapiService to verify that the backend correctly selects the CAPI account, transforms data, and calls the appropriate tracking method.
Test various event types and payloads.
Test error scenarios (e.g., invalid accountIdentifier, Facebook API errors).
Verify that logs are generated and Sentry events would be captured (mock Sentry if necessary).
Phase 3: Frontend (Next.js Application) Migration
Sub-tasks:
Remove Legacy FacebookCAPI.js:
Delete or comment out the existing FacebookCAPI.js script and its inclusions.
Client-Side Event Helper:
Create a new client-side utility/helper function (e.g., trackCapiEvent) that:
Takes eventType, eventParams, and accountIdentifier as arguments.
Collects client-side data (_fbc, _fbp, fbclid, referrer_url, event_source_url from window.location.href). Note: userAgent should not be collected here as it will be derived from the backend request.
Makes an HTTP POST request to the new NestJS backend endpoint (/api/capi/track-event).
Handles potential network errors or errors from the backend API.
Does not include userAgent or client_ip_address in the client-side payload, as these will be captured on the server.
Update Event Calls:
Go through the Next.js application codebase and replace all instances of FacebookCAPI.trackLead, FacebookCAPI.trackPurchase, etc., with calls to the new trackCapiEvent helper.
Ensure that the correct accountIdentifier is passed with each event, mapping it to the appropriate funnel.
Testing (Frontend):
Manually test all funnels and key user flows (page views, lead submissions, purchases, etc.) to ensure events are correctly sent to the NestJS backend and subsequently to Facebook.
Verify in Facebook Events Manager that events are being received and matched.
General Considerations & Best Practices
Environment Variables: Use environment variables for all sensitive data (Facebook Access Tokens, Sentry DSN, etc.) and configuration that changes between environments (development, staging, production).
Data Hashing: Emphasize that PII data (email, phone, first name, last name, city, state, zip, country, external_id, gender) must be consistently normalized (trimmed, lowercased) and SHA256 hashed before being sent to Facebook, following Facebook's guidelines. This should happen within the @juicyllama/nestjs-meta-capi package.
Deduplication: The event_id is crucial for deduplication. Ensure it's generated uniquely for each client-side event. Consider how session_id maps to server-side context in NestJS if needed, or if a more robust UUID generation strategy is better.
User Consent: While not directly part of the CAPI technical migration, ensure that the application adheres to privacy regulations (GDPR, CCPA) regarding data collection and sending to third parties.
Error Reporting: Sentry will be key for monitoring the health and accuracy of the CAPI integration. Ensure detailed context is logged with errors.
Scalability: Design the multi-account handling with scalability in mind, especially if the number of funnels/accounts is expected to grow. A database-driven configuration is highly recommended for this.
Monitoring: Once deployed, set up dashboards and alerts in Sentry and Facebook Events Manager to monitor CAPI event delivery and matching quality.
This detailed plan should provide the coding agent with a clear roadmap for the migration.