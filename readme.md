# ✨ A Constellation of Longing

A visualization that transforms New York City's Craigslist missed connections into a galaxy of fleeting moments and human encounters(at least that was the intention).

![A Constellation of Longing Screenshot](missed-galaxy-nyc.png)

-----
## Overview

A Constellation of Longing showcases small moments of connection in a simple, direct way. Each phrase offers a glimpse into someone's search for connection, appearing briefly before fading and being replaced by another longings.

-----
## Features

- **Dynamic Visualization**: Text fragments appear as "stars" in the night sky, each with its own random position, opacity, and lifetime
- Move your cursor near any phrase to reveal its full story
- **Self-Managing Lifecycle**: Each phrase manages its own lifetime, event handling, and cleanup
- As older phrases fade away, new ones appear to maintain a constant galaxy of connections

## 📦 How It Works

The visualization maintains a constant number of phrases (25 by default) on screen at any time:

1. When the page loads, it fetches missed connections data from the API
2. It selects random connections to display as phrases
3. Each phrase has a random lifetime between 15-25 seconds
4. When a phrase's lifetime expires, it fades out and is replaced by a new one
5. The system keeps track of which connections have been displayed
6. When all connections have been shown, it resets and starts a new cycle

## 🤔 Things to Work On and Think About

- Implement dynamic adjustments when screen size changes during app runtime.
- Fix glitch - opacity of phrases after being clicked.
- Better Content Filtering - how to filter out advertisements and focus on genuinely poetic longing
- Philosophical Consideration: The presence of "spammy" posts raises interesting questions about the nature of loneliness in digital spaces - are these also valid expressions of human connection-seeking behavior??
  
## 🌐 Data Source

**Missed Connections** section of [Craigslist NYC](https://newyork.craigslist.org/search/mis)
