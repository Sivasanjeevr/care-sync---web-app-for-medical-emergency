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
const { spawn } = require('child_process');
const multer  = require('multer');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
require('dotenv').config();
const fast2sms = require('fast-two-sms');
const http=require('http');
const speakeasy = require('speakeasy');


mongoose.connect("mongodb://0.0.0.0/ihealth", {useNewUrlParser:true,useUnifiedTopology:true},).then(()=>console.log("connected successfully")).catch((err)=>{console.log(err);});


const app= express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
// Configure static file serving


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
    res.render('indexnew');
});

app.get("/patient-loginpage.ejs", function(req, res){
    res.render('patient-loginpage');
});

app.get("/doctors_register.ejs", function(req, res){
     res.render('doctors_register');
 })

app.get("/medications.ejs",function(req,res){
    res.render('medications',{user: req.session.user});
});

app.get('/support.ejs',function(req,res){
  res.render('support');
});

app.get('/doctors-login.ejs',function(req,res){
  res.render('doctors_login')
})

app.get('/patient_register.ejs',function(req,res){
  res.render('patient_register')
})

app.get('/pdash.ejs',function(req,res){
  res.render('pdash',{user: req.session.user});
})

app.get('/otp_validate.ejs',function(req,res){
  res.render('otp_validate');
})

app.get('/ootp.ejs',function(req,res){
  res.render('ootp');
})



app.get('/pdash2.ejs',function(req,res){
  res.render('pdash2',{user: req.session.user});
})

app.post('/doctors_login',async(req,res)=>{
  const email = req.body.email;
    const password = req.body.password;

    user = await User.findOne({email: req.body.email});
    req.session.user = user;
    req.session.save();
    
    try{
    if(user.password === req.body.password){
        Username=user.username;
        res.render('doctors_dashboard' , {user : user});
    }else{
        res.send("<h1>Oops!!! Invalid username or password<h1>");
    }
} catch{
    res.send("Invalid username or password");
}
})

app.post("/send_message",async(req,res)=>{
  
  console.log(req.session.user.nominee_number);
  let a=parseInt(req.session.user.nominee_number);
  let Name = "Hello,Your relation "+req.session.user.username+" is met with an accident";
  const response = await fast2sms.sendMessage({authorization:process.env.API_KEY,message: Name, numbers:[a]});
  let hospital = "location: "+req.body.hospital_name+".";
  let response2 = await fast2sms.sendMessage({authorization:process.env.API_KEY,message: hospital, numbers:[a]});
  res.send(response);
});



const otpStore = new Map(); // Declare otpStore outside of the routes
let otpt=""

app.post('/send-otp', async(req, res) => {
  const email = req.session.user.email; // User's email or identifier
  const secret = speakeasy.generateSecret({ length: 20 });
  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32',
  });

  // Store OTP secret in otpStore
  otpStore.set(email, secret.base32);
  console.log(`OTP for ${email}: ${otp}`);
  // let a=parseInt(req.session.user.nominee_number);
  // let Name = "OPT from caresync: "+otp;
  // const response = await fast2sms.sendMessage({authorization:process.env.API_KEY,message: Name, numbers:[a]});
  otpt=otp;
  res.redirect('ootp.ejs');
});


app.post('/validate-otp', (req, res) => {
  const email = req.session.user.email;
  const userEnteredOtp = req.body.otp;

  if(otpt == req.body.otp){
    res.render('pdash', { user: req.session.user });
  }else{
    res.send('invalid otp');
  }
    
});








let sid = 8;

app.get("/finger_print2.ejs", async (req, res) => {
  const cs = spawn("C:/Users/haree/source/repos/finger_project/bin/Debug/finger_project.exe", ["login",sid]);

  // Assuming you're sending input data to the C# program
  // process.stdin.write("Input data here");

  var temp = "";

  cs.stdout.on('data', async (data) => {
    const result = data.toString().trim();
    console.log(`Result from C# program: ${result}`);
    console.log(typeof(result));
    temp = result;

    try {
      
      console.log('Temp value:', temp);

      const user = await User.findOne({ username: temp });

      if (!user) {
        console.log("No match found!!!!");
        res.send("No match was found!!!!");
        return;
      }

      

      req.session.user = user;
      await req.session.save();
      res.render('pdash2', { user: user});
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred.');
    }
  });

  cs.stderr.on('data', (data) => {
    console.error(`Error from C# program: ${data}`);
  });
});


