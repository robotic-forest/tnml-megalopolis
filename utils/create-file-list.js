import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates a JSON list of files in a directory and saves it to a JSON file
 * 
 * Usage: 
 *   node create-file-list.js <directory-path> <output-file>
 * 
 * Example:
 *   node create-file-list.js ../public/red_god ./red-god-files.json
 */

// Get command line arguments
const args = process.argv.slice(2);
const directoryPath = args[0];
const outputFile = args[1] || 'file-list.json';

// Validate input
if (!directoryPath) {
  console.error('Error: Please provide a directory path');
  console.log('Usage: node create-file-list.js <directory-path> [output-file]');
  process.exit(1);
}

// Function to list all files in a directory
function listFiles(dir) {
  try {
    // Check if path exists
    if (!fs.existsSync(dir)) {
      console.error(`Error: Directory "${dir}" does not exist`);
      process.exit(1);
    }
    
    // Get stats to check if it's a directory
    const stats = fs.statSync(dir);
    if (!stats.isDirectory()) {
      console.error(`Error: "${dir}" is not a directory`);
      process.exit(1);
    }
    
    // Read directory contents
    const files = fs.readdirSync(dir);
    
    // Filter out directories and include only files
    const fileList = files.filter(file => {
      const filePath = path.join(dir, file);
      return fs.statSync(filePath).isFile();
    });
    
    return fileList;
  } catch (error) {
    console.error('Error reading directory:', error);
    process.exit(1);
  }
}

// Main execution
try {
  // Get list of files
  const files = listFiles(directoryPath);
  
  // Create JSON data
  const jsonData = {
    directory: path.resolve(directoryPath),
    count: files.length,
    files: files
  };
  
  // Save to JSON file
  fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2));
  
  console.log(`✅ Successfully saved ${files.length} filenames to ${outputFile}`);
  console.log(`📁 Source directory: ${path.resolve(directoryPath)}`);
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
