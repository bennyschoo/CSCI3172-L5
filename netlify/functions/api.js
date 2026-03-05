import express from "express";
import serverless from "serverless-http";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const api = express();
const router = express.Router();

router.post("/song_recomendation", (req, res) => {

})

router.post("/artist_recomendation", (req, res) => {
    
})

api.use("/api", router);
export const handler = serverless(api);