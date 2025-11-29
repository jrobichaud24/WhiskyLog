---
description: How to set up Google Custom Search API for image search
---

# Setting up Google Custom Search API

To enable image search functionality, you need two things: a **Google API Key** and a **Search Engine ID** (CX).

## Step 1: Get a Google API Key

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., "WhiskyLog Image Search") or select an existing one.
3.  Navigate to **APIs & Services** > **Credentials**.
4.  Click **Create Credentials** and select **API Key**.
5.  Copy the generated API Key. This is your `GOOGLE_API_KEY`.
6.  **Important**: Restrict the key to "Custom Search API" to prevent unauthorized use.

## Step 2: Enable the Custom Search API

1.  In the Google Cloud Console, go to **APIs & Services** > **Library**.
2.  Search for "Custom Search API".
3.  Click **Enable**.

## Step 3: Create a Programmable Search Engine

1.  Go to [Programmable Search Engine Control Panel](https://programmablesearchengine.google.com/controlpanel/all).
2.  Click **Add**.
3.  **Name**: Enter a name (e.g., "Whisky Search").
4.  **What to search**: Select "Search the entire web".
5.  **Image Search**: Turn **ON** "Image search".
6.  Click **Create**.
7.  On the next screen (or in the "Overview" page), look for **Search engine ID**.
8.  Copy this ID. This is your `GOOGLE_CX`.

## Step 4: Configure Environment Variables

Add these keys to your `.env` file (or Render environment variables):

```env
GOOGLE_API_KEY=your_api_key_here
GOOGLE_CX=your_search_engine_id_here
```
