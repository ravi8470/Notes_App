var express = require('express');
const bodyparser = require("body-parser");
var mysql = require('mysql');
var session = require('express-session');
const bcrypt = require('bcrypt');
//var ejs = require('ejs');
var conn = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "ravi",
  database: "todo_app_db"
});
var app = express();
var port = 3000;
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(session({secret: "ravi",resave: false, saveUninitialized: false}));
conn.connect(function(err){
  if(err) throw err;})
app.post("/adduser", (req, resp) => {
  var numOfRecords;
  var user = req.body.uname;
  var pass = req.body.upass;
  var sql2 = "SELECT COUNT(username) from logins WHERE username = '"+ user + "'";
  console.log(sql2);
  conn.query(sql2, (err, res)=>{
    if(err) throw err;
    if(res[0]['COUNT(username)'] == 0){
      var sql = "INSERT INTO logins(username, password) VALUES ('" + user + "','" + pass +"')";
      console.log(sql);
      conn.query(sql, function(err,res){
        if(err) throw err;
        //numOfRecords = res.length;
        console.log("New User inserted ", user);
        resp.render('index',{success: 111});
  })
    }
    else{
      resp.render('index',{success: 200})
    }
    
  })
});
var numRec;
app.post("/login",(reqp, resp) => {
  if(reqp.session.ID && reqp.session.username){
    resp.render('dashboard',{name: reqp.session.username, notes: reqp.session.notes, len : reqp.session.notesLen})
  }
  else{
    var user = reqp.body.uname;
    var pass = reqp.body.upass;
    var sql = "SELECT ID, username FROM logins WHERE username = '"+user + "' AND password = '"+ pass +"'";
    console.log(sql);
    conn.query(sql, function(err,res){
      if(err) throw err;
      numRec = res.length;
      console.log("Num of records found: ", res.length);
      
      if(res.length == 1){
        console.log("entered the if block");
        reqp.session.ID = res[0]['ID'];
        console.log("saving the ID session variable with value: ", reqp.session.ID);
        reqp.session.username = res[0]['username'];
        var sql3 = "SELECT * FROM notes WHERE ID = " + res[0]['ID'] +" ORDER BY created DESC LIMIT 3";
        console.log(sql3);
        conn.query(sql3, (err, resqq) =>{
          console.log("Hello" ,resqq);
          if(resqq == undefined){
            reqp.session.notesLen = 0;
            reqp.session.notes = []
          }          
          else{
            reqp.session.notes = resqq;
            reqp.session.notesLen = resqq.length
          }
          resp.render('dashboard',{name: reqp.session.username, notes: reqp.session.notes, len : reqp.session.notesLen});
        })       
      }
      else{
        console.log("Entered the else block");
        resp.render('gandalf');
      }
    })
  }  
});
app.get('/login', (req,res) => {
  if(req.session.ID && req.session.username){
    res.render('dashboard',{name: req.session.username, notes: req.session.notes, len : req.session.notesLen});
  }
  else{
    res.render('index',{success: 0});
  }
});
//Saving Notes
app.post("/saveNote",(reqp,resp) => {
  if(typeof reqp.session.ID != "undefined"){
    console.log(reqp.session.ID);
    var sql = "INSERT INTO notes(ID, title, created, note_text) VALUES (" +
    reqp.session.ID + ",'" + reqp.body.noteTitle + "', NOW(),'"+ reqp.body.noteBody + "')";
    console.log(sql);
    conn.query(sql, function(err, res){
      if(err) throw err;
      var sql3 = "SELECT * FROM notes WHERE ID = " + reqp.session.ID +" ORDER BY created DESC LIMIT 3";
      conn.query(sql3, (err, resqq) =>{
        console.log("Hello" ,resqq);
        if(resqq == undefined){
          reqp.session.notesLen = 0;
          reqp.session.notes = []
        }          
        else{
          reqp.session.notes = resqq;
          reqp.session.notesLen = resqq.length
        }
        resp.render('dashboard',{name: reqp.session.username, notes: reqp.session.notes, len : reqp.session.notesLen});
      })
    })
  }
  else{
    resp.render('index',{success: 333}) 
  }
});
//Checking for Unique username through AJAX Calls
app.post("/checkUnique", (req, res) => {
  console.log(req.body.uname);
  var sql2 = "SELECT COUNT(username) from logins WHERE username = '"+ req.body.uname + "'";
  console.log(sql2);
  conn.query(sql2, (err, resp)=>{
    if(err) throw err;
    if(resp[0]['COUNT(username)'] != 0){
      res.set('statusCode', '200');
      res.set('Content-Type', 'application/json');
      res.send({status: 0, text:"<font color='red'>User already exists!</font>"});
    }
    else{
      res.set('statusCode', '200');
      res.set('Content-Type', 'application/json');
      res.send({status: 1, text:""});
    }  
  })
  
});
app.get("/adduser", (req, res)=>{
  // res.sendFile(__dirname + "/views/adduser.html");
  res.render('adduser',{success: 0});
});

app.get("/logout", (req,res) => {
  req.session.destroy(function(err){
    if(err) throw err;
  });
  res.render('index',{success: 0});
})
app.get("/", (req, res) => {
  console.log("entered the use/get"); 
  if(req.session.ID > -1 && req.session.username != ""){
    res.render('dashboard',{name: req.session.username, notes: req.session.notes, len : req.session.notesLen})
  }
  else{
    res.render('index',{success: 0});
  }
});

// app.get('*', function(req, res){
//   res.status(404).send('404 Page Not Found.');
// });

app.listen(port, () => {
  console.log("Server listening at port: "+ port);
});
// app.use(function (req, res, next) {
//   res.status(404).send("Sorry can't find that!")
// });
