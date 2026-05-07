# ==========================================
# STAGE 1: Static Compilation Environment
# ==========================================
FROM node:20-alpine AS build
WORKDIR /app

# Copy package descriptors first to maximize Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy the remaining client codebase
COPY . .

# Run production compilation (generates the optimization target inside /app/dist)
RUN npm run build

# ==========================================
# STAGE 2: High-Performance Production Server
# ==========================================
FROM nginx:alpine AS production

# Copy our custom Nginx router settings into the server default path
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Clean out default Nginx placeholder web root assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the compiled static dist chunks from Stage 1 into the Nginx server root
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx web server default port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]