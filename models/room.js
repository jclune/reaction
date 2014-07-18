var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var RoomSchema = new Schema({
  teams: [
    {type: ObjectId, ref: 'Team'}
  ],
  created_at: {type: Date}
});

mongoose.model('Room', RoomSchema);
