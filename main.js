// ===== CONSTS =====
const API_URL =
  "https://jinnic.github.io/craigslist_scrape/data/craigslist_missed_connections.json";

// Number of phrases to show at once
const MAX_PHRASES = 25;

// How long phrases stay on screen (in milliseconds - 1000ms = 1 second)
const MIN_LIFETIME = 15000; // Minimum 15 seconds
const MAX_LIFETIME = 25000; // Maximum 25 seconds

// ===== VARIABLES =====
// All the connections(posts) loaded
let connections = [];

// Track which connections are currently shown
let activeConnections = new Set();

// Track all connections that have been displayed
let displayedConnectionsHistory = new Set();

// Mouse position
let mouseX = 0;
let mouseY = 0;

// ===== LOAD DATA & START GALAXY =====
// When the page loads, start everything
window.addEventListener("DOMContentLoaded", async () => {
  // Set up panels
  setupPanels();

  // Load all the data
  connections = await loadData();

  // If there is data, start the visualization if not show error msg
  if (connections && connections.length > 0) {
    startVisualization();
  } else {
    showError();
  }
});

// Set up panels and buttons and moush detection for detail panel
function setupPanels() {
  // Info panel setup
  const infoButton = document.querySelector(".info-button");
  const infoPanel = document.querySelector(".info-panel");
  const infoCloseButton = infoPanel.querySelector(".panel-close");

  // Show info panel when button is clicked
  infoButton.addEventListener("click", () => {
    infoPanel.classList.add("active");
  });

  // Hide info panel when close button is clicked
  infoCloseButton.addEventListener("click", () => {
    infoPanel.classList.remove("active");
  });

  // Detail panel setup
  const detailPanel = document.querySelector(".detail-panel");
  const detailCloseButton = detailPanel.querySelector(".panel-close");

  // Hide detail panel when close button is clicked
  detailCloseButton.addEventListener("click", () => {
    detailPanel.classList.remove("active");
    // Remove highlighting from any active phrases
    document.querySelectorAll(".phrase-active").forEach((phrase) => {
      phrase.classList.remove("phrase-active");
    });
  });

  // Setup global mouseout detection for auto-close of detail panel
  document.addEventListener("mouseout", (e) => {
    // If detail panel is active
    if (detailPanel.classList.contains("active")) {
      // Check if mouse is over panel or an active phrase
      const isOverPanel = detailPanel.matches(":hover");
      const isOverActivePhrase =
        document.querySelector(".phrase-active")?.matches(":hover") || false;

      if (!isOverPanel && !isOverActivePhrase) {
        // Neither is hovered, close after a short delay
        setTimeout(() => {
          // Check again in case the user moved the mouse back
          if (
            !detailPanel.matches(":hover") &&
            !document.querySelector(".phrase-active")?.matches(":hover")
          ) {
            detailPanel.classList.remove("active");
            document.querySelectorAll(".phrase-active").forEach((phrase) => {
              phrase.classList.remove("phrase-active");
            });
          }
        }, 100);
      }
    }
  });
}

// Load the data from the API
async function loadData() {
  try {
    // Fetch the data
    const response = await fetch(API_URL);
    const data = await response.json();
    // Successfully loaded data
    return data.data;
  } catch (error) {
    console.error("Error loading data:", error);
    return [];
  }
}

// Show error if data couldn't be loaded
function showError() {
  document.body.innerHTML =
    '<div style="color: white; text-align: center; margin-top: 100px;">' +
    "Could not load missed connections data. Please try again later." +
    "</div>";
}

// ===== INITIALIZATION =====
function startVisualization() {
  // Create the initial phrases
  createAllPhrases();

  // Set up mouse tracking
  window.addEventListener("mousemove", handleMouseMovement);

  // Show info panel on startup
  document.querySelector(".info-panel").classList.add("active");

  // Start phrase creation loop to maintain MAX_PHRASES
  startPhraseMaintenanceLoop();
}

