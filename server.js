// More routing examples: https://expressjs.com/en/guide/routing.ejs
const express = require('express');
const session = require('cookie-session');
const app = express();
const fs = require('fs');
const formidable = require('formidable');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const mongourl = "mongodb+srv://hayden1996:yt89m444@cluster0-tilzq.mongodb.net/test?retryWrites=true&w=majority";
const dbName = "test";
var bodyParser = require('body-parser');


var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(session({
  name: 'null',
  keys: ['dont tell anyone']
}));
app.get('/logout', (req,res) => {
	req.session = null;
	res.redirect('/');
});
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');


app.get('/', (req,res) => {
  res.render('index.ejs');
});
app.get('/home', function (req, res) {
   if(req.session.authenticated){
     res.render('home.ejs');
   }else{
     res.render('index.ejs');
}

})
app.get('/index', function (req, res) {
    res.render('index.ejs');
})
app.get('/addrestaurant', function (req, res) {
   if(req.session.authenticated){
        res.render('addrestaurant.ejs');
   }else{ res.render('index.ejs');}
})
app.post('/process_login', urlencodedParser,function (req, res) {
 var username = req.body.username;
 var userpwd = req.body.userpwd;
  	let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
        const db = client.db(dbName);
	var whereStr = {"userid":username};
	db.collection("user").find(whereStr).toArray(function(err, result) {
        if (err) throw err;
	if(result.length>0){
        if(result[0].password==userpwd){
	req.session.authenticated = true;
	req.session.username=result[0].userid;

var result=`<script>alert('login successful');location.href="home.ejs"; </script>`;
	 res.send(result);

	}else{
	var result=`<script>alert('error password');location.href="index.ejs"; </script>`;
	 res.send(result);
	}
	}else{
	var result=`<script>alert('not this user');location.href="index.ejs"; </script>`;
	 res.send(result);
}
    });


})

})
app.get('/register', function (req, res) {
     res.render('register.ejs');
})
app.post('/process_register', urlencodedParser,function (req, res) {
 var username = req.body.username;
 var userpwd = req.body.userpwd;

//connect to db
	let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
         const db = client.db(dbName);
	 let new_user={};
	 new_user['userid']=username;
	 new_user['password']=userpwd;
	 insertUser(db,new_user,(result)=>{
	 client.close();
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write('<html><body>User was inserted into MongoDB!<br>');

            res.end() }) })

})
app.post('/create', function (req, res) {

	let form = new formidable.IncomingForm();
	form.parse(req, (err, fields, files) => {
    if (files.filetoupload.size == 0) {
      res.status(500).end("No file uploaded!");
    }
 let filename = files.filetoupload.path;
    if (fields.name) {
      var name = (fields.name.length > 0) ? fields.name : "untitled";
    }
    if (fields.borough) {
      var borough = (fields.borough.length > 0) ? fields.borough : "untitled";
    }
    if (fields.cuisine) {
      var cuisine = (fields.cuisine.length > 0) ? fields.cuisine : "untitled";
    }
    if (fields.building) {
      var building = (fields.building.length > 0) ? fields.building : "untitled";
    }
    if (fields.street) {
      var street = (fields.street.length > 0) ? fields.street : "untitled";
    }
    if (fields.zipcode) {
      var zipcode = (fields.zipcode.length > 0) ? fields.zipcode : "untitled";
    }
    if (fields.lon) {
      var lon = (fields.lon.length > 0) ? fields.lon : "untitled";

    }
    if (fields.lat) {
      var lat = (fields.lat.length > 0) ? fields.lat : "untitled";
    }
   if (fields.score) {
      var score = (fields.score.length > 0) ? fields.score : "untitled";
    }
    if (files.filetoupload.type) {
      var mimetype = files.filetoupload.type;
      console.log(`mimetype = ${mimetype}`);
    }
    if (!mimetype.match(/^image/)) {
      res.status(500).end("Upload file not image!");
      return;
    }
fs.readFile(filename, (err,data) => {
	let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
         const db = client.db(dbName);
//get the id and add 1
   db.collection("restaurant").find().sort({"restaurant_id":-1}).limit(1).toArray(function(err, result) {
var id=0;
	if (err) throw err;
	if(result.length>0){
	id=parseInt(result[0].restaurant_id)+1;
	//console.log(id);
	}else{
        id=0;
	}
// add to db
var image=new Buffer.from(data).toString('base64');
  let new_user={
      "restaurant_id" : id,
      "name" : name,
      "borough" : borough,
      "cuisine" : cuisine,
      "photo": image,
      "mimetype": mimetype,
      "owner": req.session.username,
      "address":{
        "building" : building,
        "street": street,
      "zipcode": zipcode,
        "coord": [lon,lat]
   },
    "grades": [
      { "user": req.session.username, "score": score}
     ]
  };
	  insertRe(db,new_user,(result)=>{
	 client.close();
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write('<html><body>Data was inserted into MongoDB!<br>  <a href="home.ejs">go back to home</a>');
            res.end() })  })


  })}) })
})
app.get('/restaurantlist', function(req,res) {
if(req.session.authenticated){
	let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
        const db = client.db(dbName);

	//var name="cafe Metro"
	//var whereStr = {"name":name};

	db.collection("test").find().toArray(function(err, result) {
        if (err) throw err;
	if(result.length>0){
 	res.render('list.ejs',{answer: result});
	}else{
	 res.writeHead(200, {"Content-Type": "text/html"});
            res.write('<html><body>not record<br>');
            res.end()

	} })
   })}else{res.render('index.ejs',{});}
});
app.get('/display/id/:id', (req,res) => {
let results={};
results.id=Number(req.params.id);

if(req.session.authenticated){
   let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
        const db = client.db(dbName);

	var id=parseInt(results.id);
	var whereStr = {"restaurant_id":id};
	db.collection("test").find(whereStr).toArray(function(err, result) {
        if (err) throw err;
	if(result.length>0){
let image = new Buffer(result[0].photo,'base64');
  	 res.render('information.ejs',{answer: result});
	}else{res.render('index.ejs',{});}
 	})
    })}else{res.render('index.ejs',{});}
});
app.get('/restaurant/name/:name', (req,res) => {
let results={};
results.name=req.params.name;
 console.log(results.name);
if(req.session.authenticated){
   let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
        const db = client.db(dbName);

	var name=results.name;
	var whereStr = {"name":name};
	db.collection("test").find(whereStr).toArray(function(err, result) {
        if (err) throw err;
	if(result.length>0){
	res.render('list.ejs',{answer: result});
	}else{res.render('index.ejs',{});}
 	})
    })}else{res.render('index.ejs',{});}
});
app.get('/restaurant/cuisine/:cuisine', (req,res) => {
let results={};
results.cuisine=req.params.cuisine;
 console.log(results.cuisine);
if(req.session.authenticated){
   let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
        const db = client.db(dbName);

	var cuisine=results.cuisine;
	var whereStr = {"cuisine":cuisine};
	db.collection("test").find(whereStr).toArray(function(err, result) {
        if (err) throw err;
	if(result.length>0){
  	res.render('list.ejs',{answer: result});
	}else{res.render('index.ejs',{});}
 	})
    })}else{res.render('index.ejs',{});}
});
app.get('/restaurant/borough/:borough', (req,res) => {
let results={};
results.borough=req.params.borough;
 console.log(results.cuisine);
if(req.session.authenticated){
   let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
        const db = client.db(dbName);

	var borough=results.borough;
	var whereStr = {"borough":borough};
	db.collection("test").find(whereStr).toArray(function(err, result) {
        if (err) throw err;
	if(result.length>0){
  	res.render('list.ejs',{answer: result});
	}else{res.render('index.ejs',{});}
 	})
    })}else{res.render('index.ejs',{});}
});
app.get('/delete', function (req, res) {
   if(req.session.authenticated){
	 let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
        const db = client.db(dbName);
	var id=parseInt(req.query.id);
	var whereStr = {"restaurant_id":id};
	db.collection("test").find(whereStr).toArray(function(err, result) {
        if (err) throw err;
	if(result.length>0){
	  if(result[0].owner==req.session.username){
	db.collection("test").deleteOne(whereStr, function(err, obj){
   res.render('home.ejs',{});
	}) }else{
	 res.writeHead(200, {"Content-Type": "text/html"});
            res.write('<html><body>you not onwer cannot delete<br>  <a href="home.ejs">go back </a>');
            res.end();

} } }) })

}else{  res.render('index.ejs',{});}
})
app.get('/addRate', (req,res) => {
if(req.session.authenticated){
   let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
        const db = client.db(dbName);

	var id=parseInt(req.query.id);
	var rate=parseInt(req.query.rate);


	var whereStr = {"restaurant_id":id};

	db.collection("test").find(whereStr).toArray(function(err, result) {
        if (err) throw err;
	if(result.length>0){
	let newJson= '{ "user": "'+req.session.username+'", "score": "'+rate+'"}';
	result[0].grades.push(JSON.parse(newJson));
	var updateStr = {$set: { "grades" : result[0].grades }};
 db.collection("test").updateOne(whereStr, updateStr, function(err, res) {
 });
	res.writeHead(200, {"Content-Type": "text/html"});
        res.write('<html><body>your rate has upload<br>  <a href="home.ejs">go back </a>');
            res.end();
	}else{res.render('index.ejs',{});}
 	})
    })}else{res.render('index.ejs',{});}
});
app.get('/change', function (req, res) {
	 console.log(req.session.username);
   if(req.session.authenticated){
	 let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
        const db = client.db(dbName);
	var id=parseInt(req.query.id);
	var whereStr = {"restaurant_id":id};
	db.collection("test").find(whereStr).toArray(function(err, result) {
        if (err) throw err;
	if(result.length>0){
	 console.log(result[0].owner);
	  if(result[0].owner==req.session.username){
	res.render('update.ejs',{answer: result});

 }else{
	 res.writeHead(200, {"Content-Type": "text/html"});
            res.write('<html><body>you not onwer cannot edit<br>  <a href="home.ejs">go back </a>');
            res.end();

} } }) })

}else{  res.render('index.ejs',{});}
})
app.post('/update', function (req, res) {

 let form = new formidable.IncomingForm();
form.parse(req, (err, fields, files) => {
console.log(JSON.stringify(files));
let client = new MongoClient(mongourl);
	client.connect((err) => {
      		try {
          		assert.equal(err,null);
       		     } catch (err) {
          res.writeHead(500,{"Content-Type":"text/plain"});
          res.end("MongoClient connect() failed!");
          return(-1);
     	 }
        const db = client.db(dbName);

 let filename = files.filetoupload.path;


    if (fields.name) {
	if(fields.name.length > 0){
	var id=parseInt(fields.id);
	var name=String(fields.name);
	var whereStr = {"restaurant_id":id};
	var updateStr = {$set: { "name" : name }};
	db.collection("test").updateOne(whereStr,updateStr,function(err, res) {
	})

	 }

    }
    if (fields.borough) {
   if(fields.borough.length > 0){
	var id=parseInt(fields.id);
	var whereStr = {"restaurant_id":id};
	var borough=String(fields.borough);
	var updateStr = {$set: { "borough" : borough }};
	db.collection("test").updateOne(whereStr,updateStr,function(err, res) {
	})

	 }
    }
    if (fields.cuisine) {
     if(fields.cuisine.length > 0){
	var id=parseInt(fields.id);
	var whereStr = {"restaurant_id":id};
	var cuisine=String(fields.cuisine);
	var updateStr = {$set: { "cuisine" : cuisine }};
	db.collection("test").updateOne(whereStr,updateStr,function(err, res) {
	})

	 }
    }
    if (fields.building) {
          if(fields.building.length > 0){
	var id=parseInt(fields.id);
	var whereStr = {"restaurant_id":id};
	var building=String(fields.building);
	var updateStr = {$set: { "address.building" : building }};
	db.collection("test").updateOne(whereStr,updateStr,function(err, res) {
	})

	 }
    }
    if (fields.street) {
         if(fields.street.length > 0){
	var id=parseInt(fields.id);
	var whereStr = {"restaurant_id":id};
	var street=String(fields.street);
	var updateStr = {$set: { "address.street" : street }};
	db.collection("test").updateOne(whereStr,updateStr,function(err, res) {
	})

	 }
    }
    if (fields.zipcode) {
         if(fields.zipcode.length > 0){
	var id=parseInt(fields.id);
	var whereStr = {"restaurant_id":id};
	var zipcode=String(fields.zipcode);
	var updateStr = {$set: { "address.zipcode" : zipcode }};
	db.collection("test").updateOne(whereStr,updateStr,function(err, res) {
	})

	 }
    }
    if (fields.lon) {
       if(fields.lon.length > 0){
	var id=parseInt(fields.id);
	var whereStr = {"restaurant_id":id};
	var lon=fields.lon;
	var lat=fields.lat;
	var updateStr = {$set: { "address.coord" :[lon,lat] }};
	db.collection("test").updateOne(whereStr,updateStr,function(err, res) {
	})

	 }

    }
    if (fields.lat) {
      if(fields.lon.length > 0){
	var id=parseInt(fields.id);
	var whereStr = {"restaurant_id":id};
	var lon=fields.lon;
	var lat=fields.lat;
	var updateStr = {$set: { "address.coord" :[lon,lat] }};
	db.collection("test").updateOne(whereStr,updateStr,function(err, res) {
	})

	 }

    }



 if (files.filetoupload.size != 0) {
    if (files.filetoupload.type) {
      var mimetype = files.filetoupload.type;
      console.log(`mimetype = ${mimetype}`);
    }
    if (!mimetype.match(/^image/)) {
      res.status(500).end("Upload file not image!");
      return;
     }
   fs.readFile(filename, (err,data) => {
	var id=parseInt(fields.id);
	var whereStr = {"restaurant_id":id};
	var image=new Buffer.from(data).toString('base64');
	var updateStr = {$set: { "photo" :image}};
	db.collection("test").updateOne(whereStr,updateStr,function(err, res) {
	}) })

}
 }) })  });
app.get(/.*fly$/, (req,res) => {
  res.status(404).send(req.url + ': Coming Soon!');
});
app.get(/.*fly$/, (req,res) => {
  res.status(404).send(req.url + ': Coming Soon!');
});

app.get(/.*/,  (req,res) => {
  res.status(404).send(req.url + ': Not Supported!');
});


const insertUser = (db,u,callback) => {
  db.collection('user').insertOne(u,(err,result) => {
    assert.equal(err,null);
    console.log("insert was successful!");
    console.log(JSON.stringify(result));
    callback(result);
  });
}
const insertRe = (db,u,callback) => {
  db.collection('test').insertOne(u,(err,result) => {
    assert.equal(err,null);
    console.log("insert was successful!");
    console.log(JSON.stringify(result));
    callback(result);
  });
}



const server = app.listen(process.env.PORT || 8099, function () {
  const port = server.address().port;
  console.log(`Server listening at ${port}`);
});
