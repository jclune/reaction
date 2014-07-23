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
  // hard coded mock User
  var mockUser = {
    _id: "53c75703945748fab4769e22",
    __v: 0,
    bio: "I just wanna make friends :)",
    email: "email@gmail.com",
    facebook: {
      bio: "“Life is like riding a bicycle. To keep your balance you must keep moving” -Albert Einstein",
      birthday: "09/27/1988",
      first_name: "First",
      last_name: "Last",
      gender: "male",
      id: "10101353752266468",
      link: "https://www.facebook.com/app_scoped_user_id/10101353752266468/",
      locale: "ja_JP",
      name: "First Last",
      timezone: 9,
      updated_time: "2014-07-19T05:29:17+0000",
      verified: true
    },
    friends: ['53c75703945748fab4769e23', '53c75703945748fab4769e24'],
    gender: "male",
    name: "First Last",
    provider: "facebook",
    username: "username"
  };

  getdata.get = function(){

    var prefix = 'my-';

    socket.emit('user:info', function(err, data){
      console.log("socket started");
      if (err){
        console.log('socket error', err);
      }
      else if (data){
        console.log("my data", data);
        setElements(data, prefix);
        getFriends(data.friends);
      } else {
        console.log('use mock user object because no user exists');
        setElements(mockUser, prefix);
        getFriends(mockUser.friends);
      }
    });

    setPicture('my', prefix);
  };

  function getFriends(fids){
    if (!fids){
      fids = mockUser.friends;
      console.log('use hard coded friends because no user.friends exist');
    }

    fids.forEach( function(fid, i){

      var prefix = 'f'+(i+1)+'-';
      setPicture(fid, prefix);

      socket.emit('user:info', {id: fid}, function(err, data){
        console.log('i=',i);
        if (err){
          console.log('socket error', err);
        }
        if (data) {
          console.log("friend "+prefix, data);
          setElements(data, prefix);
        } else {
          console.log('use mock user object because no user exists');
          setElements(mockUser, prefix);
        }        
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

    var data = {
      uid: user._id,
      name: user.name,
      bio: user.bio ||　user.facebook.bio,
      gender: user.gender || user.facebook.gender,
      age: age,
      className: user.fieldName
    };

    for (var className in data){
      var my = prefix || '';
      var elements = document.getElementsByClassName(my+className);
      if (elements){
        for (var i=0; i < elements.length; i++){
          setElement(elements[i], validator.toString(data[className]));
        }
      } else {
        console.log("document doesn't have elments for: ", my+className);
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