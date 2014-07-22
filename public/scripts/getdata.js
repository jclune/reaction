(function (name, definition) {
    if (typeof module !== 'undefined') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else {
        this[name] = definition();
    }
})('getdata', function (getdata) {

  'use strict';

  getdata = {version: '0.0.0'};

  var socket = io.connect();
  // hard coded friends for error
  var friends = ['53c75703945748fab4769e23', '53c75703945748fab4769e24'];

  // getdata.put = function(){

  //   var prefix = 'my-';

  //   $.ajax({
  //     url: "/users/my/bio", 
  //     data: "put my bio",
  //     type: "PUT"
  //   }).done(function(result){
  //     console.log("Put result: ", result);
  //   });
  // };

  getdata.get = function(){

    var prefix = 'my-';

    socket.emit('user:info', function(data){
      if (data.error){
        console.log('socket error', data.error);
      }
      setElements(data.user, prefix);
      setFriends(data.user.friends, data.user._id);
    });

    setPicture('my', prefix);
  };

  function setFriends(fids, uid){
    if (!fids){
      fids = friends;
      console.log('use hard coded friends because no user.friends exist');
    }

    fids.forEach(function(fid, i){

      var prefix = 'f'+(i+1)+'-';
      setPicture(fid, prefix);

      if ('user.friends havent logged in'){
        fid = uid || 'couldnt get my id either';
        console.log('use my data for all 3 because friends havent logged in', fid);
      }

      socket.emit('user:info', {id: fid}, function(data){
        if (data.error){
          console.log('socket error', data.error);
        }
        console.log(data.user);
        setElements(data.user, prefix);
      });
    }); 
  }

  function setPicture(fid, prefix){
    if (!fid) fid = 'my';
    var my = prefix || '';
    var elements = document.getElementsByClassName(my+'picture');
    console.log(elements);
    if (elements){
      for (var i=0; i < elements.length; i++){
        elements[i].setAttribute('src', '/users/'+validator.toString(fid)+'/picture');
      }
    } else {
      console.log("document doesn't have elments for: ", my+'picture');
    }
  }

  // finds html class names that match the user data keys
  function setElements(user, prefix){
    //console.log("socket data", data);
    var d = new Date();
    var age = parseInt((d.getTime() - Date.parse(user.facebook.birthday))/1000/60/60/24/365.25);

    console.log(user);

    var data = {
      uid: user._id,
      name: user.name,
      bio: user.bio ||　user.facebook.bio,
      gender: user.gender || user.facebook.gender,
      age: age
    };

    for (var key in data){
      var my = prefix || '';
      var elements = document.getElementsByClassName(my+key);
      if (elements){
        for (var i=0; i < elements.length; i++){
          setElement(elements[i], validator.toString(data[key]));
        }
      } else {
        console.log("document doesn't have elments for: ", my+key);
      }
    }
  }

  function setElement(element, value){
    if ((element) && typeof value !== "undefined"){
      element.innerHTML = value;
      console.log("set element ", element);
      console.log("with value ", value);
    } else {
      console.log("couldn't set element ", element);
      console.log("with value ", value);
    }
  }

  return getdata;

});