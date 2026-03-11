const searchForm = document.getElementById("artist-search-form");
const resultsContainer = document.getElementById("results-container");

async function getResults(reqUrl){
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

function setPageTitle(text){
    const pageTitle = document.getElementById("recommendation-text")
    pageTitle.textContent = text;
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
        const resultContainer = document.createElement("a");
        resultContainer.href = result.spotifyURL
        resultContainer.className = "result bg-light rounded link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover d-flex align-items-center my-3"
        
        const image = document.createElement("img");
        if(result.imageURL){
            image.src = result.imageURL
        }
        else{
            image.src = "./img/default-user.png"
        }
        image.className = "result-image ms-3 me-3"

        const name = document.createElement("p");
        name.className = "large-font"
        name.textContent = result.name;

        resultsContainer.appendChild(resultContainer);
        resultContainer.appendChild(image)
        resultContainer.appendChild(name)
    }
}

document.getElementById("back-button").addEventListener("click", (e)=>{
    e.preventDefault;
    if(history.length<=2){
        window.location.href = "./index.html"
    } else {
        history.back()
    }
})

async function main(){
    const qs = window.location.search;
    const urlParams = new URLSearchParams(qs);
    const id = urlParams.get("id")
    const type= urlParams.get("type")
    const artistName= urlParams.get("name")

    if(!id){
        displayError("id missing from url");
        
    }
    if(!type){
        displayError("type missing from url")
        
    }
    if(!artistName){
        displayError("name missing from url")
    }

    if(id && type && artistName){
        let results;
        switch(type){
            case "song":
                setPageTitle(`Song Recommendations for ${artistName}`)
                results = await getResults(`../api/song_recommendation?id=${id}`)
                break;
            case "artist":
                setPageTitle(`Artist Recommendations for ${artistName}`)
                results = await getResults(`../api/artist_recommendation?id=${id}`)
                break;
        }
        
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

        displayResults(results.recommendations);
    }
}

main()