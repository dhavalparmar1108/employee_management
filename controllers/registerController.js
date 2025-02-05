
const User = require('../model/User');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const {user, pwd} = req.body;
    console.log(req.body);
    if(!user || !pwd)
    {
        return res.status(400).json({'message' :
            'Username and password required'});
    }
    // Check duplicate
    const duplicate = await User.findOne({username: user}).exec();
    if(duplicate)
    {
        res.sendStatus(409); //Conflict
    }
    try
    {
        // encrypt password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        // store the new user
        const result = await User.create({
            "username" : user,
            "password" : hashedPwd,
        });
        console.log(result);
        res.status(201).json({
            'success' : `New user ${user} created!`
        });
    }
    catch(err)
    {
        res.status(500).json({'message' : err.message});
    }
};

module.exports = {handleNewUser};