var config = {
  dev: {
    facebook: {
      clientID: '569431436501005',
      clientSecret: '60c6d308d2bb49f19f8ed088c20a2690',
      callbackURL: 'http://localhost:3000/auth/facebook/callback'
    },
    mongo: {
      uri: 'mongodb://reaction:Cyber0gent@kahana.mongohq.com:10022/reaction_dev',
      options: {
        db: {
          native_parser: true
        },
        server: {
          poolSize: 5
        }
      }
    }
  },
  production: {
    facebook: {
      clientID: '570273149750167',
      clientSecret: '24035180906bc470716a3ae33baa8caa',
      callbackURL: 'http://ca-reaction.herokuapp.com/auth/facebook/callback'
    },
    mongo: {
      uri: 'mongodb://reaction:Cyber0gent@kahana.mongohq.com:10022/reaction_dev',
      options: {
        db: {
          native_parser: true
        },
        server: {
          poolSize: 5
        }
      }
    }
  }
};

module.exports = config[process.env.NODE_ENV] || config['dev'];