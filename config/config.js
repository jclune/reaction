var config = {};

config.rootUrl = process.env.ROOT_URL || 'http://localhost:3000/';

config.facebook = {
  appId: '1444679319132880',
  appSecret: '5db0d86bdf522b09ea25a5b6a4e46949',
  appNamespace: '',
  redirectUri: config.rootUrl + 'login/callback'
};

module.exports = config;