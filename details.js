// Get the game data from local storage
const gameData = JSON.parse(localStorage.getItem('selectedGame'));
const screenshotsData = JSON.parse(localStorage.getItem('screenshots'));
const trailersData = JSON.parse(localStorage.getItem('trailers'));
const redditPostsData = JSON.parse(localStorage.getItem('redditPosts'));

if (gameData) {
    const detailsDiv = document.getElementById('game-details');
    const genreNames = gameData.genres.map(genre => genre.name).join(', ');

    // Generate individual spans for each tag
    const tagsHtml = gameData.tags.map(tag => `<span class="tag">${tag.name}</span>`).join('');

    // Fetch platforms for the game
    const platformsHtml = gameData.platforms.map(platform => `
        <li>${platform.platform.name}</li>
    `).join('');

    // Create screenshots HTML if available
    const screenshotsHtml = screenshotsData
        ? screenshotsData.map(screenshot => `
           <div class="zoomable-image">
            <img class="SCpicture" src="${screenshot.image}" alt="Screenshot" />
            </div>
        `).join('')
        : '<p>No screenshots available.</p>'; // Fallback if no screenshots

    // Create Trailers HTML if available
    const trailerHtml = trailersData && trailersData.length > 0
        ? (() => {
            const firstTrailer = trailersData[0];  // Get the first trailer
            const trailerUrl = firstTrailer.data.max || firstTrailer.data['480'];  // Use the best available resolution
            return `
    <video width="480" height="315" controls>
        <source src="${trailerUrl}" type="video/mp4">
        Your browser does not support the video tag.
    </video>
    `;
        })()  // Immediately invoke the function to return the HTML
        : '';

    // Generate the HTML for the game details
    detailsDiv.innerHTML = `
    <div id="game-details">
    <div class="left-column">
        <div class="gameHeader">
            <div class="gameName">
                ${gameData.name}
            </div>
            <div class="gameRating">
                <i class="fa-regular fa-star"></i> ${gameData.rating || 'No Rating is given to the game'}
            </div>
        </div>

        <img src="${gameData.background_image}" alt="${gameData.name}" />

        <div class="gameReleaseDate">
            Released: ${gameData.released}
        </div>

        <div class="genres">
            ${genreNames}
        </div>

        <div class="description"> 
            ${gameData.description_raw || 'No description available.'}
        </div>

        

        <div class="platforms">
            <h3>Platforms:</h3>
            <ul>${platformsHtml}</ul>
        </div>
    </div> <!-- Close left-column -->

    <div class="right-column"> <!-- Move right-column outside left-column -->
        <div id="screenshots">
            ${screenshotsHtml}
        </div>
        
        <div id="trailers">
            ${trailerHtml}
        </div>

        <div class="Playtime">
            <i class="fa-regular fa-clock"></i>
            Playtime: ${gameData.playtime ? `${gameData.playtime} hours` : 'No time available.'}
        </div>
       
        <div class="tags">
            ${tagsHtml} <!-- Inserting the dynamically generated tags HTML -->
        </div>

        <div class="metaScore">
            <img src="metascore.png" alt="Metacritic Logo" class="metaLogo" />
            ${gameData.metacritic || 'No Metacritic score available.'}
        </div>


    </div> <!-- Close right-column -->
</div> <!-- Close game-details -->

    `;

    // Now, target the reddit-posts div for rendering Reddit posts separately
    const redditPostsDiv = document.getElementById('reddit-posts');

    // Generate the HTML for Reddit posts
    const redditPostsHtml = redditPostsData && redditPostsData.length > 0
        ? redditPostsData.map(post => `
           <div class="reddit-post">
           
    <h4><a href="${post.url}" target="_blank">${post.name}</a></h4>

    <h3>${post.text}</h3>
    
    ${post.image ? `
        <div class="reddit-post-image-container" style="background-image: url('${post.image}')">
            <img class="reddit-post-image" src="${post.image}" alt="Reddit Post Image" />
        </div>` : ''}
    
    <p>Created on: ${new Date(post.created).toLocaleDateString()}</p>
    
    <!-- Make username_url clickable using post.username -->
    <p>By User: <a href="${post.username_url}" target="_blank">${post.username}</a></p>

    
</div>


        `).join('')
        : '<p>No Reddit posts found.</p>';

    // Insert the Reddit posts HTML into the #reddit-posts div
    redditPostsDiv.innerHTML = redditPostsHtml;

} else {
    // Handle the case where no game data is found
    document.getElementById('game-details').innerHTML = '<p>No game details found.</p>';
    document.getElementById('reddit-posts').innerHTML = '<p>No Reddit posts found.</p>';
}

