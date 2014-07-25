var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var UserTeamSchema = new Schema({
  user: {type: ObjectId},
  team: {type: ObjectId}
});

mongoose.model('UserTeam', UserTeamSchema);
