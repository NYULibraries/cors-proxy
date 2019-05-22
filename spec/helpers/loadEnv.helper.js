module.exports.default = (env) => {
  Object.entries(env).forEach(([k, v]) => process.env[k] = v);
};