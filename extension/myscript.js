var semanticModules = "cite, time, div, blockquote, sub, em, sup, p, li, td, strong, i, b, span, h1, h2, h3, h4, h5, h6, a, button, footer, label, bdi";
// semanticModules = "img"


var windowWidth = $(window).width();


function background_color_change(index, elem){
  var $this = $(this)
  return $this.css("background-color") != "rgba(0, 0, 0, 0)" &&
  $this.css("background-color") != "none" &&
  $this.css("display") != "none" &&
  $this.css("visibility") != "hidden" &&
  $this.css("background-color") != $(this).parent().css("background-color");
}

function contains_text(index,elem) {
  var immediatelyContainedText = $(this).contents().not($(this).children()).filter(function() {
      return this.nodeType === 3; //Node.TEXT_NODE
    }).text();
  // if ($(this).attr("class") == "_NId") {
  //   console.log("[" + immediatelyContainedText + "]" + (immediatelyContainedText != ""));
  // }
  // replaced whitespace
  return immediatelyContainedText.replace(/\s+/g, '') != "";
}

$(semanticModules).filter(contains_text).addClass('barrier');




// $("span").css('border', 'dashed 3px black');

$("<div id='chrome-pet-box'></div>").appendTo(document.body);
$("<div class='chrome-pet-positioner'></div>").appendTo($("#chrome-pet-box"));
$("<div class='chrome-pet'>^_^</div>").appendTo($(".chrome-pet-positioner"));
$("<div id='collision_illustrator'></div>").appendTo(document.body);
$("<div id='collision_illustrator_2'></div>").appendTo(document.body);

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

