import express from "express";
import serverless from "serverless-http";
import fetch from "node-fetch";
import dotenv from "dotenv";
import {query, validationResult} from "express-validator";

dotenv.config();

const api = express();
const router = express.Router();
const spotifyClientId = process.env.CLIENT_ID
const spotifySecret = process.env.SECRET_ID

// Get spotify access token
async function getAccessTokenHeader(clientID, secret) {
    try{
        const res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body:`grant_type=client_credentials&client_id=${clientID}&client_secret=${secret}`
        });
        const json = await res.json();
        if(!json.token_type || !json.access_token){
            return ""
        }
        return json.token_type + " " + json.access_token
    }
    catch{
        return ""
    }
}

function convertSpotifyArtistSearchResults(results){
    const artists = []
    for(let result of results.artists.items){
        let artist = {}
        artist.spotifyURL = result.external_urls.spotify
        artist.id = result.id
        try{
            artist.imageURL = result.images[0].url
        } catch{
            artist.imageURL = null
        }
        artist.name = result.name
        artists.push(artist)
    }
    return artists
}

function convertSpotifyRelatedArtistResults(results){
    const artists = []
    for(let result of results.artists){
        let artist = {}
        artist.spotifyURL = result.external_urls.spotify
        artist.id = result.id
        artist.followers = result.followers.total
        try{
            artist.imageURL = result.images[0].url
        } catch{
            artist.imageURL = null
        }
        artist.popularity
        artist.name = result.name
        artists.push(artist)
    }
    return artists
}

// API endpoint for searching up artists
router.get("/search_artist", [
    query("artistName").trim().escape(),
],  async (req, res) => {
        // return error if there was an issue with the validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return
        }

        let spotifyResults
        const accessHeader = await getAccessTokenHeader(spotifyClientId, spotifySecret)
        const artistName = req.query.artistName
        const searchType = "artist"
        const reqUrl = `https://api.spotify.com/v1/search?q=artist:${artistName}&type=${searchType}&limit=10`
        const reqHeaders = {
            "Authorization": accessHeader
        }

        // return error if there was an issue with the url params
        if(!artistName){
            res.status(400).json({ error: "Missing 'artistName' url param"})
            return
        }

        // return error if there was an issue with the spotify access token
        if(!accessHeader){
            res.status(500).json({ error: "Internal Server Error: missing access token"})
            return
        }

        try{
            const spotifyRes = await fetch(reqUrl, {
                method: "GET",
                headers: reqHeaders
            });
            spotifyResults = await spotifyRes.json();
        } catch (e){
            res.status(500).json({ error: `Internal Server Error: ${e}`})
            return
        }

        if(!spotifyResults){
            res.status(500).json({ error: "Internal Server Error"})
            return
        }

        try{
            const convertedResults = convertSpotifyArtistSearchResults(spotifyResults)
        } catch (e){
            res.status(500).json({ error: `Internal Server Error: ${e}`})
            return
        }

        res.writeHead(200, {
            "Content-Type":"text/json",
            "Cache-Control": "no-cache"
        })
        res.end(JSON.stringify(spotifyResults))
    }
)

router.get("/song_recommendation", async (req, res) => {
    const accessHeader = await getAccessTokenHeader(spotifyClientId, spotifySecret)
    res.writeHead(200, {
        "Content-Type":"text/json",
        "Cache-Control": "no-cache"
    })
    res.end(JSON.stringify({token: "NOPE!"}))
})

// API endpoint for getting recommended artists
router.get("/artist_recommendation", [
    query("id").trim().escape(),
],  async (req, res) => {
        // return error if there was an issue with the validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return
        }

        let spotifyResults
        const accessHeader = await getAccessTokenHeader(spotifyClientId, spotifySecret)
        const artistID = req.query.id
        const reqUrl = `https://api.spotify.com/v1/artists/${artistID}/related-artists`
        const reqHeaders = {
            "Authorization": accessHeader
        }

         // return error if there was an issue with the url params
        if(!artistID){
            res.status(400).json({ error: "Missing 'id' url param"})
            return
        }

        // return error if there was an issue with the spotify access token
        if(!accessHeader){
            res.status(500).json({ error: "Internal Server Error: missing access token"})
            return
        }

        try{
            const spotifyRes = await fetch(reqUrl, {
                method: "GET",
                headers: reqHeaders
            });
            spotifyResults = await spotifyRes.json();
        } catch (e){
            res.status(500).json({ error: `Internal Server Error: ${e}`})
            return
        }

        if(!spotifyResults){
            res.status(500).json({ error: "Internal Server Error"})
            return
        }

        // try{
        //     const convertedResults = convertSpotifyRelatedArtistResults(spotifyResults)
        // } catch (e){
        //     res.status(500).json({ error: `Internal Server Error: ${e}`})
        //     return
        // }

        res.writeHead(200, {
            "Content-Type":"text/json",
            "Cache-Control": "no-cache"
        })
        res.end(JSON.stringify(spotifyResults))
    }
)


api.use("/api", router);
export const handler = serverless(api);
api.listen(80, "localhost")