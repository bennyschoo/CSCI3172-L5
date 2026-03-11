const searchForm = document.getElementById("artist-search-form");
const resultsContainer = document.getElementById("results-container");

async function getSearchResults(searchTerm){
    const reqUrl = `../api/search_artist?artistName=${searchTerm}`
    try{
        const res = await fetch(reqUrl, {
            method: "GET",
        });
        const spotifyResults = await res.json();
        return spotifyResults
    } catch (e){
        return e
    }
} 

function displayError(e, message="There was an error with the request."){
    console.log(e)
    resultsContainer.innerHTML = "";
    const messageElement = document.createElement("p");
    messageElement.className = "text-center large-font";
    messageElement.textContent = message
    resultsContainer.appendChild(messageElement);
}

function displayResults(results){
    resultsContainer.innerHTML = ""
    for(let result of results){
        const resultContainer = document.createElement("div");
        resultContainer.className = "result bg-light rounded d-flex flex-wrap justify-content-between text-dark m-4"

        const artistDetailsContainer = document.createElement("a");
        artistDetailsContainer.href = result.spotifyURL
        artistDetailsContainer.className = "link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover d-flex align-items-center"
        
        const artistImage = document.createElement("img");
        if(result.imageURL){
            artistImage.src = result.imageURL
        }
        else{
            artistImage.src = "./img/default-user.png"
        }
        artistImage.className = "result-image m-3"

        const artistName = document.createElement("p");
        artistName.className = "large-font"
        artistName.textContent = result.name;

        const buttonsSectionContainer = document.createElement("div");
        buttonsSectionContainer.className = "d-flex flex-column justify-content-center m-2";

        const buttonsTitle = document.createElement("p");
        buttonsTitle.className = "text-center text-nowrap p-0 m-0";
        buttonsTitle.textContent = "Get Recommendations";

        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "d-flex align-items-center justify-content-center"

        const artistButtonWrapper = document.createElement("a");
        const songButtonWrapper = document.createElement("a");
        artistButtonWrapper.href = `./recommendation.html?id=${result.id}&type=artist&name=${result.name}`
        songButtonWrapper.href = `./recommendation.html?id=${result.id}&type=song&name=${result.name}`

        const artistsButton = document.createElement("button");
        const songsButton = document.createElement("button");
        artistsButton.className = "btn btn-success m-2";
        songsButton.className = "btn btn-success m-2";
        artistsButton.textContent = "Artists"
        songsButton.textContent = "Songs"

        resultsContainer.appendChild(resultContainer);
        resultContainer.appendChild(artistDetailsContainer);
        resultContainer.appendChild(buttonsSectionContainer)

        artistDetailsContainer.appendChild(artistImage)
        artistDetailsContainer.appendChild(artistName)

        buttonsSectionContainer.appendChild(buttonsTitle)
        buttonsSectionContainer.appendChild(buttonsContainer)

        buttonsContainer.appendChild(artistButtonWrapper)
        buttonsContainer.appendChild(songButtonWrapper)

        artistButtonWrapper.appendChild(artistsButton);
        songButtonWrapper.appendChild(songsButton);
    }
}

searchForm.addEventListener("submit", async (event)=>{
    event.preventDefault();
    const searchTerm = document.getElementById("artist-search-field").value;
    const results = await getSearchResults(searchTerm);

    if(!results || results instanceof Error){
        displayError(results);
        return;
    }
    if(results.error == null){
        displayError("results.error is null")
        return
    }
    if(results.error!=""){
        displayError(results.error, results.error)
        return
    }

    displayResults(results.searchResults);
});