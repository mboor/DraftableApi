var express  = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');

var corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
}
var players = require('./routes/players');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors(corsOptions));
app.use(cookieParser());

app.get('/', function(req, res){
  res.send('Please use /api/');
});

app.get('/api/players', players.getRankedPlayers);
app.get('/api/players/:_id?', players.getPlayer);
app.post('/api/players', players.createPlayer);
app.delete('/api/players/delete/:_id', players.deletePlayer);
app.put('/api/players/:_id?', players.updatePlayer);
app.put('/api/login', players.authenticateUser);
app.put('/api/logout', players.unAuthenticateUser);
app.listen(3030, function(){
  console.log('Server Started on Port 3030...');
});
