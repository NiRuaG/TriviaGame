$(document).ready(function() {
  const DOM_CLASS_Reveal = "reveal"; // Transitions from 0 Opacity
  const DOM_CLASS_QuestionText = "questionText";
  const DOM_CLASS_Answers = {
    A: "answerA",
    B: "answerB",
    C: "answerC",
    D: "answerD",
  };

  const DOM_SELECT_AnswerButtons =
    ".carousel-item.active button.list-group-item";

  // Elements that toggle display/visibility/alert-like styles
  const DOM_CLASS_Toggles = {
    onStart: { classSelect: "toggleOnStart", classStyle: "d-none" },
    answerLock: { classSelect: "toggleLock", classStyle: "locked" },
    outOfTime: { classSelect: "progress", classStyle: "timesUp" },

    // Method to toggle one of our objects
    toggleDOM(toggleObj) {
      $(`.${toggleObj.classSelect}`).toggleClass(toggleObj.classStyle);
    }
  };

  const QUESTION_ITEM_TEMPLATE_HTML = `
      <div class="row m-0 carousel-item">
        <h1 class="col-12 font-question pt-2"><span class="${DOM_CLASS_QuestionText}"></span></h1>
        <div class="col-12 text-dark
          ${DOM_CLASS_Reveal} ${DOM_CLASS_Toggles.answerLock.classStyle} ${DOM_CLASS_Toggles.answerLock.classSelect}">
          <div class="row justify-content-center">
            <div class="col-12 col-sm-9 col-lg-6 p-0 list-group">
              <button type="button" class="row list-group-item list-group-item-action list-group-item-info py-4 m-0" data-answer="A">
                <span class="col-2 font-special">a.</span>
                <span class="col ${DOM_CLASS_Answers.A}"></span>
              </button>
              <button type="button" class="row list-group-item list-group-item-action list-group-item-info py-4 m-0" data-answer="B">
                <span class="col-2 font-special">b.</span>
                <span class="col ${DOM_CLASS_Answers.B}"></span>
              </button>
              <button type="button" class="row list-group-item list-group-item-action list-group-item-info py-4 m-0" data-answer="C">
                <span class="col-2 font-special">c.</span>
                <span class="col ${DOM_CLASS_Answers.C}"></span>
              </button>
              <button type="button" class="row list-group-item list-group-item-action list-group-item-info py-4 m-0" data-answer="D">
                <span class="col-2 font-special">d.</span>
                <span class="col ${DOM_CLASS_Answers.D}"></span>
              </button>
            </div>
          </div>
        </div>
      </div>`;

  const QUESTIONS = [
    {
      quesText: "Is this question #1?",
      answers: [
        { text: "Multiple-Choice Answer #11", correct: true },
        { text: "Multiple-Choice Answer #12" },
        { text: "Multiple-Choice Answer #13" },
        { text: "Multiple-Choice Answer #14" }
      ]
    },
    {
      quesText: "Is this question #2?",
      answers: [
        { text: "Multiple-Choice Answer #21" },
        { text: "Multiple-Choice Answer #22", correct: true },
        { text: "Multiple-Choice Answer #23" },
        { text: "Multiple-Choice Answer #24" }
      ]
    },
    {
      quesText: "Is this question #3?",
      answers: [
        { text: "Multiple-Choice Answer #31" },
        { text: "Multiple-Choice Answer #32" },
        { text: "Multiple-Choice Answer #33", correct: true },
        { text: "Multiple-Choice Answer #34" }
      ]
    },
    {
      quesText: "Is this question #4?",
      answers: [
        { text: "Multiple-Choice Answer #41" },
        { text: "Multiple-Choice Answer #42" },
        { text: "Multiple-Choice Answer #43" },
        { text: "Multiple-Choice Answer #44", correct: true },
      ]
    }
  ];

  const SECONDS_PER_QUESTION = 2;

  DOM_ids = {
    startButton: null,
    timeRemaining: null,
    timerProgressBar: null
  };
  
  //#region Utility (pure) Functions
  //#endregion

  function startNewQuestion() {
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
            // alert("Out of time");
            setTimeout(() => {
              DOM_CLASS_Toggles.toggleDOM(DOM_CLASS_Toggles.outOfTime);
              $(".carousel").carousel("next");
              startNewQuestion();
            }, 1000 * 1);
          }
        }, 1000 / 10); // seconds to update timer displays
      }, 1000 * 1); // seconds after revealing answers to make selectable
    }, 1000 * 1); // seconds to read question then reveal answers
  }

  function clickStart(event_ThatWeProbDontUse) {
    // Reveal Carousel of Questions
    DOM_CLASS_Toggles.toggleDOM(DOM_CLASS_Toggles.onStart);
    startNewQuestion();
  }

  function clickAnswer(event) {
    console.log(this);
    console.log($(this).data());
  }

  //#region  START of EXECUTION
  // Link up the DOM elements by their ids
  for (let k of Object.keys(DOM_ids)) {
    DOM_ids[k] = document.getElementById(k);
  }
  QUESTIONS.forEach( (questionObj) => {
    console.log(questionObj);
    console.log();
    $(".carousel-inner").append(QUESTION_ITEM_TEMPLATE_HTML);
    // $(QUESTION_ITEM_TEMPLATE_HTML);
    // add a li items to carousel indicator
    $(".carousel-indicators").append($("<li>"));
  });

  $(".carousel-item").first().addClass("active");
  //#endregion

  //#region  On Click FUNCTIONS
  $(startButton).on("click", clickStart);
  $(document).on("click", DOM_SELECT_AnswerButtons, clickAnswer);
  //#endregion
});

// shuffle the answers abcd
