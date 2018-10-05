// Cheating helper/tester
let isCheating = false;
function toggleCheat() {
  isCheating = !isCheating;
  console.log(`Cheating ${isCheating}`);
}

$(document).ready(function() {
  //#region Variables & Constants for Trivia Game
  const SECONDS_PER_QUESTION = 5;
  const UPDATE_INTERVAL_DIVISOR = 10; // update every tenth of a second
  const CHOICES_PER_QUESTION = 4; // DO NOT CHANGE - this is currently NOT flexible, questions are assumed as multiple-choice of 4 - the corresponding answer letters [A,B,C,D] are hard-coded

  const QUESTIONS = [
    { 
      quesText: "In what city was Archer born?",
      answers: [
        { text: "Berlin" },
        { text: "San Marcos" },
        { text: "Tangiers", correct: true },
        { text: "New York", }
      ]
    },
    {
      quesText: "Who is NOT possibly Archer's father?",
      answers: [
        { text: "Nikolai Jakov" },
        { text: "Len Trexler" },
        { text: "Buddy Rich" },
        { text: "Woodhouse", correct: true }
      ]
    },
    {
      quesText: "What is Archer's codename?",
      answers: [
        { text: "Duchess", correct: true },
        { text: "006" },
        { text: "Rainbow" },
        { text: "Bond" }
      ]
    },
    {
      quesText: "Who is Archer's worst enemy?",
      answers: [
        { text: "Burt Reynolds" },
        { text: "Barry Dylan", correct: true },
        { text: "Conway Stern" },
        { text: "Rip Riley" }
      ]
    },
    {
      quesText: "What type of firearm does Archer prefer?",
      answers: [
        { text: "Walther PPK"          , correct: true },
        { text: "Chekhov's gun"        , },
        { text: "TEC_9's"              , },
        { text: "Webley Mk VI Revolver", }
      ]
    },
    {
      quesText: "Why did Archer miss varsity lacrosse his freshman year?",
      answers: [
        { text: "Pneumonia", correct: true },
        { text: "Amnesia"  , },
        { text: "Coma"     , },
        { text: "Lead Poisoning", }
      ]
    },
    {
      quesText: "What is Archer's ringtone?",
      answers: [
        { text: "Mulatto Butts", correct: true },
        { text: "Trombone slide"  , },
        { text: "Danger Zone"     , },
        { text: "East Bound and Down", }
      ]
    },
    {
      quesText: "Archer is in remission from what cancer?",
      answers: [
        { text: "Breast", correct: true },
        { text: "Prostate"  , },
        { text: "Liver"     , },
        { text: "Lung", }
      ]
    },
    {
      quesText: "Which is NOT one of Archer's biggest fears?",
      answers: [
        { text: "Crocodiles", },
        { text: "Aneurisms" , },
        { text: "The Bermuda Triangle", },
        { text: "Death", correct: true }
      ]
    },
    {
      quesText: "What is Archer's most typical alias?",
      answers: [
        { text: "Randy", correct: true},
        { text: "Crenshaw" , },
        { text: "Slater", },
        { text: "Chet Manley", }
      ]
    },
    {
      quesText: "What CB Handle was given to Archer?",
      answers: [
        { text: "Lickbag", correct: true},
        { text: "Snowball" , },
        { text: "Bilbo", },
        { text: "Jerkins", }
      ]
    },
  ];

  const questionResult = { // intended as basic enum
      correct: "correct",
    incorrect: "incorrect",
    outOfTime: "outOfTime"
  };

  // variables initialized
  let Shuffled_Questions = Array(QUESTIONS.length);
  let Correct_Letters = Array(QUESTIONS.length);
  let globalTimer = null;

  // variables to be reset
  let TriviaGame = {
    numCorrectAnswers   : 0,
    numIncorrectAnswers : 0,
    numTimedOutAnswers  : 0,
    gameComplete        : false,
    reset() {
      this.numCorrectAnswers = 0;
      this.numIncorrectAnswers = 0;
      this.numTimedOutAnswers =0;
      this.gameComplete = false;
    }
  }
  //#endregion
  

  //#region just DOM things
  const DOM_IDs = {
    secondsPerQ     : null,
    questionCarousel: null,
    timeRemaining   : null,
    timerProgressBar: null,
    correct_text    : null,
    incorrect_text  : null,
    outOfTime_text  : null,
    numCorrect      : null, 
    numIncorrect    : null,
    numTimeOut      : null,
  };
  // Link up the DOM elements by their ids
  for (let k of Object.keys(DOM_IDs)) {
    DOM_IDs[k] = document.getElementById(k);
  }
  // One-off IDs that relate to game constants 
  $(DOM_IDs.secondsPerQ).text(SECONDS_PER_QUESTION);
  
  // Data Attributes
  // !! need to be lowercase, will be broken by 'under-the-hood' conversions if not 
  const DOM_DATA_Attr = {
    qIndex : "q-index".toLowerCase(),
    letter : "letter" .toLowerCase(),
    correct: "correct".toLowerCase(),
  };

  // Classes that apply a CSS style
  const DOM_CLASS_Styles = {
    reveal : "reveal" , // Transitions from 0 Opacity
    locked : "locked" , // Removes pointer events
    timesUp: "timesUp", // Warning/Danger style text
  };
  // Static Targets for events that toggle hide/show, a style above
  const DOM_JQ_Events = {
    // store the query results
    jq_hideOnStart : $(".hideOnStart" ),
    jq_showOnStart : $(".showOnStart" ),
    jq_showOnFinish: $(".showOnFinish"),
    jq_onTimeOut   : $(".onTimeOut"   ),

    hideOnStart () { this.jq_hideOnStart .hide(); },
    showOnStart () { this.jq_showOnStart .show(); },
    showOnFinish() { this.jq_showOnFinish.show(); },

    onTimeOut(isOut) { this.jq_onTimeOut.toggleClass(DOM_CLASS_Styles.timesUp, isOut); },
  };

  // Static Target Selects, held as jQuery (possibly array of targets)
  const DOM_JQ_Questions     = $(".carousel-inner");      // parent element that holds all the questions
  const DOM_JQ_Indicators    = $(".carousel-indicators"); // parent element of the carousel indicators  
  const DOM_JQ_SingleResults = $(".singleResult");
  const DOM_JQ_StartButtons  = $(".startButton");

  // Dynamic Target Selectors
  const DOM_SELECT_ActiveQuestion = ".carousel-item.active";
  const DOM_SELECT_AnswerButtons = `${DOM_SELECT_ActiveQuestion} button.list-group-item`;
  
  //// Question HTML Template
  const DOM_CLASS_QuestionText = "questionText";
  const DOM_CLASS_AnswersText = { // keys A,B,C,D are critical
    A: "Atext",
    B: "Btext",
    C: "Ctext",
    D: "Dtext"
  };

  const HTML_QUESTION_TEMPLATE = `
      <div class="row m-0 carousel-item">
        <h2 class="col-12 font-question pt-2 text-center"><span class="${DOM_CLASS_QuestionText}"></span></h2>
        <div class="col-12 text-dark">
          <div class="row justify-content-center">
            <div class="col-12 col-sm-9 col-lg-6 p-0 list-group 
            ${DOM_CLASS_Styles.reveal}">
              <button type="button" 
               class="${DOM_CLASS_Styles.locked} row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0" 
               data-${DOM_DATA_Attr.letter}="A">
                <span class="col-2 font-special">a.</span>
                <span class="col ${DOM_CLASS_AnswersText.A}"></span>
              </button>
              <button type="button" 
               class="${DOM_CLASS_Styles.locked} row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0" 
               data-${DOM_DATA_Attr.letter}="B">
                <span class="col-2 font-special">b.</span>
                <span class="col ${DOM_CLASS_AnswersText.B}"></span>
              </button>
              <button type="button" 
               class="${DOM_CLASS_Styles.locked} row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0"
               data-${DOM_DATA_Attr.letter}="C">
                <span class="col-2 font-special">c.</span>
                <span class="col ${DOM_CLASS_AnswersText.C}"></span>
              </button>
              <button type="button" 
               class="${DOM_CLASS_Styles.locked} row d-flex list-group-item list-group-item-action list-group-item-info py-4 m-0" 
               data-${DOM_DATA_Attr.letter}="D">
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

  // Returns the current/active question's correct-answer letter, stored in array
  let getActiveCorrectLetter = () => Correct_Letters[$(DOM_SELECT_ActiveQuestion).data(DOM_DATA_Attr.qIndex)];
  ;
  //#endregion


  function constructQuesHTMLFrom(questionObj, questionIndex) {
    // Start with a new template
    let result = $(HTML_QUESTION_TEMPLATE);

    // Attach a data attribute for this questions index number
    result.attr(`data-${DOM_DATA_Attr.qIndex}`, questionIndex);

    // Replace sections of the template with properties from the passed in question object
    result.find(`.${DOM_CLASS_QuestionText}`).text(questionObj.quesText);

    // Make a shuffled/random array of indices [0..# of choices] - eg [3,2,4,1]  if (4) choices
    let shuffledIndices = Shuffle(Array.from(Array(CHOICES_PER_QUESTION).keys()));
    let answerLetter = 'A'; // default, incase the object doesn't indicate a correct answer
    (Object.keys(DOM_CLASS_AnswersText)).forEach( (letter, index) => {
      let answerObj = questionObj.answers[shuffledIndices[index]];
      result
        .find(`.${DOM_CLASS_AnswersText[letter]}`)
        .text(answerObj.text);
      
        if (answerObj.correct) { answerLetter = letter; } // keep overwriting the correct answer letter, in case more than one was indicated as correct
    });
    // store the correct answer as its letter, to be checked against later when player is selecting answer buttons
    Correct_Letters[questionIndex] = answerLetter;

    return result; // Give back newly constructed jQuery object
  }

  function reset() {
    // Reset Game Variables
    TriviaGame.reset();

    DOM_JQ_Events.hideOnStart();

    // Make a new array that is shuffled from the QUESTIONS array
    Shuffled_Questions = Shuffle(Array.from(Array(QUESTIONS.length).keys()))
      .map(shuffledIndex => QUESTIONS[shuffledIndex]);

    // Construct the carousel items for each question
    DOM_JQ_Questions.empty();
    DOM_JQ_Indicators.empty().addClass(DOM_CLASS_Styles.locked);

    Shuffled_Questions.forEach((questionObj, index) => {
      // Construct a new question set of elements (uses template)
      DOM_JQ_Questions
        .append(constructQuesHTMLFrom(questionObj, index));

      
      // add a li item to carousel's indicator list
      DOM_JQ_Indicators
        .append($("<li>")
          .attr(`data-target`, `#${DOM_IDs.questionCarousel.id}`)
          .attr(`data-slide-to`, index));
    });

    // Make the first question (carousel-item & indicator) the active one
    $(".carousel-item").first().addClass("active");
    DOM_JQ_Indicators.find('li').first().addClass("active");
  }

  function finalResults() {
    DOM_JQ_Events.showOnFinish();
    DOM_JQ_Indicators.removeClass(DOM_CLASS_Styles.locked); // make indicators clickable
    $(DOM_IDs.numCorrect  ).text(TriviaGame.numCorrectAnswers  );
    $(DOM_IDs.numIncorrect).text(TriviaGame.numIncorrectAnswers);
    $(DOM_IDs.numTimeOut  ).text(TriviaGame.numTimedOutAnswers );
  }
  
  function singleResult(result) {
    // No matter the result, lock the answers
    $(DOM_SELECT_AnswerButtons).addClass(DOM_CLASS_Styles.locked)

    // Target the correct answer button, to restyle it below
    let correctButton = $(`${DOM_SELECT_AnswerButtons}[data-letter="${getActiveCorrectLetter()}"]`);
    correctButton.removeClass("list-group-item-info");

    // Target the active carousel indicator to restyle it below
    let currentIndicator = DOM_JQ_Indicators.find("li.active");

    switch (result) {
      case questionResult.outOfTime:
        ++TriviaGame.numTimedOutAnswers; // update variable counter
        $(DOM_IDs.outOfTime_text).show(); // Show the result text
        correctButton.addClass("list-group-item-warning") // Style the Correct Button
        currentIndicator.addClass("bg-warning"); // Style the indicator
        break;

      case questionResult.correct:
        ++TriviaGame.numCorrectAnswers; // update variable counter
        $(DOM_IDs.correct_text).show(); // Show the result text
        correctButton.addClass("list-group-item-success"); // // Style the Correct Button
        currentIndicator.addClass("bg-success"); // Style the indicator
        break;

      case questionResult.incorrect:
        ++TriviaGame.numIncorrectAnswers; // update variable counter
        $(DOM_IDs.incorrect_text).show(); // Show the result text
        correctButton.addClass("list-group-item-success"); // Style the Correct Button   
        currentIndicator.addClass("bg-danger"); // Style the indicator
        break;

      default: ;
    }

    // Timeout for user to see result
    setTimeout(() => {
      // Hide the single question results
      DOM_JQ_SingleResults.hide();
      // Clear timesUp style class
      DOM_JQ_Events.onTimeOut(false);
      
      checkIfAtEnd();
    }, 1000 * 1.5); // seconds to wait before going to next question
  }

  function unlockChoices() {
    // Make answers selectable
    $(DOM_SELECT_AnswerButtons).removeClass(DOM_CLASS_Styles.locked)

    // Start countdown timer
    let multOfSecsLeft = SECONDS_PER_QUESTION * UPDATE_INTERVAL_DIVISOR;
    globalTimer = setInterval(() => {
      // Check if out of time. 
      // Checking at top of function to get full, last interval
      if (multOfSecsLeft === 0) {
        clearInterval(globalTimer); // stop the timer
        // Style elements on this event (ie progress timer)
        DOM_JQ_Events.onTimeOut(true);
        singleResult(questionResult.outOfTime); // show result
      }
      else {
        --multOfSecsLeft;

        let secondsLeft = (multOfSecsLeft / UPDATE_INTERVAL_DIVISOR);
        // If less than 10 seconds, display a single decimal digit
        $(DOM_IDs.timeRemaining).text(
          (secondsLeft).toFixed(secondsLeft > 10 ? 0 : 1)
        );

        // Calculate the percentage of time remaining to update progress bar
        let percent = secondsLeft / SECONDS_PER_QUESTION * 100;
        $(DOM_IDs.timerProgressBar)
          .css("width", `${percent}%`)
          .attr("aria-valuenow", percent);
      }
    }, 1000 / UPDATE_INTERVAL_DIVISOR); // seconds to update timer displays
  }
  
  function revealChoices() {
    // Reveal choices on the _active_ carousel item
    $(`${DOM_SELECT_ActiveQuestion} .${DOM_CLASS_Styles.reveal}`).css("opacity", 1);

    // Timeout after revealing answers to then make answer selectable and starts the timer
    // NB: this is to avoid the user clicking an answer before they realize
    setTimeout(unlockChoices, 1000 * 1.5); // seconds after revealing answers to make selectable
  }

  function startNewQuestion() {
    // Reset Timer elements to 'Full'
    $(DOM_IDs.timeRemaining   ).text(SECONDS_PER_QUESTION);
    $(DOM_IDs.timerProgressBar).css("width", "100%");

    if (isCheating) {
      console.log('\n', $(`${DOM_SELECT_ActiveQuestion} .${DOM_CLASS_QuestionText}`).text());
      ( (correctLetter) => {
        console.log(`Answer: ${correctLetter}`);
        console.log($(`${DOM_SELECT_ActiveQuestion} .${DOM_CLASS_AnswersText[correctLetter]}`).text());
      })(getActiveCorrectLetter());
    }

    // Timeout to let user Read Question, then show choices
    setTimeout(revealChoices, 1000 * 1); // seconds to read question then reveal answers
  }

  // Hook into carousel's transitioning, and only proceed when slide is COMPLETE (slid)
  $(DOM_IDs.questionCarousel).on('slid.bs.carousel', function() {
    if (!TriviaGame.gameComplete) { // only start a new question on this trigger if game is not over
      startNewQuestion();
    }
  });
  function checkIfAtEnd() {
    // This is the last question if its data's index is equal to last index of array (length -1)
    if ($(DOM_SELECT_ActiveQuestion).data(DOM_DATA_Attr.qIndex) === Shuffled_Questions.length - 1) {
      TriviaGame.gameComplete = true;
      finalResults();
    }
    else {  
      // Bootstrap's carousel function, will update the .active .carousel-item & indicator
      $(DOM_IDs.questionCarousel).carousel("next"); // above will call startNewQuestion when complete
    }
  }

  function clickedAnswer(event_ThatWeProbDontUse) {
    // Stop the timer
    clearInterval(globalTimer);

    // compare the current buttons letter (by data attribute) against the current question's correct answer letter
    if ($(this).data(DOM_DATA_Attr.letter) === getActiveCorrectLetter()) { // user clicked correctly
      // Show the correct result
      singleResult(questionResult.correct);
    }
    else { // user clicked incorrectly
      // Style the selected answer button to 'wrong' (danger)
      $(this)
        .addClass("list-group-item-danger")
        .removeClass("list-group-item-info");
      // Show the incorrect result
      singleResult(questionResult.incorrect);
    }
  }

  function clickStart(event_ThatWeProbDontUse) {
    // Run Reset
    reset();
    // Reveal Carousel of Questions
    DOM_JQ_Events.showOnStart();
    // Start the first question
    startNewQuestion();
  }

  //#region START of EXECUTION
  console.log(
  `For testing purposes: 
To toggle showing the correct answer's letter, run toggleCheat() here in the console.
Answer will appear on next trivia question.`);
  //#endregion

  //#region On Event FUNCTIONS
  DOM_JQ_StartButtons.on("click", clickStart);
  // Because the ACTIVE carousel item gets dynamically cycled, use document click handler instead
  $(document).on("click", DOM_SELECT_AnswerButtons, clickedAnswer);
  //#endregion
});