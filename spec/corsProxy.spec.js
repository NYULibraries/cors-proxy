const handler = require('../handler');
const corsProxy = handler.corsProxy;
const emptyLambdaContext = {};

describe('corsProxy', () => {
  const baseEvent = Object.freeze({
    queryStringParameters: {},
    headers: {
      origin: 'https://library.nyu.edu'
    }
  });

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
    describe('with url defined in query string', () => {
      const devOrigin = 'https://dev.library.nyu.edu';
      const prodOrigin = 'https://library.nyu.edu';

      it( `Origin: ${ devOrigin }`, async () => {
        const event = Object.assign( {}, baseEvent, {
          headers: {
            origin: devOrigin,
          }
        });

        const result = await corsProxy(event, emptyLambdaContext, fetchSpy);

        expect(result).toEqual({
          statusCode: 200,
          body: data,
          headers: {
            "Access-Control-Allow-Origin": devOrigin,
            "Access-Control-Allow-Credentials": true,
            "content-type": headers["content-type"]
          }
        });
      });

      it( `Origin: ${ prodOrigin }`, async () => {
        const event = Object.assign( {}, baseEvent, {
          headers: {
            origin: prodOrigin,
          }
        });

        const result = await corsProxy(event, emptyLambdaContext, fetchSpy);

        expect(result).toEqual({
          statusCode: 200,
          body: data,
          headers: {
            "Access-Control-Allow-Origin": prodOrigin,
            "Access-Control-Allow-Credentials": true,
            "content-type": headers["content-type"]
          }
        });
      });
    });

    describe('without a url defined in the query string', () => {
      const badEvent = Object.assign( {}, baseEvent, {
        queryStringParameters: undefined,
      });

      beforeEach(() => {
        spyOn(console, 'error');
      });

      it('returns a 422 error', async () => {
        const result = await corsProxy(badEvent, emptyLambdaContext, fetchSpy);
        expect(result.statusCode).toEqual(422);
      });

      it('logs the error', async () => {
        await corsProxy(badEvent);
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe('if the request rejects', () => {
      const event = Object.assign( {}, baseEvent, {
        headers: {
          origin: 'https://does-not-matter.com',
        }
      });

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
        await corsProxy( event, emptyLambdaContext, fetchSpy);
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe('with invalid origins', () => {
    it('returns `undefined` allow origin', async () => {
      const event = Object.assign({}, baseEvent, {
        headers: {
          origin: 'https://invalid-origin.com'
        },
      });
      const result = await corsProxy(event, emptyLambdaContext, fetchSpy);
      expect(result.headers["Access-Control-Allow-Origin"]).toBe(undefined);
    });
  });
});
