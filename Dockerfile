FROM node:20-slim

RUN npm config set registry https://registry.npmjs.org/
RUN npm cache clean --force

# Install necessary dependencies for running Chrome
# Install only the necessary dependencies for Chrome to run
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create a user with name 'app' and group that will be used to run the app
#RUN groupadd -r app && useradd -rm -g app -G audio,video app

WORKDIR /app

COPY package*.json .
COPY .puppeteerrc.cjs .

RUN npm ci --omit=dev
RUN npx rebrowser-puppeteer browsers install chrome@127

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
