
var mysql = require('mysql');
var sqlite3 = require('sqlite3').verbose();
var express = require('express');
var http = require('http');
var path = require("path");
var bodyParser = require('body-parser');
var helmet = require('helmet');
var rateLimit = require("express-rate-limit");
const PORT = process.env.PORT || 5000;

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test"
});


var app = express();
// var server = http.createServer(app);
app.set('views','./public');
app.set('view engine','ejs');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(function(req, res, next) {
  res.locals.query = req.query;
  res.locals.url   = "https://nodejsblog08.herokuapp.com";
  next();
});
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));
app.use(helmet());
app.use(limiter);
var db = new sqlite3.Database(path.join(__dirname,'./database/blogs.db'));


db.run('CREATE TABLE IF NOT EXISTS "blogs" (id integer primary key, title varchar(20), content text , created_at REAL, updated_at REAL) ');

app.get('/', function(req,res){
  res.render("home", { myVar : "boopathi raja" });
});

app.get('/lists', function(req,res){
  
 
  db.serialize(()=>{
    db.all('SELECT * FROM blogs; ', function(err, rows) {
      if (err) {
        return console.log(err.message);
      }
      res.render("lists", { posts : rows });   

    });
});

});
app.get('/add', function(req,res){
  res.render("add");

});
app.get('/edit/:id', function(req,res){
 
  db.serialize(()=>{
    db.get('SELECT * FROM blogs WHERE id =?', [req.params.id], function(err, result) {
      if (err) {
        return console.log(err.message);
      }

      res.render("edit", { blog :result});

    });
});
});

app.post('/add', function(req,res){      

      db.serialize(()=>{
        db.run('INSERT INTO blogs(title,content,created_at,updated_at) VALUES(?,?,datetime("now"),datetime("now"))',[req.body.title,req.body.content], function(err, result) {
          if (err) {
            return console.log(err.message);
          }
          console.log("New Post has been added");
        res.render("message", { message :" New Post has been added "});
      });
});
});

app.get('/view/:id', function(req,res){

  db.serialize(()=>{
    db.get('SELECT * FROM blogs WHERE id =?', [req.params.id], function(err, result) {
      if (err) {
        return console.log(err.message);
      }
      console.log("Entry updated successfully");
      res.render("view", { blog :result});
    });
});
});

app.post('/edit/:id', function(req,res){
 
  db.serialize(()=>{
    db.run('UPDATE blogs SET title = ?,content = ?,updated_at=datetime("now") WHERE id = ?', [req.body.title,req.body.content,req.params.id], function(err, result) {
      if (err) {
        return console.log(err.message);
      }
      console.log("Entry updated successfully");
    res.render("message", { message :" Entry updated successfully "});

    });
});
});

app.get('/delete/:id', function(req,res){

  db.serialize(()=>{
    db.run('DELETE FROM blogs WHERE id = ?', req.params.id, function(err, result) {
      if (err) {
        return console.log(err.message);
      }
      console.log("Blog Deleted successfully");
    res.render("message", { message :" Blog Deleted successfully "});
  });

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

// server.listen(3000,function(){ 
//   console.log("Server listening on port: 3000");
// });
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));