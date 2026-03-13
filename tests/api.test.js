import request from "supertest";
import { api } from "../netlify/functions/api.mjs";

const timeout = 30000

describe("Search Api", () => {
    it("should return artist data for an artist search", async () => {
        const res = await request(api).get("/api/search_artist?name=jacksepticeye");
        expect(res.statusCode).toBe(200);
        expect(res.body.searchResults[0]).toHaveProperty("name");
    }, timeout);
    it("should return an empty list for missing name (No name entered in search bar)", async () => {
        const res = await request(api).get("/api/search_artist");
        expect(res.statusCode).toBe(200);
        expect(res.body.error).toBe("No Artist Results");
        expect(res.body.searchResults[0]).toBeUndefined()
    }, timeout);
});

describe("Recommend Artists API", () => {
    it("Should return a list of artists given an artist ID", async () => {
        const id = "5PeQ24Ru3fypcBborc8IeN"
        const res = await request(api).get(`/api/artist_recommendation?id=${id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("recommendations");
    }, timeout);
    it("should return an error for missing id", async () => {
        const res = await request(api).get("/api/artist_recommendation");
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Missing 'id' url param");
    }, timeout);
});

describe("Recommend Songs API", () => {
    it("should return song data given an artist ID", async () => {
        const id = "5PeQ24Ru3fypcBborc8IeN"
        const res = await request(api).get(`/api/song_recommendation?id=${id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("recommendations");
    }, timeout);
    it("should return an error for missing id", async () => {
        const res = await request(api).get("/api/song_recommendation");
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Missing 'id' url param");
    }, timeout);
});