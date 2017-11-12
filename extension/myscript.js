
// var active = false;
// chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
//   if (msg.action == 'toggle_emoji') {
//     active = !active;
//     if (active == true) {
//       addEmoji();
//     }
//   }
// });

if (typeof addEmoji === 'undefined' || !addEmoji) {
  var kFloorHeight = 0;
  $("<div id='emoji_pet_floor'><div/>").addClass("floor").text("...").appendTo($("body"));
  // define a bunch of functions, also start a scanning loop.

  // modified from https://stackoverflow.com/questions/35939886/find-first-scrollable-parent
  // Looking for the thing that will control my movement
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

  // Condition for deciding whether this is a collideable object.
  // Checks if this contains text, but not via a child node.
  function contains_text(index,elem) {
    // Exceptions to the rule
    if (["VIDEO", "IMG", "INPUT"].indexOf($(this).prop("tagName")) != -1) {
      return true;
    }
    if (["HTML"].indexOf($(this).prop("tagName")) != -1) {
      return false;
    }
    if ($(this).hasClass("emoji-pet-hitbox")) {
      return true;
    }
    console.log(this);


    var immediatelyContainedText = $(this).contents().not($(this).children()).filter(function() {
        return this.nodeType === 3; //Node.TEXT_NODE
      }).text().replace(/\s+/g, '');
    // replaced whitespace
    return immediatelyContainedText != "";
  }

  function randomizeEmoji($emoji){
    $emoji.children(".emoji-pet-hitbox").children("img").attr("src", chrome.extension.getURL('third-party/emojione/1f6' + ("0" + Math.floor((Math.random() * 45))).slice(-2) + '.png'));

    // $emoji
    // new version uses native emoji
    // $emoji.html("&#" + (128513 + Math.floor(Math.random() * (128567 - 128513))) + ";");
  }

  // puts a random emoji inside the jquery object.
  function initializeEmoji($emoji){
    // old version loads an image file
    $emoji.html("");
    $emoji.append($("<div/>").addClass("emoji-pet-hitbox"));
    $emoji.children(".emoji-pet-hitbox").append($("<img>"));
    randomizeEmoji($emoji);
    // $emoji
    // new version uses native emoji
    // $emoji.html("&#" + (128513 + Math.floor(Math.random() * (128567 - 128513))) + ";");
  }

  // function setSleepEmoji($emoji){
  //   // old version loads an image file
  //   $emoji.html("");
  //   $emoji.append($("<img>").attr("src", chrome.extension.getURL('third-party/emojione/1f634.png')));
  //   // $emoji
  //   // new version uses native emoji
  //   // $emoji.html("&#" + (128513 + Math.floor(Math.random() * (128567 - 128513))) + ";");
  // }

  // add a new emoji to the page, with a loop associated with it.
  // doens't add an emoji if there are already too many.
  function addEmoji(){
    var active = true;



    var hitLimit = true;
    for (var emoji_index = 0; emoji_index < 10; emoji_index++) {
      if ($("#chrome-pet-box-" + emoji_index).size() == 0) {
        hitLimit = false;
        break;
      }
    }
    if (hitLimit) {
      return;
    }

    // add higher level container (is this necessary?)
    var pet_box_id = "chrome-pet-box-" + emoji_index;
    var $chrome_pet_box = $("<div/>")
      .attr("id", pet_box_id)
      .addClass("chrome-pet-box")
      .appendTo(document.body);

    // Add container for emoji
    var emoji_id = "emoji-" + emoji_index;
    var $emoji = $("<div/>")
      .attr("id", emoji_id)
      .addClass("emoji")
      .appendTo($chrome_pet_box);

    var is_dragging = false;
    $emoji.draggable({
      stack: ".emoji",
      scroll: false,
      start: function(event, ui){
               is_dragging = true;
               $("#emoji_pet_floor").addClass("dragging");
             },
      stop : function(event, ui){
               is_dragging = false;
               $("#emoji_pet_floor").removeClass("dragging");
               vx = 0;
               vy = 0;
               jump_allowed = false;
               hyperactive = true;
             }
    });
    initializeEmoji($emoji);
    // old: set with image
    // $("<img id='emoji'></img>").attr("src", chrome.extension.getURL('emojione/1f600.png')).appendTo($emoji);

    $emoji.css("left", $(window).scrollLeft() + Math.floor(window.innerWidth/2));
    $emoji.css("top", $(window).scrollTop() + Math.floor(window.innerHeight/2));
    // console.log($(window).scrollTop());
    // console.log(Math.floor(window.innerHeight/2));
    // console.log($emoji.offset());
    var vx = Math.floor(10 * Math.random());
    var vy = -10;
    var smooth_accumulator = 0.0
    var keydowns     = {37/*left*/:false, 38/*up*/:false, 39/*right*/:false, 40/*down*/:false}
    var jump_allowed = false

    // coordinates of emoji in parent (possible different from current parent) during previous frame
    var last_support_left = 0;
    var last_support_top = 0;

    // Don't switch to tags of this kind
    var ignored_parent_tags = ["IMG", "TEXTAREA", "BR", "VIDEO", "INPUT", "path", "svg", "g", "IFRAME"];
    var last_immediate_parent = null;
    var hyperactive = true;
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
            if (hyperactive) {
              randomizeEmoji($emoji);
            }
          }
        }
        // avoid movement in general in non hyperactive state
        if (!hyperactive && Math.random() > 0.9) {
          keydowns[i] = false;
        }
      }
      // Sometimes when not in motion we go to sleep
      if (hyperactive && Math.random() > 0.9 && vy == 0 && vx == 0) {
        hyperactive = false;
        // setSleepEmoji($emoji);
      } else if (!hyperactive && Math.random() > 0.999) {
        // some probability of waking up
        hyperactive = true;
      }


      // Set velocity based on keystrokes
      if (keydowns[39] && !keydowns[37]) {
        vx = 4;
        $emoji.children().children("img").css("transform", "rotate(30deg)");
      } else if (keydowns[37] && !keydowns[39]) {
        vx = -4;
        $emoji.children().children("img").css("transform", "rotate(-30deg)");
      } else {

        $emoji.children().children("img").css("transform", "none");
        if (vx > 0) {
          vx = Math.max(vx - 1, 0);
        } else if (vx < 0) {
          vx = Math.min(vx + 1, 0);
        }
      }
      if (keydowns[38] /*&& !old_keydowns[38]*/ && jump_allowed && hyperactive) {
        vy = -10;
        jump_allowed = false;
      }
      // store previous state of keys
      // old_keydowns = {37:keydowns[37], 38:keydowns[38], 39:keydowns[39], 40:keydowns[40]}
      // console.log(old_keydowns);
      // console.log("step");
      //physics step: move the box
      if (hyperactive) { // don't even do physics in the resting state
        smooth_accumulator += 0.8;
      }
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


      var y = $emoji.offset().top;
      var x = $emoji.offset().left;
      // console.log("y" + y);
      // Project the emoji into view
      var window_top = $(window).scrollTop();

      var window_left = $(window).scrollLeft();
      var window_bottom = window_top + window.innerHeight;
      var window_right = window_left + document.body.clientWidth;

      var base_x = x - $(window).scrollLeft() + $emoji.width()/2;
      var base_y = y - $(window).scrollTop() + $emoji.height() + 1;

      // $(".highlight").removeClass("highlight");
      var dx = 0;
      var dy = 0;

      // change reference position
      x = x + dx;
      y = y + dy;
      var new_y = y + vy;
      var new_x = x + vx;
      //var rightMargin = $emoji.outerWidth()
      if (new_y < window_top) {
        new_y = window_top;
        vy = new_y - y;
      } else if (new_y + $emoji.outerHeight() > window_bottom - kFloorHeight) {
        // The boundary of 5 is so that the image boundary doesn't go off screen, 
        // which would increase the page size and add flickery scrollbars.
        new_y = window_bottom - $emoji.outerHeight() - kFloorHeight;
        vy = new_y - y;
        jump_allowed = true
      }
      if (new_x < window_left/* + $emoji.outerWidth()*/) {
        new_x = window_left/* + $emoji.outerWidth()*/;
        vx = new_x - x;
        jump_allowed = true
      } else if (new_x + $emoji.outerWidth() > window_right/* - rightMargin*/) {
        new_x = window_right - $emoji.outerWidth()/* - rightMargin*/;
        vx = new_x - x;
        jump_allowed = true
      } 

      // Only do complicated physics stuff if you not being dragged
      if (!is_dragging/*new_y + $emoji.outerHeight() > window_top &&
          new_y < window_bottom &&
          new_x + $emoji.outerWidth() > window_left &&
          new_x < window_right*/) {

        // Apply relative fix to position based on collision
        // var temp_y = parseInt($emoji.css("top"), 10);
        // var temp_x = parseInt($emoji.css("left"), 10);
        // $emoji.css("top", temp_y + vy);
        // $emoji.css("left", temp_x + vx);

        $emoji.offset({left:new_x, top:new_y});

        // This is the expensive stuff. When not hyperactive, all collisions are done only intermittently.
        if (hyperactive || Math.random() > 0.85) {
          var elem = document.elementFromPoint(base_x, base_y);
          if (base_y > window.innerHeight - kFloorHeight) {
            elem = document.getElementById("emoji_pet_floor")
          }
          y = $emoji.offset().top;
          x = $emoji.offset().left;

          // trick: Change the parent of $chrome_pet_box
          // determine candidate parent
          if (elem != last_immediate_parent) {
            // last_immediate_parent = elem;
            if (elem != null) {
              elem = getScrollParent(elem, false);
            }
            if (elem != $chrome_pet_box.parent()[0] && elem != null && ignored_parent_tags.indexOf($(elem).prop("tagName")) == -1) {
              // console.log(elem);
              // Move to new parent.
              $chrome_pet_box.appendTo(elem);
              // Find out the change of coordinates that is induced by the change.
              var modified_y = $emoji.offset().top;
              var modified_x = $emoji.offset().left;
              var needed_dy = y-modified_y;
              var needed_dx = x-modified_x;

              // Add offset to keep global position consistent.
              var targ = {left:x, top:y};
              // console.log(targ);
              $emoji.offset(targ);
              actual_y = $emoji.offset().top;
              actual_x = $emoji.offset().left;
              if (~~actual_y != y || ~~actual_x != x) {
                console.log("Bad teleport");
                console.log(elem);
                console.log(x + "->" + actual_x + " ," + y + "->" + actual_y);
              }
            }
          }



          // projecting step
          var signs = [-1, 1, -1, 1];
          var targets = ["left", "left", "top", "top"];

          var pet_width = $emoji.outerWidth();
          var pet_height = $emoji.outerHeight();
          var elementsOfInterest = [];
          for (var i = 0; i < 2; i++) {
            for (var j = 0; j < 2; j++) {
              //
              //      .
              // .####
              //  ####
              //  ####.
              // .
              //
              var newX = x - $(window).scrollLeft() - 1 + i * (pet_width + 2);
              var newY = y - $(window).scrollTop() + j * (pet_height) - i; 
              // putting the legs at different heights makes you collide with something 
              // other than the floor when you're on the floor
              var elem = document.elementFromPoint(newX, newY);
              if (elem != null) {
                elementsOfInterest.push(elem);
              };
            }
          }
          $elementsOfInterest = $(elementsOfInterest);



          var overlapped = false;
          $(elementsOfInterest).not("iframe, :hidden").not($emoji.children()).filter(contains_text).each(function(){
            var position = $(this).offset();
            var $this = $(this);
            var new_position = {left: parseInt(position.left, 10)/* +
                                      parseInt($this.css("borderLeftWidth"), 10) +
                                      parseInt($this.css("paddingLeft"), 10)*/,
                                top:  parseInt(position.top, 10)/* +
                                      parseInt($this.css("borderTopWidth"), 10) +
                                      parseInt($this.css("paddingTop"), 10)*/};
            var new_size = {width: parseInt($(this).outerWidth(), 10)/* -
              parseInt($this.css("paddingLeft"), 10) -
              parseInt($this.css("paddingRight"), 10)*/,
                            height: parseInt($(this).outerHeight(),10)/* -
                            parseInt($this.css("paddingTop"),10) -
                            parseInt($this.css("paddingBottom"),10)*/};
            // console.log(new_size);


            var violations = [];


            var pet_offset = $emoji.offset()
            var pet_left = parseInt(pet_offset.left, 10);
            var pet_top = parseInt(pet_offset.top, 10);

            violations.push(pet_left + pet_width - new_position.left);
            violations.push((new_position.left + new_size.width) - pet_left);
            violations.push(pet_top + pet_height - new_position.top);
            violations.push((new_position.top + new_size.height) - pet_top);

            // either there are no violations, or we can find
            // the smallest positive number in the list
            var smallest_violation = 0;
            var worst_violation = 0;
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
              var original = parseInt($emoji.css(targets[best_index]), 10);
              var modified = original + signs[best_index] * /*1*/smallest_violation/2;

              $emoji.css(targets[best_index], modified + 'px');
              vx = 0;
              vy = 0;
            }
            // This means that there is an overlap
            if (smallest_violation > 0 && !hyperactive){
              // Allow physics to wake you up.
              hyperactive = true;
              // randomizeEmoji($emoji);
            }
            if (smallest_violation >= 0) {
              overlapped = true;
            }
          })
          // No airjumping.
          if (overlapped == false) {
            jump_allowed = false;
          }

          // If it's in the air and not hyperactive, become hyperactive.
          if (overlapped == false && /*parseInt($emoji.offset().top, 10) < window_bottom - 2 * pet_height &&*/ !hyperactive) {
            hyperactive = true;
            randomizeEmoji($emoji);
          }
        }
      }

      if (active) {
        setTimeout(timestep, 30);
      } else {
        $chrome_pet_box.remove();
      }
    }
    timestep();
  }
}
addEmoji();