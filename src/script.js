'use strict'

import * as f from './functions.js'

const settingsObject = {
    'operators' : ['+','-','·',':'],
    'mode' : {
      'isFreeTime' : true,
      'isUntilMistake' : false,
      'isTimePeriod' : false,
      'timePeriod' : 2,
      'isTaskNumber' : false,
      'taskNumber' : 10,
    },
    'limits' : {
      'isOnlyPositive' : true,
      'isManualEntry' : false,
      'isResultOnly': false,
      'maxValueAddSubtr' : 100,
      'maxValueMultDiv' : 11,
    }
  }


const settingsFromStorage = window.localStorage.getItem('settings')
// console.log(settingsFromStorage.indexOf('operators'));

const settings = (settingsFromStorage && settingsFromStorage.indexOf('operators')>=0)
  ? JSON.parse(settingsFromStorage)
  : settingsObject

window.addEventListener('beforeunload', () => {
  window.localStorage.setItem('settings', JSON.stringify(settings))
})

const add = '+';
const sub = '-';
const mult = '·';
const div = ':';

// let isGameRunning = false

const startButton = document.getElementById('go-button');
const stopBlock = document.getElementById('stop');
const stopButton = document.getElementById('stop-button');

// set constraints for values in task
const MAX_VALUE_AS = settings.limits.maxValueAddSubtr
const MIN_VALUE_AS = settings.limits.isOnlyPositive ? 0 : -MAX_VALUE_AS
const MAX_VALUE_MD = settings.limits.maxValueMultDiv
const MIN_VALUE_MD = settings.limits.isOnlyPositive ? 2 : -MAX_VALUE_MD

const TASK_NUMBER_LIMIT = +settings.mode.taskNumber;
const GAME_TIME_LIMIT = +settings.mode.timePeriod * 60 * 1000;

let value_1;
let value_2;
let result;
let values;
let generateOperator;
let hidden_value;
let answers = []



const value_1_el = document.getElementById('value-1')
const value_2_el = document.getElementById('value-2')
const operator_el = document.getElementById('operator')
const result_el = document.getElementById('result')

function initTask() {
  generateOperator = f.getRandomElementFromArray(settings.operators)

  switch (generateOperator) {
    case add:
    case sub:
      value_1 = f.getValueInRange(MIN_VALUE_AS, MAX_VALUE_AS)
      value_2 = f.getValueInRange(MIN_VALUE_AS, MAX_VALUE_AS)
      result = value_1 + value_2
      break;
    case mult:
    case div:
      value_1 = f.getValueInRange(MIN_VALUE_MD, MAX_VALUE_MD,true)
      value_2 = f.getValueInRange(MIN_VALUE_MD, MAX_VALUE_MD,true)
      result = value_1 * value_2
  }

  switch (generateOperator) {
    case sub:
    case div:
      [value_1, result] = [result, value_1]
  }
}

function getHiddenValue (arr) {
  const index = f.getValueInRange(0, arr.length - 1);
  return arr.splice(index, 1, '?')
}



function renderTask() {
  [value_1_el.value, value_2_el.value, result_el.value] = values

  value_1_el.disabled = true
  value_2_el.disabled = true
  result_el.disabled = true
  operator_el.innerText = generateOperator

  let hiddenItemIndex = values.indexOf('?')
  let tempElement;

  if (settings.limits.isManualEntry) {
    switch (hiddenItemIndex) {
      case 0:
        tempElement = value_1_el
        break;
      case 1:
        tempElement = value_2_el
        break;
      case 2:
        tempElement = result_el
        break;
    }
    tempElement.disabled = false;
    tempElement.value = '';
    tempElement.focus();
    tempElement.select();
  }
}

function init() {
  answers = []
  initTask()

  if (settings.limits.isResultOnly) {
    values = [value_1, value_2, '?'];
    hidden_value = result
  } else {
    values = [value_1, value_2, result];
    hidden_value = getHiddenValue(values)[0]
  }

  renderTask()

  if (!settings.limits.isManualEntry) {
    initAnswers()
    renderAnswers()
  } else {
    answersContainer.innerText = 'Always do your best'
  }

  startTaskTimer = Date.now();
}

function initAnswers() {
  answers[f.getValueInRange(0,4)] = hidden_value
  fillArray(answers, hidden_value)
}

