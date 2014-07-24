var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var _ = require('underscore');

var NotificationType = {
  NEW_TEAM: 'new_team',
  NEW_ROOM: 'new_room',
  NEW_MESSAGE: 'new_message',
  NEW_FRIEND: 'new_friend'
};

var NotificationSchema = new Schema({
  type: {type: String, enum: _.values(NotificationType), required: true}, // 通知のタイプ
  user: {type: ObjectId, ref: 'User', required: true}, // 受信ユーザー
  payload: {}, // 通知内容
  dismissed: {type: Boolean, default: false},
  created_at: {type: Date, default: Date.now()} // 作成日付
});

mongoose.model('Notification', NotificationSchema);