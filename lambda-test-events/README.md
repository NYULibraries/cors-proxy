# AWS Lambda test events

These test events have been manually deployed to Lambda:

* Name: "Blank resource URL"
  * Source: _blank-resource-url.json_
  * Expected result: HTTP 422 error response with error details in the body.
* Name: "Origin: https://dev.library.nyu.edu"
  * Source: _dev.library.nyu.edu.json_
  * Expected result: HTTP 200 response with RSS data in the body and the expected 
    CORS HTTP headers which allow access to https://dev.library.nyu.edu.
* Name: "Invalid Origin header"
  * Source: _invalid-origin.json_
  * Expected result: HTTP 200 response with RSS data in the body but no CORS
    HTTP headers.
* Name: "Origin: https://library.nyu.edu"
  * Source: _library.nyu.edu.json_
  * Expected result: HTTP 200 response with RSS data in the body and the expected
    CORS HTTP headers which allow access to https://library.nyu.edu.

See the code comments in [handler.js](../handler.js) for details on what CORS
headers should be present in a success response.
