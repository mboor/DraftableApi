var express  = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var players = require('./routes/players');
var app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get('/', function(req, res){
  res.send('Please use /api/');
});

app.get('/api/players', players.getRankedPlayers);
app.get('/api/players/:_id?', players.getPlayer);
app.post('/api/players', players.createPlayer);
app.delete('/api/players/delete/:_id', players.deletePlayer);
app.put('/api/players/:_id?', players.updatePlayer);
app.listen(3000, function(){
  console.log('Server Started on Port 3000...');
});
