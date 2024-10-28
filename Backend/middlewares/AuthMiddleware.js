import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  
  const token = req.headers.token; 

  // Check if the token is present
  if (!token) {
    return res.status(401).json({ message: "You are not authenticated" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Token is not valid" });
    }

    // If valid, attach the payload (user ID) to the request
    req.userID = payload.userId;

    // Proceed to the next middleware or route handler
    next();
  });
};
