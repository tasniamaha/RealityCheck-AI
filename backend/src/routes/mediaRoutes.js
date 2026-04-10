const express=require('express');
const router=express.Router();
const mediaController = require('../controllers/mediaController');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.post('/upload', protect, upload.single('media'), mediaController.uploadMedia);
router.get('/history', protect, mediaController.getUserHistory);
router.get('/:id', protect, mediaController.getMediaDetails);
module.exports=router;