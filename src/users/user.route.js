const express = require('express');
const User = require('./user.model'); // Make sure the path to the User model is correct
const generateToken = require('../middleware/generateToken');
const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" }); // Handle the error properly
  }
})

//login user endpoint
router.post('/login', async (req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  try {
    if(!user){
      return res.status(404).send({message: 'User not found'});
    }
    const isMatch = await user.comparePassword(password);
    if(!isMatch){
      return res.status(401).send({message: 'Password not match failed'});
    }
    const token = await generateToken(user._id);
   

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    })
  
    res.status(200).send({message: 'Login successfully', token, user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      bio: user.bio,
      profession: user.profession,
    }})

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error logged in user" }); // Handle the error properly
  }

})

//logout endpoit
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).send({message: 'Logged out successfully'});
})

//delete a user 
router.delete('/users/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const user = await User.findByIdAndDelete(id);
    if(!user){
      return res.status(404).send({message: 'User not found'});
    }
    res.status(200).send({message: 'User deleted successfully'});
  } catch(error) {
     console.error("Error deleting user", error);
     res.status(500).send({ message: "Error deleting user" }); // Handle the error properly
  }
})

//get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'id email role').sort({createdAt: -1})
    res.status(200).send(users)
  } catch (error){
    console.error("Error getting users", error);
    res.status(500).send({ message: "Error getting users" }); // Handle the error properly
  }
})

//update user role
router.put('/users/:id', async (req, res) => {
  try {
      const {id} = req.params;
      const {role} = req.body;
      const user = await User.findByIdAndUpdate(id, {role}, {new: true});
      if(!user){
        return res.status(404).send({message: 'User not found'});
      }
      res.status(200).send({message: 'User role updated successfully', user})
  } catch (error){
    console.error("Error updating user role", error);
    res.status(500).send({ message: "Error updating user role" }); // Handle the error properly
  }
})

//edit or update profile
router.patch('/edit-profile', async (req, res) => {
  try {
      const {userId, username, profileImage, bio, profession} = req.body;
      if(!userId){
        return res.status(400).send({message: 'User id is required'});
      }
      // const user = await User.findByIdAndUpdate(userId, {username, profileImage, bio, profession}, {new: true});
      const user = await User.findById(userId);
     if(!user){
       return res.status(400).send({message: 'User not found'});
     }

     //update profile
     if(username !== undefined) user.username = username;
     if(profileImage!== undefined) user.profileImage = profileImage;
     if(bio!== undefined) user.bio = bio;
     if(profession!== undefined) user.profession = profession;

     await user.save();
     res.status(200).send({message: 'User profile updated successfully', user: {
       _id: user._id,
       username: user.username,
       email: user.email,
       role: user.role,
       profileImage: user.profileImage,
       bio: user.bio,
       profession: user.profession,
     },
    });
  } catch(error) {
    console.error("Error editing user profile", error);
    res.status(500).send({ message: "Error editing user profile" }); // Handle the error properly
  }
})




module.exports = router;
