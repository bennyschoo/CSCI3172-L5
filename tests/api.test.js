import request from "supertest";
import { handler } from "../netlify/functions/api.js";

describe("Search Api", () => {
    it("should return artist data for an artist search", async () => {
        const res = await request(handler).get("/api/search_artist?name=beatles");
        expect(res.statusCode).toBe(200);
        expect(res.body.searchResults[0]).toHaveProperty("name");
    });
    it("should return an error for missing name", async () => {
        const res = await request(handler).get("/api/search_artist");
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Missing 'artistName' url param");
    });
});

describe("Recommend Artists API", () => {
    it("Should return a list of artists given an artist ID", async () => {
        const id = "3WrFJ7ztbogyGnTHbHJFl2"
        const res = await request(handler).get(`/api/artist_recommendation?id=${id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("recommendations");
    });
    it("should return an error for missing id", async () => {
        const res = await request(handler).get("/api/artist_recommendation");
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Missing 'id' url param");
    });
});

describe("Recommend Songs API", () => {
    it("should return song data given an artist ID", async () => {
        const id = "3WrFJ7ztbogyGnTHbHJFl2"
        const res = await request(handler).get(`/api/song_recommendation?id=${id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("recommendations");
    });
    it("should return an error for missing id", async () => {
        const res = await request(handler).get("/api/song_recommendation");
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Missing 'id' url param");
    });
});