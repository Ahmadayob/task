const jwt = require("jsonwebtoken");

function verifyToken(req, res, next){
    //Extract token from Authorization header
    const token= req.headers['authorization']?.split(" ")[1];
    
    if(!token){
        return res.status(403).json({ error: "No token provided"});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).json({ error: "Unauthorized"});
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
}

function verifyAdmin(req, res, next) {
    if (req.userRole !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  }

module.exports = {verifyToken, verifyAdmin};
