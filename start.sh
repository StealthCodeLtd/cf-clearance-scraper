#!/bin/bash
Xvfb :99 -screen 0 1024x768x16 -ac +extension GLX +render -noreset &
sleep 3
node src/index.js