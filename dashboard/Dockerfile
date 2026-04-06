FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# We expose 5173 and use 'npm run dev' with --host enabled for container interoperability. 
# In pure production, we'd npm run build and host via nginx.
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
