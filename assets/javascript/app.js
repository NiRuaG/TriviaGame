$(document).ready(function() {
  //#region Variables & Constants for Trivia Game
  const SECONDS_PER_QUESTION = 2;
  const UPDATE_INTERVAL_DIVISOR = 10; // every tenth of a second
  const CHOICES_PER_QUESTION = 4;
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
  let Shuffled_Questions = Array(QUESTIONS.length);
  let Correct_Letters = Array(QUESTIONS.length);
  let numCorrectAnswers = 0;
  let numIncorrectAnswers = 0;
  let numTimedOutAnswers = 0;
  let globalTimer = null;
  let questionResult = {
    correct: "correct",
    incorrect: "incorrect",
    outoftime: "outoftime"
  };
  //#endregion

  //#region just DOM things
  const DOM_IDs = {
    questionCarousel: null,
    startButton: null,
    timeRemaining: null,
    timerProgressBar: null,
    activeQuesResult: null,
    correct: null,
    incorrect: null,
    outOfTime: null,
  };

  // Data Attributes
  // !! need to be lowercase,
  const DOM_DATA_Attr = {
    qIndex: "q-index".toLowerCase(),
    letter: "letter".toLowerCase(),
    correct: "correct".toLowerCase(),
  };

  // Classes that apply a CSS style
  const DOM_CLASS_Styles = {
    reveal  : "reveal"  , // Transitions from 0 Opacity
    dNone   : "d-none"  , // Bootstrap's class for display:none style
    locked  : "locked"  , // Removes pointer events
    timesUp : "timesUp" , // Warning/Danger style text
    selected: "selected", // the selected answer
  };

  // Target Selectors
  const DOM_SELECT_ActiveQuestion = ".carousel-item.active";
  const DOM_SELECT_AnswerButtons = `${DOM_SELECT_ActiveQuestion} button.list-group-item`;
  
  // Events that toggle display/visibility/alert-like styles
  const DOM_CLASS_Toggles = {
    onStart: {
      target: ".toggleOnStart",
      classStyle: DOM_CLASS_Styles.dNone
    },

    answersLocked: {
      target: `${DOM_SELECT_ActiveQuestion} .list-group`,
      classStyle: DOM_CLASS_Styles.locked
    },

    outOfTime: {
      target: ".progress",
      classStyle: DOM_CLASS_Styles.timesUp
    },

    // Method to toggle on one of our objects
    toggle(toggleEventObj, doAdd = undefined) {
      // if doAdd is not strictly a boolean true or false, then it will toggle
      $(toggleEventObj.target).toggleClass(toggleEventObj.classStyle, doAdd);
    }
  };

  //// Question HTML Template
  // const DOM_CLASS_QuestionIndex = "questionIndex"
  const DOM_CLASS_QuestionText = "questionText";
  const DOM_CLASS_AnswersText = {
    A: "Atext",
    B: "Btext",
    C: "Ctext",
    D: "Dtext"
  };

  const HTML_QUESTION_TEMPLATE = `
      <div class="row m-0 carousel-item">
        <h1 class="col-12 font-question pt-2 text-center"><span class="${DOM_CLASS_QuestionText}"></span></h1>
        <div class="col-12 text-dark">
          <div class="row justify-content-center">
            <div class="col-12 col-sm-9 col-lg-6 p-0 list-group 
            ${DOM_CLASS_Styles.reveal} ${DOM_CLASS_Styles.locked}">
              <button type="button" class="row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0" data-${
                DOM_DATA_Attr.letter
              }="A">
                <span class="col-2 font-special">a.</span>
                <span class="col ${DOM_CLASS_AnswersText.A}"></span>
              </button>
              <button type="button" class="row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0" data-${
                DOM_DATA_Attr.letter
              }="B">
                <span class="col-2 font-special">b.</span>
                <span class="col ${DOM_CLASS_AnswersText.B}"></span>
              </button>
              <button type="button" class="row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0" data-${
                DOM_DATA_Attr.letter
              }="C">
                <span class="col-2 font-special">c.</span>
                <span class="col ${DOM_CLASS_AnswersText.C}"></span>
              </button>
              <button type="button" class="row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0" data-${
                DOM_DATA_Attr.letter
              }="D">
                <span class="col-2 font-special">d.</span>
                <span class="col ${DOM_CLASS_AnswersText.D}"></span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
  //#endregion

  //#region Utility Functions
  //// https://css-tricks.com/snippets/javascript/shuffle-array/
  function Shuffle(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  };
  //#endregion

  let constructQuesHTMLFrom = (questionObj, questionIndex) => {
    // Start with a new template
    let result = $(HTML_QUESTION_TEMPLATE);

    // Attach a data attribute for this questions index number
    result.attr(`data-${DOM_DATA_Attr.qIndex}`, questionIndex);

    // Replace sections of the template with properties from the passed in question object
    result.find(`.${DOM_CLASS_QuestionText}`).text(questionObj.quesText);
    // TODO: shuffle answers

    // Make a shuffled/random array of indices [0..# of choices] - eg [3,2,4,1]  if (4) choices
    let shuffledIndices = Shuffle(Array.from(Array(CHOICES_PER_QUESTION).keys()));
    let answerLetter = 'A'; // default, incase the object doesn't indicate a correct answer
    ['A', 'B', 'C', 'D'].forEach( (letter, index) => {
      let answerObj = questionObj.answers[shuffledIndices[index]];
      result
        .find(`.${DOM_CLASS_AnswersText[letter]}`)
        .text(answerObj.text);
      
        if (answerObj.correct) { answerLetter = letter; } // keep overwriting the correct answer letter, in case more than one was indicated as correct
    });
    Correct_Letters[questionIndex] = answerLetter;

    return result; // Give back newly constructed jQuery object
  };

  function reset() {
    // Make a new array that is shuffled from the QUESTIONS array
    Shuffled_Questions = Shuffle(Array.from(Array(QUESTIONS.length).keys()))
      .map(shuffledIndex => {
        return QUESTIONS[shuffledIndex];
      });

    // Construct the carousel items for each question
    $(".carousel-inner").empty();
    Shuffled_Questions.forEach((questionObj, index) => {
      $(".carousel-inner")
        .append(constructQuesHTMLFrom(questionObj, index));

      // add a li items to carousel indicator
      $(".carousel-indicators")
        .append($("<li>")
          .attr(`data-target`, `#${DOM_IDs.questionCarousel.id}`));
    });

    // Make the first question (carousel-item & indicator) the active one
    $(".carousel-item").first().addClass("active");
    $(".carousel-indicators li").first().addClass("active");
  }

  function finalResults(){
    
  }

  function checkIfAtEnd() {
    setTimeout(() => {
      if($(DOM_SELECT_ActiveQuestion).data(DOM_DATA_Attr.qIndex) === Shuffled_Questions.length - 1) {
        finalResults();
      }
      else {
        $(".carousel").carousel("next"); // Bootstrap's carousel function, will update the .active .carousel-item & indicator
        startNewQuestion();
      }
    }, 1000 * 1.5); // seconds to wait before going to next question or result screen
  }

  function singleResult(result) {
    // lock the answers
    DOM_CLASS_Toggles.toggle(DOM_CLASS_Toggles.answersLocked, true);

    // Target the correct answer button and change style class to 'correct' (success)
    let correctLetter = Correct_Letters[$(DOM_SELECT_ActiveQuestion).data(DOM_DATA_Attr.qIndex)];
    $(`${DOM_SELECT_AnswerButtons}[data-letter="${correctLetter}"]`)
      .addClass("list-group-item-success")
      .removeClass("list-group-item-info");

    // Target the active carousel indicator, to be restyled below
    let currentIndicator = $(".carousel-indicators li.active");

    switch (result) {
      case questionResult.outoftime:
        ++numTimedOutAnswers;
        // Show the result text
        $(DOM_IDs.outOfTime).removeClass(DOM_CLASS_Styles.dNone);
        // Style the indicator
        currentIndicator.addClass("bg-warning");
        // Toggle additional elements (ie progress timer)
        DOM_CLASS_Toggles.toggle(DOM_CLASS_Toggles.outOfTime, true);
        break;

      case questionResult.correct:
        ++numCorrectAnswers;
        // Show the result text
        $(DOM_IDs.correct).removeClass(DOM_CLASS_Styles.dNone);
        // Style the indicator
        currentIndicator.addClass("bg-success");
        break;

      case questionResult.incorrect:
        ++numIncorrectAnswers;
        // Show the result text
        $(DOM_IDs.incorrect).removeClass(DOM_CLASS_Styles.dNone);
        // Style the indicator
        currentIndicator.addClass("bg-danger");
        break;

      default: ;
    }

    checkIfAtEnd();
  }

  function unlockChoices() {
    // Make answers selectable
    DOM_CLASS_Toggles.toggle(DOM_CLASS_Toggles.answersLocked, false);

    // Start countdown timer
    let multOfSecsLeft = SECONDS_PER_QUESTION * UPDATE_INTERVAL_DIVISOR;
    globalTimer = setInterval(() => {
      --multOfSecsLeft;

      let secondsLeft = (multOfSecsLeft / UPDATE_INTERVAL_DIVISOR); 
      // secondsLeft is likely a fraction
      // If less than 10 seconds, display a single decimal digit
      $(timeRemaining).text(
        (secondsLeft).toFixed(secondsLeft > 10 ? 0 : 1)
      );

      // Calculate the percentage of time remaining to update progress bar
      let percent = secondsLeft / SECONDS_PER_QUESTION * 100;
      $(timerProgressBar)
        .css("width", `${percent}%`)
        .attr("aria-valuenow", percent);

      // Check if out of time
      if (multOfSecsLeft === 0) {
        clearInterval(globalTimer); // stop the timer
        singleResult(questionResult.outoftime);
      }
    }, 1000 / UPDATE_INTERVAL_DIVISOR); // seconds to update timer displays
  }

  function revealChoices() {
    // Reveal choices on the _active_ carousel item
    $(`${DOM_SELECT_ActiveQuestion} .${DOM_CLASS_Styles.reveal}`).css("opacity", 1);

    // Timeout after reveal answers, then make selectable and start the timer
    // NB: this is to avoid the user clicking an answer before they realize
    setTimeout(unlockChoices, 1000 * 1.5); // seconds after revealing answers to make selectable
  }

  function startNewQuestion() {
    // Reset Timer elements to 'Full'
    $(timeRemaining).text(SECONDS_PER_QUESTION);
    $(timerProgressBar).css("width", "100%");
    DOM_CLASS_Toggles.toggle(DOM_CLASS_Toggles.outOfTime, false);

    // hide the previous question results
    [DOM_IDs.correct, DOM_IDs.incorrect, DOM_IDs.outOfTime].forEach ( id => {
      $(id).addClass(DOM_CLASS_Styles.dNone);
    });

    // Timeout to let user Read Question, then show choices
    setTimeout(revealChoices, 1000 * 1); // seconds to read question then reveal answers
  }

  function clickStart(event_ThatWeProbDontUse) {
    // Reveal Carousel of Questions
    DOM_CLASS_Toggles.toggle(DOM_CLASS_Toggles.onStart);
    startNewQuestion();
  }

  function clickedAnswer(event_ThatWeProbDontUse) {
    // Stop the timer
    clearInterval(globalTimer);

    // store the clicked button's letter, found by data attribute
    let clickedLetter = $(this).data(DOM_DATA_Attr.letter);
    // check our stored array of answers using the current question's index (by data attribute)
    let correctLetter = Correct_Letters[$(DOM_SELECT_ActiveQuestion).data(DOM_DATA_Attr.qIndex)];

    if (clickedLetter !== correctLetter) {
      // Style the selected answer button to 'wrong' (danger)
      $(this)
        .addClass("list-group-item-danger")
        .removeClass("list-group-item-info");
      singleResult(questionResult.incorrect);
    }
    else {
      singleResult(questionResult.correct);
    }

    
  }

  //#region START of EXECUTION
  // Link up the DOM elements by their ids
  for (let k of Object.keys(DOM_IDs)) {
    DOM_IDs[k] = document.getElementById(k);
  }
  // Run reset
  reset();
  //#endregion

  //#region  On Click FUNCTIONS
  $(startButton).on("click", clickStart);
  // Because the ACTIVE carousel item gets dynamically cycled, use document click handler
  $(document).on("click", DOM_SELECT_AnswerButtons, clickedAnswer);
  //#endregion
});

// shuffle the answers abcd
