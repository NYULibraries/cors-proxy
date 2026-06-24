# AWS Lambda test events

These test events have been manually deployed to Lambda:

* Name: "Any future 4th level *.library.nyu.edu subdomain"
  * Source: _[arbitrary-4th-level-subdomain.library.nyu.edu](arbitrary-4th-level-subdomain.library.nyu.edu.json)_
  * Expected result: HTTP 200 response with RSS data in the body and the expected
    CORS HTTP headers which allow access to https://arbitrary-4th-level-subdomain.library.nyu.edu
* Name: "Blank resource URL"
  * Source: _[blank-resource-url.json](blank-resource-url.json)_
  * Expected result: HTTP 422 error response with error details in the body.
* Name: "Origin: https://dev.library.nyu.edu"
  * Source: _[dev.library.nyu.edu.json](dev.library.nyu.edu.json)_
  * Expected result: HTTP 200 response with RSS data in the body and the expected 
    CORS HTTP headers which allow access to https://dev.library.nyu.edu.
* Name: "Invalid Origin header"
  * Source: _[invalid-origin.json](invalid-origin.json)_
  * Expected result: HTTP 200 response with RSS data in the body but no CORS
    HTTP headers.
* Name: "Origin: https://library.nyu.edu"
  * Source: _[library.nyu.edu.json](library.nyu.edu.json)_
  * Expected result: HTTP 200 response with RSS data in the body and the expected
    CORS HTTP headers which allow access to https://library.nyu.edu.

See the code comments in [handler.js](../handler.js) for details on what CORS
headers should be present in a success response.
