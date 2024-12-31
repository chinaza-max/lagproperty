import { Sequelize } from "sequelize";
import serverConfig from "../config/server.js";
import { init as initModels } from "./models/index.js";

class DB {
  constructor() {
    this.sequelize = null;
    this.models = null;
  }

  async connectDB() {
    const options = {
      logging: console.log,
      dialect: "mysql",
      host: serverConfig.DB_HOST,
      username: serverConfig.DB_USERNAME,
      password: serverConfig.DB_PASSWORD,
      port: Number(serverConfig.DB_PORT),
      database: serverConfig.DB_NAME,
      logQueryParameters: true,
      
      // Connection pool configuration
      pool: {
        max: 5, // Maximum number of connection instances to keep in pool
        min: 0, // Minimum number of connection instances to keep in pool
        acquire: 60000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error (60 seconds)
        idle: 10000, // The maximum time, in milliseconds, that a connection can be idle before being released (10 seconds)
      },
      
      // Handle disconnects automatically
      dialectOptions: {
        connectTimeout: 60000, // Increase connection timeout (60 seconds)
        // MySQL specific settings to handle timeouts and disconnects
        connectionLimit: 10,
        keepAlive: true,
        timezone: '+00:00',
        // Increase timeout values
        options: {
          requestTimeout: 60000
        }
      },

      retry: {
        max: 3, // Maximum amount of times to retry a failed query
        timeout: 30000, // How long to wait before retrying (30 seconds)
      }
    };
    
    try {
      this.sequelize = new Sequelize(
        serverConfig.DB_NAME,
        serverConfig.DB_USERNAME,
        serverConfig.DB_PASSWORD,
        options
      );

      // Test the connection
      await this.sequelize.authenticate();
      console.log('Database connection established successfully.');
      
      // Initialize models
      this.models = initModels(this.sequelize);

      // Set up connection error handlers
      this.sequelize.connectionManager.on('disconnect', async () => {
        console.log('Database connection lost. Attempting to reconnect...');
        try {
          await this.sequelize.connectionManager.reconnect();
          console.log('Reconnected to database successfully.');
        } catch (error) {
          console.error('Failed to reconnect:', error);
        }
      });

      if (serverConfig.NODE_ENV === "development") {
        // Uncomment if needed:
        // await this.sequelize.sync({ alter: true });   
        // await this.sequelize.sync({ force: true }); 
      }

      return this.sequelize;
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      // Implement exponential backoff for retrying connection
      const retryConnection = async (attempt = 1, maxAttempts = 5) => {
        if (attempt > maxAttempts) {
          throw new Error('Max connection attempts reached');
        }
        const timeout = Math.min(1000 * Math.pow(2, attempt), 30000); // exponential backoff with 30s max
        console.log(`Retrying connection in ${timeout/1000} seconds... (Attempt ${attempt}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, timeout));
        return this.connectDB();
      };
      return retryConnection();
    }
  }

  async closeConnection() {
    try {
      await this.sequelize.close();
      console.log('Database connection closed successfully.');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

export default new DB();


/*import { Sequelize } from "sequelize";
import serverConfig from "../config/server.js";
import { init as initModels } from "./models/index.js";

import fs from "fs";



class DB {
   constructor() {
    this.sequelize 
    this.models = null;
  }

  async connectDB() {
   


    const options= { 
      logging: console.log,
      //logging: false,
      dialect: "mysql",
      host: serverConfig.DB_HOST,
      username: serverConfig.DB_USERNAME,
      password: serverConfig.DB_PASSWORD,
      port: Number(serverConfig.DB_PORT),
      database: serverConfig.DB_NAME,
      logQueryParameters: true,
    };
    
    this.sequelize = new Sequelize(
      serverConfig.DB_NAME,
      serverConfig.DB_USERNAME,
      serverConfig.DB_PASSWORD,
      options
    );
       
    this.models =initModels(this.sequelize);

    if (serverConfig.NODE_ENV === "development") {
      //await this.sequelize.sync({ alter: true });   
      //await this.sequelize.sync({ force: true }); 
    }          
                    
/*     
        (async () => {
          try {  
            const [results] = await this.sequelize.query('SHOW TABLES;');
            const tables = results.map(result => result.Tables_in_your_database_name);
            console.log('List of tables:', tables);
          } catch (error) {
            console.error('Error retrieving tables:', error);
          } finally {
            await this.sequelize.close();
          }
        })();
*/
/*
        const disableForeignKeyChecks = 'SET foreign_key_checks = 0;';
const dropTable = 'DROP TABLE IF EXISTS WishList;';
const enableForeignKeyChecks = 'SET foreign_key_checks = 1;';

// Execute SQL commands
this.sequelize.query(disableForeignKeyChecks)
  .then(() => this.sequelize.query(dropTable))
  .then(() => this.sequelize.query(enableForeignKeyChecks))
  .then(() => {
    console.log('Table dropped successfully.');
    console.log('Table dropped successfully.');
    console.log('Table dropped successfully.');
    console.log('Table dropped successfully.');
    console.log('Table dropped successfully.');
    console.log('Table dropped successfully.');

  })
  .catch((error) => {
    console.error('Error dropping table:', error);
  });
*/




       /*
  }

}

export default new DB();
*/