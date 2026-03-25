'use strict';

const allowOriginFilter = require('./lib/utils').allowOriginFilter;

module.exports.corsProxy = async (event, context, fetchArg) => {
  const { ALLOW_ORIGINS } = process.env;
  // Silence eslint error for `fetch`
  // eslint-disable-next-line no-undef
  const fetchMethod = fetchArg || fetch;

  try {
    // assigns url, origin from event body
    const { queryStringParameters: { url }, headers: { origin } } = event;
    const response = await fetchMethod(decodeURIComponent(url));
    const responseBodyText = await response.text();
    const allowedOrigins = ALLOW_ORIGINS.split(',');

    return {
      statusCode: 200,
      body: responseBodyText,
      headers: {
        "Access-Control-Allow-Origin": allowOriginFilter(origin, allowedOrigins), // Required for CORS support to work
        "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
        "content-type": response.headers['content-type']
      }
    };
  } catch(err) {
    console.error(err);

    return {
      statusCode: 422,
      body: JSON.stringify({
        event: event,
        errorDetails: err
      })
    };
  }
};
