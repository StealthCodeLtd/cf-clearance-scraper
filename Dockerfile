FROM node:latest

# Install Xvfb and other dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    chromium \
    chromium-driver \
    xvfb \
    x11vnc \
    && rm -rf /var/lib/apt/lists/*

# Set up Xvfb
ENV DISPLAY=:99
ENV CHROME_BIN=/usr/bin/chromium

# Create a startup script - Fixed the echo command
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'Xvfb :99 -screen 0 1024x768x16 -ac +extension GLX +render -noreset &' >> /app/start.sh && \
    echo 'sleep 3' >> /app/start.sh && \
    echo 'pm2-runtime src/index.js' >> /app/start.sh && \
    chmod +x /app/start.sh

WORKDIR /app

COPY package*.json ./

RUN npm update
RUN npm install
RUN npm i -g pm2
COPY . .

EXPOSE 3000

# Use the startup script
CMD ["/app/start.sh"]