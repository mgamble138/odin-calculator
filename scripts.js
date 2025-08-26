/**
 * Constants & Global Variables
 */
const ADD_INPUT = "+";
const SUBTRACT_INPUT = "-";
const MULTIPLY_INPUT = "*";
const DIVIDE_INPUT = "/";
const EQUALS_INPUT = "=";
const CLEAR_INPUT = "clr";
const DELETE_INPUT = "del";
const NEGATIVE_INPUT = "-/+";
const DECIMAL_INPUT = ".";

const OPERAND_KEYS = [
  ADD_INPUT,
  SUBTRACT_INPUT,
  MULTIPLY_INPUT,
  DIVIDE_INPUT,
];

const OPERAND_FUNCTIONS = {
  [ADD_INPUT]: add,
  [SUBTRACT_INPUT]: subtract,
  [MULTIPLY_INPUT]: multiply,
  [DIVIDE_INPUT]: divide
};

const DECIMAL_PLACE_MAX = 8;

const X_INDEX = 0;
const OPERAND_INDEX = 1;
const Y_INDEX = 2;
const RESULT_INDEX = 3;
const ERROR_STATE = 4;

let currentState = X_INDEX;
let args = ["0", null, null, null];


/**
 * Main State Machine
 */
function handleCurrentState(inputValue) {
  const isNumber = keyIsNumber(inputValue);
  const isOperand = OPERAND_KEYS.includes(inputValue);

  switch (currentState) {
    case X_INDEX:
      if (inputValue === CLEAR_INPUT) {
        resetCalculator();
      } else if (inputValue === DELETE_INPUT) {
        handleDeleteKey();
      } else if (inputValue === DECIMAL_INPUT) {
        addToArg(inputValue);
      } else if (inputValue === NEGATIVE_INPUT) {
        handleNegativeKey();
      } else if (inputValue === EQUALS_INPUT) {
        // do nothing
      } else if (isOperand) {
        args[OPERAND_INDEX] = inputValue;
        currentState = OPERAND_INDEX;
      } else if (isNumber) {
        addToArg(inputValue);
      }
      break;

    case OPERAND_INDEX:
      if (inputValue === CLEAR_INPUT) {
        resetCalculator();
      } else if (inputValue === DELETE_INPUT) {
        args[currentState] = null;
        currentState = X_INDEX;
      } else if (inputValue === DECIMAL_INPUT) {
        currentState = Y_INDEX;
        addToArg(inputValue);
      } else if (inputValue === NEGATIVE_INPUT) {
        // Do nothing
      } else if (inputValue === EQUALS_INPUT) {
        // Do nothing
      } else if (isOperand) {
        args[OPERAND_INDEX] = inputValue;
      } else if (isNumber) {
        currentState = Y_INDEX;
        addToArg(inputValue);
      }
      break;

    case Y_INDEX:
      if (inputValue === CLEAR_INPUT) {
        resetCalculator();
      } else if (inputValue === DELETE_INPUT) {
        handleDeleteKey();
      } else if (inputValue === DECIMAL_INPUT) {
        addToArg(inputValue);
      } else if (inputValue === NEGATIVE_INPUT) {
        handleNegativeKey();
      } else if (inputValue === EQUALS_INPUT) {
        args[RESULT_INDEX] = operate();
        if (currentState != ERROR_STATE) {
          currentState = RESULT_INDEX;
        }
        logResult();
      } else if (isOperand) {
        args[RESULT_INDEX] = operate();
        logResult();
        if (currentState != ERROR_STATE) {
          restartCalculator(inputValue);
        }
      } else if (isNumber) {
        addToArg(inputValue);
      }
      break;

    case RESULT_INDEX:
      if (inputValue === CLEAR_INPUT) {
        resetCalculator();
      } else if (inputValue === DELETE_INPUT) {
        // Do nothing
      } else if (inputValue === DECIMAL_INPUT) {
        args = ["0.", null, null, null];
        currentState = X_INDEX;
      } else if (inputValue === NEGATIVE_INPUT) {
        // Do nothing
      } else if (inputValue === EQUALS_INPUT) {
        // Do nothing
      } else if (isOperand) {
        restartCalculator(inputValue);
      } else if (isNumber) {
        args = [inputValue, null, null, null];
        currentState = X_INDEX;
      }
      break;

    case ERROR_STATE:
      if (keyIsOperation(inputValue)  || keyIsNumber(inputValue)) {
        resetCalculator();
      }
      break;

    default:
      // Invalid state. This should not occur.
      break;
  }

  updateTextDisplay();
}


/**
 * Calculation functions
 */
function add(x, y) {
  return x + y;
}


function subtract(x, y) {
  return x - y;
}


