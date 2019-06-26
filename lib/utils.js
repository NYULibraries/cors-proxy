const wildcardMatch = (str, rule) => new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
const allowOriginFilter = (origin, allowedOrigins) => allowedOrigins.some(allowedOrigin => wildcardMatch(origin, allowedOrigin)) ? origin : 'null';

module.exports.wildcardMatch = wildcardMatch;
module.exports.allowOriginFilter = allowOriginFilter;