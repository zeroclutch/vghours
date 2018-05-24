var express = require('express');
var Vainglory = require('vainglory');
var fs = require('fs');
var app = express();


// Defaults
var options = {
  host: 'https://api.dc01.gamelockerapp.com/shards/',
  region: 'na',
  title: 'semc-vainglory',
};

const vainglory = new Vainglory(process.env.VG_API_KEY, options);

// All possible regions
const regions = ["na", "eu", "sa", "ea", "sg", "cn"];

const findPlayer = async (ign) => {
  
  // At the same time we will search for the IGN in all possible regions. It hurts because that's 6 requests
  let promises = regions.map(region => {
    return (vainglory.setRegion(region).players.getByName([ign]));
  });
  
  let res = await Promise.all(promises);
  
  // We remove the errors
  res = res.filter(result => {
    if (result.errors) return false;
    return true;
  })
  // then sort by createdAt. Newest createdAt is the right region
  // Sometimes we find the same username in multiple regions 
  .sort((a, b) => {
    if (!a.player.data) return false;
    if (a.player.data[0].createdAt > b.player.data[0].createdAt) return 1;
    if (a.player.data[0].createdAt < b.player.data[0].createdAt) return -1;
    return 0;
  });
  
  if (res.length > 0) return res[0];
  else return false;
};

app.post('/user', async (req, res) => {
  let player = await findPlayer(req.query.ign);
  if (!player || !player.data || !player.data[0].attributes.stats.gamesPlayed) {
      res.send({errors: "There was an error searching this IGN."})
      return
  }
  // Retrieve and send data
  const games = player.data[0].attributes.stats.gamesPlayed,
        time = Math.round((1/60) * ((games.aral || 0) * 8 + (games.blitz || 0) * 4.5 + (games.ranked || 0) * 22 + (games.casual || 0) * 21 + (games.casual_5v5 || 0) * 25 + (games.ranked_5v5 || 0) * 26));
  
  //Add data to JSON
  
  try {
    var users = JSON.parse(fs.readFileSync("hours.json", "utf8")),
        newUser = "",
        rank = users[req.query.ign] ? sortedNames.indexOf(req.query.ign) + 1 : "",
        rankPercentage,
        rankColor;
    if(!rank) newUser = "New user added!";
    if(rank == 0) rank = "";
    if(rank) rankPercentage = Math.round(rank/sortedNames.length*100);
    console.log(sortedNames.length);
    
    if(rankPercentage <= 1) {rankPercentage = "TOP 1%"; rankColor = "is-success";}
    else if(rankPercentage <= 10) {rankPercentage = "TOP 10%"; rankColor = "is-success";}
    else if(rankPercentage <= 20) {rankPercentage = "TOP 20%"; rankColor = "is-primary"}
    else if(rankPercentage <= 30) {rankPercentage = "TOP 30%"; rankColor = "is-info"}
    else if(rankPercentage <= 40) {rankPercentage = "TOP 40%"; rankColor = "is-link"}
    else if(rankPercentage <= 50) {rankPercentage = "TOP 50%"; rankColor = "is-warning"}
    else if(rankPercentage > 50) {rankPercentage = "BOTTOM 50%"; rankColor = "is-danger"}
    
    //Get percentage    
    users[req.query.ign] = time
    fs.writeFile('hours.json', JSON.stringify(users), 'utf8', (err) => { 
      if(err) console.error(err);
    console.log(`User ${req.query.ign} added to hours successfully.`)
  });
  } catch(err) { console.log("Error handled. Hours file is corrupted."); console.error(err); }
  
  res.send({success: true, aral: games.aral, blitz: games.blitz, ranked: games.ranked, ranked_5v5: games.ranked_5v5, casual: games.casual, casual_5v5: (games.casual_5v5 || 0), time: time, newUser: newUser, rank: rank, rankPercentage: [rankPercentage, rankColor], errors: ""});
});

//Leaderboard info
function refreshLeaderboard(checkNew) { 
    const oldSortedHours = sortedHours;
    sortedHours = [];
    sortedNames = [];
    try { 
    userHours = JSON.parse(fs.readFileSync("hours.json", "utf8"));
    
    for(var val in userHours) {
     sortedHours.push([val,userHours[val]])
    }
    sortedHours.sort(function(a,b){return a[1] - b[1]});
    sortedHours.reverse();
    for(var i = 0; i < sortedHours.length; i++){
      sortedNames.push(sortedHours[i][0]);
    }
    console.log("No error. Leaderboard found.");
  } catch(err) { 
    sortedHours = [["Gremalor",8724],["BABYGROOTpt2",7000],["BuayaSalto",6927],["michael656678",6257],["LovingEman",6033],["QuangTruong",5960],["NIKE",5838],["DayOfDoom",5810],["Shabbir",5645],["ClubAttaya",5640]];
    console.log("Error handled. Leaderboard unable to be found.");
    console.error(err);
  }
} 

var userHours, sortedHours = [], sortedNames = []; 
refreshLeaderboard();


 
setInterval(function(){
  refreshLeaderboard();
}, 60000);

app.post('/leaderboard', async (req, res) => {
  console.log("User connected")
  res.send({success:true, data: sortedHours.slice(0, 10)});
});

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});