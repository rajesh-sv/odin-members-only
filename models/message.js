const mongoose = require("mongoose")
const Schema = mongoose.Schema

const MessageSchema = new Schema({
  title: { type: String, required: true, minLength: 1 },
  body: { type: String, required: true, minLength: 1 },
  user: { type: Schema.Types.ObjectId, required: true },
  posted_date: { type: Date },
})

MessageSchema.virtual("posted_date_formatted").get(function () {
  return this.posted_date.toLocaleString()
})

module.exports = mongoose.model("message", MessageSchema)
