const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "QuickDrop API",
      version: "1.0.0",
      description: "QuickDrop Delivery Tracking System API",
    },

    servers: [
      {
        url: "http://localhost:5001",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./routes/*.js"],
};

module.exports = swaggerJsDoc(options);