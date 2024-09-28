[![Build and Deploy](https://github.com/magicsih/gpt-web-prompt/actions/workflows/docker_build.yaml/badge.svg)](https://github.com/magicsih/gpt-web-prompt/actions/workflows/docker_build.yaml)

# GPT Web Prompt

## Overview
This project is a web application that runs a web prompt standalone and uses a WebSocket server for a chat interface. It is implemented in TypeScript (`server.ts`) on the server side, while the client side includes an HTML file (`index.html`) and a JavaScript file (`client.js`).

This application is ideal for users who want to self-host and use OpenAI chat due to restrictions such as security policies, or those who want to develop and use their own chat UI.

Please note that the OPENAI_API_KEY is essential to run this project.

## Getting Started

### Prerequisites
- Node.js
- TypeScript
- OPENAI_API_KEY(default off) or GEMINI_API_KEY(default on)

### Installation
1. Clone the repository
2. Install dependencies with `npm install`
3. Compile TypeScript files with `tsc`

## Usage
1. Start the server with `node server.js`
2. Open `index.html` in your browser

## Files
- `server.ts`: This is the server file written in TypeScript. It handles...
- `index.html`: This is the main HTML file that displays...
- `client.js`: This JavaScript file handles...

## Contributing
Please read `CONTRIBUTING.md` for details on our code of conduct, and the process for submitting pull requests to us.

## License
This project is licensed under the MIT License - see the `LICENSE.md` file for details
