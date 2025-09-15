const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('./users');   // ✅ use "User" directly
const localStrategy = require('passport-local');
const upload = require('./multer'); // ✅ multer setup

// Passport Configuration
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStrategy(User.authenticate()));

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  const data = new User({
    username: req.body.username
  });

  User.register(data, req.body.password)
    .then(() => {
      passport.authenticate("local")(req, res, () => {
        res.redirect('/profile');
      });
    })
    .catch(err => {
      console.log(err);
      res.redirect('/register');
    });
});

router.get('/login', (req, res) => {
  res.render('login');  // ✅ needs login.ejs file
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: '/login',
  successRedirect: '/profile'
}));

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { user: req.user });
});
router.post('/fileupload', isLoggedIn, upload.single('image'), (req, res) => {
  // Handle the uploaded file here
  console.log(req.file);
  res.redirect('/profile');
});
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) console.log(err);
    res.redirect('/login');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
