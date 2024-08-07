
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const PDFDocument = require('pdfkit');
const fs = require('fs');


const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'something', 
  resave:true,
  saveUninitialized: true
  
}));

mongoose.connect('mongodb://127.0.0.1:27017/login');

 const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String
  });
const iteml=mongoose.model("first",userSchema);


const dataSchema=new mongoose.Schema({
  nameofraiser:String,
  ticketnumber:Number,
  date:Date,
  subject:String,
  description:String,
  doc: Buffer,
  approval:{
    type:String,
    default:"no"
  },
  completion:{
    type:String,
    default:"no"
  }
})
const datal=mongoose.model("second",dataSchema);

let redirectFlagResourcemanager=false;
let redirectFlagManager=false;
let redirectFlagChangeteam=false;
let redirectFlagRegister = false;
let redirectFlagProfile=false;
const checkRedirectFlagResourcemanager = (req, res, next) => {
  if (redirectFlagResourcemanager) {
      next();
  } else {
      
      res.redirect('/login');
  }
};
const checkRedirectFlagManager = (req, res, next) => {
  if (redirectFlagManager) {
      next();
  } else {
      
      res.redirect('/login');
  }
};
const checkRedirectFlagRegister = (req, res, next) => {
  if (redirectFlagRegister) {
      next();
  } else {
      
      res.redirect('/login');
  }
};
const checkRedirectFlagChangeteam = (req, res, next) => {
  if (redirectFlagChangeteam) {
      next();
  } else {
      
      res.redirect('/login');
  }
};
const checkRedirectFlagProfile = (req, res, next) => {
  if (redirectFlagProfile) {
      next();
  } else {
      
      res.redirect('/login');
  }
};

app.get('/', (req, res) => {
    res.render('login');
  });
  app.get('/login', (req, res) => {
    res.render('login');
  });
  app.get('/profile',checkRedirectFlagProfile,async (req,res)=>{
    var username = req.session.profilename;
    role="Employee";
    requests = await datal.find().lean(); 
   res.render('profile',{username,role,requests});

  })

  app.get('/register', checkRedirectFlagRegister, (req, res) => {
    res.render('register');
});
app.get('/changeteam', checkRedirectFlagChangeteam, async (req, res) => {

  requests = await datal.find().lean();
  res.render('changeteam',{requests});
});
app.get('/manager', checkRedirectFlagManager, async (req, res) => {
  try {
    
     requests = await datal.find().lean(); 
    res.render('manager', { requests });
} catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
}
  
});
app.get('/resourcemanager', checkRedirectFlagResourcemanager, async (req, res) => {
  try {
    requests = await datal.find().lean(); 
   res.render('resourcemanager', { requests });
} catch (error) {
   console.error('Error fetching user data:', error);
   res.status(500).send('Internal Server Error');
}
});

app.post('/profile',async (req,res)=>{
  try {
    items= await datal.find().lean();

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="output.pdf"');

    doc.pipe(res);

    
    doc.fontSize(12);
    items.forEach((item) => {
      
       
        doc.text(`Name of Raiser: ${item.nameofraiser}`);
        doc.text(`Date of Raising: ${item.date}`);
        doc.text(`Subject: ${item.subject}`);
        doc.text(`Description: ${item.description}`);
        doc.text(`Manager approval Status: ${item.approval}`);
        doc.text(`Completion Status: ${item.completion}`);
        doc.moveDown();
        
    });

    doc.end();
} catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Internal Server Error');
}



})





app.post('/manager',async (req,res)=>{
  var newcompletion=""
  newapproval=req.body.status;
  console.log(newapproval);
  newticketnumber=req.body.ticketnumber;
  try {

    const result = await datal.updateOne({ ticketnumber: newticketnumber }, { approval: newapproval });

    if (result.nModified === 0) {
        console.log('Item not found or no changes were made.' );
    }

    console.log("Item updated");
} catch (error) {
    console.error('Error updating item:', error);
  

}

});

app.post('/resourcemanager',async (req,res)=>{
  var newcompletion=""
  newcompletion=req.body.status;
  console.log(newcompletion);
  newticketnumber=req.body.ticketnumber;
  try {

    const result = await datal.updateOne({ ticketnumber: newticketnumber }, { completion: newcompletion });

    if (result.nModified === 0) {
        console.log('Item not found or no changes were made.' );
    }

    console.log("Item updated");
} catch (error) {
    console.error('Error updating item:', error);
  

}

});

app.get('/ticket',(req,res)=>{
 if(redirectFlagProfile){
    res.render("ticket");
  }
  else{
    res.redirect("/login");
  }
 });


app.post("/register",function(req,res){
  const User3=new iteml({
    username:req.body.username2,
    password:req.body.password2,
    role:req.body.role2
  })
  User3.save();
  console.log("registered");
})
 
app.post("/login",function(req,res){
    const User2=new iteml({
      username:req.body.username,
      password:req.body.password,
      role:req.body.role
    })
    switch(User2.role){
      case "Admin":
                if((User2.username=="adithya")&& (User2.password=="adithya") ){
                  redirectFlagRegister = true;
                  res.redirect('/register');
                }else{
                     console.log("Invalid User");
                    }
                break;
                  case "Employee":
                    iteml.findOne({ username: User2.username ,role:User2.role})
  .then(foundUser => {
    if (foundUser) {
      if (foundUser.password === User2.password) {
        
        var profilename= User2.username;
         req.session.profilename = profilename;
        redirectFlagProfile=true;
        res.redirect("/profile");
      }
    }
    else{
      console.log("Invalid User");
    }
  })
  .catch(err => {
    console.log(err);
  });
  break;
                     
        case "Change-team":
                  iteml.findOne({ username: User2.username ,role:User2.role})
  .then(foundUser => {
    if (foundUser) {
      if (foundUser.password === User2.password) {
        
        var profilename= User2.username;
         req.session.profilename = profilename;
        redirectFlagChangeteam=true;
        res.redirect("/changeteam");
      }
    }
    else{
      console.log("Invalid User");
    }
  })
  .catch(err => {
    console.log(err);
  });
          break;

      case "Manager":
        iteml.findOne({ username: User2.username ,role:User2.role})
        .then(foundUser => {
          if (foundUser) {
            if (foundUser.password === User2.password) {
              
              var profilename= User2.username;
               req.session.profilename = profilename;
              redirectFlagManager=true;
              res.redirect("/manager");
            }
          }
          else{
            console.log("Invalid User");
          }
        })
        .catch(err => {
          console.log(err);
        });
             break;
      case "Resource-manager":
        iteml.findOne({ username: User2.username ,role:User2.role})
        .then(foundUser => {
          if (foundUser) {
            if (foundUser.password === User2.password) {
              
              var profilename= User2.username;
               req.session.profilename = profilename;
              redirectFlagResourcemanager=true;
              res.redirect("/resourcemanager");
            }
          }
          else{
            console.log("Invalid User");
  
          }
        })
        .catch(err => {
          console.log(err);
        });
             break;
       }
  });

  
app.post('/ticket',(req,res)=>{
  
  const newData=new datal({
    nameofraiser:req.body.nameofraiser,
    ticketnumber:req.body.ticketnumber,
    date:req.body.date,
    subject:req.body.subject,
    description:req.body.description,
    doc: req.body.doc
  });
  newData.save();
  res.redirect("/ticket");
  console.log("Raised ticket");
})



app.listen(port, () => {
  console.log('Server is running');
});
