const randomIndex = Math.floor(Math.random() * possibleWords.length);
const currentWord = possibleWords[randomIndex].split("");
var gameWon = false;
var gameLost = false;

// --------------- SIMPLIFICATIONS ---------------

const qs = (element) => document.querySelector(element);
const qsa = (element) => document.querySelectorAll(element);

// --------------- MOUSE FUNCTIONS ---------------

let clickEventHandler = (e) => {currentCursor(e.currentTarget)};

// MOUSE CLICK EVENT INITIALIZATION
function addClickEvent(){
  qsa(".line.active .line-block").forEach(block =>{
    block.addEventListener("click", clickEventHandler);
  })
}
// MOUSE CLICK EVENT REMOVAL 
function removeClickEvent(){
  qsa(".line.active .line-block").forEach(block =>{
    block.removeEventListener("click", clickEventHandler);
  })  
}

//  --------------- GAME CURSOR ---------------

function initiateCursor(){
  if(qs(".cursor")) removeCursor();
  qs(".line.active > .line-block[data-line='1']").classList.add("cursor");
}

// GIVES THE CURRENT GAME CURSOR
function currentCursor(e){
  removeCursor();
  e.classList.add("cursor");
}

// REMOVES ALL CURSORS
function removeCursor(){
  qsa(".cursor").forEach(el => el.classList.remove("cursor"));
}

// REMOVES ALL ACTIVES LINES
function removeActiveLines(){
  qsa(".line.active").forEach(el => el.classList.remove("active"));
}

// IF POSSIBLE, MOVES TO NEXT LINE
function moveGameActiveToNextLine(index){
  qsa(".line")[index].classList.add("active");
};

// MOVES CURSOR IF POSSIBLE
function moveCursor(el, index){
  if(index == "next" && el.getAttribute("data-line") < 5){
    currentCursor(qs(`.line.active .line-block[data-line="${parseInt(el.getAttribute("data-line")) + 1}"]`))
  }
  if(index == "previous" && el.getAttribute("data-line") > 1){
    currentCursor(qs(`.line.active .line-block[data-line="${parseInt(el.getAttribute("data-line")) - 1}"]`))
  }
}

//  --------------- KEYUP EVENTS ---------------
let removeKeyEvent = false;
function keyUpEvent(input) {
  if(gameWon || removeKeyEvent || gameLost) return;
  let currentElement = qs(".cursor");

  
  let key = input?.key?.length > 0 ? input : {"key": input, "code": input, "which": 65};

  // ------------ GAME SUBMIT EVENT ------------
  if (key.key === "Enter" || key.code === "Enter") {
    let userSubmittedAnswer = [...qsa(".line.active .line-block")].map(el => el.innerHTML);
    // if submit has 5 characters
    if (userSubmittedAnswer.join("").length == 5 && possibleWords.find(el => el === userSubmittedAnswer.join(""))) {
      termoClone(userSubmittedAnswer, currentWord)
    } 
    // if not error animation 
    else {
      qs(".line.active").classList.add("error");
      setTimeout(() => {
        qs(".active").classList.remove("error");
      }, 700)
    }
  } else{
    // arrow keys, backspace and letters
    if (key.key === "ArrowLeft" || key.code === "ArrowLeft") {
      moveCursor(currentElement, "previous");
    } else if (key.key === "ArrowRight" || key.code === "ArrowRight") {
      moveCursor(currentElement, "next");
    } else {
      if ((key.which < 65 && key.which != 32 && key.which != 8) || key.which > 90) {
        return false;
      }
      if (key.key === "Backspace" || key.code === "Backspace") {
        if (currentElement.innerHTML == "") {
          moveCursor(currentElement, "previous");
        } else {
          currentElement.innerHTML = "";
        }
      } else {
        currentElement.innerHTML = key.key.toUpperCase();
        moveCursor(currentElement, "next");
      }
    }
  }
}

qsa(".keyboard-key").forEach(el =>{
  el.addEventListener("click", ()=> {keyUpEvent(el.getAttribute("data-key"))})
})

document.addEventListener("keyup", (e)=>{keyUpEvent(e)})

