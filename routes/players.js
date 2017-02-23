var nano = require('nano')('http://localhost:5984');
var prospects = nano.use('nfl_draft_prospects');

exports.getRankedPlayers = function(req, res) {
  prospects.view('getPlayers', 'getRank', function(err, players) {
    if (err) {
      console.log(err);
      res.send({error: err.description, errid: err.errid});
    } else {
      console.log(players);
      res.json(players.rows);
    }
  });
}

exports.getPlayer = function(req, res) {
  prospects.get(req.params._id, function(err, player) {
    if (err) {
      console.log(err);
      res.send({error: err.description, errid: err.errid});
    } else {
      console.log(player);
      res.json(player);
    }
  });
}

exports.createPlayer = function(req, res) {
  var vFirstName = req.body.firstName;
  var vLastName = req.body.lastName;
  var vHeight = req.body.height;
  var vWeight = req.body.weight;
  var vSchool = req.body.school;
  var vRank = req.body.rank;
  var vPosition = req.body.position;
  var vDocName = createDocId(vFirstName, vLastName, vSchool);
  prospects.insert({firstName: vFirstName, lastName: vLastName,
  height: vHeight, weight: vWeight, school: vSchool, rank: vRank, position: vPosition},
  vDocName,
  function(err, player) {
    if (err) {
      console.log(err);
      res.send({error: err.description, errid: err.errid});
    } else {
      console.log(player);
      res.json(player);
    }
    });
}

exports.deletePlayer = function(req, res) {
  prospects.get(req.params._id, function(err, player) {
    prospects.destroy(player._id, player._rev, function(err, body) {
      if (err) {
        console.log(err);
        res.send({error: err.description, errid: err.errid});
      } else {
        console.log(body);
        res.json(body);
      }
    });
  });
}

exports.updatePlayer = function(req, res) {
  prospects.get(req.params._id, function (err, player) {
    var vId = player._id;
    var vRev = player._rev;
    var vFirstName = transformNullText(req.body.firstName);
    var vLastName = transformNullText(req.body.lastName);
    var vHeight = transformNullText(req.body.height);
    var vWeight = transformNullText(req.body.weight);
    var vSchool = transformNullText(req.body.school);
    var vRank = transformNullText(req.body.rank);
    var vPosition = transformNullText(req.body.position);
    prospects.insert({_id: vId, _rev: vRev, firstName: vFirstName, lastName: vLastName,
    height: vHeight, weight: vWeight, school: vSchool, rank: vRank, position: vPosition},
    function(err, body) {
      if (err) {
        console.log(err);
        res.send({error: err.description, errid: err.errid});
      } else {
        console.log(body);
        res.json(body);
      }
    });
  });
}

function transformNullText(text) {
  console.log("Transform Text: " + text);
  if (text == null || text == undefined || text == '') {
    return "";
  } else {
    return text;
  }
}

function createDocId(firstName, lastName, school) {
  var docId = (firstName.substring(0,1) + lastName + '-' + school.replace(" ", "")).toLowerCase();
  console.log(docId);
  return docId;
}
