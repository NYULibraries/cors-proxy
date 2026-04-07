# cors-proxy

CORS proxy powered by AWS Lambda.

See [the extensive code comments in handler.js](handler.js).

# Tests

After replacing `axios` with `fetch` the original Jasmine unit tests broke
because it wasn't possible to turn the `fetch` global into a Jasmine spy.  There
was an initial attempt to circumvent this by dependency injecting a spy into the
handler:

```javascript
module.exports.corsProxy = async ( event, context, fetchArg ) => {
    // Silence eslint error for `fetch`
    // eslint-disable-next-line no-undef
    const fetchMethod = fetchArg || fetch;
```

This worked fine for getting the Jasmine tests to pass, but seemed to cause
breakage when the handler actually ran in Lambda.  Removing the `fetchArg` DI
allowed the handler to function normally.
Since a false negative is worse than no tests at all, the Jasmine tests have been
completely removed.

We are currently using Lambda test events to check the correctness of the handler:
[Testing Lambda functions in the console](https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html).
See _lambda-test-events/_.

A local test suite will need to use an HTTP server fake to stub out the proxied
server used for the tests.  Ideally the handler itself would also be running
inside an HTTP server to better simulate actual runtime conditions in Lambda.

# CircleCI deployment disabled

CircleCI deployment is currently broken and has been disabled for the time being.
See 
[Update Lambda CORS Proxy](https://nyu-lib.monday.com/boards/600228444/pulses/9546004582)
for details.

# Thanks
* [Glifery/cors-proxy](https://github.com/Glifery/cors-proxy)

