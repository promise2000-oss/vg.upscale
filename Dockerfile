FROM node:20-slim

RUN apt-get update && apt-get install -y \
  libvulkan1 \
  mesa-vulkan-drivers \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/render/project/src

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend ./backend

EXPOSE 3000

CMD ["node", "backend/server.js"]
