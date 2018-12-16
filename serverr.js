var express = require('express');
const bodyparser = require("body-parser");
var app = express();
var port = 3000;
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.get("/", (req,res) => {
    res.render('hello',{name: "OBI", msg: "Hello There"})
})
app.listen(port, () => {
    fun()
  });

function fun(){
  console.log("Server listening at port: "+ port);
}