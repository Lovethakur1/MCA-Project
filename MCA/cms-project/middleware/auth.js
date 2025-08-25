exports.requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/admin/login');
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.status(403).render('error', {
      title: 'Access Denied',
      error: 'You do not have permission to access this page'
    });
  }
  next();
};