app.get("/finger_print3.ejs", async (req, res) => {
  const cs = spawn("C:/Users/haree/source/repos/finger_project/bin/Debug/finger_project.exe", ["login",sid]);

  // Assuming you're sending input data to the C# program
  // process.stdin.write("Input data here");

  var temp = "";

  cs.stdout.on('data', async (data) => {
    const result = data.toString().trim();
    console.log(`Result from C# program: ${result}`);
    console.log(typeof(result));
    temp = result;

    try {
      
      console.log('Temp value:', temp);

      const user = await User.findOne({ username: temp });

      if (!user) {
        console.log("No match found!!!!");
        res.send("No match was found!!!!");
        return;
      }

      req.session.user = user;
      await req.session.save();
      res.render('doctors_dashboard', { user: user});
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred.');
    }
  });

  cs.stderr.on('data', (data) => {
    console.error(`Error from C# program: ${data}`);
  });
});

app.get("/finger_print.ejs", async (req, res) => {
  const cs = spawn("C:/Users/haree/source/repos/finger_project/bin/Debug/finger_project.exe", ["login",sid]);

  // Assuming you're sending input data to the C# program
  // process.stdin.write("Input data here");

  var temp = "";

  cs.stdout.on('data', async (data) => {
    const result = data.toString().trim();
    console.log(`Result from C# program: ${result}`);
    console.log(typeof(result));
    temp = result;

    try {
      
      console.log('Temp value:', temp);

      const user = await User.findOne({ username: temp });

      if (!user) {
        console.log("No match found!!!!");
        res.send("No match was found!!!!");
        return;
      }

      

      req.session.user = user;
      await req.session.save();
      res.render('ootp.ejs');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred.');
    }
  });

  cs.stderr.on('data', (data) => {
    console.error(`Error from C# program: ${data}`);
  });
});




// app.post('/finger_print.ejs',async(req, res)=>{
//     const username = req.body.username;
//     console.log(username);
//    res.render('loginpage');
// });

var user = {};
app.post('/patient-loginpage.ejs', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });

    if (!user || user.password !== password) {
      return res.send("<h1>Oops!!! Invalid username or password<h1>");
    }

    req.session.user = user;
    req.session.save();

    // Render the "pdash.ejs" template
    res.render('ootp.ejs', { user: user });

    // Update the lastview field after rendering
    const currentDateTime = new Date();
    const formattedDateTime = currentDateTime.toLocaleString(); // Format the date and time as needed

    try {
      await User.updateOne(
        { _id: user._id }, // Assuming you have a unique identifier for the user
        { $set: { lastview: formattedDateTime } }
      );
      console.log('Lastview updated successfully');
    } catch (error) {
      console.error('Error updating lastview:', error);
    }
  } catch (error) {
    console.error('Error:', error);
    res.send("An error occurred");
  }
});


app.get('/uploads/b1780daf309b378d0dd9d359813735dd', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'public', 'uploads', fileName);

  // Set the correct content type for PDF
  res.setHeader('Content-Type', 'application/pdf');

  // Send the PDF file
  res.sendFile(filePath);
});


