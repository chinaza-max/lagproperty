import express from "express";
import cors from "cors";
import routes from "./src/routes/index.route.js";
import DB from "./src/db/index.js";
import serverConfig from "./src/config/server.js";
import authService from "./src/service/auth.service.js";
import systemMiddleware from "./src/middlewares/system.middleware.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cron from "node-cron";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

import { Setting } from "./src/db/models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "LagProperty API",
      version: "1.0.0",
      description: "API documentation for your system",
    },
    servers: [
      {
        url: `${serverConfig.DOMAIN}/api/v1/`,
        description: "live server",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/**/*.js"], // Define where your route/controller files are located
};
//        url: `http://localhost:${serverConfig.PORT}/api/v1/`, // Your base URL
//      url: `${serverConfig.DOMAIN}/api/v1/`, // Your base URL

const swaggerDocs = swaggerJsDoc(swaggerOptions);

class Server {
  constructor(port, mode) {
    this.port = port;
    this.mode = mode;
    this.app = express();
    this.initializeDbAndFirebase();
    this.initializeMiddlewaresAndRoutes();
  }

  async initializeDbAndFirebase() {
    await DB.connectDB();

    const [setting, created] = await Setting.findOrCreate({
      where: { id: 1 },
      defaults: {
        commissionPercentage: 0.01,
        appPercentage: 0.05,
        accountNumber: "5948568393",
        failedDisburseRetry: 1800,
        failedRefundRetry: 1800,
        pendingDisburseRetry: 1800,
        pendingDisburseRentRetry: 1800,
        appShare: 1800,
        preferences: {
          buildingPreferences: ["flat", "a room", "duplex", "self-contain"],
        },
        notificationAllowed: true,
        isDeleted: false,
      },
    });

    if (!created) {
      await setting.update({
        preferences: {
          buildingPreferences: ["flat", "a room", "duplex", "self-contain"],
          region: [
            "North Central",
            "North East",
            "North West",
            "South East",
            "South South",
            "South West",
            "All",
          ],
          maritalStatus: ["Married", "Single", "All"],
          religion: [
            "Islam",
            "Christianity",
            "Traditional African Religions",
            "Baha'i Faith",
            "Judaism",
            "Hinduism",
            "Other Religions",
            "All",
          ],
          gender: ["Male", "Female", "All"],
        },
      });
    }

    //cron.schedule('0 */2 * * *', async () => {
    /* checktransactionUpdateWebHook
        checktransactionUpdateSingleTransfer
      })*/

    // Schedule the cron job to run every 30 minutes
    cron.schedule("*/10 * * * *", () => {
      authService.startFirstRentDisbursements();
      authService.rentDisbursements();
      authService.checkRefund();
    });
  }

  initializeMiddlewaresAndRoutes() {
    let corsOptions;
    if (this.mode == "production") {
      const allowedOrigins = ["http://example.com"]; // Add your allowed origin(s) here

      corsOptions = {
        origin: function (origin, callback) {
          // Check if the origin is in the allowedOrigins array
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
      };
    } else {
      corsOptions = {
        origin: "*",
      };
    }
    /*
        const db=DB


        console.log(db)
  
  AdminJS.registerAdapter(AdminJSSequelize);
  
  const adminJsConfig = {
    databases: [db],
    rootPath: '/admin',
    resources: Object.values(db.sequelize.models).map(model => ({
      resource: model,
      options: {
        navigation: {
          name: model.name,
          icon: 'Database',
        },
      },
    })),
    branding: {
      companyName: 'LagProperty Admin',
      logo: false,
      softwareBrothers: false
    },
  };
  
  const adminJs = new AdminJS(adminJsConfig);
  const adminRouter = AdminJSExpress.buildRouter(adminJs);

*/

    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, "public")));
    this.app.use(cors(corsOptions));

    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    // this.app.use(adminJs.options.rootPath, adminRouter);  // Add admin route if available

    this.app.use(routes);
    this.app.use(systemMiddleware.errorHandler);
    this.app.use(cors(corsOptions));
  }

  async start() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
    });
  }
}

const server = new Server(serverConfig.PORT, serverConfig.NODE_ENV);
server.start();

/**
   * path where the app is in digital ocean 
   * 
   *  older /var/www/lag-property-server/lagproperty
   * /var/www/api/lagproperty/
   *
   * 
   * /etc/nginx/sites-available
   * 
   * 
   * 
   * 

  erver {
    listen 80;
    server_name 178.62.5.186 www.178.62.5.186;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name 178.62.5.186 www.178.62.5.186;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;


    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    error_page 404 /404.html;
    location = /404.html {
        root /var/www/html;
    }
}

   */