//gallery-item 
function zoomUnzoomImage() {
    const image = this;
    const backdrop = document.querySelector('.image-backdrop');

    // If the image is already zoomed in, zoom it out
    if (image.classList.contains('zoomed')) {
        image.classList.remove('zoomed');
        backdrop.classList.remove('zoomed');

        // Reset the transform and allow scrolling
        image.style.transform = '';
        document.body.style.overflow = ''; // Enable scrolling

        // Set z-index back to 1000 to ensure it's always on top during zoom-out
        image.style.zIndex = '1000';

        // Add a listener to reset z-index after zoom-out animation finishes
        image.addEventListener('transitionend', function resetZIndex() {
            image.style.zIndex = ''; // Reset z-index after zoom-out animation
            image.removeEventListener('transitionend', resetZIndex); // Clean up event listener
        });

    } else {
        // Zoom in: Remove zoom from any other zoomed image first
        document.querySelectorAll('.zoomable-image.zoomed').forEach(img => {
            img.classList.remove('zoomed');
            img.style.transform = '';
        });
        backdrop.classList.remove('zoomed');

        // Add zoom-in to the selected image
        image.classList.add('zoomed');
        backdrop.classList.add('zoomed');

        // Disable scrolling while zoomed in
        document.body.style.overflow = 'hidden';

        // Ensure the zoomed image is always on top during the zoom-in and zoom-out process
        image.style.zIndex = '1000'; // Keep the zoomed-in image on top

        // Get the image coordinates and dimensions
        const rect = image.getBoundingClientRect();

        // Calculate the aspect ratio for the device and image
        const deviceRatio = window.innerHeight / window.innerWidth;
        const imageRatio = rect.height / rect.width;

        // Scale the image according to the device and image size
        const imageScale = deviceRatio > imageRatio ?
            window.innerWidth / rect.width :
            window.innerHeight / rect.height;

        // Calculate the image's center coordinates
        const imageX = rect.left + rect.width / 2;
        const imageY = rect.top + rect.height / 2;

        // Get the window center coordinates (device center)
        const bodyX = window.innerWidth / 2;
        const bodyY = window.innerHeight / 2;

        // Calculate the translation offsets based on the difference in the centers
        const xOffset = (bodyX - imageX) / imageScale - 0;  // Adjust this value to move left
        const yOffset = (bodyY - imageY) / imageScale + 0;  // Adjust this value to move down

        // Set the transform origin to the center of the image
        image.style.transformOrigin = 'center center';

        // Set the transform to scale and center the image, adding offsets
        image.style.transition = 'transform 0.8s ease-in-out';
        image.style.transform = `scale(${imageScale}) translate(${xOffset}px, ${yOffset}px)`;
    }
}

// Attach click event to all zoomable images
document.querySelectorAll('.zoomable-image').forEach(image => {
    image.addEventListener('click', zoomUnzoomImage);
});

// Optional: Close zoom on clicking backdrop (or use any other interaction)
document.querySelector('.image-backdrop').addEventListener('click', () => {
    document.querySelectorAll('.zoomable-image.zoomed').forEach(image => {
        image.classList.remove('zoomed');
        image.style.transform = '';
        image.style.zIndex = '1000'; // Ensure the image stays on top during zoom-out
    });
    document.querySelector('.image-backdrop').classList.remove('zoomed');
    document.body.style.overflow = ''; // Enable scrolling when closed
});
