
(function($, window, document) {
  $(function main() {

    // edit profile
    var mybio = "my bio";
    var myname = "Justin Clune";
    var myphoto = "#";
    var myage = "25";

    var data = {bio: mybio};

    // put fake profile info in bio
    $.ajax({
      url: "/users/my/bio", 
      data: data,
      type: "PUT"
    }).done(function(result){
      console.log("Result: ", result);
    });

    // get profile info
    $.get('/users/my/bio', function(data){
      console.log(data);
      for (key in data){

        function setData(element){
          if (element && element.tagName === "image"){
            element.setAttribute("src", data[key]);
          } else if (element){
            console.log("set value ", data[key]);
            element.innerHTML = data[key];
          } else {
            console.log("document doesn't have elments for: ", key);
          }
        }
        var elements = document.getElementsByClassName("my"+key);
        if (elements){
          for (var i=0; i < elements.length; i++){
            setData(elements[i]);
          }
        } else {
          console.log("document doesn't have elments for: ", key);
        }
      }
      
    }, 'JSON');

    $.get('/users/my/picture', function(data){
      console.log(data);
      for (key in data){

        function setData(element){
          if (element && element.tagName === "image"){
            element.setAttribute("src", data[key]);
          } else if (element){
            console.log("set value ", data[key]);
            element.innerHTML = data[key];
          } else {
            console.log("document doesn't have elments for: ", key);
          }
        }
        var elements = document.getElementsByClassName("my"+key);
        if (elements){
          for (var i=0; i < elements.length; i++){
            setData(elements[i]);
          }
        } else {
          console.log("document doesn't have elments for: ", key);
        }
      }
      
    }, 'JSON');
  });
}(window.jQuery, window, document));