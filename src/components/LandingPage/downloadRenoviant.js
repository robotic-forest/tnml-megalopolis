#!/usr/bin/env node

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URL to fetch
const url = 'https://www.anthropic.com/';

// Output file path
const outputPath = path.join(__dirname, 'anthropic.html');

console.log(`Downloading HTML from ${url}...`);

// Make the HTTP request
https.get(url, (response) => {
  let data = '';

  // A chunk of data has been received
  response.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received
  response.on('end', () => {
    // Write the data to a file
    fs.writeFile(outputPath, data, (err) => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log(`HTML content successfully saved to ${outputPath}`);
      }
    });
  });
}).on('error', (err) => {
  console.error('Error downloading the page:', err.message);
});