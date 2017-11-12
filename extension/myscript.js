
// var active = false;
// chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
//   if (msg.action == 'toggle_emoji') {
//     active = !active;
//     if (active == true) {
//       addEmoji();
//     }
//   }
// });

window.emojiPetDependenciesLoaded = true;

if (typeof addEmoji === 'undefined' || !addEmoji) {
  var USE_DEFAULT_EMOJI = false;
  var LEFT_KEY = 37;
  var UP_KEY = 38;
  var RIGHT_KEY = 39;
  var DOWN_KEY = 40;

  var MAX_EMOJI = 100;

  var kFloorHeight = USE_DEFAULT_EMOJI ? 10 : 2;
  $("<div id='emoji-pet-floor'><div/>").addClass("floor").appendTo($("body"));
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


    var immediatelyContainedText = $(this).contents().not($(this).children()).filter(function() {
        return this.nodeType === 3; //Node.TEXT_NODE
      }).text().replace(/\s+/g, '');
    // replaced whitespace
    return immediatelyContainedText != "";
  }


  function setSleepEmoji($emoji) {
    if (USE_DEFAULT_EMOJI) {
      $emoji.children(".emoji-pet-hitbox").children(".text-emoji").html("&#" + (128513 + 34) + ";");
    } else {
      $emoji.children(".emoji-pet-hitbox").children("img").attr("src", chrome.extension.getURL('third-party/emojione/1f634.png'));
    }
  }

  function randomizeEmoji($emoji){
    if (USE_DEFAULT_EMOJI) {
      $emoji.children(".emoji-pet-hitbox").children(".text-emoji").html("&#" + (128513 + Math.floor(Math.random() * (128567 - 128513))) + ";");
    } else {
      $emoji.children(".emoji-pet-hitbox").children("img").attr("src", chrome.extension.getURL('third-party/emojione/1f6' + ("0" + Math.floor((Math.random() * 45))).slice(-2) + '.png'));
    }
    // $emoji
    // new version uses native emoji
    // $emoji.html("&#" + (128513 + Math.floor(Math.random() * (128567 - 128513))) + ";");
  }

  // puts a random emoji inside the jquery object.
  function initializeEmoji($emoji){
    // old version loads an image file
    $emoji.html("");
    $emoji.append($("<div/>").addClass("emoji-pet-hitbox"));
    if (USE_DEFAULT_EMOJI) {
      $emoji.children(".emoji-pet-hitbox").append($("<div/>").addClass("text-emoji"));
    } else {
      $emoji.children(".emoji-pet-hitbox").append($("<img>"));
    }
    randomizeEmoji($emoji);
    // $emoji
    // new version uses native emoji
    // $emoji.html("&#" + (128513 + Math.floor(Math.random() * (128567 - 128513))) + ";");

    $emoji.css("left", $(window).scrollLeft() + Math.floor(window.innerWidth/2));
    $emoji.css("top", $(window).scrollTop() + Math.floor(window.innerHeight/2));
  }
  var rightMargin = USE_DEFAULT_EMOJI ? 20 : 10;
  function enforcePositionContraints($emoji, x, y) {
    var window_top = $(window).scrollTop();
    var window_left = $(window).scrollLeft();
    var window_bottom = window_top + window.innerHeight;
    var window_right = window_left + document.body.clientWidth;
    var jump_allowed = false;
    if (y < window_top) {
        y = window_top;
    } else if (y + $emoji.outerHeight() > window_bottom - kFloorHeight) {
      // The boundary of 5 is so that the image boundary doesn't go off screen, 
      // which would increase the page size and add flickery scrollbars.
      y = window_bottom - $emoji.outerHeight() - kFloorHeight;
      jump_allowed = true
    }
    if (x < window_left/* + $emoji.outerWidth()*/) {
      x = window_left/* + $emoji.outerWidth()*/;
      jump_allowed = true
    } else if (x + $emoji.outerWidth() > window_right - rightMargin) {
      x = window_right - $emoji.outerWidth() - rightMargin;
      jump_allowed = true
    }
    return {"y":y, "x":x, "jump_allowed":jump_allowed}
  }

  // function setSleepEmoji($emoji){
  //   // old version loads an image file
  //   $emoji.html("");
  //   $emoji.append($("<img>").attr("src", chrome.extension.getURL('third-party/emojione/1f634.png')));
  //   // $emoji
  //   // new version uses native emoji
  //   // $emoji.html("&#" + (128513 + Math.floor(Math.random() * (128567 - 128513))) + ";");
  // }

  function findPetBox() {
    for (var emoji_index = 0; emoji_index < MAX_EMOJI; emoji_index++) {
      if ($("#chrome-pet-box-" + emoji_index).size() == 0) {
        return emoji_index;
      }
    }
    return -1;
  }

  function getEmoji() {
    emoji_index = findPetBox();
    if (emoji_index == -1) return null;

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

    $emoji.draggable({
      stack: ".emoji",
      scroll: false,
      stop : function(event, ui){
               vx = 0;
               vy = 0;
               jump_allowed = false;
               hyperactive = true;
             }
    });

    return $emoji;
  }


  // add a new emoji to the page, with a loop associated with it.
  // doens't add an emoji if there are already too many.
  function addEmoji(){

    var $emoji = getEmoji(MAX_EMOJI);
    if ($emoji === null) return;
    var $chrome_pet_box = $emoji.parent();

    initializeEmoji($emoji);

    var vx = Math.floor(10 * Math.random());
    var vy = -10;
    var smooth_accumulator = 0.0
    var keydowns     = {LEFT_KEY:false, UP_KEY:false, RIGHT_KEY:false, DOWN_KEY:false}
    var jump_allowed = false


    // Don't use these kinds of things as scrolling parents.
    var ignored_parent_tags = ["IMG", "TEXTAREA", "BR", "VIDEO", "INPUT", "path", "svg", "g", "IFRAME"];
    var last_immediate_parent = null;
    var hyperactive = true;

    function randomlyChangeKeydownsAndAppearance() {
      // Randomly change motion and appearance
      for (var key = LEFT_KEY; key < DOWN_KEY; key++) {
        var rand = Math.random();

        // left and right have a fixed threshold towards changing.
        // the up key is biased towards not jumping.
        var threshold = 0.03;
        if (key == UP_KEY) {
          threshold = keydowns[UP_KEY] ? 0.08 : 0.02
        }
        if (rand < threshold) {
          keydowns[key] = !keydowns[key];
          if (rand < 0.005) {
            if (hyperactive) {
              randomizeEmoji($emoji);
            }
          }
        }
        // avoid movement in general in non hyperactive state
        if (!hyperactive && Math.random() > 0.9) {
          keydowns[key] = false;
        }
      }
      // Sometimes when not in motion we go to sleep
      if (hyperactive && Math.random() > 0.9 && vy == 0 && vx == 0) {
        hyperactive = false;
        setSleepEmoji($emoji);
      } else if (!hyperactive && Math.random() > 0.999) {
        hyperactive = true;
        randomizeEmoji($emoji);
      }
    }

    var childType = USE_DEFAULT_EMOJI ? ".text-emoji" : "img"; 
    function renderKeydowns() {
      // Set velocity based on keystrokes
      if (keydowns[RIGHT_KEY] && !keydowns[LEFT_KEY]) {
        $emoji.children().children(childType).css("transform", "rotate(30deg)");
      } else if (keydowns[LEFT_KEY] && !keydowns[RIGHT_KEY]) {
        $emoji.children().children(childType).css("transform", "rotate(-30deg)");
      } else {
        $emoji.children().children(childType).css("transform", "none");
      }
    }

    function updateVelocityAndJumpstateFromKeydowns() {
      // Sideways motion.
      if (keydowns[RIGHT_KEY] && !keydowns[LEFT_KEY]) {
        vx = 4;
      } else if (keydowns[LEFT_KEY] && !keydowns[RIGHT_KEY]) {
        vx = -4;
      } else {
        if (vx > 0) {
          vx = Math.max(vx - 1, 0);
        } else if (vx < 0) {
          vx = Math.min(vx + 1, 0);
        }
      }

      // Jumping
      if (keydowns[UP_KEY] && jump_allowed && hyperactive) {
        vy = -10;
        jump_allowed = false;
      }

      // Gravity
      if (hyperactive) {
        vy += 0.8;
      }

      // Velocity capping
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
    }

    // If we can move ourself to moving divs, scrolling looks smooth.
    function updateScrollParent(new_x, new_y) {
      var base_x = new_x - $(window).scrollLeft() + $emoji.width()/2;
      var base_y = new_y - $(window).scrollTop() + $emoji.height() + 1;
      var elem = document.elementFromPoint(base_x, base_y);
      if (base_y > window.innerHeight - kFloorHeight) {
        elem = document.getElementById("emoji-pet-floor")
      }

      var saved_offset = $emoji.offset();

      // trick: Change the parent of $chrome_pet_box
      // determine candidate parent
      if (elem != last_immediate_parent) {
        last_immediate_parent = elem;
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

          $emoji.offset(saved_offset);
          actual_y = $emoji.offset().top;
          actual_x = $emoji.offset().left;
          if (~~actual_y != ~~saved_offset.top || ~~actual_x != ~~saved_offset.left) {
            console.log("Bad teleport");
            console.log(elem);
            console.log(x + "->" + actual_x + " ," + y + "->" + actual_y);
          }
        }
      }
    }

    function timestep() {
      randomlyChangeKeydownsAndAppearance();
      renderKeydowns();
      updateVelocityAndJumpstateFromKeydowns();


      var y = $emoji.offset().top;
      var x = $emoji.offset().left;

      var new_state_info = enforcePositionContraints($emoji, x + vx, y + vy);
      jump_allowed = jump_allowed || new_state_info["jump_allowed"];
      var new_y = new_state_info["y"];
      var new_x = new_state_info["x"];
      vx = new_x - x;
      vy = new_y - y;

      // Colliding with other random divs
      // Only do complicated physics stuff if you not being dragged
      if (!$emoji.is('.ui-draggable-dragging')) {
        $emoji.offset({left:new_x, top:new_y});

        // This is the expensive stuff. When not hyperactive, all collisions are done only intermittently.
        if (hyperactive || Math.random() > 0.85) {
          updateScrollParent(new_x, new_y);


          // projecting step
          var signs   = [    -1,      1,    -1,     1];
          var targets = ["left", "left", "top", "top"];

          var pet_width = $emoji.outerWidth();
          var pet_height = $emoji.outerHeight();
          var elementsOfInterest = [];
          for (var x_index = 0; x_index < 2; x_index++) {
            for (var y_index = 0; y_index < 2; y_index++) {
              //
              //      .
              // .####
              //  ####
              //  ####.
              // .
              //
              var probe_x = new_x - $(window).scrollLeft() - 1 + x_index * (pet_width + 2);
              var probe_y = new_y - $(window).scrollTop() + y_index * (pet_height) - x_index; 
              // putting the legs at different heights makes you collide with something 
              // other than the floor when you're on the floor
              var collision = document.elementFromPoint(probe_x, probe_y);
              if (collision != null) {
                elementsOfInterest.push(collision);
              };
            }
          }
          $elementsOfInterest = $(elementsOfInterest);



          var overlapped = false;
          $(elementsOfInterest).not("iframe, :hidden, .emoji-pet-hitbox").filter(contains_text).each(function(){
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
              var modified = original + signs[best_index] * /*1*/smallest_violation/5;

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

      setTimeout(timestep, 30);
    }
    timestep();
  }
}
addEmoji();