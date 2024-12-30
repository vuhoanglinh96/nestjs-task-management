# Use the official Node.js image as the base image
FROM node:20.18.1

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json yarn.lock ./

# Install the dependencies
RUN yarn install

# Copy the rest of the application code to the working directory
COPY . .

# Build the NestJS application
# RUN yarn run build

# Expose the port the app runs on
EXPOSE 3000
