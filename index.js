const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const ejs = require("ejs");
const mongoose=require('mongoose');
const User = require('./models/Users');
const path = require("path");
const { userInfo } = require("os");
const { log } = require("console");
const session = require("express-session");
const edge = require('edge-js');
const { spawn } = require('child_process');
const multer  = require('multer');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
require('dotenv').config();
const fast2sms = require('fast-two-sms');

//admin.initializeApp();
//const User_firebase = require("./config");
//const java = require('java');
//var Fingerprint = require('express-fingerprint');
//const fingerprintScanner = require('fingerprint-scanner');


// const MFS100 = require('mfs-scanner');

// // Initialize the MFS100 class
// const mfs100 = new MFS100({
//   deviceId: '1234',
//   driverPath: '/dev/mfs100',
//   // Add any other necessary configuration options here
// });

// // Use the MFS100 class to capture a fingerprint

// const fingerprint = mfs100.captureFingerprint();








mongoose.connect("mongodb://127.0.0.1:27017/ihealth?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0", {useNewUrlParser:true,useUnifiedTopology:true},).then(()=>console.log("connected successfully")).catch((err)=>{console.log(err);});


const app= express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine","ejs");

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: "secret"
}));

// app.use(Fingerprint({
// 	parameters:[
// 		// Defaults
// 		Fingerprint.useragent,
// 		Fingerprint.acceptHeaders,
// 		Fingerprint.geoip,

// 		// Additional parameters
// 		function(next) {
// 			// ...do something...
// 			next(null,{
// 			'param1':'value1'
// 			})
// 		},
// 		function(next) {


// 			// ...do something...
// 			next(null,{
// 			'param2':'value2'
// 			})
// 		},
// 	]
// }))

// app.get('*',function(req,res,next) {
// 	// Fingerprint object
// 	console.log(req.fingerprint)
// })



app.get("/",async(req , res)=>{
    
    res.render('index');
    
});

app.get("/loginpage.ejs", function(req, res){
    res.render('loginpage');
});

app.get("/register.ejs", function(req, res){
     res.render('register');
 })

app.get("/medications.ejs",function(req,res){
    res.render('medications',{user: req.session.user});
})

// app.get("/upload_documents.ejs",function(req, res){
//     res.render('upload_documents');
// })

app.get('/support.ejs',function(req,res){
  res.render('support');
})

app.post("/send_message",async(req,res)=>{
  
  console.log(req.session.user.nominee_number);
  let a=parseInt(req.session.user.nominee_number);
  let Name = "Hello,Your relation "+req.session.user.username +" is met with an accident";
  const response = await fast2sms.sendMessage({authorization:process.env.API_KEY,message: Name, numbers:[a]});
  let hospital = "location: "+req.body.hospital_name+".";
  let response2 = await fast2sms.sendMessage({authorization:process.env.API_KEY,message: hospital, numbers:[a]}) 
  res.send(response);
})

app.get("/finger_print.ejs",async(req, res)=>{
    const cs = spawn("C:/Users/haree/source/repos/finger_project/bin/Debug/finger_project.exe");

process.stdin.setEncoding('utf8');
process.stdin.on('data', (data) => {
  cs.stdin.write(data);
});

var temp ="";

cs.stdout.on('data', (data) => {

  const result =data.toString().trim();
  console.log(`Result from C# program: ${result}`);
  console.log(typeof(result));
  temp = result;
  
});



cs.stderr.on('data', (data) => {
  console.error(`Error from C# program: ${data}`);
});

cs.on('close', async(code) => {
  console.log(`C# program exited with code ${code}`);
  console.log(temp);
  user = await User.findOne({username: temp});
  req.session.user = user;
  req.session.save();
  if(temp === "No match found!!"){
    res.send("NO match was found!!!!");
  }
  else{
  res.render('loginpage' , {username: user.username});
  }
});

});



// app.post('/finger_print.ejs',async(req, res)=>{
//     const username = req.body.username;
//     console.log(username);
//    res.render('loginpage');
// });

var user = {};
app.post('/', async(req, res)=>{
    const email = req.body.email;
    const password = req.body.password;

    user = await User.findOne({email: req.body.email});
    req.session.user = user;
    req.session.save();
    
    try{
    if(user.password === req.body.password){
        Username=user.username;
        res.render('loginpage' , {username: Username});
    }else{
        res.send("<h1>Oops!!! Invalid username or password<h1>");
    }
} catch{
    res.send("Invalid username or password");
}    
});

