const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errors: ['User context missing']
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
        errors: ['You do not have permission to access this resource']
      });
    }

    return next();
  };
};

module.exports = authorizeRoles;
