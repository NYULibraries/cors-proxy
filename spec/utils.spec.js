const utils = require('../lib/utils');
const { wildcardMatch, allowOriginFilter } = utils;

describe('utility functions', () => {
  describe('wildcardMatch', () => {
    it('tests * as wildcards', () => {
      const result = wildcardMatch('www.library.edu', '*.library.edu');
      expect(result).toBe(true);

      const result2 = wildcardMatch('wwwlibrary.nyu', '*.library.nyu.edu');
      expect(result2).toBe(false);
    });

    it('tests with explicit rules', () => {
      const result = wildcardMatch('www.library.nyu.edu', 'www.library.nyu.edu');
      expect(result).toBe(true);
      const result2 = wildcardMatch('www1.library.nyu.edu', 'www.library.nyu.edu');
      expect(result2).toBe(false);
    });
  });

  describe('allowOriginFilter', () => {
    it('returns origin if allowed rule passes', () => {
      const result = allowOriginFilter('library.nyu.edu', ['library.nyu.edu']);
      expect(result).toBe('library.nyu.edu');
    });

    it('returns origin with multiple rules', () => {
      const result = allowOriginFilter('library.nyu.edu', ['*.library.nyu.edu', 'library.nyu.edu']);
      expect(result).toBe('library.nyu.edu');
    });

    it('returns "null" when origin rules fail', () => {
      const result =  allowOriginFilter('library.nyu.edu', ['*.library.nyu.edu']);
      expect(result).toBe('null');
    });
  });
});