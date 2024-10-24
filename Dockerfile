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

WORKDIR /app

COPY package*.json ./
COPY start.sh ./
RUN chmod +x start.sh

RUN npm update
RUN npm install
RUN npm i -g pm2
COPY . .

EXPOSE 3000

CMD ["./start.sh"]