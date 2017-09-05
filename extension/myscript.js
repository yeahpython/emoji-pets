
var active = false;
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action == 'toggle_emoji') {
    active = !active;
    if (active == true) {
      addEmoji();
    }
  }
});

function addEmoji(){
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

  $(semanticModules).filter(contains_text).addClass('emoji-extension-barrier');




  // $("span").css('border', 'dashed 3px black');

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


  $("<div id='chrome-pet-box'></div>").appendTo(document.body);
  $("<div class='chrome-pet-positioner'></div>").appendTo($("#chrome-pet-box"));
  $("<div class='chrome-pet'>^_^</div>").appendTo($(".chrome-pet-positioner"));


  $(".chrome-pet").text("");
  $("<img id='emoji'></img>").attr("src", chrome.extension.getURL('emojione/1f600.png')).appendTo($(".chrome-pet"));

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

    $barriers = $(".emoji-extension-barrier").not(":hidden").slice(0,200);
    // console.log($barriers.size());
    // projecting step


    var signs = [-1, 1, -1, 1];
    var targets = ["left", "left", "top", "top"];

    var pet_width = parseInt($('.chrome-pet-positioner').outerWidth(), 10);
    var pet_height = parseInt($('.chrome-pet-positioner').outerHeight(), 10);
    $barriers.each(function(){
      var position = $(this).offset();
      var new_position = {left: parseInt(position.left, 10),
                          top:  parseInt(position.top, 10)};
      var new_size = {width: parseInt($(this).outerWidth(), 10),
                      height: parseInt($(this).outerHeight(),10)};


      var violations = [];


      var pet_offset = $('.chrome-pet-positioner').offset()
      var pet_left = parseInt(pet_offset.left, 10);
      var pet_top = parseInt(pet_offset.top, 10);

      violations.push(pet_left + pet_width - new_position.left);
      violations.push((new_position.left + new_size.width) - pet_left);
      violations.push(pet_top + pet_height - new_position.top);
      violations.push((new_position.top + new_size.height) - pet_top);

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
        var original = parseInt($('.chrome-pet-positioner').css(targets[best_index]), 10);
        var modified = original + signs[best_index] * smallest_violation;

        $('.chrome-pet-positioner').css(targets[best_index], modified + 'px');
        vx = 0;
        vy = 0;
      }

    })
    if (active) {
      setTimeout(timestep, 30);
    } else {
      $("#chrome-pet-box").remove();
    }
  }
  timestep();
};