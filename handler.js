'use strict';

const axios = require('axios');
const { ALLOW_ORIGINS } = process.env;

module.exports['cors-proxy'] = async (event, context) => {

  try {
    const { url } = event.queryStringParameters;
    const response = await axios({ method: 'get', url: decodeURIComponent(url) });

    const origin = event.headers.origin;
    const wildcardMatch = (str, rule) => new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
    const allowOrigin = ALLOW_ORIGINS.split(',').some(allowedOrigin => wildcardMatch(origin, allowedOrigin)) ? origin : 'null';
    return {
      statusCode: 200,
      body: response.data,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin, // Required for CORS support to work
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
