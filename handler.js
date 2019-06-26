'use strict';

const axios = require('axios');
const allowOriginFilter = require('./lib/utils').allowOriginFilter;

module.exports.corsProxy = async (event, context) => {
  const { ALLOW_ORIGINS } = process.env;

  try {
    // assigns url, origin from event body
    const { queryStringParameters: { url }, headers: { origin } } = event;
    const response = await axios.get(decodeURIComponent(url));
    const allowedOrigins = ALLOW_ORIGINS.split(',');

    return {
      statusCode: 200,
      body: response.data,
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
