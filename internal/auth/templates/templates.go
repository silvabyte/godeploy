package templates

// it is easier to edit the templates in each .html file and then copy the contents here

// SuccessHTML is the HTML template for the success page
const SuccessHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>GoDeploy Authentication</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 40px;
            text-align: center;
            max-width: 500px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .success-icon {
            color: #4CAF50;
            font-size: 64px;
            margin-bottom: 20px;
        }
        .close-text {
            font-size: 14px;
            color: #999;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Authentication Successful!</h1>
        <p>You have successfully authenticated with GoDeploy. You can now close this window and return to the CLI.</p>
        <p class="close-text">This window will automatically close in a few seconds...</p>
    </div>
    <script>
        // Auto-close the window after 7 seconds
        setTimeout(function() {
            window.close();
        }, 7000);
    </script>
</body>
</html>
`

// HashParamCallbackHTML is the HTML template for handling hash parameters
const HashParamCallbackHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>GoDeploy Authentication</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 40px;
            text-align: center;
            max-width: 500px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .processing-text {
            font-size: 16px;
            color: #666;
            margin-top: 20px;
        }
        .error-text {
            color: #e74c3c;
            font-weight: bold;
        }
        .debug-info {
            font-family: monospace;
            font-size: 12px;
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            text-align: left;
            max-height: 200px;
            overflow: auto;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Processing Authentication</h1>
        <p class="processing-text">Please wait while we complete your authentication...</p>
    </div>
    <script>
        // Function to parse hash parameters
        function getHashParam(name) {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            return params.get(name);
        }

        // Function to extract token and redirect
        function processAuth() {
            // Get the full hash without the # character
            const hash = window.location.hash.substring(1);
            
            // Try URLSearchParams first (standard approach)
            const token = getHashParam('access_token');
            const error = getHashParam('error');
            const errorCode = getHashParam('error_code');
            const errorDescription = getHashParam('error_description');
            
            if (token) {
                // Redirect to the callback endpoint with the token as a query parameter
                window.location.href = '/callback?access_token=' + encodeURIComponent(token);
                return;
            } 
            
            if (error) {
                // Redirect to the callback endpoint with the error parameters
                let errorUrl = '/callback?error=' + encodeURIComponent(error);
                if (errorCode) {
                    errorUrl += '&error_code=' + encodeURIComponent(errorCode);
                }
                if (errorDescription) {
                    errorUrl += '&error_description=' + encodeURIComponent(errorDescription);
                }
                window.location.href = errorUrl;
                return;
            }
            
            // If URLSearchParams didn't work, try manual parsing
            // Some OAuth providers use a different format
            if (hash) {
                const hashParts = hash.split('&');
                for (const part of hashParts) {
                    if (part.startsWith('access_token=')) {
                        const extractedToken = part.substring('access_token='.length);
                        if (extractedToken) {
                            window.location.href = '/callback?access_token=' + encodeURIComponent(extractedToken);
                            return;
                        }
                    }
                }
            }
            
            // No token or error found in hash, display error
            document.querySelector('.container').innerHTML = 
                '<h1>Authentication Error</h1>' +
                '<p>No access token or error information found in the URL. Please try again.</p>' +
                '<div class="debug-info">Hash received: ' + hash + '</div>';
        }

        // Process the authentication immediately
        processAuth();
    </script>
</body>
</html>
`

// ErrorHTML is the HTML template for the error page
const ErrorHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>GoDeploy Authentication Error</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 40px;
            text-align: center;
            max-width: 500px;
        }
        h1 {
            color: #e74c3c;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .error-icon {
            color: #e74c3c;
            font-size: 64px;
            margin-bottom: 20px;
        }
        .error-details {
            background-color: #f9f9f9;
            border-radius: 4px;
            padding: 15px;
            text-align: left;
            margin-bottom: 20px;
            font-family: monospace;
            font-size: 14px;
        }
        .close-text {
            font-size: 14px;
            color: #999;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">✗</div>
        <h1>Authentication Failed</h1>
        <p>%s</p>
        <div class="error-details">
            <strong>Error:</strong> %s<br>
            <strong>Code:</strong> %s
        </div>
        <p class="close-text">This window will automatically close in a few seconds...</p>
    </div>
    <script>
        // Auto-close the window after 10 seconds
        setTimeout(function() {
            window.close();
        }, 10000);
    </script>
</body>
</html>
`
