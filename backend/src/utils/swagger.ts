import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Express } from 'express';

// Read the OpenAPI specification from the YAML file
const yamlPath = path.join(__dirname, '../../docs/api/openapi.yaml');
const yamlSpec = fs.readFileSync(yamlPath, 'utf8');

// Parse the YAML file using js-yaml
const swaggerSpec = yaml.load(yamlSpec) as swaggerJSDoc.Options;

/**
 * Setup Swagger UI
 * @param app - Express application
 */
export const setupSwagger = (app: Express): void => {
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