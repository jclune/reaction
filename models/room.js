var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var RoomSchema = new Schema({
  teams: [
    {type: ObjectId, ref: 'Team'}
  ],
  created_at: {type: Date, default: Date.now()}
});

RoomSchema.post('save', function(room) {
  require('../lib/noti').newRoom(room._id);
});

mongoose.model('Room', RoomSchema);
