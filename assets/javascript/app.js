$(document).ready(function() {
  const SECONDS_PER_QUESTION = 2;

  DOM_ids = {
    startButton: null,
    timeRemaining: null,
    timerProgressBar: null
  };

  const DOM_SELECT_AnswerButtons = ".carousel-item.active button.list-group-item";

  const DOM_CLASS_Reveal = "reveal"; // Transitions from 0 Opacity
  
  // Elements that toggle display/visibility/alert-like styles
  const DOM_CLASS_Toggles = {
    onStart   : { classSelect: "toggleOnStart", classStyle: "d-none"  },
    answerLock: { classSelect: "toggleLock"   , classStyle: "locked"  },
    outOfTime : { classSelect: "progress"     , classStyle: "timesUp" },

    // Method to toggle one of our objects
    toggleDOM(toggleObj) {
      $(`.${toggleObj.classSelect}`).toggleClass(toggleObj.classStyle);
    }
  };

  //#region Utility (pure) Functions
  //#endregion

  (function clickStart(event) {
    // Reveal Carousel of Questions
    DOM_CLASS_Toggles.toggleDOM(DOM_CLASS_Toggles.onStart);

    // Reset Timer elements to 'Full'
    $(timeRemaining).text(SECONDS_PER_QUESTION);
    $(timerProgressBar).css("width", "100%");

    // Timeout to let user Read Question, then show answers
    setTimeout(() => {
      // Reveal Answers on the _active_ carousel item
      $(`.carousel-item.active .${DOM_CLASS_Reveal}`).css("opacity", 1);

      // Timeout after reveal answers, then make selectable and start timer
      // NB: this is to avoid the user clicking an answer before they realize
      setTimeout(() => {
        // Make answers selectable
        DOM_CLASS_Toggles.toggleDOM(DOM_CLASS_Toggles.answerLock);

        // Start countdown timer
        let tensSecondsLeft = SECONDS_PER_QUESTION * 10;
        var timer = setInterval(() => {
          // If less than 10 seconds, display a decimal digit
          $(timeRemaining).text(
            (--tensSecondsLeft / 10).toFixed(tensSecondsLeft / 10 > 10 ? 0 : 1)
          );
          let percent = (tensSecondsLeft / 10 / SECONDS_PER_QUESTION) * 100;
          $(timerProgressBar)
            .css("width", `${percent}%`)
            .attr("aria-valuenow", percent);

          // Out of Time?
          if (tensSecondsLeft === 0) {
            clearInterval(timer);
            DOM_CLASS_Toggles.toggleDOM(DOM_CLASS_Toggles.outOfTime);
            DOM_CLASS_Toggles.toggleDOM(DOM_CLASS_Toggles.answerLock);
          }
        }, 1000 / 10); // seconds to update timer displays
      }, 1000 * 1); // seconds after revealing answers to make selectable
    }, 1000 * 1); // seconds to read question then reveal answers
  })();

  function clickAnswer(event) {
    console.log(event);
  }

  //#region  START of EXECUTION
  // Link up the DOM elements by their ids
  for (let k of Object.keys(DOM_ids)) {
    DOM_ids[k] = document.getElementById(k);
  }
  //#endregion

  //#region  On Click FUNCTIONS
  $(startButton).on("click", clickStart);
  $(DOM_SELECT_AnswerButtons).on("click", clickAnswer);
  //#endregion
});

// shuffle the answers abcd
