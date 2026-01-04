const path=require('path');

module.exports={
    PORT:process.env.PORT||5000,
    UPLOADS_PATH:path.join(__dirname,'../../uploads'),
    JWT_SECRET:process.env.JWT_SECRET||'your_fallback_secret_for_dev',
    AI_SERVICE_URL:process.env.AI_SERVICE_URL||'http://127.0.0.1:8000',
};