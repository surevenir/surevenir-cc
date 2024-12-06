# Gunakan image Node.js sebagai base image
FROM node:18

# Set direktori kerja dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file aplikasi
COPY . .

# Expose port yang digunakan oleh aplikasi
EXPOSE 8080

# Jalankan aplikasi saat container mulai
CMD ["node", "dist/index.js"]
