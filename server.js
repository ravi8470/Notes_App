//Success values --
// 5 indicates dummy values to escape success is not defined errors.


var express = require('express');
const bodyparser = require("body-parser");
var mysql = require('mysql');
var session = require('express-session');
const bcrypt = require('bcrypt');
//var ejs = require('ejs');
if (process.env.JAWSDB_URL == null || process.env.JAWSDB_URL == "") {
  var conn = mysql.createConnection({
    host: "127.0.0.1",
    user: "newuser",
    password: "ravi",
    database: "todo_app_db",
    port: 3306
  });
}
else {
  var conn = mysql.createConnection(process.env.JAWSDB_URL);
}

var app = express();
var port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(session({ secret: "ravi", resave: false, saveUninitialized: false }));
conn.connect(function (err) {
  if (err) throw err;
})
app.post("/adduser", (req, resp) => {
  var numOfRecords;
  var user = req.body.uname;
  var pass = req.body.upass;
  var sql2 = "SELECT COUNT(username) from logins WHERE username = '" + user + "'";
  console.log(sql2);
  conn.query(sql2, (err, res) => {
    if (err) throw err;
    if (res[0]['COUNT(username)'] == 0) {
      let hash = bcrypt.hashSync(pass, 10);
      var sql = "INSERT INTO logins(username, password) VALUES ('" + user + "','" + hash + "')";
      console.log(sql);
      conn.query(sql, function (err, res) {
        if (err) throw err;
        //numOfRecords = res.length;
        console.log("New User inserted ", user);
        resp.render('index', { success: 111 });
      })
    }
    else {
      resp.render('index', { success: 200 })
    }

  })
});
var numRec;
app.post("/login", (reqp, resp) => {
  if (reqp.session.ID && reqp.session.username) {
    resp.render('dashboard', { name: reqp.session.username, success: 5 })
  }
  else {
    var user = reqp.body.uname;
    var pass = reqp.body.upass;
    let hash = bcrypt.hashSync(pass, 10);
    //console.log("hashed pass is: ", hash);
    var sql = "SELECT ID, username, password FROM logins WHERE username = '" + user + "'";
    console.log(sql);
    conn.query(sql, function (err, res) {
      if (err) throw err;
      numRec = res.length;
      console.log("Num of records found: ", res.length);
      if (res.length == 1) {
        //console.log("found a user.. matching pass next");
        //console.log("hash is :" + hash + "and pass is " + res[0]['password']);
        if (bcrypt.compareSync(reqp.body.upass, res[0]['password'])) {
          //console.log("password comparison succeeded");
          reqp.session.ID = res[0]['ID'];
          reqp.session.username = res[0]['username']
          console.log("saving the ID session variable with value: ", reqp.session.ID);
          //selectRecentNotes(reqp, resp);
          resp.render('dashboard', { name: reqp.session.username, success: 5 });
        }
        else {
          resp.render('index', { success: 666 });
        }
      }
      else {
        resp.render('index', { success: 666 })
      }
    })
  }
});
app.get('/login', (req, res) => {
  if (req.session.ID && req.session.username) {
    res.render('dashboard', { name: req.session.username, success: 5 });
  }
  else {
    res.render('index', { success: 0 });
  }
});

//Saving Notes
app.post("/saveNote", (reqp, resp) => {
  if (typeof reqp.session.ID != "undefined") {
    console.log(reqp.session.ID);
    var sql = "INSERT INTO notes(ID, title, created, note_text) VALUES (" +
      reqp.session.ID + ",'" + reqp.body.noteTitle + "', NOW(),'" + reqp.body.noteBody + "')";
    console.log(sql);
    conn.query(sql, function (err, res) {
      if (err) throw err;
      // selectRecentNotes(reqp,resp);
      resp.render('dashboard', { name: reqp.session.username, success: 288 });
    })
  }
  else {
    resp.render('index', { success: 299 })
  }
});

//Checking for Unique username through AJAX Call
app.post("/checkUnique", (req, res) => {
  console.log(req.body.uname);
  var sql2 = "SELECT COUNT(username) from logins WHERE username = '" + req.body.uname + "'";
  console.log(sql2);
  conn.query(sql2, (err, resp) => {
    if (err) throw err;
    if (resp[0]['COUNT(username)'] != 0) {
      res.set('statusCode', '200');
      res.set('Content-Type', 'application/json');
      res.send({ status: 0, text: "<font color='red'>User already exists!</font>" });
    }
    else {
      res.set('statusCode', '200');
      res.set('Content-Type', 'application/json');
      res.send({ status: 1, text: "" });
    }
  })

});

