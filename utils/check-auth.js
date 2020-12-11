const jwt = require("jsonwebtoken");

module.exports = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) throw new Error("Missing Authorization Header");

  const token = authHeader.split(" ").pop();

  if (!token) throw new Error("Authorization Header Must Contain Token");

  try {
    const player = jwt.verify(token, process.env.JWT_SECRET);
    return player;
  } catch (err) {
    throw new Error("Invalid/Expired Token");
  }
};
