(function () {

  var store = {};

  /**
   * ソケットを保存する
   * @param uid ユーザーID
   * @param socket ソケット
   */
  exports.put = function (uid, socket) {
    uid = uid.toString();
    store[uid] = (store[uid] || []).concat(socket);
    console.log("PUT", store);
  };

  /**
   * ソケットを取得する
   * @param uid ユーザーID
   * @returns {*|Array} ソケットのリスト
   */
  exports.get = function (uid) {
    uid = uid.toString();
    return store[uid] || [];
  };

  /**
   * ソケットを削除する
   * @param socket
   */
  exports.removeSocket = function (socket) {
    for (var key in store) {
      if (!store.hasOwnProperty(key)) {
        continue;
      }
      var idx = store[key].indexOf(socket);
      if (idx != -1) {
        store[key].splice(idx, 1);
      }
      if (store[key].length === 0) {
        delete store[key];
      }
    }
  };

  /**
   * ユーザーのソケットを全部削除する
   * @param uid
   */
  exports.removeUser = function (uid) {
    delete store[uid];
  };

}).call(this);