const answersContainer = document.getElementById('answers');

function renderAnswers() {
  let i = 0;
  for (const answer of answersContainer.children) {
    answer.hidden = false
    answer.innerText = answers[i];
    i++;
  }
}

function renderTimerValue(value) {
  timer.innerText = value
}

function clearData () {
  for (const answer of answersContainer.children) {
    answer.hidden = true
  }

  value_1_el.disabled = true
  value_2_el.disabled = true
  result_el.disabled = true
    value_1_el.value = '?'
    value_2_el.value = '?'
    operator_el.innerText = 'x'
    result_el.value = '?'
}

function fillArray(arr, value) {
  // fills array [arr] with values based on [value] with basic range of [range]%
  let range = 0.1;
  let step = 0;
  let tempValue;

  for (let i = 0; i < 5; i++) {
    let min
    let max
    if (!arr[i]) {
      while (!arr[i]) {
        min = Math.max(Math.floor(value*(1 - range)),0)
        max = Math.floor(value*(1 + range))

        tempValue = f.getValueInRange(min, max)

        if(!arr.includes(tempValue)) {
          arr[i] = tempValue;
        }

        step++;

        if (step % 20 === 0) {
          range += 0.02
        }
      }
    }
  }
  return arr;
}

let totalTimeSpent
let taskTimeSpent
// let totalTimeLimit = settings.limits.timePeriod * 60 * 1000
let totalTimeSpentInterval
let startTaskTimer
let currentTaskNumber = 1;
let timePerTaskArray = [];

const timer = document.getElementById('timer')
let isGameRunning = false;

let correctTasksInRow = 0;
let correctTasksInRowTemp = 0
let correctAnswers = 0;
let wrongAnswers = 0;
let correctAnswersRel = 0
let wrongAnswersRel = 0
let tasksInRow = 0;
let timePerTask = 0;

let isAlreadyWrong = false

// let totalTimeSpent

// START listener
startButton.addEventListener('click', (event) => {
  // statisticsEl.hidden = true
  // taskEl.hidden = false
  statisticsEl.hidden = true
  taskEl.style.display = 'block'

  isGameRunning = true
  const startTimer = Date.now();
  startTaskTimer = Date.now();
  let currentTimeLeft;

  if (settings.mode.isTaskNumber) {
    renderTimerValue (`${currentTaskNumber} of ${TASK_NUMBER_LIMIT}`)
  }

  if (settings.mode.isFreeTime || settings.mode.isTimePeriod) {
    totalTimeSpentInterval = setInterval(() => {
      totalTimeSpent = Date.now() - startTimer
      if (settings.mode.isTimePeriod) {
        currentTimeLeft = GAME_TIME_LIMIT - totalTimeSpent
        if (currentTimeLeft > 0) {
          renderTimerValue(f.getTimeFromMls(currentTimeLeft))
        } else {
          stopTheGame()
        }

      }
      if (settings.mode.isFreeTime) {
        renderTimerValue(f.getTimeFromMls(totalTimeSpent))
      }
    }, 100)
  }

  startButton.hidden = true
  stopBlock.hidden = false
  
  init()
})

// select ANSWERS listener
answersContainer.addEventListener('click', (event) => {
  if(event.target.classList.contains('answers__item')) {
    processGameMode(+event.target.innerText) 
  }
})

const taskContainer = document.getElementById('task-container')

// listener for MANUAL Entry mode
taskContainer.addEventListener('keyup', (event) => {
  if(event.target.classList.contains('task__value')){
    if(event.key === 'Enter'){
      processGameMode(+event.target.value)
    }
  }
})

// STOP listener
stopButton.addEventListener('click', () => {
  stopTheGame()
})

function processGameMode(targetValue) {
  let tempValue = targetValue
  let isAnswerCorrect = hidden_value === tempValue

  if (isAnswerCorrect) {
    taskTimeSpent = Date.now() - startTaskTimer
    timePerTaskArray.push(taskTimeSpent)
    currentTaskNumber++
    if (settings.mode.isTaskNumber) {
      renderTimerValue(`${currentTaskNumber} of ${TASK_NUMBER_LIMIT}`)
    }
  }

  if (settings.mode.isFreeTime) {
    processGame(settings.mode.isFreeTime, isAnswerCorrect)
  } else if (settings.mode.isTimePeriod) {
    processGame(GAME_TIME_LIMIT >= totalTimeSpent, isAnswerCorrect)
  } else if (settings.mode.isTaskNumber) {
    processGame(TASK_NUMBER_LIMIT >= currentTaskNumber, isAnswerCorrect)
  } else if (settings.mode.isUntilMistake) {
    processGame(isAnswerCorrect, isAnswerCorrect)
  }
  getStatistics()
}

