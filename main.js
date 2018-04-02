const ACTIVITY_URL = "https://jira.secondlife.com/activity?maxResults=50&streams=user+IS+{user}&providers=issues";
const STATUS_URL = "https://jira.secondlife.com/rest/api/2/search?jql=project={project}+and+status={status}+and+status+changed+to+{status}+before+-{inStatusFor}d&fields=id,status,key,assignee,summary&maxresults=100`";
const ACTIVITY_OK = "Activity query: {url}\n";
const ACTIVITY_NONE = "There are no activity results.";
const STATUS_OK = "Query term: {url}\n";
const STATUS_NONE = "There are no status results.";


/**
 * Check for the existence of the project and add event listeners
 */
document.addEventListener('DOMContentLoaded', function() {
  var url;
  // if logged in, setup listeners
    checkProjectExists().then(function() {
      //load saved options
      loadOptions();

      // query click handler
      document.getElementById("query").onclick = function(){
        // build query, perform query, display results
        buildJql().then(performQueryJson, displayError).then(displayStatusResults, displayError);
      };
      // activity feed click handler
      document.getElementById("feed").onclick = function(){   
        // get the xml feed, perform query, display results
        getJiraFeedUrl().then(performQueryEmpty, displayError).then(displayActivityResults, displayError);    
      };        

    }).catch(displayError);   
});

/**
 * Make a query to check if the project exists
 */
async function checkProjectExists(){
  try {
    return await makeRequest("https://jira.secondlife.com/rest/api/2/project/SUN", "json");
  } catch (errorMessage) {
    document.getElementById('status').innerHTML = 'ERROR. ' + errorMessage;
    document.getElementById('status').hidden = false;
  }
}

/**
 * Set some default values into the form to make debugging easier
 */
function loadOptions(){
  chrome.storage.sync.get({
    project: 'Sunshine',
    user: 'nyx.linden',
    daysPast: 1,
  }, function(items) {
    document.getElementById('project').value = items.project;
    document.getElementById('user').value = items.user;
    document.getElementById("daysPast").value = items.daysPast;
  });
}

/**
 * Make an AJAX request against the url, with the requested response type. Returns a promise
 * @param {string} url 
 * @param {string} responseType 
 */
async function makeRequest(url, responseType) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.responseType = responseType;

    req.onload = function() {
      var response = responseType ? req.response : req.responseXML;
      if(response && response.errorMessages && response.errorMessages.length > 0){
        reject(response.errorMessages[0]);
        return;
      }
      resolve({response: response, url: url});
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    }
    req.onreadystatechange = function() { 
      if(req.readyState == 4 && req.status == 401) { 
          reject("You must be logged in to JIRA to see this project.");
      }
    }

    // Make the request
    req.send();
  });
}

/**
 * Display an error message
 * @param {string} errorMessage 
 */
function displayError(errorMessage) {
  document.getElementById('status').innerHTML = 'ERROR. ' + errorMessage;
  document.getElementById('status').hidden = false;
}

/**
 * Perform query using the url and empty response type and display current status
 * @param {string} url 
 */
function performQueryEmpty(url) {
  return performQuery(url, "");
}

/**
 * Perform query using the url and json response type and display current status
 * @param {string} url 
 */
function performQueryJson(url) {
  return performQuery(url, "json");
}

/**
 * Perform query using the url and responseType and display current status
 * @param {string} url 
 */
function performQuery(url, responseType) {
  document.getElementById('status').innerHTML = 'Performing JIRA search for ' + url;
  document.getElementById('status').hidden = false;  
  // perform the search
  return makeRequest(url, responseType);
}

/**
 * Grabs the user value from the DOM and returns an activity URL containing the user name.
 * No validation because it appears any and all characters are allowed in JIRA user names.
 */
async function getJiraFeedUrl(){
  var user = document.getElementById("user").value;
  if(user == null)
    return;
  
  return ACTIVITY_URL.replace(/\{user\}/, user);
}

/**
 * Build a Jira Ticket Status query from form values. Return the query URL. 
 */
async function buildJql() {
  var project, status, inStatusFor;
  project = document.getElementById("project").value;
  status = document.getElementById("statusSelect").value;
  inStatusFor = document.getElementById("daysPast").value
  return STATUS_URL.replace(/\{project\}/, project).replace(/\{status\}/g, status).replace(/\{inStatusFor\}/, inStatusFor)
}

/**
 * Given a response to a activity query format and display the results or error
 * @param {object} response 
 */
function displayActivityResults(response) {
  var xmlDoc, url, feed, entries, list;
  xmlDoc = response.response;
  url = response.url;
  list = createActivityResultElement(xmlDoc);
  // render result
  displayResults(list, url, ACTIVITY_OK, ACTIVITY_NONE);
}

/**
 * Create and display the html results of a status query
 * @param {object} response 
 */
function displayStatusResults(response) {
  var json, url, list;
  json = response.response;
  url = response.url;
  list = createStatusResultElement(json);
  // render the results
  displayResults(list, url, STATUS_OK, STATUS_NONE);
}

/**
 * Generic list and status display
 * @param {Element} list 
 * @param {string} url 
 * @param {string} statusOk 
 * @param {string} statusNone 
 */
function displayResults(list, url, statusOk, statusNone) {
  var resultDiv = document.getElementById('query-result');
  // render the results
  document.getElementById('status').innerHTML = statusOk.replace(/\{url\}/, url);
  document.getElementById('status').hidden = false;
  
  if(list.childNodes.length > 0){
    resultDiv.innerHTML = list.outerHTML;
  } else {
    document.getElementById('status').innerHTML = statusNone;
    document.getElementById('status').hidden = false;
  }
  resultDiv.hidden = false;
}


