const {config} = require('dotenv');
const path = require('path');

config({ path: path.resolve('.env') });

console.log('GOOGLE_GENAI_API_KEY:', process.env.GOOGLE_GENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('API Key length:', process.env.GOOGLE_GENAI_API_KEY ? process.env.GOOGLE_GENAI_API_KEY.length : 0);
console.log('First 10 chars:', process.env.GOOGLE_GENAI_API_KEY ? process.env.GOOGLE_GENAI_API_KEY.substring(0, 10) : 'N/A');
console.log('Current directory:', process.cwd());
console.log('Env file path:', require('path').resolve('.env'));
