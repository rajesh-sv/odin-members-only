const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
  firstName: { type: String, required: true, maxLength: 100 },
  lastName: { type: String, required: true, maxLength: 100 },
  username: { type: String, required: true, maxLength: 100 },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["consumer", "poweruser", "admin"],
    default: "consumer",
  },
})

UserSchema.virtual("name").get(function () {
  return this.firstName + " " + this.lastName
})

module.exports = mongoose.model("user", UserSchema)
