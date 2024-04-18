const express = require("express")
const router = express.Router()

const messageController = require("../controllers/messageController")
const userController = require("../controllers/userController")

function loggedIn(req, res, next) {
  if (req.user) next()
  else res.redirect("/login")
}

// GET home page
router.get("/", messageController.getMessages)

// GET message form
router.get("/message", [loggedIn].concat(messageController.messageCreateGet))

// POST message form
router.post("/message", [loggedIn].concat(messageController.messageCreatePost))

// GET delete message form
router.get(
  "/delete/message/:id",
  [loggedIn].concat(messageController.messageDeleteGet)
)

// POST delete message form
router.post(
  "/delete/message/:id",
  [loggedIn].concat(messageController.messageDeletePost)
)

// GET login form
router.get("/login", userController.loginGet)

// POST login form
router.post("/login", userController.loginPost)

// GET logout
router.get("/logout", userController.logoutGet)

// GET signup form
router.get("/signup", userController.signupGet)

// POST signup form
router.post("/signup", userController.signupPost)

// GET upgrade role form
router.get(
  "/upgraderole/:role",
  [loggedIn].concat(userController.upgradeRoleGet)
)

// POST upgrade role form
router.post(
  "/upgraderole/:role",
  [loggedIn].concat(userController.upgradeRolePost)
)

module.exports = router
