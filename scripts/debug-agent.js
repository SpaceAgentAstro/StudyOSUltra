import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables manually since we don't want to depend on dotenv just for this script if possible, 
// strictly speaking we could use 'process.env' if run with 'node --env-file=.env' in newer node versions, 
// but let's be safe and parse it.
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
                    process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.error('Failed to load .env file', e);
    }
}

loadEnv();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1';
const VERBOSE = true;

function log(msg, type = 'info') {
    const timestamp = new Date().toISOString();
    const color = type === 'error' ? '\x1b[31m' : type === 'success' ? '\x1b[32m' : '\x1b[34m';
    const reset = '\x1b[0m';
    console.log(`${color}[${type.toUpperCase()}] ${timestamp}: ${msg}${reset}`);
}

async function queryOllama(prompt) {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false
            })
        });
        const data = await response.json();
        return data.response;
    } catch (error) {
        log(`Error querying Ollama: ${error.message}`, 'error');
        return null;
    }
}

let appProcess = null;
let isFixing = false;

function startApp() {
    if (appProcess) {
        log('Restarting application...', 'info');
        appProcess.kill();
    } else {
        log('Starting application...', 'info');
    }

    // We use 'npm run dev' to start the vite server
    appProcess = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        shell: true,
        env: { ...process.env, FORCE_COLOR: 'true' }
    });

    appProcess.stdout.on('data', (data) => {
        const output = data.toString();
        process.stdout.write(output); // Pass through output
        checkForErrors(output);
    });

    appProcess.stderr.on('data', (data) => {
        const output = data.toString();
        process.stderr.write(output); // Pass through output
        checkForErrors(output);
    });

    appProcess.on('close', (code) => {
        if (code !== 0 && code !== null) { // code is null if we killed it
            log(`Application process exited with code ${code}`, 'error');
        }
    });
}

function checkForErrors(output) {
    if (isFixing) return;

    // Simple heuristic to detect errors
    // Vite / Rollup errors usually look like [vite] Internal server error: ... or have partial stack traces
    const lowerOutput = output.toLowerCase();
    if (
        lowerOutput.includes('error:') ||
        lowerOutput.includes('exception:') ||
        output.includes('[vite] Internal server error') ||
        output.includes('Pre-transform error')
    ) {
        log('Detected error! Initiating fix sequence...', 'error');
        handleError(output);
    }
}

async function handleError(errorLog) {
    isFixing = true;

    // 1. Identify file causing the error
    // Regex covers common stack trace formats:
    // /path/to/file.tsx:10:5
    // at func (/path/to/file.tsx:10:5)
    // [vite] ... /path/to/file.tsx
    const fileMatch = errorLog.match(/(\/[a-zA-Z0-9_\-\.\/]+(?:\.tsx|\.ts|\.js|\.jsx|\.css)):(\d+)/)
        || errorLog.match(/(\/[a-zA-Z0-9_\-\.\/]+(?:\.tsx|\.ts|\.js|\.jsx|\.css))/);

    if (!fileMatch) {
        log('Could not identify file from error log. Retrying manual intervention or waiting for more logs.', 'error');
        isFixing = false;
        return;
    }

    const filePath = fileMatch[1];
    log(`Identified problematic file: ${filePath}`, 'info');

    if (!fs.existsSync(filePath)) {
        log(`File does not exist: ${filePath}. Ignoring.`, 'error');
        isFixing = false;
        return;
    }

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const prompt = `
        You are an expert debugger. The following error occurred in a React/Vite application:

        ERROR LOG:
        ${errorLog}

        FILE CONTENT (${filePath}):
        \`\`\`
        ${fileContent}
        \`\`\`

        Please fix the error in the file. 
        Return ONLY the full corrected content of the file. 
        Do not include any explanation, markdown formatting (like \`\`\`jsx), or comments identifying your changes unless necessary. 
        Just the raw code ready to be written to the file.
        `;

        log('Asking AI for a fix...', 'info');
        const fixedContent = await queryOllama(prompt);

        if (fixedContent) {
            // Clean up potentially wrapped markdown from "smart" LLMs
            let cleanContent = fixedContent.trim();
            if (cleanContent.startsWith('```')) {
                cleanContent = cleanContent.replace(/^```[a-z]*\n/, '').replace(/```$/, '');
            }

            if (cleanContent === fileContent.trim()) {
                log('AI suggested no changes. Skipping.', 'info');
            } else {
                log(`Applying fix to ${filePath}...`, 'success');
                fs.writeFileSync(filePath, cleanContent);
                log('Fix applied. Vite should hot-reload automatically.', 'success');
            }
        }
    } catch (e) {
        log(`Failed to process error: ${e.message}`, 'error');
    } finally {
        // Give it a moment to reload before listening for errors again
        setTimeout(() => {
            isFixing = false;
        }, 5000);
    }
}

// Start the loop
log(`Debug Agent Initialized. Monitoring for errors using ${OLLAMA_MODEL}...`, 'success');
startApp();
