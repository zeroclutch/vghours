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
    if (a.player.data[0].createdAt > b.player.data[0].createdAt) return 1;
    if (a.player.data[0].createdAt < b.player.data[0].createdAt) return -1;
    return 0;
  });
  
  if (res.length > 0) return res[0];
  else return false;
};

app.post('/user', async (req, res) => {
  let player = await findPlayer(req.query.ign);
  if (!player) {
      res.send({errors: "There was an error searching this IGN."})
      return
  }
  // Retrieve and send data
  const games = player.data[0].attributes.stats.gamesPlayed
  const time = Math.round((1/60) * ((games.aral || 0) * 8 + (games.blitz || 0) * 4.5 + (games.ranked || 0) * 22 + (games.casual || 0) * 21 + (games.casual_5v5 || 0) * 25))
  res.send({success: true, aral: games.aral, blitz: games.blitz, ranked: games.ranked, casual: games.casual, casual_5v5: (games.casual_5v5 || 0), time: time, errors: ""});
  
  //Add data to JSON
  var users = JSON.parse(fs.readFileSync("hours.json"));
  users[req.query.ign] = time
  fs.writeFile('hours.json', JSON.stringify(users), 'utf-8', (err) => {
    if(err) throw err;
  });
});

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});