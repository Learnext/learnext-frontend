FROM node:20-alpine

WORKDIR /app

# cài serve
RUN npm install -g serve

# copy build đã có sẵn
COPY dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]