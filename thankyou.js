/// go back to front page after a period of inactivity
var timeoutID;

function setupTimer() {
    this.addEventListener("mousemove", resetTimer, false);
    this.addEventListener("mousedown", resetTimer, false);
    this.addEventListener("keypress", resetTimer, false);
    this.addEventListener("DOMMouseScroll", resetTimer, false);
    this.addEventListener("mousewheel", resetTimer, false);
    this.addEventListener("touchmove", resetTimer, false);
    this.addEventListener("MSPointerMove", resetTimer, false);
    startTimer();
}
setupTimer();

function startTimer() {
    // wait 45 seconds before calling goInactive
    timeoutID = window.setTimeout(goInactive, 60000);
}

function resetTimer(e) {
    window.clearTimeout(timeoutID);
    goActive();
}

function goInactive() {
    // do something
    // window.location.href = 'index.html';
}

function goActive() {
    // do something
    // window.location.href = 'index.html';
    startTimer();
}