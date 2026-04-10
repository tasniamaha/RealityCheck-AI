const prisma=require('../config/prisma');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

exports.register=async(req,res)=>{
    try{
        const existingUser=await prisma.user.findUnique({
        where:{email:req.body.email}
    });
    if(existingUser){
        return res.status(400).json({message:'User already exists'});
    }
    const hashedPassword=await bcrypt.hash(req.body.password,10);
    const newUser=await prisma.user.create({
        data:{
            email:req.body.email,
            password:hashedPassword,
            //name:req.body.name,
            role:'USER'
        }
    });
    res.status(201).json({message:'User registered successfully',userId:newUser.id});
    
}catch(err){
    res.status(500).json({error: err.message});
}};

exports.login=async(req,res)=>{
    try{
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    const token = jwt.sign(     
        { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        });
}catch(err){
    res.status(500).json({error: err.message});
}};
exports.getMe = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, role: true, createdAt: true }
    });
    res.json(user);
};
