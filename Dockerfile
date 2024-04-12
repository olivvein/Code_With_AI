# Utilisez l'image node:18
FROM node:18

# Installez pnpm globalement dans le conteneur
RUN npm install -g pnpm

# Définissez le répertoire de travail dans le conteneur
WORKDIR /app

# Copiez les fichiers package.json et package-lock.json depuis le répertoire vite-code-with-ai
COPY vite-code-with-ai/package*.json ./

# Installez les dépendances de votre application avec pnpm
RUN pnpm install

# Copiez le reste des fichiers de l'application depuis le répertoire vite-code-with-ai
COPY vite-code-with-ai/ . 

# Exposez le port sur lequel votre application s'exécute
EXPOSE 3000

# Démarrez votre application avec pnpm
CMD ["pnpm", "run", "dev"]