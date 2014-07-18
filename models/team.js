var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var TeamSchema = new Schema({
  members: [
    {type: ObjectId, ref: 'User'}
  ],
  created_by: {type: ObjectId, ref: 'User'},
  created_at: {type: Date, default: Date.now()},
  favorites: [
    {type: ObjectId, ref: 'Team'}
  ]
});

/* Static Method */

/**
 * ユーザーのTeamsを取得
 * @param userId
 * @param callback
 */
TeamSchema.statics = {
  findListByUserId: function (userId, callback) {
    return this.find({members: userId})
      .exec(callback);
  }
};

/* Validation */

TeamSchema.path('members').validate(function (members) {
  return members.length === 3;
}, 'Size of members must be 3');

mongoose.model('Team', TeamSchema);