function randomizeEmoji(){
  $("#emoji").attr("src", chrome.extension.getURL('emojione/1f6' + ("0" + Math.floor((Math.random() * 40))).slice(-2) + '.png'));
}

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

  // key_tracker = {37:false, 38:false, 39:false, 40:false}
  var old_keydowns = {37:false, 38:false, 39:false, 40:false}
  var keydowns     = {37:false, 38:false, 39:false, 40:false}
  var jump_allowed = true
 /* window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
        keydowns[e.keyCode] = true;
    }
  }, false);

  window.addEventListener("keyup", function(e) {
    // space and arrow keys
    if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
        keydowns[e.keyCode] = false;
    }
  }, false);*/



  var collided = [];
  var last_best_index = -1;
  function timestep() {
    for (var i = 37; i <40; i++) {
      var rand = Math.random();
      var threshold = 0.97;
      if (i == 38) {
        threshold = keydowns[38] ? 0.92 : 0.98
      }
      if (rand > threshold) {
        keydowns[i] = !keydowns[i];
        if (rand > 0.995) {
          randomizeEmoji();
        }
      }
    }


    if (keydowns[39] && !keydowns[37]) {
      vx = 4;
      $("#emoji").css("transform", "rotate(30deg)");
    } else if (keydowns[37] && !keydowns[39]) {
      vx = -4;
      $("#emoji").css("transform", "rotate(-30deg)");
    } else {

      $("#emoji").css("transform", "none");
      if (vx > 0) {
        vx = Math.max(vx - 1, 0);
      } else if (vx < 0) {
        vx = Math.min(vx + 1, 0);
      }
    }
    if (keydowns[38] /*&& !old_keydowns[38]*/ && jump_allowed) {
      vy = -10;
      jump_allowed = false;
    }
    old_keydowns = {37:keydowns[37], 38:keydowns[38], 39:keydowns[39], 40:keydowns[40]}
    // console.log(old_keydowns);
    // console.log("step");
    //physics step: move the box
    var y = parseInt($(".chrome-pet-positioner").css("top"), 10);
    var x = parseInt($(".chrome-pet-positioner").css("left"), 10);

    // var original_x = x;
    // var original_y = y;
    smooth_accumulator += 0.8;
    // uhh
    while (smooth_accumulator > 1) {
      vy += 1;
      smooth_accumulator -= 1.0;
    }
    if (vy > 9) {
      vy = 9;
    }
    if (vy < -9) {
      vy = -9;
    }
    if (vx > 9) {
      vx = 9;
    }
    if (vx < -9) {
      vx = -9;
    }
    // x += vx;
    // y += vy;
    // console.log("x:" + x + " y: " + y);

    // console.log(x + vx);
    var window_top = $(window).scrollTop();
    var window_left = $(window).scrollLeft();
    var window_bottom = window_top + $(window).height();
    var window_right = window_left + $(window).width();
    if (y + vy < window_top) {
      var new_y = window_top;
      vy = new_y - y;
    } else if (y + vy + $(".chrome-pet-positioner").outerHeight() > window_bottom) {
      var new_y = window_bottom - $(".chrome-pet-positioner").outerHeight();
      vy = new_y - y;
      jump_allowed = true
    } else if (x + vx < window_left) {
      var new_x = window_left;
      vx = new_x - x;
      jump_allowed = true
    } else if (x + vx + $(".chrome-pet-positioner").outerWidth() > window_right) {
      var new_x = window_right - $(".chrome-pet-positioner").outerWidth();
      vx = new_x - x;
      jump_allowed = true
    }

    $(".chrome-pet-positioner").css("top", y + vy);
    $(".chrome-pet-positioner").css("left", x + vx);

    // var ox = parseInt($('.chrome-pet-positioner').offset().left, 10);
    // var oy = parseInt($('.chrome-pet-positioner').offset().top, 10);
    // console.log("ox:" + ox + "oy" + oy);

    $barriers = $(".barrier").not(":hidden").slice(0,200);
    // console.log($barriers.size());
    // projecting step


    $barriers.each(function(){
      var position = $(this).offset();
      var size = {height:parseInt($(this).outerHeight(),10), width:parseInt($(this).outerWidth(), 10)};

      // console.log(position);
      // console.log(size);

      position.left = parseInt(position.left, 10);
      position.top = parseInt(position.top, 10);

      // a is true when we are doing vertical bars
      // b is true when we are bottom right
      for (var a = 0; a < 2; a++) {
        for (var b = 0; b < 2; b++) {
          if (0 /* using lines */) {
            var new_position = {left: (a && !b) ? position.left + size.width : position.left,
                                top:  (a || !b) ? position.top : position.top + size.height};
            var new_size = {width: a ? 0 : size.width,
                            height: a ? size.height : 0};
          } else {
            if (a || b) {
              continue;
            } else {
              var new_position = {left: position.left,
                                  top:  position.top};
              var new_size = {width: size.width,
                              height: size.height};
            }
          }


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
            if (best_index != 3) {
              jump_allowed = true;
            }
            // if(~~(best_index / 2) != last_best_index) {
            //   last_best_index = ~~(best_index / 2);
            //   // randomize icon when colliding with a wall facing a different direction
            //   randomizeEmoji();
            // }
            // Change the appropriate coordinate in the appropriate direction.
            var original = parseInt($('.chrome-pet-positioner').css(targets[best_index]), 10);
            // console.log("best_index:" + best_index + " smallest_violation:" + signs[best_index] * smallest_violation);
            var modified = original + signs[best_index] * smallest_violation;
            // console.log(targets[best_index] + " modified by " + signs[best_index] * smallest_violation);
            // console.log(modified + 'px');
            // if (best_index == 0)  {
            //   console.log("a: ", a + " b:" + b);
            //   console.log($(this).parents().map(function(index, elem){
            //     if (elem === undefined) {
            //       return undefined;
            //     }
            //     return $(elem).attr("class") + $(elem).css("position");
            //   }));
            // }
            // $(".highlight").removeClass("highlight");
            // $(this).addClass("highlight");
            $('#collision_illustrator').css("left", new_position.left).css("top", new_position.top).css("width", new_size.width).css("height", new_size.height);
            $('#collision_illustrator_2').css("left", new_position.left).css("top", new_position.top).css("width", new_size.width).css("height", new_size.height);
            if (a == 0) {
              var proposed_left = parseInt($('.chrome-pet-positioner').css("left"), 10);
              var proposed_width = $('.chrome-pet-positioner').width();
              var actual_left = Math.max(parseInt($('.chrome-pet-positioner').css("left"), 10), new_position.left);
              var actual_right = Math.min(proposed_left + proposed_width, new_position.left + new_size.width);
              $('#collision_illustrator_2').css("left", actual_left)
              .css("width", actual_right - actual_left);
            } else {
              var proposed_top = parseInt($('.chrome-pet-positioner').css("top"), 10);
              var proposed_height = $('.chrome-pet-positioner').height();
              var actual_top = Math.max(parseInt($('.chrome-pet-positioner').css("top"), 10), new_position.top);
              var actual_bottom = Math.min(proposed_top + proposed_height, new_position.top + new_size.height);
              $('#collision_illustrator_2').css("top", actual_top)
              .css("height", actual_bottom - actual_top);
            }
            // console.log(violations);
            $('.chrome-pet-positioner').css(targets[best_index], modified + 'px');
            var new_x = parseInt($('.chrome-pet-positioner').offset().left, 10);
            var new_y = parseInt($('.chrome-pet-positioner').offset().top, 10);
            // $('#position_illustrator').css("width", new_x + 'px');
            // $('#position_illustrator').css("height", new_y + 'px');
            // console.log(original_y + ' ' + y);
            // velocity update
            vx = 0; //new_x - x;
            vy = 0;//new_y - y;
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
    // console.log($temp.offset().left + " " + new_x);
    $('#bad_position_illustrator').css("width", new_x + 'px');
    $('#bad_position_illustrator').css("height", new_y + 'px');

    $temp.remove();

    setTimeout(timestep, 30);
  }
  timestep();
})();