// --------------- EVENT CALLOUTS ---------------

document.addEventListener("DOMContentLoaded", ()=>{
  addClickEvent();
  initiateCursor();
})

// --------------- GAME LOGICS ---------------

// CHECKS IS LETTER IS PRESENT IN ANY POSITION OF ARRAY
function checkIfLetterIsPresent(arr, letter){
  return arr.some(el => el === letter);
};

// GAME LOGICS
function termoClone(userInput, game){
  if(gameWon) return;
  let answer = new Array(5);

  let gameAnswer = game.map(el => el)

  // handles green letters
  userInput.forEach((currentLetter, letterIndexGlobal) =>{
    if(checkIfLetterIsPresent(gameAnswer, currentLetter)){
      if(currentLetter === gameAnswer[letterIndexGlobal]){
        answer[letterIndexGlobal] = "green";
        gameAnswer[letterIndexGlobal] = null;
        userInput[letterIndexGlobal] = null;
      }
    }
  })

  // handles yellow letters
  userInput.forEach((currentLetter, letterIndexGlobal) =>{
    if(checkIfLetterIsPresent(gameAnswer, currentLetter)){
      if(currentLetter !== gameAnswer[letterIndexGlobal]){
        answer[letterIndexGlobal] = "yellow";
        gameAnswer[gameAnswer.findIndex(el => el === currentLetter)] = null;
        userInput[userInput.findIndex(el => el === currentLetter)] = null;
      }
    }
  })

  // handles non-present letters
  userInput.forEach((currentLetter, letterIndexGlobal) =>{
    if(!checkIfLetterIsPresent(gameAnswer, currentLetter)){
      answer[letterIndexGlobal] = "red";
    }
  })

  updateGameStatus(answer, gameAnswer);

};

function updateGameStatus(curAnswer){
  if(gameWon) return;
  // changing in game styles
  curAnswer.forEach((answer, index) =>{
    let element = qs(`.line.active .line-block:nth-child(${index + 1})`);
    changeLetterLook(answer, element);
    changeKeyboardLook(answer, element.innerHTML);
  });
  // if all green
  if(curAnswer.every(el => el == "green")){
    removeClickEvent();
    removeCursor();
    removeActiveLines();
    swal({
      title: "Parabéns",
      text: "Você acertou a palavra!",
      icon: "success",
    });
    gameWon = true;
  }else{
    // moving game to next line
    let index = [... qsa(".line")].findIndex(el => el.classList.contains("active")) + 1;
    removeClickEvent();
    removeCursor();
    removeActiveLines();
    if((index) < qsa(".line").length){
      moveGameActiveToNextLine(index);
      initiateCursor();
      addClickEvent();
    } else{
      swal({
        title: "Você perdeu!",
        text: "Você não conseguiu acertar a palavra.",
        icon: "error",
      });
      gameLost = true;
    }
  }
}

// --------------- LOOKS ---------------

function changeLetterLook(letterColor, element){
  if(letterColor == "green") element.classList.add("right");
  else if(letterColor == "red") element.classList.add("wrong");
  else if(letterColor == "yellow") element.classList.add("maybe");
}

function changeKeyboardLook(letterColor, answer){
  let element = qs(`.keyboard-key[data-key="${answer}"]`)
  if(letterColor == "green") element.classList.add("right");
  else if(letterColor == "red") element.classList.add("wrong");
  else if(letterColor == "yellow") element.classList.add("maybe");
}

// dark mode
let rotate = 0;
qs("#darkmode").addEventListener("click", (e) => {
  let body = qs("body");
  let img = qs("#darkmode img");
  qs("#darkmode").classList.toggle("hidden");
  setTimeout(() => {
    if (body.classList.contains("white")) {
      body.classList.remove("white");
      body.classList.add("dark");
      img.setAttribute("src", "./assets/images/sunny-outline.svg");
    } else if (body.classList.contains("dark")) {
      body.classList.remove("dark");
      body.classList.add("white");
      img.setAttribute("src", "./assets/images/moon-outline.svg");
    }
    qs("#darkmode").classList.toggle("hidden");
  }, 500)
});