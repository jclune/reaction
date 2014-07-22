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

    var ul = document.getElementById("photos");
    //start out in full screen
    var width = 310;
    var marginLeft = 5;

    //-----------------GET THE PHOTOS!-----------------
    var options = {};
    options.url = 'https://api.flickr.com/services/rest/';
    options.method = 'GET';
    options.params = {
        method: 'flickr.photos.search',
        per_page: 15,
        text: 'bikini',
        api_key: '3e53c0f0f82059213050c4e8f2ad111d',
        format: 'json',
        nojsoncallback: 1
    };

    function requestSearch(options) {
        console.log("start ajax with search: " + options.params.text);
        $.ajax({
            type: options.method,
            url: options.url,
            data: options.params,
        }).done(function(data) {
            getPhotos(data);
        }).error(function() {
            var h2 = document.createElement("h2");
            h2.innerHTML = "API error";
            document.getElementById("container").appendChild(h2);
        });
    }
    

    var refresh = 0; //counter for first 2 li
    function getPhotos(data) {
        // get the photo array and append images. reset if theres an old arrray
        var photos = data.photos.photo;
        photos.forEach(function(i) {
            var img = document.createElement("img");
            //img.style.width = width + "px";
            img.src = "http://farm" + i.farm + ".staticflickr.com/" +
                i.server + "/" + i.id + "_" + i.secret + "_z.jpg";

            var li;
            //append images to first li (to see gray canvas with load bar)   
            if (refresh++ === 0) {
                console.log("refresh is " + refresh);
                li = document.getElementById("loading");
                li.appendChild(img);
                li.removeAttribute("style");
            } else {
                //console.log("normal li");
                li = document.createElement("li");
                ul.appendChild(li);
                li.appendChild(img);
            }
            li.style.height = img.style.height;
            li.className = li.className + " boxShadow";

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
        });
    }

    //-----------------PLAY WITH PHOTOS!-----------------

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

        var threshold = 20;
        if (Math.abs(x) > threshold) {
            event.preventDefault();
            element.style.marginTop = (startMT + y) + "px";
            var deg = Math.atan(y / x) * 180 / Math.PI;
            deg = deg / 4;
            if (deg < -20) {
                deg = -20;
            } else if (deg > 20) {
                deg = 20;
            }
            element.style.webkitTransform = "rotate(" + deg + "deg)";
            var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
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
            }
        });

        //infinite supply of photos
        console.log(ul.children.length);
        if (ul.children.length === 10) {
            options.params.per_page = 6;
            requestSearch(options);
            console.log("another API");
        }
    }


    dragdrop.init = function(){
        requestSearch(options);
        buttonListeners();
    };

    return dragdrop;
});