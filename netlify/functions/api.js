import express from "express";
import serverless from "serverless-http";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const api = express();
const router = express.Router();
const spotifyClientId = process.env.CLIENT_ID
const spotifySecret = process.env.SECRET_ID
async function getAccessToken(clientID, secret) {
    try{
        const res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body:f`grant_type=client_credentials&client_id=${spotifyClientId}&client_secret=${spotifySecret}`
        });
        const json = await res.json();
        console.log(json.accessToken)
        return json.token_type + " " + json.access_token
    }
    catch{
        return ""
    }
}

getAccessToken(spotifyClientId, spotifySecret);


router.get("/song_recommendation", async (req, res) => {
    const accessToken = await getAccessToken(spotifyClientId, spotifySecret)
    res.json({token: accessToken})
})

router.get("/artist_recommendation", async (req, res) => {
    const accessToken = await getAccessToken(spotifyClientId, spotifySecret)
    res.json({token: accessToken})
})

api.use("/api", router);
export const handler = serverless(api);