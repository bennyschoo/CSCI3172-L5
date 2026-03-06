import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

const html = fs.readFileSync(path.resolve(__dirname, "../frontend/index.html"), "utf8");

describe("Music Recomendation App UI ", () => {
    let dom, document;
    beforeEach(() => {
        dom = new JSDOM(html);
        document = dom.window.document;
    });
    it("Should have an artist search field to choose an artist you like", () => {
        const input = document.querySelector("#artist-search");
        expect(input).not.toBeNull();
    });
    it("Should have artist results from the search", () => {
        const input = document.querySelector("#artist-search");
        const form = document.querySelector('#artist-form')
        input.value = "beatles";
        form.submit();

        const result = document.querySelectorAll(".artist-result");
        expect(result).not.toBeNull();
        expect(result).toBeTruthy();
    });
    it("Should have a search button", () => {
        const input = document.querySelector("#artist-search-button");
        expect(result).not.toBeNull();
    });
});