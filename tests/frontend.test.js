import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

const searchHtml = fs.readFileSync("./frontend/index.html", "utf8");
const recommendationHtml = fs.readFileSync("./frontend/recommendation.html", "utf8");

describe("Search UI ", () => {
    let searchDOM, searchDoc;
    beforeEach(() => {
        searchDOM = new JSDOM(searchHtml);
        searchDoc = searchDOM.window.document;
    });
    it("Should have an artist search field to choose an artist you like", () => {
        const input = searchDoc.querySelector("#artist-search-field");
        expect(input).not.toBeNull();
    });
    it("Should have artist results container to store results", () => {
        const result = searchDoc.querySelector("#results-container");
        expect(result).not.toBeNull();
    });
    it("Should have a search button", () => {
        const input = searchDoc.querySelector(".btn");
        expect(input).not.toBeNull();
    });
    it("Should have a descriptive title", () => {
        const result = searchDoc.querySelector("h1");
        expect(result).not.toBeNull();
    })
});

describe("Recomendation UI", () => {
    let recommendationDOM, recommendationDoc;
    beforeEach(() => {
        recommendationDOM = new JSDOM(recommendationHtml);
        recommendationDoc = recommendationDOM.window.document;
    });
    it("Should have a container for the recommendation results", () => {
        const result = recommendationDoc.querySelector("#results-container");
        expect(result).not.toBeNull();
    });
    it("Should have a title that can be edited based on if it is a song or artist recommendation", () => {
        const result = recommendationDoc.querySelector("#recommendation-text");
        expect(result).not.toBeNull();
    });
    it("Should have a message that indicates the results are loading", () => {
        const result = recommendationDoc.querySelector("#loading-text");
        expect(result).not.toBeNull();
    });
});