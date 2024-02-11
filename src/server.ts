// src/server.ts
import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import OpenAI from "openai";
import basicAuth from 'basic-auth';

const app = express();

const BASIC_AUTH_USER = process.env['BASIC_AUTH_USER'] || 'admin';
const BASIC_AUTH_PASSWORD = process.env['BASIC_AUTH_PASSWORD'] || 'admin';
const PORT = process.env['PORT'] || 8080;
const OPENAI_API_KEY = process.env['OPENAI_API_KEY'];

console.log('BASIC_AUTH_USER:', BASIC_AUTH_USER);
console.log('BASIC_AUTH_PASSWORD:', BASIC_AUTH_PASSWORD);
console.log('PORT:', PORT);
console.log('OPENAI_API_KEY:', OPENAI_API_KEY);

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// Express middleware to authenticate the user
const authMiddleware = (req: any, res: any, next: any) => {
    const user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.status(401).send('Authentication required.');
    }

    if (user.name === BASIC_AUTH_USER && user.pass === BASIC_AUTH_PASSWORD) { // 예시로 사용된 하드코딩된 값
        next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.status(401).send('Access denied');
    }
};

// Use the middleware
app.use(authMiddleware);

// WebSocket server with basic authentication
const verifyClient = (info: any, done: any) => {
    const user = basicAuth.parse(info.req.headers['authorization']);

    if (!user || user.name !== BASIC_AUTH_USER || user.pass !== BASIC_AUTH_PASSWORD) {
        done(false, 401, 'Unauthorized');
    } else {
        done(true, 200, 'Authorized');
    }
};

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, verifyClient });

app.use(express.static('public'));

// WebSocket server
wss.on('connection', ws => {
    ws.on('message', async (message) => {
        console.log('Received:', message);

        try {
            const stream = await openai.chat.completions.create({
                messages:
                    [
                        { role: 'system', content: "You are a helpful assistant. Focuses answers, without summarizing the questions, outputs in Markdown" },
                        { role: 'user', content: message.toString() }
                    ],
                model: 'gpt-3.5-turbo',
                stream: true
            });

            for await (const chunk of stream) {
                ws.send(JSON.stringify({ role: 'ai', content: chunk.choices[0]?.delta?.content || '', "fin": false }));
            }

            ws.send(JSON.stringify({ role: 'ai', content: '', "fin": true }));
            console.log('Completed')
        } catch (error) {
            console.error('Error:', error);
            ws.send('Error processing your request');
        }
    });

    ws.send(JSON.stringify({ role: 'ai', content: 'Hello! what can I do for you?', "fin": true }));
});

console.log(`WebSocket server started at ws://localhost:${PORT}`);

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});