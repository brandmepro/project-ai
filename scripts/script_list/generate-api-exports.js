#!/usr/bin/env node
import { readdirSync, statSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UI_CLIENTS_PATH = join(__dirname, '../../packages/api-client/ui-clients');

// Get all folders in ui-clients directory
function getFolders(path) {
  try {
    return readdirSync(path).filter(item => {
      const fullPath = join(path, item);
      return statSync(fullPath).isDirectory();
    });
  } catch (error) {
    console.error(`Error reading directory ${path}:`, error);
    return [];
  }
}

// Generate the index.ts content
function generateIndexContent() {
  const folders = getFolders(UI_CLIENTS_PATH);
  
  // Filter out node_modules and other non-api folders
  const apiFolders = folders.filter(folder => 
    !['node_modules', 'dist', '.git'].includes(folder) && 
    !folder.startsWith('.')
  );

  let content = `/**
 * @businesspro/api-client
 * 
 * Business Pro API Client with auto-generated React Query hooks
 * 
 * Auto-generated exports - DO NOT EDIT MANUALLY
 * Run: bun run generate:ui-client to regenerate
 */

// Export axios instance and utilities
export {
  API_INSTANCE,
  customAxiosInstance,
  ApiError,
  transformDates,
  clearPendingRequests,
  isRequestPending,
  getPendingRequestsCount,
} from './axios-instance';

// Auto-generated exports from API endpoints
`;

  apiFolders.forEach(folder => {
    // Check if folder has .ts files
    const folderPath = join(UI_CLIENTS_PATH, folder);
    const files = readdirSync(folderPath).filter(f => f.endsWith('.ts'));
    
    if (files.length > 0) {
      // Check if there's an index.ts
      if (files.includes('index.ts')) {
        content += `export * from './${folder}';\n`;
      } else {
        // Export from the main file (usually matches folder name)
        const mainFile = files.find(f => f === `${folder}.ts`);
        if (mainFile) {
          content += `export * from './${folder}/${folder}';\n`;
        }
      }
    }
  });

  return content;
}

// Main execution
try {
  console.log('🔄 Generating API client exports...');
  
  if (!existsSync(UI_CLIENTS_PATH)) {
    console.error('❌ ui-clients directory not found!');
    process.exit(1);
  }

  const indexContent = generateIndexContent();
  const indexPath = join(UI_CLIENTS_PATH, 'index.ts');
  
  writeFileSync(indexPath, indexContent, 'utf-8');
  
  console.log('✅ Successfully generated exports in ui-clients/index.ts');
  console.log('📦 All API endpoints are now exported automatically!');
} catch (error) {
  console.error('❌ Error generating exports:', error);
  process.exit(1);
}
