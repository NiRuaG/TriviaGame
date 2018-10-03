$(document).ready(function() {
  DOM_ids = {
    startButton: null,
    timeRemaining: null,
    timerProgressBar: null
  };

  // Classes that apply a CSS style
  const DOM_CLASS_Styles = {
    reveal: "reveal", // Transitions from 0 Opacity
    dNone: "d-none", // Bootstrap's class
    locked: "locked", // Removes pointer events
    timesUp: "timesUp" // Warning/Danger text
  };

  // Elements that toggle display/visibility/alert-like styles
  const DOM_CLASS_Toggles = {
    onStart: {
      select: ".toggleOnStart",
      classStyle: DOM_CLASS_Styles.dNone
    },

    answersLocked: {
      select: ".carousel-item.active .list-group",
      classStyle: DOM_CLASS_Styles.locked
    },

    outOfTime: {
      select: ".progress",
      classStyle: DOM_CLASS_Styles.timesUp
    },

    // Method to toggle one of our objects
    toggleDOM(toggleEventObj, doAdd = undefined) {
      // if doAdd is not strictly a boolean true or false, then it will toggle
      $(toggleEventObj.select).toggleClass(toggleEventObj.classStyle, doAdd);
    }
  };

  //// Question Template
  const DOM_CLASS_QuestionText = "questionText";
  const DOM_CLASS_AnswersText = {
    A: "answerTextA",
    B: "answerTextB",
    C: "answerTextC",
    D: "answerTextD"
  };
  // How to target the CURRENT (active) answer buttons
  const DOM_SELECT_AnswerButtons =
    ".carousel-item.active button.list-group-item";

  const QUESTION_ITEM_HTML_TEMPLATE = `
      <div class="row m-0 carousel-item">
        <h1 class="col-12 font-question pt-2 text-center"><span class="${DOM_CLASS_QuestionText}"></span></h1>
        <div class="col-12 text-dark">
          <div class="row justify-content-center">
            <div class="col-12 col-sm-9 col-lg-6 p-0 list-group 
            ${DOM_CLASS_Styles.reveal} ${DOM_CLASS_Styles.locked}">
              <button type="button" class="row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0" data-answer="A">
                <span class="col-2 font-special">a.</span>
                <span class="col ${DOM_CLASS_AnswersText.A}"></span>
              </button>
              <button type="button" class="row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0" data-answer="B">
                <span class="col-2 font-special">b.</span>
                <span class="col ${DOM_CLASS_AnswersText.B}"></span>
              </button>
              <button type="button" class="row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0" data-answer="C">
                <span class="col-2 font-special">c.</span>
                <span class="col ${DOM_CLASS_AnswersText.C}"></span>
              </button>
              <button type="button" class="row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0" data-answer="D">
                <span class="col-2 font-special">d.</span>
                <span class="col ${DOM_CLASS_AnswersText.D}"></span>
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
        { text: "Multiple-Choice Answer #44", correct: true }
      ]
    }
  ];

  const SECONDS_PER_QUESTION = 2;

  //#region Utility (pure) Functions
  //#endregion

  function startNewQuestion() {
    // Reset Timer elements to 'Full'
    DOM_CLASS_Toggles.toggleDOM(DOM_CLASS_Toggles.outOfTime, false);
    $(timeRemaining).text(SECONDS_PER_QUESTION);
    $(timerProgressBar).css("width", "100%");

    // Timeout to let user Read Question, then show answers
    setTimeout(() => {
      // Reveal Answers on the _active_ carousel item
      $(`.carousel-item.active .${DOM_CLASS_Styles.reveal}`).css("opacity", 1);

      // Timeout after reveal answers, then make selectable and start timer
      // NB: this is to avoid the user clicking an answer before they realize
      setTimeout(() => {
        // Make answers selectable
        DOM_CLASS_Toggles.toggleDOM(DOM_CLASS_Toggles.answersLocked, false);

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
            DOM_CLASS_Toggles.toggleDOM(DOM_CLASS_Toggles.outOfTime, true);
            DOM_CLASS_Toggles.toggleDOM(DOM_CLASS_Toggles.answersLocked, true);
            setTimeout(() => {
              $(".carousel").carousel("next");
              startNewQuestion();
            }, 1000 * 1); // seconds to wait before going to next question after running out of time
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

  function clickAnswer(event_ThatWeProbDontUse) {
    console.log(this);
    console.log($(this).data());
  }

  //#region  START of EXECUTION
  // Link up the DOM elements by their ids
  for (let k of Object.keys(DOM_ids)) {
    DOM_ids[k] = document.getElementById(k);
  }

  let constructQuesHTMLFrom = questionObj => {
    let result = $(QUESTION_ITEM_HTML_TEMPLATE); // start with a new template

    // Replace sections of the template with properties from the passed in question object
    result.find(`.${DOM_CLASS_QuestionText}`).text(questionObj.quesText);
    // TODO: shuffle answers
    result
      .find(`.${DOM_CLASS_AnswersText.A}`)
      .text(questionObj.answers[0].text);
    result
      .find(`.${DOM_CLASS_AnswersText.B}`)
      .text(questionObj.answers[1].text);
    result
      .find(`.${DOM_CLASS_AnswersText.C}`)
      .text(questionObj.answers[2].text);
    result
      .find(`.${DOM_CLASS_AnswersText.D}`)
      .text(questionObj.answers[3].text);

    return result; // Give back newly constructed 
  };

  QUESTIONS.forEach(questionObj => {
    $(".carousel-inner").append(constructQuesHTMLFrom(questionObj));

    // add a li items to carousel indicator
    $(".carousel-indicators").append($("<li>"));
  });

  // Move this to startQuestion?
  $(".carousel-item")
    .first()
    .addClass("active");

  //#endregion

  //#region  On Click FUNCTIONS
  $(startButton).on("click", clickStart);
  // Because the ACTIVE carousel item gets dynamically cycled, use document click handler
  $(document).on("click", DOM_SELECT_AnswerButtons, clickAnswer);

  //#endregion
});

// shuffle the answers abcd
