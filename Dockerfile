# ---- Build Stage ----
# Use the official Node.js 18+ image as the build base
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json, package-lock.json, and tsconfig.json files to the working directory
COPY package*.json tsconfig.json ./

# Install the dependencies
RUN npm install

# Copy the source code and public directory to the working directory
COPY ./src ./src
COPY ./public ./public

# Build the TypeScript code
RUN npm run build

# ---- Run Stage ----
# Use a minimal Node.js runtime for the final image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the built files from the build stage to the runtime stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm install --omit=dev

# Expose port 8080 for the WebSocket server
EXPOSE 8080

# Run the Node.js server
CMD ["node", "dist/server.js"]