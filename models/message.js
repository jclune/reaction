var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var MessageSchema = new Schema({
  room: {type: ObjectId, ref: 'Room'},
  user: {type: ObjectId, ref: 'User'},
  message: {type: String, default: ''},
  created_at: {type: Date}
});

mongoose.model('Message', MessageSchema);
