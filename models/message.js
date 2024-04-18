const mongoose = require("mongoose")
const Schema = mongoose.Schema

const MessageSchema = new Schema({
  title: { type: String, required: true, minLength: 1 },
  description: { type: String, required: true, minLength: 1 },
  user: { type: Schema.Types.ObjectId, required: true, ref: "user" },
  postedDate: { type: Date },
})

MessageSchema.virtual("postedDateFormatted").get(function () {
  return this.postedDate.toLocaleString()
})

module.exports = mongoose.model("message", MessageSchema)
