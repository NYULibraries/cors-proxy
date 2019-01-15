'use strict';

const axios = require('axios');

module.exports['cors-proxy'] = async (event, context) => {
  let response;
  try {
    const { url } = event.queryStringParameters;
    response = await axios({ method: 'get', url });

    return {
      statusCode: 200,
      body: response.data,
      headers: {
        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
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
