
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const User = require('../models/User')
var API_KEY = '7c32897a648ba798a80fc709590d3827-a83a87a9-eeb41682';
var DOMAIN = 'sandbox493c56ca918845d9999100b8e5ee9831.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});



const {registerValidation,loginValidation} = require("../validation");

//signup using name,email,password
exports.signup = async(req,res) => {
    
        const{name,email,password} = req.body;
        
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password,salt);
        var data = {
            name:req.body.name,
            email:req.body.email,
            password: hashedpassword,
        }
        var user = new User(data)
        
        User.findOne({email}).exec((err,user) => {
            if(user){
                return res.status(400).json({message:'User with this email already exists'});
            }
            const token = jwt.sign({
                name:req.body.name,
                email:req.body.email,
                password: hashedpassword,
            }, process.env.JWT_ACC_ACTIVATE, {expiresIn : '60m'});
            const data = {
                from: 'Ian <sps151207@gmail.com>',
                to: email,
                subject: 'Account Activation Link',
                html:`<h2>Please click on the link</h2><p>${process.env.CLIENT_URL}/authentication/activate/${token}</p>`
            };
            mailgun.messages().send(data, (error, body) => {
                if(error){
                    return res.json({
                        error:error
                    })
                }
               return res.json({message:'Email has been sent, kindly activate your account'})
               
            }); 
    
        });
    }
    

//account activation
exports.activateaccount = (req,res) => {
    const{token} =req.body;
    if(token){
        jwt.verify(token, process.env.JWT_ACC_ACTIVATE, (err,decodedtoken)=> {
            if(err){
                return res.status(400).json({error: 'Incorrect or expired link'})
            }
            const {name,email,password} = decodedtoken;
            User.findOne({email}).exec((err,user) => {
                if(user){
                    return res.status(400).json({message:'User with this email already exists'});
                }
               let newUser =  new User({name,email,password});
               newUser.save((err, success) => {
                   if(err){
                       console.log("Error in signup account activation:", err);
                       return res.status(400).json({error:'Error activating account'})
                   }
                   res.json({
                       message: 'Signup success!!'
                   })
               })            
        
            });
        })
    }
    else{
        return res.json({error: 'Something went wrong'})
    }
}


//forgot password 
exports.forgotpassword = (req,res) => {
    const  {email} = req.body;
    
    User.findOne({email}, (err,user) => {
        if(err || !user){
            return res.status(400).json({error:'User with this email does not exists'});
        }
        const token = jwt.sign({_id: user._id }, process.env.RESET_PASSWORD_KEY, {expiresIn : '60m'});
        const data = {
            from: 'Ian <sps151207@gmail.com>',
            to: 'sps151207@gmail.com',
            subject: 'Account Activation Link',
            html:`<h2>Please click on the link to reset password</h2><p>${process.env.CLIENT_URL}/resetpassword/${token}</p>`
        };
        return user.updateOne({resetLink : token},  (err, success) => {
            if(err){
                return res.status(400).send('reset password link error');
            } else { 
                mailgun.messages().send(data, (error, body) => {
                    if(error){
                        return res.json({
                            error : err.message
                        })
                    }
                   return res.json({message:'Email has been sent, kindly follow the instructions'})
                   console.log(body);
                });
            }
        })

    })
}

//reset password
exports.resetpassword = (req,res) => {
    const  {resetLink, newPass} = req.body;
    if(resetLink){
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function(error, decodeddata){
            if(error){
                return res.status(401).json({
                    error:"Incorrect token or token expired"
                })
            }
            User.findOne({resetLink},(err,user) => {
                if(err || !user){
                    return res.status(400).json({error: "User with this token does not exist"});
                }
                const obj = {
                    password:newPass,
                    resetLink:''
                }
                user = _.extend(user,obj);
                user.save((err,result) =>{
                    if(err){
                        return res.status(400).json({error:'reset password error'});
                    }else{
                        return res.status(200).json({message:'Your password has been changed'});
                    }

                })
            })
        })
    }else{
        return res.status(401).send('Authentication failed');
    }

}

exports.login = (req,res) => {
  
    User.find({email: req.body.email}).exec()
    .then(user =>{
        if(user.length < 1){
            return res.status(400).json({message:"User does not exist"
        });
        }bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
            if(err){return res.status(401).json({error:"Auth failed"})}
            if(result){
                const token = jwt.sign({
                    email:user.email,
                    userId:user._id
                },process.env.JWT_SIGNIN_KEY,{expiresIn : "7d"});
                
                return res.status(200).json({
                    message:"Auth success"})
                }
            res.status(401).json({error:"Auth failed"})
        });
    })
    .catch(err => {
        console.log('error');
        return res.status(500).json({error: err})
    })

}
