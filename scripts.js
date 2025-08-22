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
const DECIMAL_INPUT = "."

const OPERATION_KEYS = [
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

const OPERAND_KEYS = [
  ADD_INPUT,
  SUBTRACT_INPUT,
  MULTIPLY_INPUT,
  DIVIDE_INPUT,
];

const OPERANDS = {
  [ADD_INPUT]: add,
  [SUBTRACT_INPUT]: subtract,
  [MULTIPLY_INPUT]: multiply,
  [DIVIDE_INPUT]: divide
}

const DECIMAL_PLACE_MAX = 8;

const X_INDEX = 0;
const OPERAND_INDEX = 1;

const Y_INDEX = 2;
const RESULT_INDEX = 3;

let args = ["0", null, null, null];
let currentIndex = X_INDEX;
let isError = false;


/**
 * Main State Machine
 */
function handleCurrentIndex(inputValue) {
  if (isError) {
    resetCalculator();
    return;
  }

  const isNumber = buttonValueIsNumber(inputValue);
  const isOperand = OPERAND_KEYS.includes(inputValue);

  switch (currentIndex) {
    case X_INDEX:
      if (inputValue === CLEAR_INPUT) {
        resetCalculator();
      } else if (inputValue === DELETE_INPUT) {
        doDeleteKeyPress();
      } else if (inputValue === DECIMAL_INPUT) {
        addToArg(inputValue);
      } else if (inputValue === NEGATIVE_INPUT) {
        doNegativeKeyPress();
      } else if (inputValue === EQUALS_INPUT) {
        // do nothing
      } else if (isOperand) {
        args[OPERAND_INDEX] = inputValue;
        currentIndex = OPERAND_INDEX;
      } else if (isNumber) {
        addToArg(inputValue);
      }
      break;

    case OPERAND_INDEX:
      if (inputValue === CLEAR_INPUT) {
        resetCalculator();
      } else if (inputValue === DELETE_INPUT) {
        // Do nothing
      } else if (inputValue === DECIMAL_INPUT) {
        currentIndex = Y_INDEX;
        addToArg(inputValue);
      } else if (inputValue === NEGATIVE_INPUT) {
        // Do nothing
      } else if (inputValue === EQUALS_INPUT) {
        // Do nothing
      } else if (isOperand) {
        args[OPERAND_INDEX] = inputValue;
      } else if (isNumber) {
        currentIndex = Y_INDEX;
        addToArg(inputValue);
      }
      break;

    case Y_INDEX:
      if (inputValue === CLEAR_INPUT) {
        resetCalculator();
      } else if (inputValue === DELETE_INPUT) {
        doDeleteKeyPress();
      } else if (inputValue === DECIMAL_INPUT) {
        addToArg(inputValue);
      } else if (inputValue === NEGATIVE_INPUT) {
        doNegativeKeyPress();
      } else if (inputValue === EQUALS_INPUT) {
        args[RESULT_INDEX] = operate();
        currentIndex = RESULT_INDEX;
        logResult();
      } else if (isOperand) {
        args[RESULT_INDEX] = operate();
        logResult();
        restartCalculator(inputValue);
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
        currentIndex = X_INDEX;
      } else if (inputValue === NEGATIVE_INPUT) {
        // Do nothing
      } else if (inputValue === EQUALS_INPUT) {
        // Do nothing
      } else if (isOperand) {
        restartCalculator(inputValue);
      } else if (isNumber) {
        args = [inputValue, null, null, null];
        currentIndex = X_INDEX;
      }
      break;

    default:
      // Invalid key
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
    isError = true;
    return "Cannot Divide By 0!"
  }
}


function operate() {
  const x = Number(args[X_INDEX]);
  const y = Number(args[Y_INDEX]);
  const operand = args[OPERAND_INDEX];

  return OPERANDS[operand](x, y);
}


/**
 * Input processing
 */
function handleKeyboardInput(e) {
  e.preventDefault();  // Prevent Firefox Quick Search
  let key = e.key;
  let keyval = key;

  if (key === "Escape") {
    keyval = CLEAR_INPUT;
  } else if (key === "Enter") {
    keyval = EQUALS_INPUT;
  } else if (key === "Backspace") {
    keyval = DELETE_INPUT;
  }

  if (OPERATION_KEYS.includes(keyval) || buttonValueIsNumber(keyval)) {
    handleCurrentIndex(keyval);
    const el = document.querySelector(".button[data-keyval='" + key + "']");
    el.classList.add("active-button");
  }
}


function handleClickInput(e) {
  const button = e.target;
  const val = getButtonValue(button);
  handleCurrentIndex(val);
}


function doDeleteKeyPress() {
  if (args[currentIndex]) {
    if (args[currentIndex].length > 1 && args[currentIndex].charAt(0) != "-") {
      args[currentIndex] = args[currentIndex].slice(0, -1);
    } else {
      args[currentIndex] = "0";
    }
  }
}


function doNegativeKeyPress() {
  if (args[currentIndex]) {
    let arg = Number(args[currentIndex]);
    if (arg > 0) {
      args[currentIndex] = "-" + args[currentIndex];
    } else if (arg < 0) {
      args[currentIndex] = args[currentIndex].slice(1);
    }
  }
}


/**
 * Input manipulation
 */
function getButtonValue(button) {
  return button.innerHTML;
}


function buttonValueIsNumber(buttonValue) {
  return Number(buttonValue) || buttonValue == 0;
}


function addToArg(value) {
  if (args[currentIndex] == "0" || args[currentIndex] === null) {
    if (value === DECIMAL_INPUT) {
      args[currentIndex] = "0."
    } else {
      args[currentIndex] = value;
    }
  } else {
    args[currentIndex] += value;
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

  const msg = `<p>> ${x} ${operand} ${y} = ${result}</p>`;
  const log = document.querySelector("#log");
  log.innerHTML += msg;
}


/**
 * Calculator intitializaion/setup
 */
function restartCalculator(nextOperand) {
  const newX = args[RESULT_INDEX];
  args = [newX, nextOperand, null, null];
  currentIndex = Y_INDEX;
}


function resetCalculator() {
  args = [0, null, null, null];
  currentIndex = X_INDEX;
  isError = false;
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
  let keyval = key;

  if (key === "Escape") {
    keyval = CLEAR_INPUT;
  } else if (key === "Enter") {
    keyval = EQUALS_INPUT;
  } else if (key === "Backspace") {
    keyval = DELETE_INPUT;
  }

  if (OPERATION_KEYS.includes(keyval) || buttonValueIsNumber(keyval)) {
    const el = document.querySelector(".button[data-keyval='" + key + "']");
    el.classList.remove("active-button");
  }
});
