const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');

// Read the OpenAPI specification from the YAML file
const yamlPath = path.join(__dirname, '../../docs/api/openapi.yaml');
const yamlSpec = fs.readFileSync(yamlPath, 'utf8');

// Parse the YAML file using js-yaml
const yaml = require('js-yaml');
const swaggerSpec = yaml.load(yamlSpec);

/**
 * Setup Swagger UI
 * @param {Express} app - Express application
 */
const setupSwagger = (app) => {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    }
  }));
  
  // Serve Swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger UI available at /api-docs');
};

module.exports = {
  setupSwagger
};