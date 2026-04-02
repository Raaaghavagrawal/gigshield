import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssPath = path.join(__dirname, 'index.css');
let cssStr = fs.readFileSync(cssPath, 'utf8');

// Replace standard solid colors
cssStr = cssStr.replace(/#0a2a20/g, 'rgba(15, 23, 42, 0.4)'); // Dark green bg -> Glass Slate bg
cssStr = cssStr.replace(/#10b981/g, '#6366f1'); // Emerald 500 -> Indigo 500
cssStr = cssStr.replace(/#065f46/g, '#4f46e5'); // Emerald 800 -> Indigo 600
cssStr = cssStr.replace(/#059669/g, '#4f46e5'); // Emerald 600 -> Indigo 600
cssStr = cssStr.replace(/#34d399/g, '#818cf8'); // Emerald 400 -> Indigo 400

cssStr = cssStr.replace(/rgba\(16,\s*185,\s*129,/g, 'rgba(99, 102, 241,');

// Replace text colors based on green
cssStr = cssStr.replace(/rgba\(167,\s*243,\s*208,/g, 'rgba(199, 210, 254,'); // Emerald 200 text -> Indigo 200 text

// Fix any mismatched Auth Background class
cssStr = cssStr.replace(/\.auth-left \{[\s\S]*?background:\s*rgba\(15,\s*23,\s*42,\s*0\.4\);/g, '.auth-left {\n  background: rgba(15, 23, 42, 0.4);\n  backdrop-filter: blur(16px);');

fs.writeFileSync(cssPath, cssStr, 'utf8');
console.log('CSS Theme Successfully Updated');
