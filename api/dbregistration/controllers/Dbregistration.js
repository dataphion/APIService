"use strict";
const mysql = require("mysql2/promise");
const mssql = require("mssql");

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  check: async ctx => {
    return strapi.services.connectioncheck.check(ctx.request.body);
  },

  execute: async ctx => {
    const data = ctx.request.body;
    // for mysql
    if (data.database_type === "mysql") {
      const config = {
        host: data.ip,
        port: data.port,
        user: data.username,
        password: data.password,
        database: data.database
      };

      try {
        const conn = await mysql.createConnection(config);
        const [rows] = await conn.execute(data.query);
        return { status: "success", data: { rows } };
      } catch (error) {
        return { status: "failed", error };
      }
    }
    // for mssql
    else if (data.database_type === "mssql") {
      const config = {
        server: data.ip,
        port: Number(data.port),
        user: data.username,
        password: data.password,
        database: data.database
      };
      try {
        await mssql.connect(config);
        const mssqlRequest = new mssql.Request();
        const rows = await mssqlRequest.query(data.query);
        mssql.close();
        return { status: "success", data: [rows] };
      } catch (error) {
        return { status: "failed", error };
      }
    }
  }
};
