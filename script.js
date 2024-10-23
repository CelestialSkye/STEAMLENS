document.getElementById('searchButton').addEventListener('click', async () => {
    const searchQuery = document.getElementById('searchInput').value;
    //const resultsDiv = document.getElementById('gameResults'); // i forgor why i kept this line

    history.replaceState(null, '', window.location.pathname);

    // Redirect to index.html with the search query as a URL parameter
    window.location.href = `index.html?search=${encodeURIComponent(searchQuery)}`;


    try {
        console.log(`Searching for: ${searchQuery}`); // Log the search query
        const response = await fetch(`http://localhost:3000/search?q=${searchQuery}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Search results:', data); // Log the results returned from the server

        // Clear previous results
        resultsDiv.innerHTML = '';

        // Check if there are results
        if (data.results && data.results.length > 0) {
            data.results.forEach(renderGame);
        } else {
            resultsDiv.innerHTML = '<p>No results found.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = '<p>Error fetching results.</p>';
    }
});

// Function to render a game
function renderGame(game) {
    const resultsDiv = document.getElementById('gameResults');
    const genreNames = game.genres.map(genre => genre.name).join(', ');

    const gameDiv = document.createElement('div');
    gameDiv.className = 'card';

    gameDiv.innerHTML = `
        <img src="${game.background_image}" alt="${game.name}" />
        <div class="overlay">
            <h2 class="gameName">${game.name}</h2>
            <p>Release Date: ${game.released || 'No Release Date is given to the game'}</p>
            <p>Rating: ${game.rating || 'No Rating is given to the game'}</p>
            <p>Genre: ${genreNames}</p>
        </div>
    `;


    // Add click event listener to fetch game details from RAWG API
    gameDiv.addEventListener('click', async () => {
        try {
            // Fetch game details
            const response = await fetch(`https://api.rawg.io/api/games/${game.id}?key=bb6548a777cb4af0945238e67619bfcd`);
            const detailedGameData = await response.json();

            // Fetch screenshots for the game
            const screenshotsResponse = await fetch(`https://api.rawg.io/api/games/${game.id}/screenshots?key=bb6548a777cb4af0945238e67619bfcd`);
            const screenshotsData = await screenshotsResponse.json();

            //trailers
            const trailersResponse = await fetch(`https://api.rawg.io/api/games/${game.id}/movies?key=bb6548a777cb4af0945238e67619bfcd`);
            const trailersData = await trailersResponse.json();

            //reddit post
            const redditResponse = await fetch(`https://api.rawg.io/api/games/${game.id}/reddit?key=bb6548a777cb4af0945238e67619bfcd`);
            const redditData = await redditResponse.json();


            // Console logs to inspect fetched data
            console.log('Detailed Game Data:', detailedGameData);
            console.log('Screenshots Data:', screenshotsData.results);
            console.log('Reddit Data:', redditData);

            // Store both detailed game data and screenshots data in local storage (SCREENSHOTS)
            localStorage.setItem('selectedGame', JSON.stringify(detailedGameData));
            localStorage.setItem('screenshots', JSON.stringify(screenshotsData.results || [])); // Store screenshots data

            // Store both detailed game data and screenshots data in local storage (TRAILERS)
            localStorage.setItem('selectedGame', JSON.stringify(detailedGameData));
            localStorage.setItem('trailers', JSON.stringify(trailersData.results || [])); // Store screenshots data

            // store reddit post url



            localStorage.setItem('redditPosts', JSON.stringify(redditData.results || []));

            // Redirect to game details page
            window.location.href = 'game-details.html';
        } catch (error) {
            console.error('Error fetching game details:', error);
        }
    });




    resultsDiv.appendChild(gameDiv);
}


