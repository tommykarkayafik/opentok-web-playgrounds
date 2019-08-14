/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

var apiKey;
var sessionId;
var token;
var subscriber;

const defaultOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  fitMode: 'contain'
};

settings = ['audioBlockedDisplayMode','audioLevelDisplayMode','videoDisabledDisplayMode','buttonDisplayMode','nameDisplayMode'];
var enums = {};
settings.forEach(element => {
  enums[element] = document.getElementById(element);
});

const uri = document.getElementById('backgroundImageURI');
const init = document.getElementById('init');

// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

function connectToSession(session) {
  // Connect to the session
  session.connect(token, function (error) {
    // If the connection is successful, log to the console
    if (error) {
      handleError(error);
    } else {
      console.log('connected to session')
    }
  });
}

function setVolume() {
  if (subscriber) {
  subscriber.setAudioVolume(Number(document.getElementById('volume').value));
  }
}

function newStyle() {
  var style = {};

  Object.keys(enums).forEach(select => {
    if (enums[select].selectedIndex != 0) {
      const value = enums[select].options[enums[select].selectedIndex].value;
      style[select] = value;
    }
  });

  style['backgroundImageURI'] = uri.value;
  if (subscriber != null) {
    subscriber.setStyle(style);
  };
};

function initializeSession() {
  const session = OT.initSession(apiKey, sessionId);

    // Subscribe to a newly created stream
    session.on('streamCreated', function streamCreated(event) {
      subscriber = session.subscribe(event.stream, 'subscriber', defaultOptions, handleError);
    });
    
  connectToSession(session);

  init.addEventListener('click', newStyle);
  document.getElementById('volume').addEventListener('input', setVolume)
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
