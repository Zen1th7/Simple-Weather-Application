// DOM Elements
const form = document.querySelector(".top-banner form");
const input = document.querySelector(".top-banner input");
const msg = document.querySelector(".top-banner .msg");
const list = document.querySelector(".ajax-section .cities");
const bookmarkList = document.querySelector("#bookmark-list");

// API Key - OpenWeatherMap
const apiKey = process.env.API_KEY; // Placeholder for local development

// State
let bookmarks = JSON.parse(localStorage.getItem('weatherBookmarks')) || [];

// Clock Functions
function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    
    timeElement.textContent = now.toLocaleTimeString();
    dateElement.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock(); // Initial call

// Bookmark Functions
function saveBookmarks() {
    localStorage.setItem('weatherBookmarks', JSON.stringify(bookmarks));
}

function addBookmark(cityData) {
    const bookmarkExists = bookmarks.some(bookmark => 
        bookmark.name.toLowerCase() === cityData.name.toLowerCase() && 
        bookmark.country === cityData.country
    );

    if (!bookmarkExists) {
        bookmarks.push({
            name: cityData.name,
            country: cityData.country
        });
        saveBookmarks();
        renderBookmarks();
    }
}

function removeBookmark(cityName, country) {
    bookmarks = bookmarks.filter(bookmark => 
        !(bookmark.name.toLowerCase() === cityName.toLowerCase() && 
          bookmark.country === country)
    );
    saveBookmarks();
    renderBookmarks();
}

function renderBookmarks() {
    bookmarkList.innerHTML = '';
    bookmarks.forEach(bookmark => {
        const li = document.createElement('li');
        li.classList.add('bookmark-item');
        li.innerHTML = `
            <span class="bookmark-name">${bookmark.name}, ${bookmark.country}</span>
            <div class="bookmark-actions">
                <button class="load-bookmark">Load</button>
                <button class="remove-bookmark">Remove</button>
            </div>
        `;

        li.querySelector('.load-bookmark').addEventListener('click', () => {
            fetchWeather(`${bookmark.name},${bookmark.country}`);
        });

        li.querySelector('.remove-bookmark').addEventListener('click', () => {
            removeBookmark(bookmark.name, bookmark.country);
        });

        bookmarkList.appendChild(li);
    });
}

// Weather Functions
async function fetchWeather(inputVal) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
            const { main, name, sys, weather } = data;
            const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;

            // Create weather card
            const li = document.createElement("li");
            li.classList.add("city");
            const markup = `
                <h2 class="city-name" data-name="${name},${sys.country}">
                    <span>${name}</span>
                    <sup>${sys.country}</sup>
                </h2>
                <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
                <figure>
                    <img class="city-icon" src="${icon}" alt="${weather[0]["description"]}">
                    <figcaption>${weather[0]["description"]}</figcaption>
                </figure>
                <button class="bookmark-btn">Bookmark</button>
            `;
            
            li.innerHTML = markup;

            // Check if the city already exists
            const cityNodes = list.querySelectorAll(".city");
            const cityArray = Array.from(cityNodes);
            const duplicateCity = cityArray.find(city => 
                city.querySelector(".city-name").dataset.name.toLowerCase() === 
                `${name},${sys.country}`.toLowerCase()
            );

            if (duplicateCity) {
                list.removeChild(duplicateCity);
            }

            // Add the new city card
            list.appendChild(li);

            // Add bookmark button functionality
            li.querySelector('.bookmark-btn').addEventListener('click', () => {
                addBookmark({ name, country: sys.country });
            });

            // Clear any error messages
            msg.textContent = "";
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        msg.textContent = "Please search for a valid city 😩";
    }
}

// Event Listeners
form.addEventListener("submit", e => {
    e.preventDefault();
    const inputVal = input.value.trim();

    if (inputVal) {
        fetchWeather(inputVal);
        form.reset();
        input.focus();
    }
});

// Initialize
renderBookmarks();