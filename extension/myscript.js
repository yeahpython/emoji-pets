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
       $(this).css("display") != "none" &&
       $(this).css("visibility") != "hidden" &&
       $(this).css("background-color") != $(this).parent().css("background-color")) {
    $(this).css('border', 'dashed 3px black');
  $(this).addClass('barrier');
    //console.log($(this).css("background-color") + "|" + $(this).parent().css("background-color"));
  }
});

// $("span").css('border', 'dashed 3px black');

$("<div id='chrome-pet-box'>Hello</div>").appendTo(document.body);
$("<div class='chrome-pet-positioner'></div>").appendTo($("#chrome-pet-box"));
$("<div class='chrome-pet'>^_^</div>").appendTo($(".chrome-pet-positioner"));
$("<div id='collision_illustrator'></div>").appendTo(document.body);
$("<div id='position_illustrator'></div>").appendTo(document.body);
$("<div id='bad_position_illustrator'></div>").appendTo(document.body);


$(".chrome-pet").text("");
$("<img id='emoji'></img>").attr("src", chrome.extension.getURL('emojione/1f600.png')).appendTo($(".chrome-pet"));

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

  $('.chrome-pet-positioner').css("left", Math.floor(Math.random() * $(window).width()) + 'px');
  $('.chrome-pet-positioner').css("top", Math.floor(Math.random() * $(window).height()) + 'px');
  // var x = 100;
  // var y = 100;
  var vx = 0;
  var vy = 0;
  smooth_accumulator = 0.0

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
          vx += 2;
          // $(".chrome-pet").text(">_>")
        } else if (e.keyCode == 37) {
          vx -= 2;
          // $(".chrome-pet").text("<_<")
        } else if (e.keyCode == 38) {
          vy = -10;
          $("#emoji").attr("src", chrome.extension.getURL('emojione/1f6' + ("0" + Math.floor((Math.random() * 45))).slice(-2) + '.png')).appendTo($(".chrome-pet"));
          // $(".chrome-pet").text("^_^")
        }
    }
  }, false);


  var collided = [];

  function timestep() {
    // console.log("step");
    //physics step: move the box
    var y = parseInt($(".chrome-pet-positioner").css("top"), 10);
    var x = parseInt($(".chrome-pet-positioner").css("left"), 10);

    // var original_x = x;
    // var original_y = y;
    smooth_accumulator += 0.4;
    if (smooth_accumulator > 1) {
      vy += 1;
      smooth_accumulator = 0.0;
    }
    if (vy > 10) {
      vy = 10;
    }
    if (vy < -10) {
      vy = -10;
    }
    if (vx > 10) {
      vx = 10;
    }
    if (vx < -10) {
      vx = -10;
    }
    // x += vx;
    // y += vy;
    // console.log("x:" + x + " y: " + y);

    // console.log(x + vx);

    $(".chrome-pet-positioner").css("top", y + vy);
    $(".chrome-pet-positioner").css("left", x + vx);

    // var ox = parseInt($('.chrome-pet-positioner').offset().left, 10);
    // var oy = parseInt($('.chrome-pet-positioner').offset().top, 10);
    // console.log("ox:" + ox + "oy" + oy);

    $barriers = $(".barrier").not(":hidden").slice(0,50);
    console.log($barriers.size());
    // projecting step
    $barriers.each(function(){
      var position = $(this).offset();
      var size = {height:parseInt($(this).outerHeight(),10), width:parseInt($(this).outerWidth(), 10)};

      // console.log(position);
      // console.log(size);

      position.left = parseInt(position.left, 10);
      position.top = parseInt(position.top, 10);

      // a is true when we are doing vertical bars
      // b is true when we are top left
      for (var a = 0; a < 2; a++) {
        for (var b = 0; b < 2; b++) {
          var new_position = {left: (a && !b) ? position.left + size.width : position.left,
                              top:  (a || !b) ? position.top : position.top + size.height};
          var new_size = {width: a ? 0 : size.width,
                          height: a ? size.height : 0};


          // console.log("block: " + new_position);
          // console.log("block size: " + new_size);



          var violations = [];
          var signs = [-1, 1, -1, 1];
          var targets = ["left", "left", "top", "top"];


          var left = parseInt($('.chrome-pet-positioner').offset().left, 10);
          var width = parseInt($('.chrome-pet-positioner').outerWidth(), 10)
          var top = parseInt($('.chrome-pet-positioner').offset().top, 10);
          var height = parseInt($('.chrome-pet-positioner').outerHeight(), 10)

          // console.log("left " + left);
          // console.log("width " + width);
          // console.log("top" + top);
          // console.log("height" + height);

          // console.log((new_position.left));
          // conso + new_size.width));

          violations.push(left + width - new_position.left);
          violations.push((new_position.left + new_size.width) - left);
          violations.push(top + height - new_position.top);
          violations.push((new_position.top + new_size.height) - top);

          // either there are no violations, or we can find
          // the smallest positive number in the list
          var smallest_violation = 0;
          var best_index = -1;
          for (var i = 0; i < 4; i++) {
            if (best_index == -1 || violations[i] < smallest_violation) {
              smallest_violation = violations[i];
              best_index = i;
            }
          }

          if (smallest_violation > 0) {
            // Change the appropriate coordinate in the appropriate direction.
            var original = parseInt($('.chrome-pet-positioner').css(targets[best_index]), 10);
            // console.log("best_index:" + best_index + " smallest_violation:" + signs[best_index] * smallest_violation);
            var modified = original + signs[best_index] * smallest_violation;
            // console.log(targets[best_index] + " modified by " + signs[best_index] * smallest_violation);
            // console.log(modified + 'px');
            if (best_index == 0)  {
              console.log("a: ", a + " b:" + b);
              console.log($(this).parents().map(function(index, elem){
                if (elem === undefined) {
                  return undefined;
                }
                return $(elem).attr("class") + $(elem).css("position");
              }));
            }
            $('#collision_illustrator').css("left", new_position.left).css("top", new_position.top).css("width", new_size.width).css("height", new_size.height);
            // console.log(violations);
            $('.chrome-pet-positioner').css(targets[best_index], modified + 'px');
            var new_x = parseInt($('.chrome-pet-positioner').offset().left, 10);
            var new_y = parseInt($('.chrome-pet-positioner').offset().top, 10);
            // $('#position_illustrator').css("width", new_x + 'px');
            // $('#position_illustrator').css("height", new_y + 'px');
            // console.log(original_y + ' ' + y);
            // velocity update
            vx = new_x - x;
            vy = new_y - y;
          }
        }
      }
    })

    var new_x = parseInt($('.chrome-pet-positioner').offset().left, 10);
    var new_y = parseInt($('.chrome-pet-positioner').offset().top, 10);
    $('#position_illustrator').css("width", new_x + 'px');
    $('#position_illustrator').css("height", new_y + 'px');

    var $temp = $('.chrome-pet-positioner').clone().css("left", new_x).css("top", new_y).appendTo("#chrome-pet-box");

    new_x = parseInt($temp.offset().left, 10);
    new_y = parseInt($temp.offset().top, 10);
    console.log($temp.offset().left + " " + new_x);
    $('#bad_position_illustrator').css("width", new_x + 'px');
    $('#bad_position_illustrator').css("height", new_y + 'px');

    $temp.remove();

    setTimeout(timestep, 30);
  }
  timestep();
})();