# Gunakan image Node.js sebagai base image
FROM node:18

# Set direktori kerja dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Salin semua file aplikasi
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port yang digunakan oleh aplikasi
EXPOSE 3000

# Jalankan aplikasi saat container mulai
CMD ["node", "dist/index.js"]
