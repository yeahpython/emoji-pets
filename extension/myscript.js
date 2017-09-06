
var active = false;
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action == 'toggle_emoji') {
    active = !active;
    if (active == true) {
      addEmoji();
    }
  }
});


// modified from https://stackoverflow.com/questions/35939886/find-first-scrollable-parent
// Actually looking for the thing that will control my movement
function getScrollParent(element, includeHidden) {
  if (element == null) {
    return null;
  }
  var style = getComputedStyle(element);
  var excludeStaticParent = style.position === "absolute";
  var overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

  if (style.position === "fixed") return element;
  for (var parent = element; (parent = parent.parentElement);) {
      style = getComputedStyle(parent);
      if (excludeStaticParent && style.position === "static") {
          continue;
      }
      if (style.position === "fixed" || overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent;
  }

  return document.body;
}

function addEmoji(){
  // var semanticModules = "cite, time, div, blockquote, sub, em, sup, p, li, td, strong, i, b, span, h1, h2, h3, h4, h5, h6, a, button, footer, label, bdi";
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
    if (["VIDEO", "IMG"].indexOf($(this).prop("tagName")) != -1) {
      return true;
    }
    var immediatelyContainedText = $(this).contents().not($(this).children()).filter(function() {
        return this.nodeType === 3; //Node.TEXT_NODE
      }).text();
    // if ($(this).attr("class") == "_NId") {
    //   console.log("[" + immediatelyContainedText + "]" + (immediatelyContainedText != ""));
    // }
    // replaced whitespace
    return immediatelyContainedText.replace(/\s+/g, '') != "";
  }

  // $(semanticModules).filter(contains_text).addClass('emoji-extension-barrier');




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
    // $("#emoji").attr("src", chrome.extension.getURL('emojione/1f6' + ("0" + Math.floor((Math.random() * 40))).slice(-2) + '.png'));
    $("#emoji").html("&#" + (128513 + Math.floor(Math.random() * (128567 - 128513))) + ";");
  }


  $("<div id='chrome-pet-box'></div>").appendTo(document.body);
  $("<div class='chrome-pet-positioner'></div>").appendTo($("#chrome-pet-box"));
  $("<div class='chrome-pet'>^_^</div>").appendTo($(".chrome-pet-positioner"));


  $(".chrome-pet").text("");
  $("<div id='emoji'></div>").appendTo($(".chrome-pet"));
  randomizeEmoji();
  // $("<img id='emoji'></img>").attr("src", chrome.extension.getURL('emojione/1f600.png')).appendTo($(".chrome-pet"));

  $('.chrome-pet-positioner').css("left", $(window).scrollLeft() + Math.floor($(window).width()/2));
  $('.chrome-pet-positioner').css("top", $(window).scrollTop() + Math.floor($(window).height()/2));
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
  // var old_keydowns = {37:false, 38:false, 39:false, 40:false}
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
  var last_support_left = 0;
  var last_support_top = 0;
  function timestep() {
    // Randomly change motion and appearance
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

    // Set velocity based on keystrokes
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
    // store previous state of keys
    // old_keydowns = {37:keydowns[37], 38:keydowns[38], 39:keydowns[39], 40:keydowns[40]}
    // console.log(old_keydowns);
    // console.log("step");
    //physics step: move the box

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


    var y = $(".chrome-pet-positioner").offset().top;
    var x = $(".chrome-pet-positioner").offset().left;
    // console.log("y" + y);
    // Project the emoji into view
    var window_top = $(window).scrollTop();
    var window_left = $(window).scrollLeft();
    var window_bottom = window_top + $(window).height();
    var window_right = window_left + $(window).width();


    var center_x = x - $(window).scrollLeft() + $("#emoji").width()/2;
    var center_y = y - $(window).scrollTop() + $("#emoji").height()/2;
    var elem = document.elementFromPoint(center_x, center_y);

    $(".highlight").removeClass("highlight");
    var dx = 0;
    var dy = 0;
    // if (elem != null) {
    //   $(elem).addClass("highlight");

    //   var elem_offset = $(elem).offset();
    //   // modify compensation term if necessary
    //   if ($(elem).hasClass("last_support")) {

    //     dx = elem_offset.left - last_support_left;
    //     dy = elem_offset.top - last_support_top;
    //   } else {
    //     // change last support
    //     $(".last_support").removeClass("last_support");
    //     $(elem).addClass("last_support");
    //   }
    //   // console.log(elem);
    //   last_support_left = elem_offset.left;
    //   last_support_top = elem_offset.top;
    // } else {
    //   $(".last_support").removeClass("last_support");
    // }

    // change reference position
    x = x + dx;
    y = y + dy;
    var new_y = y + vy;
    var new_x = x + vx;
    if (new_y < window_top) {
      new_y = window_top;
      vy = new_y - y;
    } else if (new_y + $("#emoji").outerHeight() > window_bottom) {
      new_y = window_bottom - $("#emoji").outerHeight();
      vy = new_y - y;
      jump_allowed = true
    } else if (new_x < window_left) {
      new_x = window_left;
      vx = new_x - x;
      jump_allowed = true
    } else if (new_x + $("#emoji").outerWidth() > window_right) {
      new_x = window_right - $("#emoji").outerWidth();
      vx = new_x - x;
      jump_allowed = true
    }

    // Apply relative fix to position based on collision
    // var temp_y = parseInt($(".chrome-pet-positioner").css("top"), 10);
    // var temp_x = parseInt($(".chrome-pet-positioner").css("left"), 10);
    // $(".chrome-pet-positioner").css("top", temp_y + vy);
    // $(".chrome-pet-positioner").css("left", temp_x + vx);

    $(".chrome-pet-positioner").offset({left:new_x, top:new_y});





    y = $(".chrome-pet-positioner").offset().top;
    x = $(".chrome-pet-positioner").offset().left;


    // trick: Change the parent of $(".chrome-pet-box")
    // determine candidate parent
    if (elem != null) {
      elem = getScrollParent(elem, false);
    }
    if (elem != $("#chrome-pet-box").parent()[0] && elem != null && ["IMG", "TEXTAREA", "BR", "VIDEO", "INPUT", "path", "svg", "g", "IFRAME"].indexOf($(elem).prop("tagName")) == -1) {
      // Move to new parent.
      console.log(elem);
      $("#chrome-pet-box").appendTo(elem);
      // Find out the change of coordinates that is induced by the change.
      var modified_y = $(".chrome-pet-positioner").offset().top;
      var modified_x = $(".chrome-pet-positioner").offset().left;
      var needed_dy = y-modified_y;
      var needed_dx = x-modified_x;

      // Add offset to keep global position consistent.
      var targ = {left:x, top:y};
      // console.log(targ);
      $(".chrome-pet-positioner").offset(targ);
      actual_y = $(".chrome-pet-positioner").offset().top;
      actual_x = $(".chrome-pet-positioner").offset().left;
      if (actual_y != y || actual_x != x) {
        console.log("Bad teleport");
        console.log(elem);
        console.log(x + "->" + actual_x + " ," + y + "->" + actual_y);
      }
      // console.log(y + " " + x);
      // temp_y = parseInt($(".chrome-pet-positioner").css("top"), 10);
      // temp_x = parseInt($(".chrome-pet-positioner").css("left"), 10);
      // $(".chrome-pet-positioner").css("top", temp_y + needed_dy);
      // $(".chrome-pet-positioner").css("left", temp_x + needed_dx);
    }


    // projecting step
    var signs = [-1, 1, -1, 1];
    var targets = ["left", "left", "top", "top"];

    var pet_width = $('#emoji').outerWidth();
    var pet_height = $('#emoji').outerHeight();
    var elementsOfInterest = [];
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 2; j++) {
        var newX = x - $(window).scrollLeft() + i * ($("#emoji").width());
        var newY = y - $(window).scrollTop() + j * ($("#emoji").height());
        var elem = document.elementFromPoint(newX, newY);
        if (elem != null) {
          elementsOfInterest.push(elem);
        };
      }
    }
    $(elementsOfInterest).not("iframe, :hidden").filter(contains_text).each(function(){
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
        var modified = original + signs[best_index] * 1/*smallest_violation*/;

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