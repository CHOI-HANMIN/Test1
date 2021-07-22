var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '221.145.54.134',
  user     : 'head',
  password : '1014',
  database : 'opentutorials'
});
 
connection.connect();
 
connection.query('SELECT * FROM topic', function (error, results, fields) {
  if (error) {
      console.log(error);
  };
  console.log(results);
});
 
connection.end();