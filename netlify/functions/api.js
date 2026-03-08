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
const accessHeader = await getAccessTokenHeader(spotifyClientId, spotifySecret)

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

async function makeSpotifyRequest(reqUrl){
    const reqHeaders = {
        "Authorization": accessHeader
    }
    try{
        const res = await fetch(reqUrl, {
            method: "GET",
            headers: reqHeaders
        });
        const spotifyResults = await res.json();
        return spotifyResults
    } catch (e){
        return e
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

function getContributingArtistsID(tracks, currArtistID){
    const artists=[]
    for(let track of tracks){
        for(let artist of track.artists){
            if(artist.id != currArtistID){
                artists.push(artist.id);
            }
        }
    }
    return artists;
}

async function getArtistsData(artistIDs){
    const artistsData = []
    for(let artistID of artistIDs){
        const artistdata = await getArtist(artistID)
        if(artistdata instanceof Error){
            return artistdata
        }
        artistsData.push(artistdata)
    }
    return artistsData
}

async function getArtistsAlbums(id){
    const reqUrl = `https://api.spotify.com/v1/artists/${id}/albums?limit=10`
    const result = await makeSpotifyRequest(reqUrl)
    return result.items
}

async function getArtists(name){
    const reqUrl = `https://api.spotify.com/v1/search?q=artist:${name}&type=artist&limit=10`
    const result = await makeSpotifyRequest(reqUrl)
    return result
}

async function getAlbum(id){
    const reqUrl = `https://api.spotify.com/v1/albums/${id}`
    const result = await makeSpotifyRequest(reqUrl)
    return result
}

async function getArtist(id){
    const reqUrl = `https://api.spotify.com/v1/artists/${id}`
    const result = await makeSpotifyRequest(reqUrl)
    return result
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
        
        // return error if there was an issue with the url params
        if(!req.query.artistName){
            res.status(400).json({ error: "Missing 'artistName' url param"})
            return
        }

        // return error if there was an issue with the spotify access token
        if(!accessHeader){
            res.status(500).json({ error: "Internal Server Error: missing access token"})
            return
        }

        const artists = await getArtists(req.query.artistName)
        
        if(artists instanceof Error) {
            res.status(500).json({ error: `Internal Server Error: ${artists}`})
        }

        if(!artists){
            res.status(500).json({ error: "Internal Server Error"})
            return
        }

        try{
            const convertedResults = convertSpotifyArtistSearchResults(artists)
            res.writeHead(200, {
                "Content-Type":"text/json",
                "Cache-Control": "no-cache"
            })
            res.end(JSON.stringify(convertedResults))
        } catch (e){
            res.status(500).json({ error: `Internal Server Error: ${e}`})
            return
        }
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

        const id = req.query.id;
         
        // return error if there was an issue with the url params
        if(!id){
            res.status(400).json({ error: "Missing 'id' url param"})
            return
        }

        // return error if there was an issue with the spotify access token
        if(!accessHeader){
            res.status(500).json({ error: "Internal Server Error: missing access token"})
            return
        }
        
        const albums = await getArtistsAlbums(id);
        
        if(albums instanceof Error) {
            res.status(500).json({ error: `Internal Server Error: ${albums}`})
        }

        if(!albums){
            res.writeHead(200, {
                "Content-Type":"text/json",
                "Cache-Control": "no-cache"
             })
            res.end(JSON.stringify({
                recommendedArtists: albums,
                error: "Artist has no album data"
            }))
            return
        }

        const randIndex = Math.trunc(Math.random() * (albums.length))
        const randAlbumID = albums[randIndex].id
        const randAlbum = await getAlbum(randAlbumID)

        if(randAlbum instanceof Error) {
            res.status(500).json({ error: `Internal Server Error: ${randAlbum}`})
        }

        if(!randAlbum){
            res.status(500).json({ error: "Internal Server Error: Error in album retreival logic"})
            return
        }

        const contributingArtistIDs = getContributingArtistsID(randAlbum.tracks.items, id)

        if(!contributingArtistIDs){
            res.writeHead(200, {
                "Content-Type":"text/json",
                "Cache-Control": "no-cache"
             })
            res.end(JSON.stringify({
                recommendedArtists: contributingArtistIDs,
                error: "No related artists"
            }))
            return
        }

        // need to modify getArtistsData function to filter for only useful data
        const contributingArtists = await getArtistsData(contributingArtistIDs)

        if(contributingArtists instanceof Error) {
            res.status(500).json({ error: `Internal Server Error: ${contributingArtists}`})
        }

        res.writeHead(200, {
            "Content-Type":"text/json",
            "Cache-Control": "no-cache"
        })
        res.end(JSON.stringify(contributingArtists))
    }
)


api.use("/api", router);
export const handler = serverless(api);
api.listen(80, "localhost")