app.get("/adduser", (req, res) => {
  // res.sendFile(__dirname + "/views/adduser.html");
  res.render('adduser', { success: 0 });
});

app.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    if (err) throw err;
  });
  res.render('index', { success: 0 });
});


app.post("/fetchNotes", (req, res) => {
  if (req.session.ID) {
    console.log("the offset received was ", req.body);
    var sql = "SELECT COUNT(note_id) from notes WHERE ID = " + req.session.ID;
    conn.query(sql, (err, resp) => {
      console.log(resp);
      req.session.numNotes = resp[0]['COUNT(note_id)'];
      console.log("num notes stored are ", req.session.numNotes);
      req.session.numPages = Math.ceil(req.session.numNotes / 4);
      console.log("Number of pages are ", req.session.numPages);
      console.log("request body is", req.body);
      var sql2 = "SELECT * from notes WHERE ID = " + req.session.ID + " LIMIT 4 OFFSET " + ((req.body.offset - 1) * 4);
      console.log(sql2);
      conn.query(sql2, (err, ress) => {
        console.log(ress);
        console.log("Num of things retrieved ", ress.length);
        res.set('statusCode', '200');
        res.set('Content-Type', 'application/json');
        res.send({ payload: ress, numPages: req.session.numPages });
      })
    });
  }
  else {
    res.render('index', { success: 0 });
  }
});

app.post("/updateNote", (reqp, resp) => {
  console.log("Data received is :", reqp.body.note_id, reqp.body.noteTitle, reqp.body.noteBody);
  var sql = "UPDATE notes SET title = '" + reqp.body.noteTitle + "' ,note_text = '" + reqp.body.noteBody +
    "' ,created = NOW() WHERE note_id = " + reqp.body.note_id;
  console.log(sql);
  conn.query(sql, (err, res) => {
    if (err) throw err;
    console.log(res);
    //Maybe async await here so that after the update call is finished that we start the retrieval process so the
    // updated note also gets retrieved.
    // selectRecentNotes(reqp,resp);
    if (res.changedRows == 1 || res.affectedRows == 1) {
      resp.render('dashboard', { name: reqp.session.username, success: 555 });
    }
    else {
      resp.render('dashboard', { name: reqp.session.username, success: 556 });
    }

  })

});


app.get("/deleteNote", (req, res) => {
  console.log("Note id received for deleting is: ", req.query.note_id);
  var sql = "DELETE FROM notes WHERE note_id= " + req.query.note_id;
  conn.query(sql, (err, resp) => {
    if (err) throw err;
    console.log(resp);
    res.set('statusCode', '200');
    res.set('Content-Type', 'text/html');
    if (resp.affectedRows == 1) {
      res.send("<font color='green'>Note was deleted</font>");
    }
    else {
      res.send("<font color='red'>Error in deleting note.</font>");
    }
  })

});

app.get("/searchNotes", (req, resp) => {
  console.log(req.session.ID, req.session.username);
  if (req.session.ID && req.session.username) {
    console.log("Value received to search is: ", req.query.searchTerm);
    var sql = "SELECT * FROM notes WHERE title LIKE '%" + req.query.searchTerm + "%' OR note_text LIKE '%" + req.query.searchTerm + "%'";
    console.log(sql);
    conn.query(sql, (err, res) => {
      if (err) throw err;
      console.log(res);
      resp.set('statusCode', '200');
      resp.set('Content-Type', 'application/json');
      resp.send({ searchResult: res });
    })
  }
});

app.get("/", (req, res) => {
  console.log("entered the use/get");
  if (req.session.ID > -1 && req.session.username != "") {
    res.render('dashboard', { name: req.session.username, success: 5 })
  }
  else {
    res.render('index', { success: 0 });
  }
});
app.use(function (req, res, next) {
  res.status(404).send("<font color='red'>Sorry, This page is in another Castle!</font>")
});
app.listen(port, () => {
  console.log("Server listening at port: " + port);
});



function selectRecentNotes(reqp, resp) {
  console.log("function selectRecentNotes called");
  var sql3 = "SELECT * FROM notes WHERE ID = " + reqp.session.ID + " ORDER BY created DESC LIMIT 3";
  console.log(sql3);
  conn.query(sql3, (errr, resqq) => {
    if (errr) throw errr;
    console.log(resqq);
    if (resqq == undefined) {
      reqp.session.notesLen = 0;
      reqp.session.notes = []
    }
    else {
      reqp.session.notes = resqq;
      reqp.session.notesLen = resqq.length
    }
    resp.render('dashboard', { name: reqp.session.username, success: 5 });
  })
}
// app.get('*', function(req, res){
//   res.status(404).send('404 Page Not Found.');
// });