// ===== PHRASE CREATION =====
// Create all initial phrases
function createAllPhrases() {
  // Clear any existing phrases
  //clearAllPhrases();

  // Choose random connections to display
  selectRandomConnections();

  // Create a phrase for each selected connection
  activeConnections.forEach((index) => {
    // Create the phrase
    createSelfManagedPhrase(connections[index], index);
  });
}

// [NOT USED] Clear all existing phrases - reset button
function clearAllPhrases() {
  // Remove all phrases from the page
  document.querySelectorAll(".phrase").forEach((element) => {
    // Each element has its own cleanup function stored as a property
    if (typeof element.cleanup === "function") {
      element.cleanup();
    }
    // Remove from DOM
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  // Reset our tracking variables
  activeConnections.clear();

  // Note: I am intentionally NOT clearing displayedConnectionsHistory here
  // as I want to track which connections have been displayed across multiple cycles
}

// Select which connections to display
function selectRandomConnections() {
  // Keep selecting random connections until we have enough
  while (activeConnections.size < Math.min(MAX_PHRASES, connections.length)) {
    // Pick a random connection
    const randomIndex = Math.floor(Math.random() * connections.length);

    // Using Set.add automatically handles duplicates
    activeConnections.add(randomIndex);
  }
}

// Create a self-managed phrase that handles its own lifetime and cleanup of event listeners.
function createSelfManagedPhrase(connection, index) {
  // Get a poetic fragment from the text
  const phrase = getPhrase(connection.post_text);

  // Create a new div element
  const element = document.createElement("div");
  element.className = "phrase";
  element.textContent = phrase;

  // Store data in the element
  element.dataset.id = connection.post_id;
  element.dataset.title = connection.title;
  element.dataset.index = index;

  // Position the phrase randomly on screen
  const x = Math.random() * (window.innerWidth - 200);
  const y = Math.random() * (window.innerHeight - 200) + 100;
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;

  // Store position and hover state
  element.dataset.x = x;
  element.dataset.y = y;
  element.dataset.isHovered = "false";

  // Calculate lifetime
  const lifetime = MIN_LIFETIME + Math.random() * (MAX_LIFETIME - MIN_LIFETIME);
  element.dataset.lifetime = lifetime;

  // Generate a random base opacity and store it (0.1 - 0.7)
  const baseOpacity = 0.1 + Math.random() * 0.6;
  element.dataset.baseOpacity = baseOpacity;

  // Start invisible
  element.style.opacity = 0;

  // Make sure elements can receive hover events by default
  element.style.pointerEvents = "auto";

  // Add to the page
  document.body.appendChild(element);

  // Fade in after a short delay
  setTimeout(() => {
    element.style.opacity = baseOpacity;
  }, 50);

  // Add to our history of displayed connections
  displayedConnectionsHistory.add(index);

  // Set up mouse event listeners
  const mouseEnterHandler = () => {
    if (element.dataset.isHovered === "false") {
      element.dataset.isHovered = "true";
      element.style.opacity = 1;
      element.style.cursor = "pointer";
    }
  };

  const mouseLeaveHandler = () => {
    if (
      element.dataset.isHovered === "true" &&
      !element.classList.contains("phrase-active")
    ) {
      element.dataset.isHovered = "false";
      element.style.cursor = "auto";
      element.style.opacity = element.dataset.baseOpacity;
    }
  };

  const clickHandler = () => {
    showDetailPanel(connection, element);
  };

  // Add event listeners
  element.addEventListener("mouseenter", mouseEnterHandler);
  element.addEventListener("mouseleave", mouseLeaveHandler);
  element.addEventListener("click", clickHandler);

  // Setup self-destruction timer
  const lifetimeTimer = setTimeout(() => {
    // Only fade out if not being interacted with
    if (
      element.dataset.isHovered === "false" &&
      !element.classList.contains("phrase-active")
    ) {
      fadeOutAndRemovePhrase(element);
    } else {
      // If being interacted with, check again in a short while
      const checkAgainTimer = setTimeout(() => {
        if (!element.classList.contains("phrase-active")) {
          fadeOutAndRemovePhrase(element);
        }
      }, 5000); // Check again after 5 seconds

      // Store this additional timer for cleanup
      element.checkAgainTimer = checkAgainTimer;
    }
  }, lifetime);

  // Store the cleanup function and timers directly on the element
  element.cleanup = function () {
    // Clear all timers
    if (this.fadeTimer) clearTimeout(this.fadeTimer);
    if (this.lifetimeTimer) clearTimeout(this.lifetimeTimer);
    if (this.checkAgainTimer) clearTimeout(this.checkAgainTimer);
    if (this.fadeRAF) cancelAnimationFrame(this.fadeRAF);

    // Remove all event listeners
    this.removeEventListener("mouseenter", mouseEnterHandler);
    this.removeEventListener("mouseleave", mouseLeaveHandler);
    this.removeEventListener("click", clickHandler);

    // Remove from active connections
    activeConnections.delete(parseInt(this.dataset.index));
  };

  // Store timers for cleanup
  element.lifetimeTimer = lifetimeTimer;

  // Check if we've displayed all connections
  checkAllPhrases();

  return element;
}

// Fade out and remove a phrase
function fadeOutAndRemovePhrase(element) {
  // Mark it as fading
  element.dataset.fading = "true";

  // Get the current opacity
  const startOpacity = parseFloat(element.style.opacity) || 0.5;
  const startTime = Date.now();
  const fadeDuration = 1000; // 1 second fade

  // Fade animation function using requestAnimationFrame
  function fade() {
    // Skip if being interacted with
    if (
      element.dataset.isHovered === "true" ||
      element.classList.contains("phrase-active")
    ) {
      element.fadeRAF = requestAnimationFrame(fade);
      return;
    }

    // Calculate fade progress
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / fadeDuration, 1);

    // Update opacity
    const newOpacity = startOpacity * (1 - progress);
    element.style.opacity = newOpacity;

    if (progress < 1) {
      // Continue fading
      element.fadeRAF = requestAnimationFrame(fade);
    } else {
      // Fading complete, remove the element

      // Run the cleanup function
      if (typeof element.cleanup === "function") {
        element.cleanup();
      }

      // Remove from DOM
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }

      // Create a new phrase to replace this one
      createNewPhrase();
    }
  }

  // Start the fade animation
  element.fadeRAF = requestAnimationFrame(fade);
}

