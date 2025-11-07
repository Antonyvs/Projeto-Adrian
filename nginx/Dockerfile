# =========================================
# Dockerfile do Proxy Reverso (NGINX)
# =========================================

# Usa imagem oficial do NGINX
FROM nginx:latest

# Copia a configuração customizada para dentro do container
COPY default.conf /etc/nginx/conf.d/default.conf

# Expõe a porta padrão HTTP
EXPOSE 80
