# cors-proxy
CORS proxy with AWS Lambda.

Produces an `"Access-Control-Allow-Origin"` header specific to your server with some basic configuration.

# Configure

Simply configure allowed  via the environment. '*' is used as a wildcard. Uses a comma separted list for multiple urls.

`serverless.yml`
```yml
  environment:
    ALLOW_ORIGINS: https://*.library.nyu.edu,https://library.nyu.edu
```

For our purposes, the url is checked in to our repository; for those interested in forking, you can also refer to an environment variable which is referenced at the time of build and deploy.

```yml
environment:
  ALLOW_ORIGINS: ${env:ALLOW_ORIGINS}
```

Thanks:
* [Glifery/cors-proxy](https://github.com/Glifery/cors-proxy)
* [SO * wildcard RegExp](https://stackoverflow.com/a/32402438/8603212)