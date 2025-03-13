# Audetic Authentication Service

This service handles authentication for the Audetic application, including deep linking support for the desktop application.

## Deep Linking Support

The authentication service supports deep linking to the desktop application via the `audetic://` protocol. This allows users to authenticate in the web application and then be redirected back to the desktop application with their authentication token.

### How It Works

1. The desktop application opens the web application with a query parameter: `?redirect_url=audetic://callback`
2. The web application captures this redirect URL and stores it in localStorage
3. When the user logs in, the redirect URL is passed to the authentication service
4. After successful authentication, the user is redirected back to the desktop application using the deep link protocol URL
5. If a session token is available, it's included in the redirect URL as a query parameter

### Key Components

- **SessionLogin**: Captures the redirect URL from query parameters and stores it in localStorage
- **SessionAuthenticate**: Handles the authentication process and stores the redirect URL
- **AuthService**: Appends the redirect URL to the email redirect URL for the authentication provider
- **redirectToApp**: Handles the redirection logic based on the authentication state

## Testing

The deep linking functionality is thoroughly tested with the following test suites:

### redirectUtils.test.ts

Tests the redirection logic in the `redirectToApp` function, including:

- Redirecting to the app with a token when a session exists
- Redirecting to the deep link protocol with a token when a session exists and a redirect URL is stored
- Redirecting to the base URL when a user exists but no session
- Redirecting to the deep link protocol when a user exists but no session and a redirect URL is stored
- Calling the next function when no session or user exists

### SessionLogin.test.tsx

Tests the login component and action, including:

- Capturing and storing the redirect URL from query parameters
- Not storing the redirect URL if it doesn't start with the deep link protocol
- Calling `signInWithEmail` with the email and redirect URL

### SessionAuthenticate.test.tsx

Tests the authenticate loader, including:

- Storing the redirect URL in localStorage if it starts with the deep link protocol
- Not storing the redirect URL if it doesn't start with the deep link protocol
- Calling `verifyOTP` with the token hash and type

### auth.deep-link.test.ts

Tests the deep linking functionality in the `signInWithEmail` method, including:

- Appending the redirect URL to the email redirect URL when it starts with the deep link protocol
- Not appending the redirect URL when it doesn't start with the deep link protocol
- Handling URLs with existing query parameters

### ServiceContext.test.tsx

Tests the service context, including:

- Providing the auth service to components
- Accessing the auth service with the `useAuthService` hook

## Constants

The deep linking functionality uses the following constants:

- `REDIRECT_URL_STORAGE_KEY`: The key used to store the redirect URL in localStorage
- `DEEP_LINK_PROTOCOL`: The protocol prefix for deep links to the desktop app
- `REDIRECT_URL_PARAM`: The query parameter name for the redirect URL
- `TOKEN_PARAM`: The query parameter name for the token
