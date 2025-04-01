async function fetchData() {
  const res = await fetch(
    "https://jinnic.github.io/craigslist_scrape/data/craigslist_missed_connections.json"
  );
  const json = await res.json();
  console.log("data", json.data);
  return json.data;
}

function renderPosts(posts) {
  const container = document.getElementById("posts-container");
  container.innerHTML = "";

  posts.forEach((post) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <h3>${post.title}</h3>
        <p><strong>${post.location}</strong> - ${new Date(
      post.date_posted
    ).toLocaleDateString()}</p>
        <p>${post.post_text}</p>
        <a href="${post.url}" target="_blank">View original post</a>
      `;
    container.appendChild(div);
  });
}

function filterPosts(posts, keyword, location) {
  return posts.filter(
    (post) =>
      (!keyword ||
        post.post_text.toLowerCase().includes(keyword.toLowerCase()) ||
        post.title.toLowerCase().includes(keyword.toLowerCase())) &&
      (!location || post.location === location)
  );
}

function populateLocationFilter(posts) {
  console.log(posts);
  const locationSelect = document.getElementById("locationFilter");
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
  renderPosts(posts);

  document.getElementById("search").addEventListener("input", () => {
    const keyword = document.getElementById("search").value;
    const location = document.getElementById("locationFilter").value;
    renderPosts(filterPosts(posts, keyword, location));
  });

  document.getElementById("locationFilter").addEventListener("change", () => {
    const keyword = document.getElementById("search").value;
    const location = document.getElementById("locationFilter").value;
    renderPosts(filterPosts(posts, keyword, location));
  });
});
