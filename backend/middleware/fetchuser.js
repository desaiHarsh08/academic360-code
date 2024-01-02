import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;


const fetchuser = (req, res, next)=> {
    // Get the user from the jwt_token and add id to req object
    const token = req.header('auth-token');
    if(!token) {
        return res.status(401).send({error: "Please authenticate using valid token!"});
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
    } catch (error) {
        console.log('here')
        return res.status(500).send({error: "Internal Server Error!"});
    }
    next();
}


export default fetchuser;