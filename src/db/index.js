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
      dialect: "mysql",
      host: serverConfig.DB_HOST,
      username: serverConfig.DB_USERNAME,
      password: serverConfig.DB_PASSWORD,
      port: Number(serverConfig.DB_PORT),
      database: serverConfig.DB_NAME,
      logQueryParameters: true,
    };

    console.log(options);

    this.sequelize = new Sequelize(
      serverConfig.DB_NAME,
      serverConfig.DB_USERNAME,
      serverConfig.DB_PASSWORD,
      options
    );

    this.models = initModels(this.sequelize);
    await this.syncMissingColumns();
  }

  async syncMissingColumns() {
    const tables = ["Admin", "PropertyManager", "ProspectiveTenant"];
    for (const table of tables) {
      try {
        const [results] = await this.sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'fcmToken';`);
        if (!results || results.length === 0) {
          await this.sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`fcmToken\` TEXT NULL;`);
          console.log(`[DB Migration] Successfully added missing column 'fcmToken' to '${table}' table.`);
        }
      } catch (err) {
        console.error(`[DB Migration Notice] Column check for '${table}':`, err.message);
      }
    }
  }
}

export default new DB();
