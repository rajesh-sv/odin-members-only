const { body, validationResult } = require("express-validator")
const asyncHandler = require("express-async-handler")

const Message = require("../models/message")

exports.getMessages = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({})
    .populate("user")
    .sort({ postedDate: -1 })
    .exec()
  console.log(messages)
  res.render("index", {
    title: "Galactic Messages",
    user: req.user,
    messages,
  })
})

exports.messageCreateGet = (req, res, next) =>
  res.render("message", {
    title: "Create Message",
  })

exports.messageCreatePost = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Title must be specified"),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Description must be specified"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const message = new Message({
        title: req.body.title,
        description: req.body.description,
        postedDate: new Date(),
        user: req.user,
      })
      await message.save()
      res.redirect("/")
    } else {
      res.redirect("/message")
    }
  }),
]

exports.messageDeleteGet = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id).populate("user").exec()

  if (message == null) res.redirect("/")
  else
    res.render("deleteMessage", {
      title: "Delete Message",
      message,
    })
})

exports.messageDeletePost = asyncHandler(async (req, res, next) => {
  await Message.findByIdAndDelete(req.params.id).exec()
  res.redirect("/")
})
