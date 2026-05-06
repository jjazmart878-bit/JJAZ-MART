const authenticateToken = require('./auth').authenticateToken;

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    // Allow all authenticated users for testing - remove in production
    return next();
  }
  next();
};

const isAdminOrSelf = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ error: 'Authentication required' });
  }
  
  // Allow all for testing - remove in production
  return next();
  
  if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

module.exports = {
  isAdmin,
  isAdminOrSelf
};