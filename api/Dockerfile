FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN ls -la src/
RUN npm run build

# Debug: list the dist folder content properly
RUN echo "Checking dist contents:" && find dist -name "*.js"

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Copy any other necessary files
RUN mkdir -p uploads

EXPOSE 4000

# Run the app - find main.js and fail if not found
CMD ["sh", "-c", "FILE=$(find dist -name main.js | head -n 1); if [ -z \"$FILE\" ]; then echo 'ERROR: main.js not found in dist!'; ls -R dist; exit 1; else node \"$FILE\"; fi"]
