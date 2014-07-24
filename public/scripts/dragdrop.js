/*
* 20140522
*
* Copyright (c) 2014 Justin Clune
*/
(function (name, definition) {
    if (typeof module !== 'undefined') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else {
        this[name] = definition();
    }
})('dragdrop', function (dragdrop) {

    'use strict';

    dragdrop = {version: '0.0.0'};

    var ul = document.getElementById("matches");
    //start out in full screen
    var width = 310;
    var marginLeft = 0;

    var socket = io.connect();
    var teamId;



    // -------------- GET THE TEAM DATA ----------------------------

    function getTeams(){
        console.log("start getting teams");
        socket.emit('matching:randomTeams', {
          id: teamId
        }, function(err, teams) {
          console.log(err, teams);
          teams.forEach(function(team, i) {
            addTeam(team, i);
          });
        });
    }

    function addTeam(team, i){
        console.log("add team #"+i, team);
        var li = document.createElement("li");
        li.className = "card boxShadow";
        li.id = team._id;
        ul.appendChild(li);
        //must have marginLeft defined
        //console.log(li.style.marginLeft);
        if (!li.style.marginLeft) {
            li.style.marginLeft = marginLeft + "px";
        }
        if (!li.style.marginTop) {
            li.style.marginTop = marginLeft + "px";
        }
        //console.log(li.style.marginLeft);
        addListeners(li);

        team.members.forEach( function(user, j){
            createElements(li, function(div){
                addUser(div, user, j);
            });
        });
    }
    
    function createElements(li, cb){
        var div = document.createElement("div");
        div.className = "clearfix";
        li.appendChild(div);

        var img = document.createElement("img");
        img.className = "left picture";
        div.appendChild(img);

        var span = document.createElement("span");
        span.className = "left profile";
        div.appendChild(span);

        var topline = document.createElement("div");
        topline.className = "topline clearfix";
        var s1 = "<span class='left'><h5 class='";
        var s2 = "'></h5></span>";
        topline.innerHTML = s1+'name'+s2+s1+'age'+s2+s1+'gender'+s2;
        span.appendChild(topline);

        var p = document.createElement("p");
        p.className = "bio";
        span.appendChild(p);

        cb(div);
    }

    function addUser(div, uid, j){

        socket.emit('user:info', {id: uid}, function(err, user){
            console.log('j=',j);
            if (err){
              console.log('socket error', err);
            }
            else {
              console.log("member #"+j, user);

              var img = div.getElementsByClassName('picture');
              img[0].setAttribute('src', '/users/'+validator.toString(uid)+'/picture');

              var d = new Date();
              var age = parseInt((d.getTime() - Date.parse(user.facebook.birthday))/1000/60/60/24/365.25);

              var data = {
                name: user.name,
                bio: user.bio ||　user.facebook.bio,
                gender: user.gender || user.facebook.gender,
                age: age
              };

              for (var className in data){
                var elements = div.getElementsByClassName(className);
                console.log("changing element ", elements[0]);
                console.log("with data ", data[className]);
                if (elements){
                    elements[0].innerHTML = validator.toString(data[className]);
                } else {
                    console.log("document doesn't have elments for: ", className);
                }
              }
            }
        });
    }



    //-----------------PLAY WITH THE TEAMS!-----------------

    var startX;
    var startY;
    var startML;
    var startMT;
    var touch;

    function buttonListeners() {

        var love = document.getElementsByClassName("passBtn");
        love[0].addEventListener("click", function() {
            //console.log(ul.children[0]);
            lovehate(ul.children[0], -1);
        }, false);
        var hate = document.getElementsByClassName("likeBtn");
        hate[0].addEventListener("click", function() {
            //console.log(ul.children[0]);
            lovehate(ul.children[0], 1);
        }, false);
    }

    function addListeners(element) {
        element.addEventListener("touchstart", function() {
            touchstart(event, element);
        }, false);
        element.addEventListener("touchmove", function() {
            touchmove(event, element);
        }, false);
        element.addEventListener("touchend", function() {
            touchend(event, element);
        }, false);
        element.addEventListener("mousedown", function() {
            touchstart(event, element, "mouse");
        }, false);
        element.addEventListener("mousemove", function() {
            touchmove(event, element, "mouse");
        }, false);
        // element.addEventListener("mouseup", function() {
        //     touchend(event, element, "mouse");
        // }, false);
    }

    function touchstart(event, element, mouse) {
        //console.log(element.style.marginLeft);
        if (mouse){
            touch = event;
        }else{
            touch = event.changedTouches[0] || event.touches[0];
        }
        startX = touch.clientX;
        startY = touch.clientY;
        startML = parseInt(element.style.marginLeft);
        startMT = parseInt(element.style.marginTop);
        // event.preventDefault();
        // event.stopPropagation();
    }

    function touchmove(event, element, mouse) {
        if (mouse){
            touch = event;
            if (Math.abs(touch.clientX - startX) > 200 ){
                console.log("nudge");
                touchend(event, element, mouse);
            }
        }else{
            touch = event.changedTouches[0] || event.touches[0];
        }
        var x = touch.clientX - startX;
        var y = touch.clientY - startY;
        element.style.marginLeft = (startML + x) + "px";

        //disables scroll
        event.preventDefault();
        var threshold = 0;
        if (Math.abs(x) > threshold) {
            //event.preventDefault();
            element.style.marginTop = (startMT + y) + "px";
            var deg = Math.atan(y / x) * 180 / Math.PI;
            var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

            deg = deg*z / 200;
            if (deg < -30) {
                deg = -30;
            } else if (deg > 30) {
                deg = 30;
            }
            element.style.webkitTransform = "rotate(" + deg + "deg)";
            z = z / width / 2 + 1;
            //console.log("scale(" + z + ", " + z + ")");
            element.style.webkitTransform = "scale(" + z + ", " + z + ")" + " rotate(" + deg / -4 + "deg)";
            //console.log(deg);

        }
        event.stopPropagation();
    }

    function touchend(event, element, mouse) {
        if (mouse){
            touch = event;
        }else{
            touch = event.changedTouches[0] || event.touches[0];
        }
        var x = touch.clientX - startX;
        var y = touch.clientY - startY;
        var threshold = 100;
        var deg = Math.atan(y / x) * 180 / Math.PI;
        if (deg < -30) {
            deg = -30;
        } else if (deg > 30) {
            deg = 30;
        }

        if (Math.abs(x) < threshold) {
            nudge(element);
        } else {
            lovehate(element);
        }
    }

    function nudge(element) {
        if (!startML) {
            startML = 0;
        }
        if (!startMT) {
            startMT = 0;
        }
        var $elem = $(element);

        $elem.animate({
            "marginLeft": startML,
            "marginTop": startMT
        }, {
            step: function(now, fx) {
                $elem.css("-webkit-transform", "scale(1,1) rotate(" + 0 + "deg)");
            },
            "duration": 500,
            "specialEasing": "easeOutQuad",
            complete: function() {
                console.log("animation done!");
            }
        });

    }

    function lovehate(element, buttonSign) {
        var sign;
        var match_teamId = element.id;

        if (buttonSign) {
            sign = buttonSign;
        } else if (touch) {
            sign = 1 * ((touch.clientX - startX) > 0) || -1 * ((touch.clientX - startX) < 0);
        } else {
            console.log("ran lovehate without an event");
        }

        $(element).animate({
            "marginLeft": sign * (width + 20) + "px",
            "webkitTransform": "rotate(90deg)"
        }, {
            "duration": 200,
            "specialEasing": "easeInExpo",
            complete: function() {
                //console.log("animation done!");
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                // match : sign 1(love) or -1(hate)
                console.log('my_team:', teamId);
                console.log('match_team:', match_teamId);

                if (sign === 1) {
                  socket.emit('matching:addToFavorites', {
                    my_team: teamId,
                    match_team: match_teamId
                  }, function(err, result) {
                    if (ul.children.length <= 1) {
                      getTeams();
                      console.log('another API request');
                    }
                  });  
                } else {
                  socket.emit('matching:addToDislikes', {
                    my_team: teamId,
                    match_team: match_teamId
                  }, function(err, result) {
                    if (ul.children.length <= 1) {
                      getTeams();
                      console.log('another API request');
                    }
                  }); 
                }
            }
        });
    }


    dragdrop.init = function(ID){

      teamId = ID;
      console.log(teamId);

      // change title
      var title = $('#title');
      title.text('');

      socket.emit('team:info',{
        id: teamId
      }, function(err, team) {
        if (err) throw err;
        team.members.forEach(function(member) {
          socket.emit('user:info', {
            id: member
          }, function(err, user) {
            if (err) throw err;
            var text = title.text() + ' ' + user.name;
            title.text(text);
          });
        });
      });

      getTeams();
      buttonListeners();
    };

    return dragdrop;
});
