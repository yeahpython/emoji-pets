var semanticModules = "cite, time, div, blockquote, sub, em, sup, p, li, td, strong, i, b, span, h1, h2, h3, h4, h5, h6, a, button";




$(semanticModules).each(function(){
  /*var immediatelyContainedText = $(this).contents().not($(this).children()).filter(function() {
      return this.nodeType === 3; //Node.TEXT_NODE
    }).text();
  if (immediatelyContainedText != "" || $(this).css("background-image") != "none") {
    //$(this).css('border', 'solid 1px black');
    $(this).css('background-color', 'rgba(255,0,0,0.05)');
  } else {
    //console.log(immediatelyContainedText)
  }*/
  // detect change in background color
  if ( $(this).css("background-color") != "rgba(0, 0, 0, 0)" &&
       $(this).css("background-color") != "none" &&
       $(this).css("background-color") != $(this).parent().css("background-color")) {
    $(this).css('border', 'dashed 3px black');
    //console.log($(this).css("background-color") + "|" + $(this).parent().css("background-color"));
  }
});

// $("span").css('border', 'dashed 3px black');

$("<div id='chrome-pet-box'>Hello</div>").appendTo(document.body);
$("<div class='chrome-pet-positioner'></div>").appendTo($("#chrome-pet-box"));
$("<div class='chrome-pet'>^_^</div>").appendTo($(".chrome-pet-positioner"));

// function addEvent(element, eventName, callback) {
//     if (element.addEventListener) {
//         element.addEventListener(eventName, callback, false);
//     } else if (element.attachEvent) {
//         element.attachEvent("on" + eventName, callback);
//     } else {
//         element["on" + eventName] = callback;
//     }
// }

(function(){
  var x = 100;
  var y = 100;
  var vx = 0;
  var vy = 0;

  // $(document).keydown(function (e) {
  //   e.stopPropagation();
  //   console.log("hi");
  //     e = e || window.event;
  //     // use e.keyCode
  //     if (e.keyCode == 39) {
  //       console.log("yo");
  //       vx += 1;
  //     } else if (e.keyCode == 37) {
  //       vx -= 1;
  //     }
  // });

  window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
        if (e.keyCode == 39) {
          console.log("yo");
          vx += 1;
          $(".chrome-pet").text(">_>")
        } else if (e.keyCode == 37) {
          vx -= 1;
          $(".chrome-pet").text("<_<")
        } else if (e.keyCode == 38) {
          vy = -5;
          $(".chrome-pet").text("^_^")
        }
    }
  }, false);


  function timestep() {
    vy += 1;
    if (vy > 5) {
      vy = 5;
    }
    if (vy < -10) {
      vy = -10;
    }
    if (vx > 3) {
      vx = 3;
    }
    if (vx < -5) {
      vx = -5;
    }

    x += vx;
    y += vy;
    $(".chrome-pet-positioner").css("top", y);
    $(".chrome-pet-positioner").css("left", x);

    setTimeout(timestep, 30);
  }
  timestep();
})();