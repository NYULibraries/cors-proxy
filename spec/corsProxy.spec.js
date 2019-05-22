const handler = require('../handler');
const corsProxy = handler.corsProxy;

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

  let axios;
  beforeEach(() => {
    axios = require('axios');
    spyOn(axios, 'get').and.returnValue(Promise.resolve({
      data,
      headers,
    }));
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
        const result = await corsProxy(event);

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
        const result = await corsProxy(event);
        expect(result.statusCode).toEqual(422);
      });

      it('logs the error', async () => {
        await corsProxy(event);
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe('if the request rejects', () => {
      beforeEach(() => {
        axios.get.and.returnValue(Promise.reject({
          data: 'Error!',
        }));

        spyOn(console, 'error');
      });

      it('returns a 422 error', async () => {
        const result = await corsProxy(event);

        expect(result.statusCode).toEqual(422);
      });

      it('logs the error', async () => {
        await corsProxy(event);
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
      const result = await corsProxy(event);
      expect(result.headers["Access-Control-Allow-Origin"]).toBe('null');
    });
  });
});