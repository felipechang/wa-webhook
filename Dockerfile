# Use Node.js 20 slim version as the base image
FROM node:20-slim

# Skip downloading Chromium since we'll be using Google Chrome instead
# This helps reduce the image size
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install Google Chrome Stable and required dependencies
# This block:
# 1. Updates package list
# 2. Installs gnupg and wget for key management and downloads
# 3. Downloads and adds Google's signing key
# 4. Adds Google Chrome repository
# 5. Updates package list with new repository
# 6. Installs Chrome without recommended packages
# 7. Cleans up apt cache to reduce image size
RUN apt-get update &&  \
    apt-get install gnupg wget -y && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -ms /bin/bash api

# Create application directory
RUN mkdir -p /home/api/src

# Set working directory
WORKDIR /home/api/src

# Copy application files to container
COPY . .

# Change ownership of application files to non-root user
RUN chown -R api:api /home/api

# Switch to non-root user for security
USER api

# Install application dependencies
RUN npm install

# Expose port 5000 for the application
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start"]