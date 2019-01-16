'use strict';

const axios = require('axios');
const { ALLOW_ORIGIN } = process.env;

module.exports['cors-proxy'] = async (event, context) => {

  function wildcardMatch(str, rule) {
    return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
  }

  const allowOrigin = wildcardMatch(event.headers.Origin, ALLOW_ORIGIN) ? event.headers.Origin : null;

  let response;
  try {
    const { url } = event.queryStringParameters;
    response = await axios({ method: 'get', url });

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
        message: `Invalid input. Request expects a 'url' parameter`,
        event: event,
      })
    };
  }
};
