const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('./users');   // ✅ User model
const localStrategy = require('passport-local');
const upload = require('./multer'); // ✅ multer setup

// Passport Configuration
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new localStrategy(User.authenticate()));

// Register
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

// Login
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: '/login',
  successRedirect: '/profile'
}));

// Profile
router.get('/profile', isLoggedIn, async (req, res) => {
  const user = await User.findOne({ username: req.session.passport.user });
  res.render('profile', { user });
});

// File Upload (Profile Picture)
router.post('/fileupload', isLoggedIn, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.session.passport.user });
    if (user) {
      user.profileImage = req.file.filename;
      await user.save();
    }
    res.redirect('/profile');
  } catch (err) {
    console.log(err);
    res.redirect('/profile');
  }
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) console.log(err);
    res.redirect('/login');
  });
});

// Auth Middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
