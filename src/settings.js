'use strict'

import * as f from "./functions.js";

// let settings 
let settingsString = window.localStorage.getItem('settings');;
let settings = JSON.parse(settingsString);

console.log('STRING', settingsString);
console.log('OBJECT', settings);

window.addEventListener('load', () => {

  // MODE settings initialization
  document.getElementById('free-time').checked = settings.mode.isFreeTime
  document.getElementById('until-mistake').checked = settings.mode.isUntilMistake
  document.getElementById('time-period').checked = settings.mode.isTimePeriod
  setValueToControls('time-period-control', settings.mode.timePeriod)
  document.getElementById('task-number').checked = settings.mode.isTaskNumber
  setValueToControls('task-number-control', settings.mode.taskNumber)
  
  // LIMITS settings initialization
  document.getElementById('positive-only').checked = settings.limits.isOnlyPositive
  document.getElementById('manual-entry').checked = settings.limits.isManualEntry
  document.getElementById('result-only').checked = settings.limits.isResultOnly
  // document.getElementById('time-limit').checked = settings.limits.isTimeLimitPerTask
  // setValueToControls('time-limit-control', settings.limits.timeLimitPerTask)
  setValueToControls('max-value-add-subtr-control', settings.limits.maxValueAddSubtr)
  setValueToControls('max-value-mult-div-control', settings.limits.maxValueMultDiv)

  controlsInit ()
  operatorsInit()
})

// console.log(window.localStorage.getItem('settings'));

window.addEventListener('beforeunload', () => {
  console.log(settings);
  window.localStorage.setItem('settings', JSON.stringify(settings))
})

// f.removeItemByValue(settings.operators,'a')
// f.removeItemByValue(settings.operators,'xxx')
// f.removeItemByValue(settings.operators,'')
// console.log(settings);

// ===== OPERATORS =====
// get OPERATORS variables
const operatorsElement = document.getElementById('operators');

const add = '+';
const sub = '-';
const mult = '·';
const div = ':';
const operatorArray = [add, sub, mult, div];

// window.localStorage.setItem('anArr', operatorArray)

const operators = {
  'multiplication': mult,
  'addition': add,
  'subtraction': sub,
  'division': div,
}

// get OPERATORS data
if (operatorsElement) {
  operatorsElement.addEventListener('click', (event) => {
    const operator = event.target;
    if (operator.classList.contains('radio__input')) {
      f.updateArray(operator.checked, settings.operators, operators[operator.id])
      console.log(settings.operators)
    }
  })
}

// ===== EXERCISE MODE =====
// get EXERCISE MODE variables
const exerciseMode = document.getElementById('exrcise-mode');

// get EXERCISE MODE data
if (exerciseMode) {
  exerciseMode.addEventListener('click', (event) => {
    const operator = event.target;
    if (operator.classList.contains('radio__input')) {
      settings.mode.isFreeTime = false
      settings.mode.isUntilMistake = false
      settings.mode.isTimePeriod = false
      settings.mode.isTaskNumber = false
      // inputInit ();
      switch (operator.id) {
        case 'free-time':
          settings.mode.isFreeTime = operator.checked
          controlsInit ();
          break;
        case 'until-mistake':
          settings.mode.isUntilMistake = operator.checked
          controlsInit ();
        break;
        case 'time-period':
          settings.mode.isTimePeriod = operator.checked
          controlsInit ();
          break;
        case 'task-number':
          settings.mode.isTaskNumber = operator.checked
          controlsInit ();
          break;
      }
    }
  })
}

// ===== LIMITS =====
// get LIMITS variables
const limits = document.getElementById('limits');

const timePeriodControl = document.getElementById('time-period-control')
const taskNumberControl = document.getElementById('task-number-control')
// const timeLimitPerTaskControl = document.getElementById('time-limit-control')

// let isOnlyPositive = true;
// let isTimeLimitPerTask = false;

