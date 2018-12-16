const mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ravi",
  database: "todo_app_db"
});
con.connect(function (err){
  if(err) throw err;
  con.query("CREATE TABLE note_text(note_id int, content TEXT, FOREIGN KEY(note_id) REFERENCES notes(note_id))",
   function(err, result){
    if(err) throw err;
    console.log("table created!");
  });
});
