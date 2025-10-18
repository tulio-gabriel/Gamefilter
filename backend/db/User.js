import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	admin:{ type: Boolean, required: true },
})

export const User = mongoose.model("User", userSchema);