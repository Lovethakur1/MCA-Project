# Use the official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm ci --only=production

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Make the startup script executable
RUN chmod +x start-with-admin.sh

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nextjs:nodejs /usr/src/app
USER nextjs

# Define the command to run your app with admin setup
CMD ["./start-with-admin.sh"]
