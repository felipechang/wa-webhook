# Use Node.js 20 slim version as the base image
FROM node:20-slim

# Skip downloading Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install Google Chrome Stable and dependencies
RUN apt-get update && \
    apt-get install -y gnupg wget && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -ms /bin/bash api

# Create required directories
RUN mkdir -p /home/api/src/.wwebjs_auth /home/api/src/.wwebjs_cache /tmp/chrome-data

# Set working directory
WORKDIR /home/api/src

# Copy application files
COPY . .

# Set permissions
RUN chown -R api:api /home/api /tmp/chrome-data && \
    chmod -R 755 /home/api/src/.wwebjs_auth /home/api/src/.wwebjs_cache /tmp/chrome-data

# Switch to non-root user
USER api

# Install dependencies
RUN npm install

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "run", "start"]