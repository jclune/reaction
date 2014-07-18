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

  var mybio = {bio: "put my bio"};
  var friends = ['53c75703945748fab4769e23', '53c75703945748fab4769e24'];

  getdata.putMy = function(){

    var prefix = 'my-';
    // put fake bio info
    $.ajax({
      url: "/users/my/bio", 
      data: mybio,
      type: "PUT"
    }).done(function(result){
      console.log("Put result: ", result);
    });
  }

  getdata.getMy = function(){

    var prefix = 'my-';
    // get my profile info
    $.get('/users/my/bio', function(data){
      setElements(data, prefix);
    }, 'JSON');
    // var socket = io.connect();
    // socket.emit('user:fields', {id: 'my', fields: 'bio'}, function(data){
    //   setElements(data, prefix);
    // });

    setPicture('my', prefix);
  };

  getdata.getFriends =function(fids){
    if (!fids){
      fids = friends;
      console.log('used hard coded friends');
    }

    fids.forEach(function(fid, i){

      var prefix = 'f'+(i+1)+'-';

      $.get('/users/'+fid+'/bio', function(data){
        setElements(data, prefix);
      }, 'JSON');

      setPicture(fid, prefix);
    }); 
  };

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

  // finds html class names that match the json keys
  function setElements(json, prefix){
    for (var key in json){
      var my = prefix || '';
      var elements = document.getElementsByClassName(my+key);
      if (elements){
        for (var i=0; i < elements.length; i++){
          setElement(elements[i], validator.toString(json[key]));
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