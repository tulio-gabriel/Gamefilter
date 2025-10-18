import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
	title: { type: String, required: true },
	img: { type: String, required: true },
	desc: { type: String, required: true },
	genre:{ type: String, required: true},
	platform:{ type: String, required: true},
	player:{ type: String, required: true},
	features:{ type: String, required: true},
	saved:{type:Boolean, required:true, default:false} 
})

export const Game = mongoose.model("Game", gameSchema);