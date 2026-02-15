// Quick test to verify Swagger setup
import { swaggerSpec } from './dist/config/swagger.js';

console.log('Swagger configuration loaded successfully!');
console.log('API Title:', swaggerSpec.info.title);
console.log('API Version:', swaggerSpec.info.version);
console.log('Swagger is ready!');