app.get("/basic_details.ejs", function(req, res){
    //console.log(req.session.user)

    res.render('basic_details',{user : req.session.user});
})

  
  
  
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
    
  
  app.post('/doctors_register.ejs', async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    
    console.log(email, password);
  
    try {
      sid=sid+1;
      const resultFromCSharp = await executeCSharpProgram(email,sid,password); // Execute the C# program and await its completion
      
      const user = await User.findOne({ username: email });
  
      if (!user) {
        console.log("No match found!!!!");
        res.send("No match was found!!!!");
        return;
      }
  
      req.session.user = user;
      await req.session.save();
  
      res.render('doctors_dashboard', { user: user });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('An error occurred.');
    }
    if(req.body.username != ""){
      User.updateOne({username: req.session.user.username}, { $set: {username: req.body.username
       } })
    .then(() => {
      console.log('username updated successfully');
    })
    .catch((err) => {
      console.error('Error updating documents', err);
    });
    }

    if(req.body.dob != ""){
      User.updateOne({username: req.session.user.username}, { $set: {dob: req.body.dob
       } })
    .then(() => {
      console.log('dob updated successfully');
    })
    .catch((err) => {
      console.error('Error updating documents', err);
    });
    }

    if(req.body.password != ""){
      User.updateOne({username: req.session.user.username}, { $set: {password: req.body.password
       } })
    .then(() => {
      console.log('password updated successfully');
    })
    .catch((err) => {
      console.error('Error updating documents', err);
    });
    }

    if(req.body.email != ""){
      User.updateOne({username: req.session.user.username}, { $set: {email: req.body.email  
       } })
    .then(() => {
      console.log('email updated successfully');
    })
    .catch((err) => {
      console.error('Error updating documents', err);
    });
    }

    if(req.body.specialist != ""){
      User.updateOne({username: req.session.user.username}, { $set: {specialist: req.body.specialist
       } })
    .then(() => {
      console.log('specialist updated successfully');
    })
    .catch((err) => {
      console.error('Error updating documents', err);
    });
    }

    if(req.body.phone_number != ""){
      User.updateOne({username: req.session.user.username}, { $set: {phone_number: req.body.phone_number
       } })
    .then(() => {
      console.log('phone_number updated successfully');
    })
    .catch((err) => {
      console.error('Error updating documents', err);
    });
    }

    if(req.body.address != ""){
      User.updateOne({username: req.session.user.username}, { $set: {address: req.body.address
       } })
    .then(() => {
      console.log('address updated successfully');
    })
    .catch((err) => {
      console.error('Error updating documents', err);
    });
    }
  });
  
  function executeCSharpProgram(email,sid,password) {
    return new Promise((resolve, reject) => {
      const cs = spawn("C:/Users/haree/source/repos/finger_project/bin/Debug/finger_project.exe", ["register", email,sid,password]);
  
      let result = '';
  
      cs.stdout.on('data', (data) => {
        console.log('C# program output:', data.toString().trim());
        result = data.toString().trim();
      });
      
  
      cs.stderr.on('data', (data) => {
        console.error(`Error from C# program: ${data}`);
        reject(data.toString().trim());
      });
  
      cs.on('close', (code) => {
        if (code === 0) {
          resolve(result);
        } else {
          reject(`C# program exited with code ${code}`);
        }
      });
    });
  }
  

 // Assuming you have your express app and middleware already set up

const upload = multer({ dest: 'uploads/' }); // Destination for uploaded files

// Render the EJS template
app.get('/patientpage.ejs', async (req, res) => {
  try {
    // Find the logged-in user
    res.render('patientpage', {user : req.session.user});
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle file uploads
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.session.user.email },
      {
        $push: {
          uploadedPDFs: {
            fileName: req.file.originalname,
            filePath: req.file.path
          }
        }
      },
      { new: true } // Return the updated user object
    );

    req.session.user = user; // Update session user object

    console.log('PDF uploaded successfully');
    res.render('pdash2',{user:req.session.user}); // Redirect to the patient page
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).send('Internal Server Error');
  }
});

const storage = multer.memoryStorage();
const upload2 = multer({ storage: storage });

// Handle image upload
app.post('/upload-image', upload2.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No image file provided.');
        }
        const imageBuffer = req.file.buffer;

        await User.updateOne(
            { username: req.session.user.username },
            { $set: { profileImage: imageBuffer } }
        );

        console.log('Image uploaded successfully');
        res.redirect('/profile'); // Redirect to the profile page
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).send('Internal Server Error');
    }
});


const hostname = '0.0.0.0';
const server = http.createServer((req,res)=>{
  res.statusCode=200;
  res.setHeader('Content-Type','text/plain');
  res.end('zeet code');
})
app.listen(5000,hostname, function(){
    console.log("Server started on port : 5000");
})