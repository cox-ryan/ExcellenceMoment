// set up basic variables for app

const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.controls');

const trigger = document.querySelector(".trigger");
const closeButton = document.querySelector(".close-button");


let uploadTarget;

var uploadBucketName = "BUCKET_NAME";  //my-excellence-moment-audio";
var bucketRegion = "REGION";  //"ca-central-1";
var IdentityPoolId = "IDENTITY_POOL_ID";

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: uploadBucketName }
});

function windowOnClick(event) {}


window.addEventListener("click", windowOnClick);
// visualiser setup - create web audio api context and canvas

let audioCtx;
const canvasCtx = canvas.getContext("2d");

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function (stream) {
    const mediaRecorder = new MediaRecorder(stream);

    record.onclick = function () {
      visualize(stream);
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");

      stop.disabled = false;
      document.getElementsByClassName("stop")[0].style.display = 'block';
      document.getElementsByClassName("visualizer")[0].style.display = 'block';
      document.getElementsByClassName('clipProgress')[0].style.display = 'block';
      record.disabled = true;
      document.getElementsByClassName("record")[0].style.display = 'none';
      document.getElementsByClassName('clip')[0].style.display = 'none';
      

      var i = 0;
      if (i == 0) {
        i = 1;
        var elem = document.getElementById("myBar");
        var width = .5;
        var id = setInterval(frame, 600); //timer for 60 seconds
        function frame() {
          if (width < 100 && record.disabled == true) {
            width++;
            elem.style.width = width + "%";

          } else {
            clearInterval(id);
            i = 0;
            elem.style.width = 1;
            stop.click();
          }
        }
      }

    }

    stop.onclick = function () {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");

      stop.disabled = true;
      document.getElementsByClassName("stop")[0].style.display = 'none';
      document.getElementsByClassName("visualizer")[0].style.display = 'none';
      document.getElementsByClassName("clipProgress")[0].style.display = 'none';
      record.disabled = false;
      document.getElementsByClassName("record")[0].style.display = 'block';
      document.getElementsByClassName('clip')[0].style.display = 'block';
    }

    mediaRecorder.onstop = function (e) {
      console.log("data available after MediaRecorder.stop() called.");

      let audio = document.getElementsByClassName('clipPlayer')[0];

      const blob = new Blob(chunks, { 'type': 'audio/wav; codecs=opus' });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("recorder stopped");

      document.getElementsByClassName('upload')[0].onclick = async function (e) {
        uploadTarget = e;
        let evtTgt = e.target;

        let clipSrc = document.getElementsByClassName('clipPlayer')[0].currentSrc;
        let clipName = localStorage.getItem("storageName") + "-" + Date.now();
        // let clipName = evtTgt.parentNode.getElementsByTagName('p')[0].innerHTML;
        let blob = await fetch(clipSrc).then(r => r.blob());
        let file = new File([blob], clipName, { 'type': 'audio/wav; codecs=opus' })

        let clipKey = `${Date.now()}_${clipName}`

        let upload = new AWS.S3.ManagedUpload({
          params: {
            Bucket: uploadBucketName,
            Key: clipKey,
            Body: file
          }
        });

        let promise = upload.promise();
        promise.then(
          function (data) {
            alert("Successfully uploaded clip.");
          },
          function (err) {
            return alert(`There was an error uploading your clip: \n${err.message}`);
          }
        );
        window.location.href='thankyou.html';
      }

      document.getElementsByClassName('delete')[0].onclick = function (e) {
        document.getElementsByClassName('clip')[0].style.display = 'none';
        document.getElementsByClassName('clipProgress')[0].style.display = 'none';
      }
    }
    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
    }
  }
  let onError = function (err) {
    console.log('The following error occured: ' + err);
  }
  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
} 
else {
  console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
}

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
    // wait 60 seconds before calling goInactive
    timeoutID = window.setTimeout(goInactive, 120000);
}

function resetTimer(e) {
    window.clearTimeout(timeoutID);
    goActive();
}

function goInactive() {
    // do something
    window.location.href = 'index.html';
}

function goActive() {
    // do something
    // window.location.href = 'index.html';
    startTimer();
}

window.onresize = function () {
  canvas.width = mainSection.offsetWidth;
}

window.onresize();
