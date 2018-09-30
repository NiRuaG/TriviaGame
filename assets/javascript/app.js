$(document).ready(function() {
  const SECONDS_PER_QUESTION = 15;
  DOM_ids = {
    startButton: null,
    timeRemaining: null,
    timerProgress: null
  };

  // Elements that get display/visibility toggles
  const DOM_CLASS_Toggles = {
    onStart: { classSelect: "toggleOnStart", classToggle: "d-none" },

    toggleDOM(toggleObj) {
      $(`.${toggleObj.classSelect}`).toggleClass(toggleObj.classToggle);
    }
  };

  //#region Utility (pure) Functions
  //#endregion

  function clickStart(event) {
    // console.log(event);
    // console.log("start!");
    $(timeRemaining).text(SECONDS_PER_QUESTION);
    $(timerProgress).css("width", "100%");

    DOM_CLASS_Toggles.toggleDOM(DOM_CLASS_Toggles.onStart);

    // Timeout to Read Question
    setTimeout(() => {
      // Start countdown timer
      let tensSecondsLeft = SECONDS_PER_QUESTION * 10;
      var timer = setInterval(() => {
        // If less than 10 seconds, display a decimal digit
        $(timeRemaining).text(
          (--tensSecondsLeft / 10).toFixed(tensSecondsLeft * 10 > 10 ? 0 : 1)
        );
        let percent = (tensSecondsLeft / 10 / SECONDS_PER_QUESTION) * 100;
        //   console.log(percent);
        $(timerProgress)
          .css("width", `${percent}%`)
          .attr("aria-valuenow", percent);
        if (tensSecondsLeft === 0) {
          console.log("times up!");
          clearInterval(timer);
          $(".progress").addClass("timeDone");
        }
      }, 100); // 1/10th second to update displays
    }, 2 * 1000); // seconds to read question
  }

  //#region  START of EXECUTION
  // Link up the DOM elements by their ids
  for (let k of Object.keys(DOM_ids)) {
    DOM_ids[k] = document.getElementById(k);
  }
  //#endregion

  //#region  On Click FUNCTIONS
  $(startButton).on("click", clickStart);
  //#endregion
});
