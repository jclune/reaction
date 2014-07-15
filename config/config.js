var config = {};

config.rootUrl = process.env.ROOT_URL || 'http://localhost:3000/';

config.facebook = {
  appId: '569431436501005',
  appSecret: '60c6d308d2bb49f19f8ed088c20a2690',
  appNamespace: '',
  redirectUri: config.rootUrl + 'login/callback'
};

module.exports = config;