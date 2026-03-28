/**
 * Basic Integration Tests for CineFlask
 * Run with: node tests/basic.test.js
 */

const assert = require('assert');
const { execSync } = require('child_process');

console.log('🧪 Running CineFlask Basic Tests\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

// Test 1: Check required files exist
test('Required files exist', () => {
  const fs = require('fs');
  const required = [
    'server.js',
    'package.json',
    '.env.example',
    'database/init.js',
    'database/migrate.js',
    'helpers/metadata.js',
    'helpers/cache.js',
    'middleware/security.js',
    'middleware/rateLimiter.js',
    'middleware/validators.js',
    'Dockerfile',
    'docker-compose.yml'
  ];
  
  required.forEach(file => {
    assert(fs.existsSync(file), `${file} not found`);
  });
});

// Test 2: Check database schema
test('Database has language and country columns', () => {
  const Database = require('better-sqlite3');
  const db = new Database('./cinelocal.db');
  
  try {
    db.prepare('SELECT language, country FROM movies LIMIT 1').all();
    db.prepare('SELECT language, country FROM series LIMIT 1').all();
  } finally {
    db.close();
  }
});

// Test 3: Check metadata helper exports
test('Metadata helper exports required functions', () => {
  const metadata = require('../helpers/metadata');
  assert(typeof metadata.fetchMetadata === 'function');
  assert(typeof metadata.fetchMetadataByImdbId === 'function');
  assert(typeof metadata.cleanMovieTitle === 'function');
  assert(typeof metadata.extractYear === 'function');
});

// Test 4: Check cache helper
test('Cache helper exports required functions', () => {
  const cache = require('../helpers/cache');
  assert(cache.metadataCache, 'metadataCache not found');
  assert(cache.movieListCache, 'movieListCache not found');
  assert(typeof cache.generateKey === 'object');
  assert(typeof cache.getStats === 'function');
});

// Test 5: Check validators
test('Validators export required rules', () => {
  const validators = require('../middleware/validators');
  assert(Array.isArray(validators.register));
  assert(Array.isArray(validators.login));
  assert(Array.isArray(validators.movieMetadata));
  assert(Array.isArray(validators.movieFilters));
});

// Test 6: Validate package.json dependencies
test('Required npm packages are listed', () => {
  const pkg = require('../package.json');
  const required = [
    'express',
    'better-sqlite3',
    'bcrypt',
    'jsonwebtoken',
    'helmet',
    'express-rate-limit',
    'express-validator',
    'node-cache'
  ];
  
  required.forEach(dep => {
    assert(pkg.dependencies[dep], `${dep} not in dependencies`);
  });
});

// Test 7: Check .env.example has required variables
test('.env.example has required variables', () => {
  const fs = require('fs');
  const envExample = fs.readFileSync('.env.example', 'utf8');
  assert(envExample.includes('IMDB_API_KEY'), 'IMDB_API_KEY not in .env.example');
  assert(envExample.includes('JWT_SECRET'), 'JWT_SECRET not in .env.example');
});

// Test 8: Validate server.js syntax
test('server.js has valid syntax', () => {
  execSync('node -c server.js', { stdio: 'pipe' });
});

// Test 9: Check Docker files
test('Dockerfile is valid', () => {
  const fs = require('fs');
  const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
  assert(dockerfile.includes('FROM node'), 'Dockerfile missing FROM statement');
  assert(dockerfile.includes('EXPOSE 3000'), 'Dockerfile missing EXPOSE');
  assert(dockerfile.includes('CMD'), 'Dockerfile missing CMD');
});

test('docker-compose.yml is valid', () => {
  const fs = require('fs');
  const compose = fs.readFileSync('docker-compose.yml', 'utf8');
  assert(compose.includes('version:'), 'docker-compose.yml missing version');
  assert(compose.includes('services:'), 'docker-compose.yml missing services');
  assert(compose.includes('cineflask:'), 'docker-compose.yml missing cineflask service');
});

// Test 10: Check cleanMovieTitle function
test('cleanMovieTitle removes file extensions and quality tags', () => {
  const { cleanMovieTitle } = require('../helpers/metadata');
  
  assert.strictEqual(
    cleanMovieTitle('Movie.Name.2021.1080p.BluRay.x264.mp4'),
    'Movie Name 2021'
  );
  
  assert.strictEqual(
    cleanMovieTitle('Another_Movie_Name.720p.WEB-DL.mkv'),
    'Another Movie Name'
  );
});

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`Tests Passed: ${passed}`);
console.log(`Tests Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
