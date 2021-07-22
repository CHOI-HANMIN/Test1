const express = require('express')
const app = express()
const port = 3000

var fs = require('fs');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
var bodyParser = require('body-parser')
var compression = require('compression')
var mysql = require('mysql');
const { response } = require('express');

var db = mysql.createConnection({
  host:'221.145.54.134',
  user     : 'head',
  password : '1014',
  database : 'opentutorials'
})
db.connect();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(function(req, res, next){
  fs.readdir('./data', function(error, filelist){
    req.list = filelist;
    next();
  })
})


app.get('/', (req, res) => {
    db.query(`SELECT * FROM topic`, function(error,topics){
    var title = 'HEAD';
    var description = 'Hello, HEAD';
    var list = template.list(topics);
    var html = template.HTML(title, list,
    `
      <h2>${title}</h2>${description}
      <img src="/images/Robot.jpg" style="width:400px; display:block; margin-top:10px">
      `,
      `<a href="/create">create</a>`
      );
          
    res.send(html);
   })
    
});


app.get('/page/:pageId', (req, res) => {
    var filteredId = path.parse(req.params.pageId).base;
        db.query(`SELECT * FROM topic`, function(error,topics){
          if(error){
            throw error;
          }
        db.query(`SELECT * FROM topic WHERE id=?`,[filteredId], function(error2, topic){
          if(error2){
            throw error;
          }
          var title = topic[0].title;
          var description = topic[0].description;
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>
              <a href="/update/${filteredId}">update</a>
              <form action="/delete_process" method="post">
                <input type="hidden" name="id" value="${filteredId}">
                <input type="submit" value="delete">
              </form>
            `
          );

          res.send(html);
          });
     });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////


app.get('/create', (req, res) => {
    db.query(`SELECT * FROM topic`, function(error,topics){
    var title = 'WEB -create';
    var list = template.list(topics);
    var html = template.HTML(title, list,
    `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `,
      `<a href="/create">create</a>`
      );
    res.send(html);
   })
})

app.post('/create_process', (req, res) => {
    var post = req.body;
    db.query(`
    INSERT INTO topic (title, description, created, author_id) 
    VALUES(?, ?, NOW(), ?)`,
    [post.title, post.description, 1],
    function(error, result){
      if(error){
        throw error;
      }
      res.writeHead(302, {Location: `/?id=${result.insertId}`});
      res.end();
      }
    )
  })

app.get('/update/:pageId', (req, res) => {
    var filteredId = path.parse(req.params.pageId).base;
    db.query(`SELECT * FROM topic`, function(error, topics){
      if(error){
        throw error;
      }
      db.query(`SELECT * FROM topic WHERE id=?`,[filteredId], function(error2, topic){
        if(error){
          throw error2;
        }
        var list = template.list(topics);
        var html = template.HTML(topic[0].title, list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${topic[0].id}">
            <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
            <p>
              <textarea name="description" placeholder="description">${topic[0].description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
        );
      res.send(html);
    })
  })
})

app.post('/update_process', (req, res) => {
  var post = req.body;
  db.query(`UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?`, [post.title, post.description, post.id], function(error, result){
    res.redirect('/?id=${post.id}')  
  })


  
})

app.post('/delete_process',(req, res) => {
var post = req.body;
db.query(`DELETE FROM topic WHERE id = ?`, [post.id], function(error, result){
  if(error){
    throw error;
  }
  res.redirect('/');
  });
});



app.use(function(req, res, next) {
  res.status(404).send("Sorry can't find that!");
})


app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send("Fxxx!");
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
