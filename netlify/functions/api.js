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
const MAX_REQUESTS_MESSAGE = "max requests has been reached"

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

const MAX_TOTAL_REQUESTS = 35
let currTotalReqs = 0
async function makeSpotifyRequest(reqUrl){
    if(currTotalReqs >= MAX_TOTAL_REQUESTS){
        throw new Error(MAX_REQUESTS_MESSAGE)
    }
    currTotalReqs++
    
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

function convertSpotifyArtistResults(results){
    const artists = []
    for(let result of results){
        let artist = {}
        try{
            artist.spotifyURL = result.external_urls.spotify
        } catch{
            artist.spotifyURL = null
        }
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

// Get the contributing artists from a list of albums given the current artist ID,
// and a set 
async function getContributingArtistsID(artistAlbums, currArtistID, artistsSet){
    const artists=[]
    for(let album of artistAlbums){
            const albumID = album.id
            const albumData = await getAlbum(albumID)
            if(albumData instanceof Error) {
                return albumData
            }
  
            for(let track of albumData.tracks.items){
                for(let artist of track.artists){
                    if(artist.id != currArtistID && !artistsSet.has(artist.id)){
                        artists.push(artist.id);
                        artistsSet.add(artist.id)
                    }
                }
            }
        }
    return artists;
}

// get the detailed artist data from a list of artist ids
async function getArtistsDataFromIDList(artistIDs){
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

async function getRandomSongsFromArtistAlbumsList(albums){
    const songs = []
    for(let album of albums){
        const albumData = await getAlbum(album.id)
        const tracks = albumData.tracks.items

        // Random number of tracks to select from album
        // Use a set to determine if the index was already used
        const numTracks = Math.min(Math.trunc(Math.random() * 3) + 1, tracks.length-1)
        const usedIndexes = new Set()
        for(let i=0; i<numTracks; i++){
            // Get randomIndex
            let randIndex
            do{
                randIndex = Math.trunc(Math.random() * tracks.length)
            } while (usedIndexes.has(randIndex))
            usedIndexes.add(randIndex)

            const track = tracks[randIndex]

            // extract the useful track data
            const extractedTrackData = {}
            extractedTrackData.name = track.name
            extractedTrackData.spotifyURL = track.external_urls.spotify
            extractedTrackData.id = track.id
            try{
                extractedTrackData.imageURL = albumData.images[0].url
            } catch {
                extractedTrackData.imageURL = null
            }
            songs.push(extractedTrackData)
        }
    }
    return songs
}

// Get artists albums from artist id
async function getArtistsAlbums(id){
    const reqUrl = `https://api.spotify.com/v1/artists/${id}/albums?limit=10`
    const result = await makeSpotifyRequest(reqUrl)
    return result
}

// search artists by name
async function getArtists(name){
    const reqUrl = `https://api.spotify.com/v1/search?q=artist:${name}&type=artist&limit=10`
    const result = await makeSpotifyRequest(reqUrl)
    return result
}

// get album data by id
// Use variables to limit requests so 
// we don't get blocked by server 
const MAX_ALBUM_REQS = 20
let currAlbumReqs = 0
async function getAlbum(id){
    if(currAlbumReqs >= MAX_ALBUM_REQS){
        throw new Error(MAX_REQUESTS_MESSAGE)
    }
    currAlbumReqs++
    const reqUrl = `https://api.spotify.com/v1/albums/${id}`
    const result = await makeSpotifyRequest(reqUrl)
    return result
}

// get artist data by id
// Use variables to limit requests so 
// we don't get blocked by server
const MAX_ARTIST_REQS = 20
let currArtistReqs = 0
async function getArtist(id){
    if(currArtistReqs >= MAX_ARTIST_REQS){
        throw new Error(MAX_REQUESTS_MESSAGE)
    }
    currArtistReqs++
    const reqUrl = `https://api.spotify.com/v1/artists/${id}`
    const result = await makeSpotifyRequest(reqUrl)
    return result
}

// get next album from url
// Use variables to limit requests so 
// we don't get blocked by server
const MAX_NEXT_ALBUM_REQS = 10
let currNextAlbumReqs = 0
async function getNextAlbum(url){
    if(currNextAlbumReqs >= MAX_NEXT_ALBUM_REQS){
        throw new Error(MAX_REQUESTS_MESSAGE)
    }
    currNextAlbumReqs++
    const result = await makeSpotifyRequest(url)
    return result;
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
            const convertedResults = convertSpotifyArtistResults(artists.artists.items)
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

// API endpoint for getting recommended songs
// The spotify song recommendation API is deprecated and can't be used
// because of this I am simply going to choose 1 random song from their 10 latest albums.
router.get("/song_recommendation", [
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

        // Each album response from spotify contains a url to get the next list of albums
        // This loop is used to continue searching the albums until atleast 20 songs are found.
        // i<10 so that I do not make too many requests to the spotify API and get blocked.
        let artistAlbumsRawData = await getArtistsAlbums(id)
        const allSongs = []
        while(true) {
            try{
                // Send error to client
                if(artistAlbumsRawData instanceof Error) {
                    res.status(500).json({ error: `Internal Server Error: ${artistAlbumsRawData}`})
                    return
                }

                const artistAlbums = artistAlbumsRawData.items;
                
                // Send OK response with empty list
                if(!artistAlbums || artistAlbums.length==0){
                    res.writeHead(200, {
                        "Content-Type":"text/json",
                        "Cache-Control": "no-cache"
                    })
                    res.end(JSON.stringify({
                        recommendedSongs: artistAlbums,
                        error: "Artist has no album data"
                    }))
                    return
                }

                const songs = await getRandomSongsFromArtistAlbumsList(artistAlbums)


                if(songs instanceof Error) {
                    res.status(500).json({ error: `Internal Server Error: ${songs}`})
                    return
                }

                allSongs.push(...songs)
                
                // If there are more albums and we have found less then 10 artists, continue search,
                // if not, break.
                if(artistAlbumsRawData.next){
                    artistAlbumsRawData = await getNextAlbum(artistAlbumsRawData.next)
                } else{
                    break;
                }
            } catch ({name, message}){
                // break if we've made too many spotify api requests
                // to avoid getting blocked
                if(message == MAX_REQUESTS_MESSAGE){
                    break;
                }
            }
        }

        
        res.writeHead(200, {
            "Content-Type":"text/json",
            "Cache-Control": "no-cache"
        })
        
        // If no other artists found on any albums 
        if(!allSongs || allSongs.length==0){
            res.end(JSON.stringify({
                recommendedSongs: allSongs,
                error: "No related songs"
            }))
            return
        }

        res.end(JSON.stringify({
            recommendedSongs: allSongs,
            error: ""
        }))
    }
)

// API endpoint for getting recommended artists
// The spotify "Related Artists" API is deprecated and no longer works.
// Because of this, I have to get artists that are featured on one  of their albums to recommend. 
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
        
        // Each album response from spotify contains a url to get the next list of albums
        // This loop is used to continue searching the albums until atleast 10 artists are found.
        // i<10 so that I do not make too many requests to the spotify API and get blocked.
        let artistAlbumsRawData = await getArtistsAlbums(id)
        const foundContributingArtistIDs = new Set()
        const totalContributingArtists = []
        while(true) {
            try{
                // Send error to client
                if(artistAlbumsRawData instanceof Error) {
                    res.status(500).json({ error: `Internal Server Error: ${artistAlbumsRawData}`})
                    return
                }

                const artistAlbums = artistAlbumsRawData.items;
                
                // Send OK response with empty list
                if(!artistAlbums || artistAlbums.length==0){
                    res.writeHead(200, {
                        "Content-Type":"text/json",
                        "Cache-Control": "no-cache"
                    })
                    res.end(JSON.stringify({
                        recommendedArtists: artistAlbums,
                        error: "Artist has no album data"
                    }))
                    return
                }

                // Get contributing artists from all albums in list
                const contributingArtistIDs = await getContributingArtistsID(artistAlbums, id, foundContributingArtistIDs)

                if(contributingArtistIDs instanceof Error) {
                    res.status(500).json({ error: `Internal Server Error: ${contributingArtistIDs}`})
                    return
                }

                const contributingArtists = await getArtistsDataFromIDList(contributingArtistIDs.slice(0,11))

                if(contributingArtists instanceof Error) {
                    res.status(500).json({ error: `Internal Server Error: ${contributingArtists}`})
                    return
                }

                totalContributingArtists.push(...convertSpotifyArtistResults(contributingArtists))
                
                // If there are more albums and we have found less then 10 artists, continue search,
                // if not, break.
                if(artistAlbumsRawData.next){
                    artistAlbumsRawData = await getNextAlbum(artistAlbumsRawData.next)
                } else{
                    break;
                }
            } catch({name, message}){
                // break if we've made too many spotify api requests
                // to avoid getting blocked
                if(message == MAX_REQUESTS_MESSAGE){
                    break;
                }
            }
        }
        
        res.writeHead(200, {
            "Content-Type":"text/json",
            "Cache-Control": "no-cache"
        })

        // If no other artists found on any albums 
        if(!totalContributingArtists || totalContributingArtists.length==0){
            res.end(JSON.stringify({
                recommendedArtists: totalContributingArtists,
                error: "No related artists"
            }))
            return
        }

        res.end(JSON.stringify({
            recommendedArtists: totalContributingArtists,
            error: ""
        }))
    }
)


api.use("/api", router);
export const handler = serverless(api);
api.listen(80, "localhost")