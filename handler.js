'use strict';

// This code intentionally over-commented so that devs and sysadmins with limited
// experience with JavaScript and/or CORS can easily understand it when viewing it in the
// Lambda console.

// Overview
// ========
//
// Project repo: https://github.com/NYULibraries/cors-proxy/
//
// This Lambda is used to proxy browser requests for a cross-origin resource that
// does not return the CORS headers necessary for the browser to allow the
// requests to access the API.  For example, the library.nyu.edu home page might
// make a `fetch` or XHR request for https://guides.nyu.edu/rss/blog.php, which
// does not return the needed CORS headers, preventing the browser from sharing
// the response with library.nyu.edu.
//
// Implementation details
// ======================
//
// This script checks to see if the `Origin` HTTP header of the request matches
// a regular expression from our allowed Origins regexps list.
// If there is a match, `cors-proxy` will proxy the request and will include in
// its response the following headers:
//
//     Access-Control-Allow-Origin: <Origin HTTP header value from the request>
//     Access-Control-Allow-Credentials: true
//
// If the `Origin` HTTP header does not match one of our allowed Origins regexps,
// The headers will not be added to the response and the browser will refuse to
// allow access to the requested resource.
//
// Reference docs:
//
// - "Cross-Origin Resource Sharing (CORS)":
//    https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
// - "Origin header"
//    https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin
// - "Access-Control-Allow-Origin header"
//    https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Origin
// - "Access-Control-Allow-Credentials header"
//    https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Credentials
//
// =============================================================================

// The list of regexps to test the requests Origin HTTP header against.
// This is likely the only part of this script that will ever need to be added
// to or changed.
// When adding a new regexp, please observe the following practices:
// - Maintain alphanumeric ordering to make detection of accidental duplicates
//   and misspelling easier.
// - Use single quotes, not double-quotes.
// - Include a trailing comma to make editing easier.  See "Trailing commas":
//       https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Trailing_commas
const ALLOWED_ORIGINS_REGEXPS = [
    // Matches "library.nyu.edu" and any 4th level subdomains, either HTTP or
    // HTTPS.
    // Example matches:
    //    • https://dev.library.nyu.edu
    //    • http://library.nyu.edu
    //    • https://arbitrary-4th-level-subdomain.library.nyu.edu
    'https?://(?:[^.]+\\.)?library.nyu.edu',
];

// Tests if `origin` matches any regexp in `allowedOriginsRegexps`.
function isAllowedOrigin( origin ) {
    return ALLOWED_ORIGINS_REGEXPS.some(
        regexp => origin.match( new RegExp( regexp ) )
    );
}

module.exports.corsProxy = async ( event, context) => {
    try {
        // The `event` arg is provided by the AWS Lambda environment.
        // See "Request payload format" in
        // https://docs.aws.amazon.com/lambda/latest/dg/urls-invocation.html
        // for documentation on the structure of the `event` object.
        // We only need to the URL of the resource being proxied and the vaule of
        // `Origin` HTTP header.
        const { queryStringParameters : { url }, headers : { origin } } = event;

        // Proxy the request to the cross-origin resource and get the response body.
        const response = await fetch( decodeURIComponent( url ) );
        const responseBodyText = await response.text();

        // Build minimal HTTP headers that will be sent whether CORS is allowed or
        // not.
        const headers = {
            "content-type" : response.headers.get( 'content-type' ),
        };

        // Add CORS headers if the request is from an allowed origin.
        if ( isAllowedOrigin( origin ) ) {
            // Required for cookies and authorization headers with HTTPS.
            headers[ 'Access-Control-Allow-Credentials' ] = true;
            headers[ 'Access-Control-Allow-Origin' ] = origin;
        }

        return {
            statusCode : 200,
            body       : responseBodyText,
            headers,
        };
    } catch ( err ) {
        // The `fetch` request to the URL of the requested resource failed.
        console.error( err );

        return {
            statusCode : 422,
            body       : JSON.stringify(
                {
                    event        : event,
                    errorDetails : err,
                },
            ),
        };
    }
};
