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
    console.log(clientID, secret)
    try{
        const res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body:`grant_type=client_credentials&client_id=${clientID}&client_secret=${secret}`
        });
        const json = await res.json();
        console.log(json)
        return json.token_type + " " + json.access_token
    }
    catch{
        return ""
    }
}

router.get("/song_recommendation", async (req, res) => {
    const accessToken = await getAccessToken(spotifyClientId, spotifySecret)
    res.writeHead(200, {
        "Content-Type":"text/json",
        "Cache-Control": "no-cache"
    })
    res.end(JSON.stringify({token: accessToken}))
})

router.get("/artist_recommendation", async (req, res) => {
    const accessToken = await getAccessToken(spotifyClientId, spotifySecret)

})

api.use("/api", router);
export const handler = serverless(api);