function multiply(x, y) {
  return x * y;
}


function divide(x, y) {
  if (y != 0) {
    return Number((x / y).toFixed(DECIMAL_PLACE_MAX));
  } else {
    currentState = ERROR_STATE;
    return "Cannot Divide By 0!"
  }
}


function operate() {
  const x = Number(args[X_INDEX]);
  const y = Number(args[Y_INDEX]);
  const operand = args[OPERAND_INDEX];

  return OPERAND_FUNCTIONS[operand](x, y);
}


/**
 * Input processing
 */
function handleKeyboardInput(e) {
  e.preventDefault();  // Prevent Firefox Quick Search from hijacking '/' key.
  let key = e.key;
  let key_cleaned = key;

  if (key === "Escape") {
    key_cleaned = CLEAR_INPUT;
  } else if (key === "Enter") {
    key_cleaned = EQUALS_INPUT;
  } else if (key === "Backspace") {
    key_cleaned = DELETE_INPUT;
  }

  if (keyIsOperation(key_cleaned) || keyIsNumber(key_cleaned)) {
    handleCurrentState(key_cleaned);
    const el = document.querySelector(".button[data-keyval='" + key + "']");
    el.classList.add("active-button");
  }
}


function handleClickInput(e) {
  const button = e.target;
  const val = getKeyValue(button);
  handleCurrentState(val);
}


function handleDeleteKey() {
  if (args[currentState]) {
    if (args[currentState].length > 1 && args[currentState].charAt(0) != "-") {
      args[currentState] = args[currentState].slice(0, -1);
    } else {
      args[currentState] = "0";
    }
  }
}


function handleNegativeKey() {
  if (args[currentState]) {
    let arg = Number(args[currentState]);
    if (arg > 0) {
      args[currentState] = "-" + args[currentState];
    } else if (arg < 0) {
      args[currentState] = args[currentState].slice(1);
    }
  }
}


/**
 * Input manipulation
 */
function getKeyValue(button) {
  return button.innerHTML;
}


function keyIsNumber(buttonValue) {
  return Number(buttonValue) || buttonValue == 0;
}


function keyIsOperation(key) {
  const operation_keys = [
    ADD_INPUT,
    SUBTRACT_INPUT,
    MULTIPLY_INPUT,
    DIVIDE_INPUT,
    EQUALS_INPUT,
    CLEAR_INPUT,
    DELETE_INPUT,
    NEGATIVE_INPUT,
    DECIMAL_INPUT,
  ];
  return operation_keys.includes(key);
}


function addToArg(value) {
  if (args[currentState] == "0" || args[currentState] === null) {
    if (value === DECIMAL_INPUT) {
      args[currentState] = "0."
    } else {
      args[currentState] = value;
    }
  } else {
    args[currentState] += value;
  }
}


/**
 * Display functions
 */
function updateTextDisplay() {
  let msg;
  if (args[RESULT_INDEX]) {
    msg = args[RESULT_INDEX];
  } else {
    msg = args.join(" ");
  }
  const display = document.querySelector("#ver-txt");
  display.innerHTML = msg;
}


function logResult() {
  const x = Number(args[X_INDEX]);
  const y = Number(args[Y_INDEX]);
  const operand = args[OPERAND_INDEX];
  const result = args[RESULT_INDEX];

  const msg = `<p>>  ${x} ${operand} ${y} = ${result}</p>`;
  const log = document.querySelector("#log");
  log.innerHTML += msg;
}


/**
 * Calculator intitializaion/setup
 */
function restartCalculator(nextOperand) {
  const newX = args[RESULT_INDEX];
  args = [newX, nextOperand, null, null];
  currentState = Y_INDEX;
}


function resetCalculator() {
  args = [0, null, null, null];
  currentState = X_INDEX;
  const log = document.querySelector("#log");
  log.innerHTML = null;
}


/**
 * Events
 */
document.addEventListener("DOMContentLoaded", function() {
  updateTextDisplay();

  const buttons = document.querySelectorAll(".button");
  buttons.forEach(button => {
    button.addEventListener("click", handleClickInput);
  });
});


document.addEventListener("keydown", handleKeyboardInput);


document.addEventListener("keyup", (e) => {
  let key = e.key;
  let key_cleaned = key;

  if (key === "Escape") {
    key_cleaned = CLEAR_INPUT;
  } else if (key === "Enter") {
    key_cleaned = EQUALS_INPUT;
  } else if (key === "Backspace") {
    key_cleaned = DELETE_INPUT;
  }

  if (keyIsOperation(key_cleaned) || keyIsNumber(key_cleaned)) {
    const el = document.querySelector(".button[data-keyval='" + key + "']");
    el.classList.remove("active-button");
  }
});
