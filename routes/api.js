
const User = require('../models/User');
const express = require('express');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const dotenv = require('dotenv'); 
const app = express();

const {registerValidation,loginValidation} = require("../validation");
const {login,signup,activateaccount,forgotpassword,resetpassword} = require("../controllers/auth");
router.post('/signup',signup);
router.post('/activateaccount',activateaccount);
router.put('/forgotpassword',forgotpassword);
router.put('/resetpassword',resetpassword);
router.post('/login',login);



router.get('/', (req,res)=>{
    res.render('welcome');
})

router.post('/signup', async(req,res)=>{
    
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
               
                return res.json({error:err.message})



            }
           return res.json({message:'Email has been sent, kindly activate your account'})
           
        }); 

    });
})


module.exports = router;