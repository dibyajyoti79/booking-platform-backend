import { Sequelize } from "sequelize";
import { dbConfig } from "../../config";

const sequelize = new Sequelize({
  dialect: "mysql",
  host: dbConfig.DB_HOST,
  username: dbConfig.DB_USER,
  password: dbConfig.DB_PASS,
  database: dbConfig.DB_NAME,
  logging: true,
});

export default sequelize;
