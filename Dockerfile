FROM node:22-slim

# Build tools needed for better-sqlite3 native module
RUN apt-get update -y && \
    apt-get install -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies (need devDeps for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client and build Next.js
RUN npx prisma generate && npm run build

# Hand ownership to the non-root node user (uid 1000, matches HF Spaces)
RUN chown -R node:node /app

USER node

# HF Spaces requires port 7860
ENV PORT=7860
ENV NODE_ENV=production
# Absolute path so prisma migrate deploy and the adapter both find the same file
ENV DATABASE_URL="file:/app/prisma/dev.db"

EXPOSE 7860

COPY --chown=node:node start.sh ./start.sh
RUN chmod +x start.sh
CMD ["./start.sh"]
