
(function($, window, document) {
  $(function main() {
    var layout   = document.getElementById('layout'),
        menu     = document.getElementById('menu'),
        menuLink = document.getElementById('menuLink');

    function toggleClass(element, className) {
        var classes = element.className.split(/\s+/),
            length = classes.length,
            i = 0;

        for(; i < length; i++) {
          if (classes[i] === className) {
            classes.splice(i, 1);
            break;
          }
        }
        // The className is not found
        if (length === classes.length) {
            classes.push(className);
        }

        element.className = classes.join(' ');
    }

    menuLink.onclick = function (e) {
        var active = 'active';

        e.preventDefault();
        toggleClass(layout, active);
        toggleClass(menu, active);
        toggleClass(menuLink, active);
    };

    

    var li = menu.getElementsByTagName('li');
    console.log(menu.getElementsByTagName('li'));

    for (i=0; i < li.length; i++){
        li[i].onclick = function(e){
            e.stopPropagation();

            var lastActive = this.parentNode.getElementsByClassName('menu-item-divided pure-menu-selected');
            if (lastActive){
                lastActive[0].className = "";
            }
            console.log(this);
            this.className = "clicked";

            setTimeout(function(e){
            var active = 'active';
                toggleClass(layout, active);
                toggleClass(menu, active);
                toggleClass(menuLink, active);                
            },300);
        };
    }
    menu.onclick = function (e) {
        var active = 'active';

        //e.preventDefault();
        toggleClass(layout, active);
        toggleClass(menu, active);
        toggleClass(menuLink, active);
    };

  });
}(window.jQuery, window, document));