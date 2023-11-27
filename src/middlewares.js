export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "Mytube";
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user;
  console.log(req.session);
  next();
};
