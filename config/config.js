var config = {
  facebook: {
    clientID: '569431436501005',
    clientSecret: '60c6d308d2bb49f19f8ed088c20a2690',
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  mongo: {
    uri: 'mongodb://localhost/reaction',
    options: {
      db: {
        native_parser: true
      },
      server: {
        poolSize: 5
      }
    }
  }
};

module.exports = config;