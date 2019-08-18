/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

var apiKey;
var sessionId;
var token;
var publisher;

const defaultOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%'
};

var publisherOptions = {};
Object.assign(publisherOptions, defaultOptions);


var settings = ['audioFallbackEnabled','disableAudioProcessing','enableStereo','insertDefaultUI','mirror','publishAudio','publishVideo','showControls'];
var buttons = {};
settings.forEach(element => {
  buttons[element] = document.getElementById(element);
});

settings = ['facingMode','fitMode','frameRate','insertMode','resolution','audioSource','videoSource'];
var enums = {};
settings.forEach(element => {
  enums[element] = document.getElementById(element);
});

settings = ['bitrate']
var inputs = {};
settings.forEach(element => {
  inputs[element] = document.getElementById(element);
});

const init = document.getElementById('init');

// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

function toggleStyle(button) {
  button.classList.toggle('toggle-button-on');
  button.classList.toggle('toggle-button-off');
}

function connectToSession(session) {
  // Connect to the session
  session.connect(token, function (error) {
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
      session.publish(publisher, handleError);
    }
  });
}

function newPub(session) {
  Object.assign(publisherOptions, defaultOptions);
  Object.keys(buttons).forEach(element => {
    publisherOptions[element] =  buttons[element].classList.contains('toggle-button-on');
  });

  Object.keys(enums).forEach(select => {
    if (enums[select].selectedIndex != 0) {
      const value = enums[select].options[enums[select].selectedIndex].value;
      if (value === 'null') {
        publisherOptions[select] = null;
      } else if (isNaN(Number(value))) {
        publisherOptions[select] = value;
      } else {
        publisherOptions[select] = Number(value);
      }
    }
  });

  Object.keys(inputs).forEach(input => {
    if (inputs[input].value != null && ''!= inputs[input].value) {
      if (!isNaN(Number(inputs[input].value))) {
        publisherOptions[input] = Number(inputs[input].value);
      } else {
        publisherOptions[input] = inputs[input].value;
      }
    }
  });

  session.unpublish(publisher);
  publisher = OT.initPublisher('publisher', publisherOptions, handleError);
  session.publish(publisher, handleError);
};

function initializeSession() {
  const session = OT.initSession(apiKey, sessionId);

  // Create an initial publisher
  publisher = OT.initPublisher('publisher', publisherOptions, handleError);

  connectToSession(session);

  Object.keys(buttons).forEach(button => {
    buttons[button].addEventListener('click', () => toggleStyle(buttons[button]));
  });

  init.addEventListener('click', () => newPub(session));

  OT.getUserMedia().then( 
    OT.getDevices((error, response) => {
      handleError(error);
      response.forEach((device,i) => {
        var option = document.createElement('option');
        option.value = device.deviceId;
        option.text = i
        if (device['kind'] === 'audioInput') {
          document.getElementById('audioSource').options.add(option)
        } else if (device['kind'] === 'videoInput') {
          document.getElementById('videoSource').options.add(option)
        }
      })
  }),handleError);
}

// See the config.js file.
if (API_KEY && TOKEN && SESSION_ID) {
  apiKey = API_KEY;
  sessionId = SESSION_ID;
  token = TOKEN;
  initializeSession();
} else if (SAMPLE_SERVER_BASE_URL) {
  // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
  fetch(SAMPLE_SERVER_BASE_URL + '/session').then(function fetch(res) {
    return res.json();
  }).then(function fetchJson(json) {
    apiKey = json.apiKey;
    sessionId = json.sessionId;
    token = json.token;

    initializeSession();
  }).catch(function catchErr(error) {
    handleError(error);
    alert('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
  });
}
