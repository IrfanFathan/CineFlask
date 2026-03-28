/**
 * OpenSubtitles API Helper
 * Integrates with opensubtitles.com REST API
 */

const fs = require('fs');
const path = require('path');

// Dynamic import for node-fetch
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

const BASE_URL = 'https://api.opensubtitles.com/api/v1';

class OpenSubtitles {
  constructor() {
    this.apiKey = process.env.OPENSUBTITLES_API_KEY;
    this.username = process.env.OPENSUBTITLES_USERNAME;
    this.password = process.env.OPENSUBTITLES_PASSWORD;
    this.token = null;
    this.tokenExpiry = null;
  }

  isConfigured() {
    return !!(this.apiKey && this.username && this.password);
  }

  async authenticate() {
    if (!this.isConfigured()) return false;
    
    // Check if current token is still valid
    if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return true;
    }

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': this.apiKey,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      });

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`);
      }

      const data = await response.json();
      this.token = data.token;
      // Token usually valid for 24h, we set expiry to 23h
      this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
      return true;
    } catch (error) {
      console.error('OpenSubtitles auth error:', error.message);
      return false;
    }
  }

  async searchByImdbId(imdbId, languages = 'en') {
    if (!this.isConfigured()) {
      throw new Error('OpenSubtitles is not configured in .env');
    }

    // Clean IMDb ID (remove 'tt' prefix if exists for the API)
    const cleanId = imdbId.replace(/^tt/, '');

    try {
      const response = await fetch(`${BASE_URL}/subtitles?imdb_id=${cleanId}&languages=${languages}`, {
        headers: {
          'Api-Key': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('OpenSubtitles search error:', error.message);
      throw error;
    }
  }

  async getDownloadLink(fileId) {
    if (!await this.authenticate()) {
      throw new Error('Failed to authenticate with OpenSubtitles');
    }

    try {
      const response = await fetch(`${BASE_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': this.apiKey,
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          file_id: parseInt(fileId)
        })
      });

      if (!response.ok) {
        throw new Error(`Download request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.link; // The actual download URL
    } catch (error) {
      console.error('OpenSubtitles download error:', error.message);
      throw error;
    }
  }

  async downloadSubtitle(url, destinationPath) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);
      
      const buffer = await response.buffer();
      fs.writeFileSync(destinationPath, buffer);
      return true;
    } catch (error) {
      console.error('Download write error:', error.message);
      throw error;
    }
  }
}

module.exports = new OpenSubtitles();
