#!/bin/bash

# Script to set up Swagger UI for the 2FLocal API documentation

echo "Setting up Swagger UI for 2FLocal API documentation..."

# Install required dependencies
echo "Installing required dependencies..."
npm install swagger-jsdoc swagger-ui-express js-yaml

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "Dependencies installed successfully."
else
    echo "Error installing dependencies. Please check npm logs."
    exit 1
fi

# Build the project
echo "Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Project built successfully."
else
    echo "Error building the project. Please check build logs."
    exit 1
fi

echo "Swagger UI setup complete."
echo "You can access the API documentation at http://localhost:3000/api-docs when the server is running."
echo "To start the server, run: npm run dev"

exit 0