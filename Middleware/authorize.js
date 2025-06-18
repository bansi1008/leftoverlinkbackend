const authorize = (...allowedroles) => {
  return (req, res, next) => {
    if (!req.user || !allowedroles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = authorize;
