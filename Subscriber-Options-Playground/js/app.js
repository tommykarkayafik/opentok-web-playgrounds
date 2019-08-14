/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

var apiKey;
var sessionId;
var token;
var publisher;
var subscriber;

const defaultOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  preferredResolution: {
    width: 360,
    height: 240
  }
};

var subscriberOptions = {};
Object.assign(subscriberOptions, defaultOptions);


var settings = ['insertDefaultUI','testNetwork','subscribeToAudio','subscribeToVideo','showControls'];
var buttons = {};
settings.forEach(element => {
  buttons[element] = document.getElementById(element);
});

settings = ['fitMode','insertMode'];
var enums = {};
settings.forEach(element => {
  enums[element] = document.getElementById(element);
});

settings = ['preferredResWidth','preferredResHeight','preferredFrameRate']//
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
      session.publish(publisher, (error) => {if (error) {alert(error.message);} else {subscriber = session.subscribe(publisher.stream, 'subscriber', subscriberOptions, handleError);}});
    }
  });
}

function newSub(session) {
  Object.assign(subscriberOptions, defaultOptions);
  Object.keys(buttons).forEach(element => {
    subscriberOptions[element] =  buttons[element].classList.contains('toggle-button-on');
  });

  Object.keys(enums).forEach(select => {
    if (enums[select].selectedIndex != 0) {
      const value = enums[select].options[enums[select].selectedIndex].value;
      if (value === 'null') {
        subscriberOptions[select] = null;
      } else if (isNaN(Number(value))) {
        subscriberOptions[select] = value;
      } else {
        subscriberOptions[select] = Number(value);
      }
    }
  });

  let preferences = {}
  Object.keys(inputs).forEach(input => {
    if (inputs[input].value != null && !isNaN(Number(inputs[input].value)) && ''!= inputs[input].value) {
      preferences[input] = Number(inputs[input].value);
    }
  });
  subscriberOptions['preferredFrameRate'] = preferences['preferredFrameRate'];
  subscriberOptions['preferredResolution'] = {
    width: preferences['preferredResWidth'],
    height: preferences['preferredResHeight']
  }

  if (subscriber != null && subscriber.session != null) session.unsubscribe(subscriber);
  subscriber = session.subscribe(publisher.stream, 'subscriber', subscriberOptions, handleError);
};

function initializeSession() {
  const session = OT.initSession(apiKey, sessionId);

  // Create a publisher
  publisher = OT.initPublisher('publisher', defaultOptions, handleError);

  connectToSession(session);
  session.on('streamCreated', (event) => {
    subscriber = session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
  });

  /*
  publisher.on('streamCreated', (event) => {
    subscriber = session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
  });  
  */

  Object.keys(buttons).forEach(button => {
    buttons[button].addEventListener('click', () => toggleStyle(buttons[button]));
  });

  init.addEventListener('click', () => newSub(session));
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
