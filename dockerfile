# =========================================
# Dockerfile da Aplicação Node.js
# =========================================

# Usa imagem base oficial do Node
FROM node:18

# Define diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia dependências e instala
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos
COPY server.js .

# Expõe a porta usada pelo servidor
EXPOSE 3123

# Comando para iniciar o servidor
CMD ["node", "server.js"]
