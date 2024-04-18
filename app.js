require("dotenv").config()

const createError = require("http-errors")
const express = require("express")
const path = require("path")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const compression = require("compression")
const helmet = require("helmet")

const session = require("express-session")
const bcrypt = require("bcryptjs")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy

const User = require("./models/user")

// connect to mongodb
const mongoose = require("mongoose")
mongoose.set("strictQuery", false)
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on(
  "error",
  console.error.bind(console, "mongo connection error")
)

const indexRouter = require("./routes/index")

const app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// authentication setup
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
)
app.use(passport.session())

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username }).exec()
      if (!user) return done(null, false, { message: "Invalid Username" })
      if (!bcrypt.compare(password, user.password))
        return null, false, { message: "Invalid Password" }
      return done(null, user)
    } catch (err) {
      return done(err)
    }
  })
)

passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec()
    done(null, user)
  } catch (err) {
    done(err)
  }
})

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(compression())
app.use(helmet())
app.use(express.static(path.join(__dirname, "public")))

app.use("/", indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

module.exports = app