// POPULAR GAMES SECTION
async function loadPopularGames() {
    const popularGamesResponse = await fetch(`https://api.rawg.io/api/games?key=bb6548a777cb4af0945238e67619bfcd&platforms=4&ordering=-added&page_size=9`);
    const popularGamesData = await popularGamesResponse.json();

    const popularGamesDiv = document.getElementById('popularGames'); // Assuming you have a div for popular games

    popularGamesData.results.forEach(game => {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'card';

        gameDiv.innerHTML = `
            <img src="${game.background_image}" alt="${game.name}" />
            <div class="overlay">
                <h2 class="gameName">${game.name}</h2>
            <p>Release Date: ${game.released || 'No Release Date is given to the game'}</p>
                <p>Rating: ${game.rating || 'No Rating given to the game'}</p>
            </div>
        `;

        // Add click event listener to store game data and redirect
        gameDiv.addEventListener('click', async () => {
            // Fetch detailed game data and store it in local storage
            const detailedGameResponse = await fetch(`https://api.rawg.io/api/games/${game.id}?key=bb6548a777cb4af0945238e67619bfcd`);
            const detailedGameData = await detailedGameResponse.json();

            // Fetch screenshots for the game
            const screenshotsResponse = await fetch(`https://api.rawg.io/api/games/${game.id}/screenshots?key=bb6548a777cb4af0945238e67619bfcd`);
            const screenshotsData = await screenshotsResponse.json();

            // Fetch trailers for the game
            const trailersResponse = await fetch(`https://api.rawg.io/api/games/${game.id}/movies?key=bb6548a777cb4af0945238e67619bfcd`);
            const trailersData = await trailersResponse.json();

            // Fetch Reddit posts for the game
            const redditResponse = await fetch(`https://api.rawg.io/api/games/${game.id}/reddit?key=bb6548a777cb4af0945238e67619bfcd`);
            const redditData = await redditResponse.json();

            // Store data in local storage
            localStorage.setItem('selectedGame', JSON.stringify(detailedGameData));
            localStorage.setItem('screenshots', JSON.stringify(screenshotsData.results || []));
            localStorage.setItem('trailers', JSON.stringify(trailersData.results || []));
            localStorage.setItem('redditPosts', JSON.stringify(redditData.results || []));

            // Redirect to game details page
            window.location.href = 'game-details.html';
        });

        // Append the gameDiv to the popularGamesDiv
        popularGamesDiv.appendChild(gameDiv);
    });
}

// Call the function to load popular games when the page is loaded
loadPopularGames();



//TRENDING GAMES SECTION
// Function to load newly released games
async function loadNewlyReleasedGames() {
    // Fetch newly released games (e.g., ordered by release date)
    const newlyReleasedGamesResponse = await fetch(`https://api.rawg.io/api/games?key=bb6548a777cb4af0945238e67619bfcd&ordering=-rating&page_size=6`);
    const newlyReleasedGamesData = await newlyReleasedGamesResponse.json();

    const newlyReleasedDiv = document.getElementById('newlyReleasedGames'); // Assuming you have a div for new releases

    newlyReleasedGamesData.results.forEach(game => {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'card';

        gameDiv.innerHTML = `
            <img src="${game.background_image}" alt="${game.name}" />
            <div class="overlay">
                <h2>${game.name}</h2>
            <p>Release Date: ${game.released || 'No Release Date is given to the game'}</p>
                <p>Rating: ${game.rating || 'No Rating given to the game'}</p>
            </div>
        `;


        // Add click event listener to store game data and redirect
        gameDiv.addEventListener('click', async () => {
            // Fetch detailed game data and store it in local storage
            const detailedGameResponse = await fetch(`https://api.rawg.io/api/games/${game.id}?key=bb6548a777cb4af0945238e67619bfcd`);
            const detailedGameData = await detailedGameResponse.json();

            // Fetch screenshots for the game
            const screenshotsResponse = await fetch(`https://api.rawg.io/api/games/${game.id}/screenshots?key=bb6548a777cb4af0945238e67619bfcd`);
            const screenshotsData = await screenshotsResponse.json();

            // Fetch trailers for the game
            const trailersResponse = await fetch(`https://api.rawg.io/api/games/${game.id}/movies?key=bb6548a777cb4af0945238e67619bfcd`);
            const trailersData = await trailersResponse.json();

            // Fetch Reddit posts for the game
            const redditResponse = await fetch(`https://api.rawg.io/api/games/${game.id}/reddit?key=bb6548a777cb4af0945238e67619bfcd`);
            const redditData = await redditResponse.json();

            // Store data in local storage
            localStorage.setItem('selectedGame', JSON.stringify(detailedGameData));
            localStorage.setItem('screenshots', JSON.stringify(screenshotsData.results || []));
            localStorage.setItem('trailers', JSON.stringify(trailersData.results || []));
            localStorage.setItem('redditPosts', JSON.stringify(redditData.results || []));

            // Redirect to game details page
            window.location.href = 'game-details.html';
        });

        // Append the gameDiv to the newlyReleasedDiv
        newlyReleasedDiv.appendChild(gameDiv);
    });
}

// Call the function to load newly released games when the page is loaded
loadNewlyReleasedGames();


//test

document.getElementById('searchButton').addEventListener('click', () => {
    const searchQuery = document.getElementById('searchInput').value;
    window.location.href = `index.html?search=${encodeURIComponent(searchQuery)}`;
});


window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    if (searchQuery) {
        const resultsDiv = document.getElementById('gameResults');

        try {
            console.log(`Searching for: ${searchQuery}`); // Log the search query
            const response = await fetch(`http://localhost:3000/search?q=${searchQuery}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Search results:', data); // Log the results returned from the server

            // Clear previous results
            resultsDiv.innerHTML = '';

            // Check if there are results
            if (data.results && data.results.length > 0) {
                data.results.forEach(renderGame);
            } else {
                resultsDiv.innerHTML = '<p>No results found.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = '<p>Error fetching results.</p>';
        }
    }
});


