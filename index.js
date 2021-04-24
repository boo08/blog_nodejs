
var mysql = require('mysql');
var express = require('express');
var http = require('http');
var path = require("path");
var bodyParser = require('body-parser');
var helmet = require('helmet');
var rateLimit = require("express-rate-limit");
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test"
});


var app = express();
var server = http.createServer(app);
app.set('views','./public');
app.set('view engine','ejs');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(function(req, res, next) {
  res.locals.query = req.query;
  res.locals.url   = "http://localhost:3000";
  next();
});
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));
app.use(helmet());
app.use(limiter);


var DBQuery ='CREATE TABLE IF NOT EXISTS `blogs` ( `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT, `title` varchar(220) NOT NULL, `content` text NOT NULL, `create` datetime NOT NULL DEFAULT current_timestamp(), `update` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() )';
con.query(DBQuery, function (err, result) {
  if (err) throw err;
});
app.get('/', function(req,res){
  res.render("home", { myVar : "boopathi raja" });
});

app.get('/lists', function(req,res){
  var BlogQuery='SELECT * from blogs';
  con.query(BlogQuery, function (err, result) {
    if (err) throw err;
    
   res.render("lists", { posts : result });   
  });
 

});
app.get('/add', function(req,res){
  res.render("add");

});
app.get('/edit/:id', function(req,res){
  con.query('SELECT * FROM blogs WHERE id =?', [req.params.id], function (err, result) {
    if (err) throw err;
    console.log(result);
    res.render("edit", { blog :result});
  });
});

app.post('/add', function(req,res){      
      con.query('INSERT INTO blogs(title,content) VALUES(?,?)',[req.body.title,req.body.content], function (err, result) {
        if (err) throw err;
        console.log("New Post has been added");
        res.render("message", { message :" New Post has been added "});
      });
});

app.get('/view/:id', function(req,res){

  con.query('SELECT * FROM blogs WHERE id =?', [req.params.id], function (err, result) {
    if (err) throw err;
    console.log("Entry updated successfully");
    res.render("view", { blog :result});
  });
});

app.post('/edit/:id', function(req,res){
  console.log([req.params.title,req.params.content,req.params.id]);
  con.query('UPDATE blogs SET title = ?,content = ? WHERE id = ?', [req.body.title,req.body.content,req.params.id], function (err, result) {
    if (err) throw err;
    console.log(result);
    console.log("Entry updated successfully");
    res.render("message", { message :" Entry updated successfully "});
  });

});

app.get('/delete/:id', function(req,res){
 
  con.query('DELETE FROM blogs WHERE id = ?', req.params.id, function (err, result) {
    if (err) throw err;
    console.log("Blog Deleted successfully");
    res.render("message", { message :" Blog Deleted successfully "});
  });

  
});

app.get('/close', function(req,res){
  db.close((err) => {
    if (err) {
      res.send('There is some error in closing the database');
      return console.error(err.message);
    }
    console.log('Closing the database connection.');
    res.send('Database connection successfully closed');
  });
});

server.listen(3000,function(){ 
  console.log("Server listening on port: 3000");
});
