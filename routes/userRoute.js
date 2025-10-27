const express=require('express');

const router=express.Router();
const { signupUser, loginUser, editProfile ,fetchProfile} =require('../controllers/userController');

const auth=require('../middlewares/auth');
const upload=require('../middlewares/multer')

router.post('/signup', signupUser);
router.post('/login',loginUser)
router.put('/edit-profile', auth, upload.single('photo'),editProfile)
router.get('/profile', auth,fetchProfile)


module.exports=router;
