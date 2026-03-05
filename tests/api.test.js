import request from "supertest";
import { handler } from "../netlify/functions/api.js";

describe("Weather API", () => {
    it("should return weather data for a valid city", async () => {
        const res = await request(handler).get("/api/weather?city=London");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("city");
    });
    it("should return an error for missing city", async () => {
        const res = await request(handler).get("/api/weather");
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("City is required");
    });
});