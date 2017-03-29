var nano = require('nano')('http://localhost:5984');
var prospects = nano.use('nfl_draft_prospects');
var cookie = require('cookie');

exports.getRankedPlayers = function(req, res) {
  prospects.view('getPlayers', 'getRank', function(err, players) {
    if (err) {
      console.log(err);
      res.send({error: err.description, err_reason: err.reason});
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
      res.send({error: err.description, err_reason: err.reason});
    } else {
      console.log(player);
      res.json(player);
    }
  });
}

exports.createPlayer = function(req, res) {
  var auth = req.cookies.AuthSession;
  console.log('auth: ' + auth);
  var nano = require('nano')({url: 'http://localhost:5984', cookie: 'AuthSession=' + auth});
  nano.session(function (err, session) {
    if (err) {
      console.log(err);
      res.json({'auth_failed': 'true', err_reason: err.reason});
    }
    else if (session.userCtx.name == null || session.userCtx.name == undefined) {
      console.log('user is not authenticated.');
      res.json({'auth_failed': 'true', 'session_name': "null or undefined"});
    } else {
      console.log('user: ' + session.userCtx.name + ', roles: ' + session.userCtx.roles);
      var prospect = nano.use('nfl_draft_prospects');
      var vFirstName = req.body.firstName;
      var vLastName = req.body.lastName;
      var vHeight = req.body.height;
      var vWeight = req.body.weight;
      var vSchool = req.body.school;
      var vRank = req.body.rank;
      var vPosition = req.body.position;
      var vDocName = createDocId(vFirstName, vLastName, vSchool);

      prospect.insert({firstName: vFirstName, lastName: vLastName,
      height: vHeight, weight: vWeight, school: vSchool, rank: vRank, position: vPosition},
      vDocName,
      function(err, player) {
        if (err) {
          console.log(err);
          res.send({error: err.description, err_reason: err.reason});
        } else {
          console.log(player);
          res.json(player);
        }
      });
    }
  });
}

exports.deletePlayer = function(req, res) {
  var auth = req.cookies.AuthSession;
  console.log('auth: ' + auth);
  var nano = require('nano')({url: 'http://localhost:5984', cookie: 'AuthSession=' + auth});
  nano.session(function (err, session) {
    if (err) {
      console.log(err);
      res.json({'auth_failed': 'true', err_reason: err.reason});
    }
    if (session.userCtx.name == null || session.userCtx.name == undefined) {
      console.log('user is not authenticated.');
      res.json({'auth_failed': 'true', 'session_name': 'null or undefined'});
    } else {
      console.log('user: ' + session.userCtx.name + ', roles: ' + session.userCtx.roles);
      var prospect = nano.use('nfl_draft_prospects');
      prospect.get(req.params._id, function(err, player) {
        prospect.destroy(player._id, player._rev, function(err, body) {
          if (err) {
            console.log(err);
            res.send({delete_failed: 'true', err_reason: err.reason});
          } else {
            console.log(body);
            res.json({delete_success: 'true'});
          }
        });
      });
    }
  });

}

exports.updatePlayer = function(req, res) {
  var auth = req.cookies.AuthSession;
  console.log('auth: ' + auth);
  var nano = require('nano')({url: 'http://localhost:5984', cookie: 'AuthSession=' + auth});
  nano.session(function (err, session) {
    if (err) {
      console.log(err);
      res.json({'auth_failed': 'true', err_reason: err.reason});
    }
    if (session.userCtx.name == null || session.userCtx.name == undefined) {
      console.log('user is not authenticated.');
      res.json({'auth_failed': 'true', 'session_name': 'null or undefined'});
    } else {
      console.log('user: ' + session.userCtx.name + ', roles: ' + session.userCtx.roles);
      var prospect = nano.use('nfl_draft_prospects');
      prospect.get(req.params._id, function (err, player) {
        var vId = player._id;
        var vRev = player._rev;
        var vFirstName = transformNullText(req.body.firstName);
        var vLastName = transformNullText(req.body.lastName);
        var vHeight = transformNullText(req.body.height);
        var vWeight = transformNullText(req.body.weight);
        var vSchool = transformNullText(req.body.school);
        var vRank = transformNullText(req.body.rank);
        var vPosition = transformNullText(req.body.position);

        prospect.insert({_id: vId, _rev: vRev, firstName: vFirstName, lastName: vLastName,
        height: vHeight, weight: vWeight, school: vSchool, rank: vRank, position: vPosition},
        function(err, body) {
          if (err) {
            console.log(err);
            res.send({error: err.description, err_reason: err.reason});
          } else {
            console.log(body);
            res.json(body);
          }
        });
      });
    }
  });
}

exports.authenticateUser = function(req, res) {
  console.log('user: ' + req.body.username + ', pw: ' + req.body.password);
  prospects.auth(req.body.username, req.body.password, function(err, body, headers) {
    if (err) {
      console.log(err);
      res.send({'auth_failed': 'true', err_reason: err.reason})
    } else {
      var myCookie = cookie.parse(headers['set-cookie'][0]);
      console.log(myCookie);
      res.cookie('AuthSession', myCookie.AuthSession, {httpOnly: false, secure: false, domain: false});
      res.json({'auth_success': 'true', 'AuthSession': myCookie.AuthSession});
    }
  });
}

exports.unAuthenticateUser = function(req, res) {
    res.clearCookie('AuthSession');
    res.json({'auth_failed': 'true'});
}

function transformNullText(text) {
  console.log("Transform Text: " + text);
  if (text == null || text == undefined) {
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