app.get("/basic_details.ejs", function(req, res){
    //console.log(req.session.user)

    res.render('basic_details',{user : req.session.user});
})
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    }
  }).single('myFile'); // make sure this matches the 'name' attribute of your file input field in the HTML form
  
  function checkFileType(file, cb) {
    // Allowed file extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check file extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check MIME type
    const mimetype = filetypes.test(file.mimetype);
  
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
  
  app.get('/upload_documents.ejs', (req, res) => {
    res.render('upload_documents');
  });
  
app.get('/updation.ejs',function(req,res){
  
  res.render('updation');
});

app.post('/updation.ejs',(req, res)=>{
  if(req.body.username != ""){
    User.updateOne({email: req.session.user.email}, { $set: {username: req.body.username
     } })
  .then(() => {
    console.log('username updated successfully');
  })
  .catch((err) => {
    console.error('Error updating documents', err);
  });
  }

  if(req.body.dob != ""){
    User.updateOne({email: req.session.user.email}, { $set: {dob: req.body.dob
    } })
 .then(() => {
   console.log('dob updated successfully');
 })
 .catch((err) => {
   console.error('Error updating documents', err);
 });
  }

  if(req.body.phone_number != ""){
    User.updateOne({email: req.session.user.email}, { $set: {phone_number: req.body.phone_number
    } })
 .then(() => {
   console.log('phone number updated successfully');
 })
 .catch((err) => {
   console.error('Error updating documents', err);
 });
  }

  if(req.body.age != ""){
    User.updateOne({email: req.session.user.email}, { $set: {age: req.body.age
    } })
 .then(() => {
   console.log('age updated successfully');
 })
 .catch((err) => {
   console.error('Error updating documents', err);
 });
  }
    
  if(req.body.gender != ""){
    User.updateOne({email: req.session.user.email}, { $set: {gender: req.body.gender
    } })
 .then(() => {
   console.log('gender updated successfully');
 })
 .catch((err) => {
   console.error('Error updating documents', err);
 });
  }

  if(req.body.blood_grp != ""){
    User.updateOne({email: req.session.user.email}, { $set: {blood_grp: req.body.blood_grp
    } })
 .then(() => {
   console.log('blood group updated successfully');
 })
 .catch((err) => {
   console.error('Error updating documents', err);
 });
  }

  if(req.body.nominee_name != ""){
    User.updateOne({email: req.session.user.email}, { $set: {nominee_name: req.body.nominee_name
    } })
 .then(() => {
   console.log('nominee name updated successfully');
 })
 .catch((err) => {
   console.error('Error updating documents', err);
 });
  }
  
  if(req.body.nominee_number != ""){
    User.updateOne({email: req.session.user.email}, { $set: {nominee_number: req.body.nominee_number
    } })
 .then(() => {
   console.log('nominee phone number updated successfully');
 })
 .catch((err) => {
   console.error('Error updating documents', err);
 });
  }

  if(req.body.nominee_relation != ""){
    User.updateOne({email: req.session.user.email}, { $set: {nominee_relation: req.body.nominee_relation
    } })
 .then(() => {
   console.log('nominee_relation updated successfully');
 })
 .catch((err) => {
   console.error('Error updating documents', err);
 });
  }

  if(req.body.address != ""){
    User.updateOne({email: req.session.user.email}, { $set: {address: req.body.address
    } })
 .then(() => {
   console.log('address updated successfully');
 })
 .catch((err) => {
   console.error('Error updating documents', err);
 });
  }
    res.render('loginpage',{username : req.session.user.username});
  
 })
  
  // POST request to handle the file upload
 app.post('/upload_documents.ejs',(req,res)=>{
  const admin = req.body.admin;
  const admin_password = req.body.admin_password;
  if(admin_password === "admin@123"){
    res.render('updation');
  }
 })


  /*app.post('/upload_documents', async (req, res) => {
    const user = await User.findOne({ email: req.session.user.email });
    if (!user) {
      return res.status(404).send('User not found');
    }
  
    upload(req, res, function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
      }
  
      if (!req.file) {
        return res.status(400).send('No file uploaded');
      }
  
      // Assign the image buffer to the user's profilePicture field
      user.profilePicture = req.file.buffer;
  
      user.save(function(err) {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal server error');
        }
  
        // Return success message
        res.send('Image uploaded successfully');
      });
    });
  });*/
    
  
app.post('/register.ejs', function(req , res){
    const email = req.body.email;
    const password = req.body.password;
    console.log(email,password);
    const newUser = new User({
        email: email,
        password: password
    });

    newUser.save().then(()=>{
    res.render("index");
       
    })
    .catch((err)=>{
        console.log("doesnt save");
    });
});




 /* app.get('/upload_documents.ejs', async(req, res) => {
    const email = req.session.email; // Retrieve email from session object

    console.log(email);
    // Use email to find the user document in the database
    await User.findOne({ email }, async(err, user) => {
      if (err) {
        console.log("Heheyy error found!!");
        console.error(err);
        return res.status(500).send('Internal server error');
      }
  
      // Assuming you have a field named "profilePicture" in your User schema
      user.profilePicture = req.file.buffer; // Assign the image buffer to the user's profilePicture field
      user.save((err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal server error');
        }
  
        // Return success message
        res.send('Image uploaded successfully');
      //});
    //});
  }); 
*/


// app.post('/basic_details',async(req , res)=>{
//     console.log("aaaaaaaaaaaaaaaaaaa")
//     console.log(req.session.user);
    
//     res.render("basic_details");
// });

app.listen(5000, function(){
    console.log("Server started on port : 5000");
})
