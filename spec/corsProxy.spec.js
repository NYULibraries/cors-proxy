const handler = require('../handler');
const corsProxy = handler.corsProxy;
const emptyLambdaContext = {};

describe('corsProxy', () => {
  const baseEvent = Object.freeze({
    queryStringParameters: {},
    headers: {
      origin: 'library.nyu.edu'
    }
  });

  const event = Object.assign({}, baseEvent);

  const data = ({
    message:'Hello world',
  });

  const headers = {
    ['content-type']: 'json',
  };

  let fetchSpy;
  beforeEach(() => {
    const response = {
      text: function() {
        return data;
      },
      headers: {
        get: function(header) {
          return headers[header];
        }
      }
    };
    fetchSpy = jasmine.createSpy('fetch')
        .and.returnValue(Promise.resolve(response));
  });

  describe('with valid origins', () => {
    beforeEach(() => {
      const loadEnv = require('./helpers/loadEnv');
      loadEnv({
        'ALLOW_ORIGINS': 'library.nyu.edu,*.library.nyu.edu',
      });
    });

    describe('with url defined in query string', () => {
      it('redirects with allowed origin header', async () => {
        const result = await corsProxy(event, emptyLambdaContext, fetchSpy);

        expect(result).toEqual({
          statusCode: 200,
          body: data,
          headers: {
            "Access-Control-Allow-Origin": 'library.nyu.edu',
            "Access-Control-Allow-Credentials": true,
            "content-type": headers["content-type"]
          }
        });
      });
    });

    describe('without a url defined in the query string', () => {
      const event = Object.assign({}, baseEvent, {
        queryStringParameters: undefined,
      });

      beforeEach(() => {
        spyOn(console, 'error');
      });

      it('returns a 422 error', async () => {
        const result = await corsProxy(event, emptyLambdaContext, fetchSpy);
        expect(result.statusCode).toEqual(422);
      });

      it('logs the error', async () => {
        await corsProxy(event);
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe('if the request rejects', () => {
      beforeEach(() => {
        fetchSpy = jasmine.createSpy('fetch').and.returnValue(
            Promise.reject({
              data: 'Error!',
            })
        );

        spyOn(console, 'error');
      });

      it('returns a 422 error', async () => {
        const result = await corsProxy(event, emptyLambdaContext, fetchSpy);

        expect(result.statusCode).toEqual(422);
      });

      it('logs the error', async () => {
        await corsProxy(event, emptyLambdaContext, fetchSpy);
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe('with invalid origins', () => {
    beforeEach(() => {
      const loadEnv = require('./helpers/loadEnv');
      loadEnv({
        'ALLOW_ORIGINS': 'library.edu,*.library.edu',
      });
    });

    it('returns null allow origin', async () => {
      const result = await corsProxy(event, emptyLambdaContext, fetchSpy);
      expect(result.headers["Access-Control-Allow-Origin"]).toBe('null');
    });
  });
});
