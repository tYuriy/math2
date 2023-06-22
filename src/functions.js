export function clearCollection(container) {
  while (container.children.length) {
    container.children[0].remove();
  }
}

export function getValueInRange (min, max, isMult = false) {
  // generates random value from min to max result 
  // in cast 3rd parameter is true generated value will be above limit
  let value;
  let limit = 1

  if (min > max) {
    [min, max] = [max, min]
  }

  do {
    value = Math.floor(Math.random() * (max - min + 1) + min)
  } while (isMult && Math.abs(value) <= limit)

  return value;
}

export function getRandomElementFromArray (arr) {
  return arr[getValueInRange(0, arr.length - 1)]
}

export function addNewItem (array, item) {
  if (!array.includes(item)) {
    array.push(item)
  }

  return array;
}

export function removeItemByValue (array, item) {
  const index = array.indexOf(item)
  if (index >= 0) {
    array.splice(index,1)
  }

  return array
}

export function updateArray (isTrue, array, item) {
  if (isTrue) {
    addNewItem(array, item)
  } else {
    removeItemByValue(array, item)
  }
}

export function getSecondsFromMls(timeInMls) {
  // console.log('time:', timeInMls);
  return Math.floor(timeInMls / 1000) % 60;
}

export function getMinutesFromMls(timeInMls) {
  return Math.floor(timeInMls / (60 * 1000));
}

export function getTimeFormat(min, sec) {
  const minFormat = min.toString().padStart(2,'0')
  const secFormat = sec.toString().padStart(2,'0')

  return `${minFormat}:${secFormat}`
}

export function getTimeFromMls(timeInMls) {
  let min = getMinutesFromMls(timeInMls);
  let sec = getSecondsFromMls(timeInMls);

  return getTimeFormat(min, sec);
}

function fieldValidation(str) {
  //checks only integer negative or positive values
  const regex = /(^(-|\+)?\d*)$/gm
  return regex.test(str)
}

// const add = '+';
// const sub = '-';
// const mult = '·';
// const div = ':';
// const operatorArray = [add, sub, mult, div];

// console.log(operatorArray);