/**
 * Create and return a results table to display the Jira Ticket Status query results
 * @param {object} response 
 */
function createStatusResultElement(response) {
    var index, issues, list, resultsTable;
    resultsTable = document.createElement("div");
    resultsTable.className = "container";
    issues = response.issues;
    issues.forEach(function(i) {
      var row;
      row = createQueryResultRow(i);
      resultsTable.appendChild(row);
    });
    return resultsTable;
  }
  
  /**
   * Given an issue, create a row with columns containing an issue"s icon, linkified summary, and description
   * @param {object} issue 
   */
  function createQueryResultRow(issue) {
    var link, summary, description, iconUrl, row, linkElement, summaryCol, icon, iconCol, descriptionCol;
    link = issue.fields.status.self;
    summary = issue.fields.summary;
    description = issue.fields.status.description;
    iconUrl = issue.fields.status.iconUrl;
    row = document.createElement("div");
    row.className = "row";
    linkElement = document.createElement("a")
    linkElement.href = link;
    linkElement.textContent = summary;
    summaryCol = document.createElement("div");
    summaryCol.className = "six columns";
    summaryCol.appendChild(linkElement);
    icon = document.createElement("img");
    icon.src = iconUrl;
    iconCol = document.createElement("div");
    iconCol.className = "one column";
    iconCol.appendChild(icon);
    descriptionCol = document.createElement("div");
    descriptionCol.className = "five columns";
    descriptionCol.innerHTML = description;
    row.appendChild(iconCol)
    row.appendChild(summaryCol)
    row.appendChild(descriptionCol);
    return row;
  }
  
  function createActivityResultElement(xmlDoc) {
    var feed, entries, list;
    feed = xmlDoc.getElementsByTagName("feed");
    entries = feed[0].getElementsByTagName("entry");
    list = document.createElement("ul");
  
    for(var e of entries) {
      var html = e.getElementsByTagName("title")[0].innerHTML;
      var updated = e.getElementsByTagName("updated")[0].innerHTML;
      var item = document.createElement("li");
      item.innerHTML = new Date(updated).toLocaleString() + " - " + domify(html);
      list.appendChild(item);
    }
    return list;
  }

  

/**
 * A utility function for creating dom elements from html strings
 * @param {string} str 
 */
function domify(str){
    var dom = (new DOMParser()).parseFromString("<!doctype html><body>" + str,"text/html");
    return dom.body.textContent;
  }