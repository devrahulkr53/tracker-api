var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const checkAdmin = require('../middleware/admin');
const checkAuth = require('../middleware/auth');
const Users = require('../model/users'); 


router.get('/', async (req,res)=>{
    try {
        let result = await Users.aggregate([
            { $project: { _id: 1, name: 1, email: 1, latitude: 1, longitude: 1 } }
        ])
        res.status(200).json(result) 
    }catch(err) {
        res.status(500).json(err) 

    }

})

router.post('/signup',(req,res)=>{ 
      
    Users.find({email:req.body.email}).exec().then(docs=>{ 
        if(docs.length == 0){
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    res.status(500).json(err)
                }else{ 
                    const user = new Users({
                        _id:new mongoose.Types.ObjectId(),
                        name:req.body.name,
                        email:req.body.email,
                        password:hash,
                        latitude:req.body.latitude,
                        longitude:req.body.longitude
                    })
                    user.save().then(result=>{ 
                        res.status(200).json({
                            status: 1,
                            message:'New user added',
                            user:{
                                _id:user._id,
                                name:user.name,
                                email:user.email,
                            }
                        })
                    }).catch(err=>{
                        res.status(500).json(err)
                    })
                }
            })
            
        }else{
            res.status(500).json({
                status: 0,
                message:"Emaill Address is already taken by a user. Please assign another one."
            })
        }
    })
    
})


router.get('/:id', async (req,res)=>{
    
    try {
        let result = await Users.aggregate([
            {$match: {_id: mongoose.Types.ObjectId(req.params['id'])}},
            { $project: { _id: 1, name: 1, email: 1, latitude: 1, longitude: 1 } }
        ])
        res.status(200).json(result[0]) 
    }catch(err) {
        res.status(500).json(err) 

    }

})


router.patch('/:id', checkAuth,(req,res)=>{  
    var updateOps = {};
    for(let ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Users.update({_id:req.params['id']},{$set:updateOps}).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"User data updated",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})

router.delete('/:id', checkAuth,(req,res)=>{
    Users.deleteOne({_id:req.params['id']}).exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"User deleted",
            _id:req.params['id']
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})

router.delete('/', checkAdmin,(req,res)=>{
    Users.remove().exec()
    .then(docs=>{ 
        res.status(200).json({
            message:"All User data deleted"
        }) 
    }).catch(err=>{ 
        res.status(500).json(err) 

    }) 
})

module.exports = router;