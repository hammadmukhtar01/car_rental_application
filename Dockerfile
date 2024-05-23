# Use the official Node.js image as the base image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Remove existing node_modules
RUN rm -rf node_modules

# Reinstall node_modules
RUN npm install

# Expose the port the app runs on
EXPOSE 8000

# Define the environment variable
ENV PORT=8000

# Start the application
CMD ["npm", "start"]
