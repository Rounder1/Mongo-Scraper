// function for poputating the article table
function populateTable (data){
    // Clear out old data
    $("#article-results-body").empty();

    // loop through all the data and append it to the table
    for (var i = 0; i < data.length; i++) {

        var tableBody = $("#article-results-body");
        var newRow = $("<tr>");
    
        var title = data[i].title;
        var link = data[i].link;
    
        newRow.append("<td>" + title + "</td>");
        newRow.append("<td>" + link + "</td>");
    
        tableBody.append(newRow);
      }
}

// Generate a table body
$.getJSON("/all", function(data) {
    populateTable(data);
});