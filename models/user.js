var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var moment = require('moment');

var UserSchema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  username: { type: String, default: '' },
  gender: {type: String, default: ''},
  bio: {type: String, default: ''},
  birthday: {type: Date},
  provider: { type: String, default: '' },
  authToken: { type: String, default: '' },
  facebook: {},
  friends: [
    {type: ObjectId, ref: 'User'}
  ],
  created_at: {type: Date}
});

UserSchema.virtual('age').get(function () {
  if(!this.birthday) return null;
  return new moment().diff(this.birthday, 'years');
});

mongoose.model('User', UserSchema);