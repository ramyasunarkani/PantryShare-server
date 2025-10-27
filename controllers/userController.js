const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const imagekit=require('../config/imagekit');
const fs = require('fs');


const signupUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token, 
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        photoURL: newUser.photoURL,
        location: newUser.location,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        photoURL: user.photoURL,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { fullName, location } = req.body;

    const updatedData = {};

    if (fullName) updatedData.fullName = fullName;

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: req.file.originalname,
        folder: "/users",
      });

      const optimizedImageUrl = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });

      updatedData.photoURL = optimizedImageUrl;
    }

    if (location) {
      let locObj = location;
      if (typeof location === "string") {
        try {
          locObj = JSON.parse(location);
        } catch (err) {
          console.log("Invalid location format");
        }
      }

      if (locObj.lat && locObj.lng) {
        updatedData.location = {
          lat: parseFloat(locObj.lat),
          lng: parseFloat(locObj.lng),
        };
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        photoURL: updatedUser.photoURL,
        location: updatedUser.location,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error.message);
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
};


const fetchProfile = async (req, res) => {
  try {
    const userId = req.user.userId; 

    const user = await User.findById(userId).select('-password');

    if (!user)
      return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: 'Profile fetched successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        photoURL: user.photoURL,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile fetch failed', error: error.message });
  }
};

module.exports={signupUser,loginUser,editProfile,fetchProfile}