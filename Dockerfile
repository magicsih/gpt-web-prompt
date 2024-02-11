# Use the official Node.js 18+ image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./
COPY tsconfig.json ./

# Install the dependencies
RUN npm install

# Copy the source code to the working directory
COPY ./src ./src

# Copy the public directory to the working directory
COPY ./public ./public

# Build the TypeScript code
RUN npm run build

# Expose port 8080 for the WebSocket server
EXPOSE 8080

# Run the Node.js server on the built files in the dist directory
CMD ["node", "dist/server.js"]