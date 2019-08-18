/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

let apiKey;
let sessionId;
let token;
let publisher;

const defaultOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  fitMode: 'cover'
};

const settings = ['audioLevelDisplayMode', 'archiveStatusDisplayMode', 'buttonDisplayMode', 'nameDisplayMode'];
let enums = {};
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
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
      session.publish(publisher, handleError);
    }
  });
}

function newStyle() {
  let style = {};

  Object.keys(enums).forEach(select => {
    if (enums[select].selectedIndex != 0) {
      const value = enums[select].options[enums[select].selectedIndex].value;
      style[select] = value;
    }
  });

  style['backgroundImageURI'] = uri.value;
  publisher.setStyle(style);
};

function initializeSession() {
  const session = OT.initSession(apiKey, sessionId);

  // Create an initial publisher
  publisher = OT.initPublisher('publisher', defaultOptions, handleError);

  connectToSession(session);

  init.addEventListener('click', newStyle);

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