
const User = require('../model/User');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const {user, pwd} = req.body;
    console.log(req.body);
    if(!user || !pwd)
    {
        return res.status(400).json({'message' :
            'Username and password required'});
    }
    const foundUser =  await User.findOne({username: user}).exec();
       
    if(!foundUser) return res.sendStatus(401); //Unautorized
    //Evaluate Password
    const match = await bcrypt.compare(pwd, foundUser.password);
    if(match)
    {
        const roles = Object.values(foundUser.roles);
        //create JWT
        const accessToken = jwt.sign(
            {"UserInfo" :
                {
                    "username" : foundUser.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn : '40s'}
        )
        const refreshToken = jwt.sign(
            {"username" : foundUser.username},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn : '1d'}
        )
        
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        console.log(result);
        // Sent with every request
        res.cookie('jwt', refreshToken, {
            httpOnly : true,
            sameSite: 'None',
            secure: true,
            maxAge: 24*60*60*1000
        });
        // On front-end store it in app current memory
        // Not secure with cookie or local memory
        res.json({accessToken});
    }
    else
    {
        res.sendStatus(401);
    }    
};

module.exports = {handleLogin};