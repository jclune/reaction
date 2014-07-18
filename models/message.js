var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  roomId: {type: String, default: ''},
  userId: {type: String, default: ''},
  message: {type: String, default: ''},
  created_at: {type: Date}
});

mongoose.model('Message', MessageSchema);
