import request from "supertest";
import { handler } from "../netlify/functions/api.js";

describe("Search Api", () => {
    it("should return artist data for an artist search", async () => {
        const res = await request(handler).get("/api/search_artist?name=beatles");
        expect(res.statusCode).toBe(200);
        expect(res.body[0]).toHaveProperty("name");
    });
    it("should return an error for missing name", async () => {
        const res = await request(handler).get("/api/search_artist");
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Missing 'artistName' url param");
    });
});