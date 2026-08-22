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


    this.sequelize = new Sequelize(
      serverConfig.DB_NAME,
      serverConfig.DB_USERNAME,
      serverConfig.DB_PASSWORD,
      options
    );

    this.models = initModels(this.sequelize);
    //
    // Auto-create or alter tables to match current models (safe for dev & fresh DBs)
    try {
      await this.sequelize.sync({ alter: true });
      console.log("[DB] All tables synced successfully.");
    } catch (err) {
      console.error("[DB] Table sync error:", err.message);
    }

    await this.syncMissingColumns();
  }

  async syncMissingColumns() {
    try {
      const [identityResults] = await this.sequelize.query(`SHOW COLUMNS FROM \`EmailandTelValidation\` LIKE 'identityId';`);
      if (!identityResults || identityResults.length === 0) {
        await this.sequelize.query(`ALTER TABLE \`EmailandTelValidation\` ADD COLUMN \`identityId\` VARCHAR(255) NULL;`);
        console.log(`[DB Migration] Successfully added missing column 'identityId' to 'EmailandTelValidation' table.`);
      }
    } catch (err) {
      console.error(`[DB Migration Notice] Column check for 'EmailandTelValidation.identityId':`, err.message);
    }

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

    const userTables = ["PropertyManager", "ProspectiveTenant"];
    for (const table of userTables) {
      try {
        const [dobResults] = await this.sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'dateOfBirth';`);
        if (!dobResults || dobResults.length === 0) {
          await this.sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`dateOfBirth\` DATETIME NULL;`);
          console.log(`[DB Migration] Successfully added missing column 'dateOfBirth' to '${table}' table.`);
        }
      } catch (err) {
        console.error(`[DB Migration Notice] Column check for '${table}.dateOfBirth':`, err.message);
      }

      try {
        const [ninResults] = await this.sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'isNINValid';`);
        if (!ninResults || ninResults.length === 0) {
          await this.sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`isNINValid\` TINYINT(1) NULL DEFAULT 0;`);
          console.log(`[DB Migration] Successfully added missing column 'isNINValid' to '${table}' table.`);
        }
      } catch (err) {
        console.error(`[DB Migration Notice] Column check for '${table}.isNINValid':`, err.message);
      }
    }
  }
}

export default new DB();