// get LIMITS data
limits.addEventListener('click', (event) => {
  const operator = event.target;
  if (operator.classList.contains('radio__input')) {
    switch (operator.id) {
      case 'positive-only':
        // isOnlyPositive = operator.checked;
        settings.limits.isOnlyPositive = operator.checked;
        break;
      case 'manual-entry':
        // isOnlyPositive = operator.checked;
        settings.limits.isManualEntry = operator.checked;
        break;
      case 'result-only':
        // isOnlyPositive = operator.checked;
        settings.limits.isResultOnly = operator.checked;
        break;
      // case 'time-limit':
      //   // isTimeLimitPerTask = operator.checked;
      //   settings.limits.isTimeLimitPerTask = operator.checked;
      //   break;
      // case 'subtraction':
      //   isSubtraction = operator.checked;
      //   break;
      // case 'division':
      //   isDivision = operator.checked;
      //   break;
    }
    controlsInit ();
  }
})

function controlsInit () {
  timePeriodControl.style.display = settings.mode.isTimePeriod ? 'flex' : 'none';
  taskNumberControl.style.display = settings.mode.isTaskNumber ? 'flex' : 'none';
  // timeLimitPerTaskControl.style.display = settings.limits.isTimeLimitPerTask ? 'flex' : 'none';
}

function operatorsInit() {
  document.getElementById('addition').checked
    = settings.operators.includes(add)
  document.getElementById('subtraction').checked
    = settings.operators.includes(sub)
  document.getElementById('multiplication').checked
    = settings.operators.includes(mult)
  document.getElementById('division').checked
    = settings.operators.includes(div)
}

function valuesInit() {
  settings.mode.timePeriod = getValueFromControls('time-period-control');
  settings.mode.taskNumber = getValueFromControls('task-number-control');

  // settings.limits.timeLimitPerTask = getValueFromControls('time-limit-control');
  settings.limits.maxValueAddSubtr = getValueFromControls('max-value-add-subtr-control');
  settings.limits.maxValueMultDiv = getValueFromControls('max-value-mult-div-control');
}

const controls = document.getElementsByClassName('set-value');

const MAX_VALUE = 99;
const MIN_VALUE = 1;

for (const control of controls) {
  control.addEventListener('click', (event) => {
    const valueLabel = control.children[1];
    const targetElement = event.target;
    const changeBy = event.ctrlKey ? 100 : event.shiftKey ? 10 : 1

    let value = +valueLabel.innerText

    if(targetElement.classList.contains('set-value__button')) {
      event.preventDefault();
      if(targetElement.innerText === '+') {
        value = value + changeBy > MAX_VALUE ? MAX_VALUE : value + changeBy;
      }
      if(targetElement.innerText === '-') {
        value = value - changeBy < MIN_VALUE ? MIN_VALUE : value - changeBy;
      }
      valueLabel.innerText = value
      valuesInit();
      // console.log('CONTROLS',settings);
    }
  })
}

function getValueFromControls(id) {
  return document.getElementById(id).children[1].innerText;
}

function setValueToControls(id, value) {
  document.getElementById(id).children[1].innerText = value;
}

// controlsInit();
// operatorsInit()


function getTimer () {
  const startTimer = Date.now()
  
  refreshTimeInterval = setInterval(() => {
    let timeDiff = Date.now() - startTimer
    let seconds = (Math.floor(timeDiff / 1000) % 60).toString().padStart(2,'0')
    let minutes = Math.floor(timeDiff / (60 * 1000)).toString().padStart(2,'0')
    timerElement.innerText = minutes + ":" + seconds;
    console.log(timerElement.innerText);
  }, 1000)

  // refreshTimeInterval;
}

console.log('tttt');

// const settingsEl = document.getElementById('settings')
// console.log(settingsEl.style.transform = 'scale(0)');
// settingsEl.addEventListener('load', () => {
//   console.log('loaded');
//   settingsEl.style.transform = 'scale(0.5)'
//   settingsEl.style.backgroundColor = '#fff'
// })