function processGame(condition, isAnswerCorrect) {
  if (condition) {
    if (isAnswerCorrect) {
      init();
      if (isAlreadyWrong) {
        isAlreadyWrong = false
      } else {
        correctAnswers++
        correctTasksInRowTemp++
      }
      correctTasksInRow = Math.max(correctTasksInRow, correctTasksInRowTemp)
    } else {
      console.log('wrong answer');
      wrongAnswers = isAlreadyWrong ? wrongAnswers : wrongAnswers+1
      isAlreadyWrong = true
      correctTasksInRow = Math.max(correctTasksInRow, correctTasksInRowTemp)
      correctTasksInRowTemp = 0
    }
  } else {
    if(isAnswerCorrect) {
      currentTaskNumber++
      correctAnswers++
    } else {
      wrongAnswers++
    }
    stopTheGame();
  }
}

function getStatistics() {
  // console.log('ttl number:', currentTaskNumber - 1);
  console.log('ttl number2:', timePerTaskArray.length);
  console.log('correct:', correctAnswers);
  console.log('correct in Row:', correctTasksInRow);
  console.log('wrong:', wrongAnswers);
  console.log('isWrong', isAlreadyWrong);
  // console.log('%:', Math.round(correctAnswers/timePerTaskArray.length*100));
  // console.log('timePerTask:', Math.round(timePerTaskArray.reduce((a, b) => (a + b), 0) / timePerTaskArray.length / 10) / 100);
  // console.log('ttlTimeSpent:', totalTimeSpent);
  ttlTaskEl.innerText = correctAnswers + wrongAnswers
  correctAnswersEl.innerText = correctAnswers
  correctAnswersPercentEl.innerText = Math.round(correctAnswers / (correctAnswers + wrongAnswers)*10000)/100
  correctAnswerInRowEl.innerText = correctTasksInRow
  ttlTimeSpentEl.innerText = f.getTimeFromMls(totalTimeSpent)
  averageTimePerTaksEl.innerText = Math.round(timePerTaskArray.reduce((a, b) => (a + b), 0) / timePerTaskArray.length / 10) / 100;
}

function stopTheGame() {

  console.log('===== GAME OVER =====');
  getStatistics()
  renderTimerValue('')

  
  startButton.hidden = false
  stopBlock.hidden = true
  correctAnswers = 0
  correctTasksInRow = 0
  correctTasksInRowTemp = 0
  wrongAnswers = 0
  isAlreadyWrong = false
  // startTaskTimer = Date.now();
  
  // console.log('array:',timePerTaskArray);
  // console.log(timePerTaskArray.reduce((a, b) => (a + b), 0)/1000);
  // console.log(Math.round(timePerTaskArray.reduce((a, b) => (a + b), 0) / timePerTaskArray.length / 10) / 100);
  
  clearInterval(totalTimeSpentInterval);
  clearData ()
  
  totalTimeSpent = 0
  currentTaskNumber = 1
  timePerTaskArray.length = 0
  console.log('Game stopped');
  // statisticsEl.style.display = 'block'
  // taskEl.hidden = true
  statisticsEl.hidden = false
  taskEl.style.display = 'none'
}

const ttlTaskEl = document.getElementById('total-tasks')
const correctAnswersEl = document.getElementById('correct-tasks')
const correctAnswersPercentEl = document.getElementById('correct-percent')
const correctAnswerInRowEl = document.getElementById('correct-in-row')
const ttlTimeSpentEl = document.getElementById('total-time')
const averageTimePerTaksEl = document.getElementById('time-per-task')


const statisticsEl = document.getElementById('statistics')
const taskEl = document.getElementById('task')

// const ttlTaskEl = document.getElementById('')
// const ttlTaskEl = document.getElementById('')
