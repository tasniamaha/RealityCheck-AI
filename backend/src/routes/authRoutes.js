const express=require('express');
const router=express.Router();
const authController=require('../controllers/authController');
const {protect}=require('../middlewares/authMiddleware');


router.post('/register',authController.registerUser);
router.post('/login',authController.loginUser);
//router.post('/logout',protect,authController.logoutUser);
router.get('/me',protect,authController.getMe);
module.exports=router;