const express = require('express');
const mongoose = require('mongoose');
const devuser = require('./devusermodel');
const jwt = require('jsonwebtoken');
const middleware = require('./middleware');
const reviewmodel = require('./reviewmodel');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors({origin:'*'}));

mongoose.connect('mongodb+srv://venkata:abcd1234@cluster0.75kv6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(
    ()=>console.log('DB Connected')
)

app.get('/',(req,res) => {
    return res.send('Hello,world')
})

app.post('/register',async(req, res) =>{
    try{
       const {fullname,email,mobile,skill,password,confirmpassword} = req.body
       const exist = await devuser.findOne({email});
       if(exist){
        return res.status(400).send('User already registered');
       }
       if(password != confirmpassword){
        return res.status(403).send('Password invalid');
       }
       let newUser = new devuser({
        fullname,email,mobile,skill,password,confirmpassword
       })
       newUser.save();
       return res.status(200).send('User Registered');
    }  
       
       
    
    catch(err){
        console.log(err);
        return res.status(500).send('server error')
    }
})

app.post('/login',async(req, res) =>{
    try{
       const {email,password} = req.body;
       const exist = await devuser.findOne({email});
       if(!exist){
        return res.status(400).send('User not exist');
       }
       if(exist.password != password){
        return res.status(400).send('Password invalid');
       }
       let payload = {
        user :{
            id : exist.id
        }
       }
       jwt.sign(payload,'jwtPassword',{expiresIn:360000000},
        (err,token)=>{
          if(err) throw err
          return res.json({token})
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).send('server error')
    }
})


app.get('/allprofiles',middleware,async(req, res) =>{
    try{
       let allprofiles = await devuser.find();
       return res.json(allprofiles);
    }  
    catch(err){
        console.log(err);
        return res.status(500).send('server error')
    }
})

app.get('/myprofile',middleware,async(req, res) =>{
    try{
       let user = await devuser.findById(req.user.id);
       return res.json(user);
    }  
    catch(err){
        console.log(err);
        return res.status(500).send('server error')
    }
})


/*app.post('/addreview',middleware,async(req, res) =>{
    try{
       const {taskworker,rating} = req.body;
       const exist = await devuser.findById(req.user.id);
       const newReview = new reviewmodel({
        taskprovider:exist.fullname,
        taskworker,rating
       })
       newReview.save();
       return res.status(200).send('Review updated successfully')
    }  
    catch(err){
        console.log(err);
        return res.status(500).send('server error')
    }
})
    */
app.post('/addreview', middleware, async (req, res) => {
    try {
      const { taskworker, rating } = req.body;
      const exist = await devuser.findById(req.user.id);
  
      // Check if the user is trying to rate themselves
      if (taskworker === req.user.id) {
        return res.status(400).send("You cannot rate yourself.");
      }
  
      // Create a new review
      const newReview = new reviewmodel({
        taskprovider: exist.fullname,
        taskworker,
        rating,
      });
      await newReview.save(); // Add await to ensure the review is saved properly
      return res.status(200).send("Review updated successfully");
    } catch (err) {
      console.log(err);
      return res.status(500).send("Server error");
    }
  });
   


app.get('/myreview',middleware,async(req, res) =>{
    try{
       let allreviews = await reviewmodel.find();
       let myreviews = allreviews.filter(review => review.taskworker.toString() === req.user.id.toString())
       return res.status(200).json(myreviews);

    }  
    catch(err){
        console.log(err);
        return res.status(500).send('server error')
    }
})


app.listen(5000,()=> console.log('Server running...'));