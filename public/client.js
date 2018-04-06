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
            if(document.querySelector("." + mode)) {
              document.querySelector("." + mode).innerHTML = data[mode];
            }
          }
      }
    
    button.classList.remove("is-loading");
  }
  http.send();
}

document.querySelector('form').addEventListener("submit", function(event) {
  event.preventDefault();
  searchIGN();
});

document.querySelector('button').addEventListener("click", function(event) {
  event.preventDefault();
  searchIGN();
});