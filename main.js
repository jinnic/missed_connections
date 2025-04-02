const API_URL =
  "https://jinnic.github.io/craigslist_scrape/data/craigslist_missed_connections.json";

async function fetchData() {
  try {
    console.log("Starting fetch...");
    const res = await fetch(API_URL);
    console.log("Fetch response:", res);
    const json = await res.json();
    console.log("Data loaded:", json.data);
    return json.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function renderPosts(posts) {
  const container = document.getElementById("posts-container");
  container.innerHTML = "";
  posts.forEach((post) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${post.title}</h3>
      <div class = "text-container">
        <p>
          <strong>${post.location || "Unknown Location"}</strong>
          — ${new Date(post.date_posted).toLocaleDateString()} 
        </p>
        <a href="${post.url}" target="_blank">post link</a>
        </div>
      <p>${post.post_text}</p>
      
    `;
    container.appendChild(div);
  });
}

function filterPosts(posts, keyword, location) {
  return posts.filter((post) => {
    const lowerKeyword = keyword.toLowerCase();
    return (
      (!keyword ||
        post.post_text.toLowerCase().includes(lowerKeyword) ||
        post.title.toLowerCase().includes(lowerKeyword)) &&
      (!location ||
        (post.location &&
          post.location.toLowerCase() === location.toLowerCase()))
    );
  });
}

function sortPosts(posts, sortBy) {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.date_posted);
    const dateB = new Date(b.date_posted);
    return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
  });
}

function updateCount(count) {
  document.getElementById(
    "results-count"
  ).textContent = `${count} result(s) found`;
}

function populateLocationFilter(posts) {
  const locationSelect = document.getElementById("locationFilter");
  // Get unique, non-empty, and non-null locations
  const locations = Array.from(
    new Set(
      posts.map((post) => post.location).filter((loc) => loc && loc !== "N/A")
    )
  ).sort();
  locations.forEach((loc) => {
    const option = document.createElement("option");
    option.value = loc;
    option.textContent = loc;
    locationSelect.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const posts = await fetchData();
  populateLocationFilter(posts);
  updateCount(posts.length);
  renderPosts(sortPosts(posts, "newest"));

  function updateView() {
    const keyword = document.getElementById("search").value;
    const location = document.getElementById("locationFilter").value;
    const sort = document.getElementById("sort").value;
    const filtered = filterPosts(posts, keyword, location);
    updateCount(filtered.length);
    renderPosts(sortPosts(filtered, sort));
  }

  document.getElementById("search").addEventListener("input", updateView);
  document
    .getElementById("locationFilter")
    .addEventListener("change", updateView);
  document.getElementById("sort").addEventListener("change", updateView);
});
