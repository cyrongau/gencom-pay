FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including devDeps for building)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Copy any other necessary files (like uploads folder placeholder if needed)
RUN mkdir -p uploads

EXPOSE 4000

# Run the app
CMD ["node", "dist/main.js"]