// Create a new phrase to maintain the count
function createNewPhrase() {
  // Find a new connection to display
  // First, check if we have any connections that haven't been displayed yet
  const remainingConnections = new Set();
  for (let i = 0; i < connections.length; i++) {
    if (!displayedConnectionsHistory.has(i)) {
      remainingConnections.add(i);
    }
  }

  let newConnectionIndex;

  // If there are still connections we haven't shown yet, prioritize those
  if (remainingConnections.size > 0) {
    // Convert to array to select randomly
    const remainingArray = Array.from(remainingConnections);
    // Select a random connection from the remaining ones
    do {
      newConnectionIndex =
        remainingArray[Math.floor(Math.random() * remainingArray.length)];
    } while (activeConnections.has(newConnectionIndex));
  } else {
    // We've shown all connections at least once, just pick any non-active one
    do {
      newConnectionIndex = Math.floor(Math.random() * connections.length);
    } while (activeConnections.has(newConnectionIndex));
  }

  // Add new connection to tracking set
  activeConnections.add(newConnectionIndex);

  // Create new phrase
  createSelfManagedPhrase(connections[newConnectionIndex], newConnectionIndex);
}

// Start a loop to ensure we always have MAX_PHRASES
function startPhraseMaintenanceLoop() {
  // Check every few seconds if we need to add more phrases
  setInterval(() => {
    const currentPhraseCount = document.querySelectorAll(".phrase").length;

    // If we have fewer phrases than MAX_PHRASES, create more
    if (currentPhraseCount < MAX_PHRASES) {
      const phrasesToAdd = MAX_PHRASES - currentPhraseCount;

      for (let i = 0; i < phrasesToAdd; i++) {
        createNewPhrase();
      }
    }
  }, 5000); // Check every 5 seconds
}

