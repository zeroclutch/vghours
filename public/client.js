console.log('hello world :o');

function searchIGN() {
  const http = new XMLHttpRequest();
  const ign = document.querySelector('input').value;
  
  const url = "/user?ign=" + ign;
  http.open("POST", url, true);
  
  //Send the proper header information along with the request
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  
  const button = document.querySelector('button');
  button.classList.add("is-loading");

  http.onreadystatechange = function() {//Call a function when the state changes.
      if(http.readyState == 4 && http.status == 200) {
          const data = JSON.parse(http.responseText)
          for(var mode in data) {
            if(mode == "rank"){
              if(data["rank"]) document.querySelector(".rank").innerHTML = "<span class='help'>RANK<span><br><h3 class='title is-3'>#" + data["rank"] + " " +(data["rankPercentage"] ? "<span class='tag " + data["rankPercentage"][1] + "'>" + data["rankPercentage"][0] +"<span>" : "")+ "</h3>"
              else document.querySelector(".rank").innerHTML = "";
            } else if(document.querySelector("." + mode)) {
              document.querySelector("." + mode).innerHTML = data[mode];
            }
          }
      }
    
    button.classList.remove("is-loading");
  }
  http.send();
}

function getLeaderboard() {
  const http = new XMLHttpRequest();
  const url = "/leaderboard";
  http.open("POST", url, true);
  
  //Send the proper header information along with the request
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  http.onreadystatechange = function() {//Call a function when the state changes.
      if(http.readyState == 4 && http.status == 200) {
          const data = JSON.parse(http.responseText).data,
                table = document.querySelector(".table-leaderboard"),
                tableLoader = document.querySelector(".table-loader");
        tableLoader.parentElement.removeChild(tableLoader);
        table.innerHTML = "<thead>\
                            <th><abbr title='Rank'>#</abbr></th>\
                            <th>IGN</th>\
                            <th>Hours</th>\
                          </thead>";
          for(var i = 0; i < data.length; i++) {
            table.innerHTML += "<tr><th>" + (i + 1) + "</th><td>" + data[i][0] + "</td><td>" + data[i][1] + "</td></tr>"
          }
      }
  }
  http.send();
}

getLeaderboard();

document.querySelector('form').addEventListener("submit", function(event) {
  event.preventDefault();
  searchIGN();
});

document.querySelector('button').addEventListener("click", function(event) {
  event.preventDefault();
  searchIGN();
});