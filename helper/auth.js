import jwt from "jsonwebtoken";
//  const {verify} = jwt
const authorizationRequired = "Authorization required";
const invalidCredentials = "Invalid credentials";

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.statusMessage = authorizationRequired;
    res.status(401).json({ message: authorizationRequired });
  } else {
    try {
      const token = authHeader.split(" ")[1]; // Expecting 'Bearer <token>'
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // Attach user info (e.g., userId) to the request
      req.user = { id: decoded.userId };
      next();
    } catch (err) {
      res.statusMessage = invalidCredentials;
      res.status(403).json({ message: invalidCredentials });
    }
  }
};

export { auth };
