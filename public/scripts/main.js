
(function($, window, document) {
  $(function main() {

    var bio = {bio: "my bio"};
    getdata.getMy();
    getdata.getFriends();

    // main.getMy = function(){

    //   // put fake bio info
    //   $.ajax({
    //     url: "/users/my/bio", 
    //     data: bio,
    //     type: "PUT"
    //   }).done(function(result){
    //     console.log("Put result: ", result);
    //   });

    //   // get my profile info
    //   $.get('/users/my/bio', function(data){
    //     var prefix = 'my-';
    //     setElements(data, prefix);
    //   }, 'JSON');

    //   $.get('/users/my/picture', function(data){
    //     var prefix = 'my-';
    //     setElements(data, prefix);
    //   }, 'JSON');
    // };

    // // get my friends profile info
    // var fids = ['53c75703945748fab4769e23', '53c75703945748fab4769e24'];

    // fids.forEach(function(fid, i){

    //   $.get('/users/'+fid+'/bio', function(data){
    //     var prefix = 'f'+i+'-';
    //     setElements(data, prefix);
    //   }, 'JSON');

    //   $.get('/users/'+fid+'/picture', function(data){
    //     var prefix = 'f'+i+'-';
    //     setElements(data, prefix);
    //   }, 'JSON');
    // });

    // // finds html class names that match the json keys
    // function setElements(json, uid){
    //   for (var key in json){
    //     var my = uid || '';
    //     var elements = document.getElementsByClassName(my+key);
    //     if (elements){
    //       for (var i=0; i < elements.length; i++){
    //         setElement(elements[i], validator.toString(json[key]));
    //       }
    //     } else {
    //       console.log("document doesn't have elments for: ", my+key);
    //     }
    //   }
    // }
    // function setElement(element, value){
    //   if ((element) && typeof value !== "undefined"){
    //     element.innerHTML = value;
    //     console.log("set element ", element);
    //     console.log("with value ", value);
    //   } else {
    //     console.log("couldn't set element ", element);
    //     console.log("with value ", value);
    //   }
    // }
    // return main;
  });
}(window.jQuery, window, document));