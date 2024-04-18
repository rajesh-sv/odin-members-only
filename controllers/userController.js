require("dotenv").config({ path: "../.env" })

const { body, validationResult } = require("express-validator")
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const passport = require("passport")

const User = require("../models/user")

exports.logoutGet = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err)
    }
    res.redirect("/")
  })
}

exports.loginGet = (req, res, next) => res.render("login", { title: "Login" })

exports.loginPost = passport.authenticate("local", {
  failureRedirect: "/login",
  successRedirect: "/",
})

exports.signupGet = (req, res, next) =>
  res.render("signup", {
    title: "Sign Up",
    errors: undefined,
  })

exports.signupPost = [
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First Name is required"),
  body("lastName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last Name is required"),
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Username is required"),
  // .custom(async (username) => {
  //   const existingUser = await User.find({ username }).exec()
  //   if (existingUser != null) throw new Error("Username already in use")
  // }),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password is required"),
  body("confirmPassword")
    .custom((confirmPassword, { req }) => {
      return confirmPassword === req.body.password
    })
    .withMessage("Passwords do not match"),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render("signup", { title: "Sign Up", errors: errors.array() })
    } else {
      next()
    }
  },
  asyncHandler(async (req, res, next) => {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) return next(err)

      try {
        const user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          password: hashedPassword,
        })
        user.save()
        res.redirect("/login")
      } catch (err) {
        return next(err)
      }
    })
  }),
]

exports.upgradeRoleGet = (req, res, next) => {
  if (req.params.role !== "member" && req.params.role !== "admin") {
    res.redirect("/")
  } else {
    res.render("upgraderole", {
      title: `Become ${req.params.role}`,
      errors: undefined,
      role: req.params.role,
    })
  }
}

exports.upgradeRolePost = [
  body("secretkey").custom((secretkey, { req }) => {
    const role = req.params.role
    if (role === "member") {
      if (secretkey !== process.env.POWERUSER_KEY) throw new Error("Wrong Key")
      else return true
    } else if (role === "admin") {
      if (secretkey !== process.env.ADMIN_KEY) throw new Error("Wrong Key")
      else return true
    } else {
      res.redirect("/")
    }
  }),
  (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      next()
    } else {
      res.render("upgraderole", {
        title: `Become ${req.params.role}`,
        errors: errors.array(),
        role: req.params.role,
      })
    }
  },
  asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, {
      role: req.params.role === "member" ? "poweruser" : "admin",
    })
    res.redirect("/")
  }),
]