// Extract a fragment from the text
function getPhrase(text) {
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  // Find sentences that might be poetic
  const poeticSentences = sentences.filter(
    (sentence) =>
      sentence.length > 20 && // Not too short
      sentence.length < 55 && // Not too long
      !sentence.includes("email") && // No emails
      !sentence.includes("http") && // No links
      !sentence.includes("(") && // No parentheses
      sentence.split(" ").length > 3 && // At least 5 words
      !/\d{3,}/.test(sentence) // No long numbers
  );

  // If no poetic sentences found, just use the start of the text and truncate
  if (poeticSentences.length === 0) {
    return text.substring(0, 50) + "...";
  }

  // Pick a random sentence from the poetic ones
  return poeticSentences[
    Math.floor(Math.random() * poeticSentences.length)
  ].trim();
}

// ===== MOUSE INTERACTION =====
// Handle mouse movement for star like cursor effect
function handleMouseMovement(e) {
  // Update global mouse position (used by some functions)
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Update cursor effect if it exists
  const cursor = document.querySelector(".cursor");
  if (cursor) {
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  }
}

// ===== DETAIL PANEL =====
// Show the detail panel for a phrase
function showDetailPanel(connection, element) {
  // Highlight the phrase
  element.classList.add("phrase-active");

  // Get the detail panel
  const detailPanel = document.querySelector(".detail-panel");

  // Update panel content
  fillDetailPanel(detailPanel, connection);

  // Position the panel
  positionDetailPanel(detailPanel, element);

  // Show the panel
  detailPanel.classList.add("active");

  // Remember which element is active
  detailPanel.dataset.activeElementId = element.dataset.id;
}

// Fill the detail panel with content
function fillDetailPanel(panel, connection) {
  panel.querySelector(".detail-title").textContent = connection.title;
  panel.querySelector(".detail-date").textContent = formatDate(
    connection.date_posted
  );
  panel.querySelector(".detail-location").textContent =
    connection.location || "New York"; // Defaults to NY since it's all from NYC Craigslist
  panel.querySelector(".detail-content").textContent = connection.post_text;
  panel.querySelector(".detail-link").href = connection.url;
  panel.querySelector(".detail-link").textContent = "View Original Post";
}

// *****Work in Progress
// Position the detail panel - make sure it is inside the screen: still working on it.
function positionDetailPanel(panel, element) {
  // Get position of the phrase
  const rect = element.getBoundingClientRect();

  // Panel dimensions
  const panelWidth = 350;
  const panelHeight = 300;

  // Try to position to the right of the phrase
  let left = rect.right + 20;

  // If that would put it off-screen, position to the left
  if (left + panelWidth > window.innerWidth) {
    left = rect.left - 20 - panelWidth;
  }

  // If still off-screen, center it
  if (left < 0) {
    left = Math.max(10, (window.innerWidth - panelWidth) / 2);
  }

  // Try to center vertically
  let top = rect.top - (panelHeight - rect.height) / 2;

  // Make sure it's on screen
  top = Math.max(10, top);
  top = Math.min(window.innerHeight - panelHeight - 10, top);

  // Set position
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

// Check if all phrases have been displayed
function checkAllPhrases() {
  // If we've displayed all connections at least once
  if (displayedConnectionsHistory.size >= connections.length) {
    // All connections have been displayed, starting a new cycle

    // Reset the history to start a new cycle
    displayedConnectionsHistory.clear();
  }
}

// ===== HELPER FUNCTIONS =====
// Format a date nicely
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
