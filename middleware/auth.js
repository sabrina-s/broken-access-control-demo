const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    req.user = jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).end("Access denied.");
  }
}
