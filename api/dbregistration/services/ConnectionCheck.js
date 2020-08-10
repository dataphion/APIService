"use strict";
const mysql = require("mysql2/promise");
const oracledb = require("oracledb");
const asyncRedis = require("async-redis");
const amqp = require("amqplib/callback_api");
const mongo = require("mongodb").MongoClient;
const mssql = require("mssql");

/**
 * `ConnectionCheck` service.
 */

module.exports = {
  check: async data => {
    try {
      let status = "";

      if (data.database_type === "mysql") {
        status = await checkMysqlConnection(data);
      } else if (data.database_type === "oracle") {
        status = await checkOracleConnection(data);
      } else if (data.database_type === "redis") {
        status = await checkRedisConnection(data);
      } else if (data.database_type === "rabbitmq") {
        status = await checkRMQConnection(data);
      } else if (data.database_type === "mongodb") {
        status = await checkMongoDBConnection(data);
      } else if (data.database_type === "mssql") {
        status = await checkMSSQLConnection(data);
      }

      return { status: status };
    } catch (error) {
      console.error("Error in connection checking");
      console.error(error);
      return { status: "failed", error };
    }
  }
};

/**
 * @param  {object} creds
 * @description check the mysql connectivity
 */
const checkMysqlConnection = creds => {
  return new Promise((resolve, reject) => {
    try {
      const connectionObject = {
        host: creds.ip,
        port: creds.port,
        user: creds.username,
        password: creds.password,
        database: creds.database
      };

      mysql
        .createConnection(connectionObject)
        .then(() => {
          resolve("success");
        })
        .catch(err => {
          reject(err);
        });
    } catch (error) {
      console.error("Error in checkMysqlConnection");
      console.error(error);
      reject(error);
    }
  });
};

/**
 * @param  {object} creds
 * @description check the oracle connectivity
 */
const checkOracleConnection = creds => {
  return new Promise((resolve, reject) => {
    try {
      const connectionObject = {
        user: creds.username,
        password: creds.password,
        connectString: `${creds.ip}:${creds.port}/${creds.database}`
      };

      oracledb
        .getConnection(connectionObject)
        .then(() => {
          resolve("success");
        })
        .catch(err => {
          reject(err);
        });
    } catch (error) {
      console.error("Error in checkOracleConnection");
      console.error(error);
      reject(error);
    }
  });
};

/**
 * @param  {object} creds
 * @description check the redis connectivity
 */
const checkRedisConnection = creds => {
  return new Promise((resolve, reject) => {
    try {
      const client = asyncRedis.createClient(creds.port, creds.ip);

      client.on("error", err => {
        client.quit(); // terminate the connection before sending the message back
        reject(err);
      });
      client.on("connect", () => {
        client.quit(); // terminate the connection before sending the message back
        resolve("success");
      });
    } catch (error) {
      console.error("Error in checkRedisConnection");
      console.error(error);
      reject(error);
    }
  });
};

/**
 * @param  {object} creds
 * @description check the rabbitmq connectivity
 */
const checkRMQConnection = creds => {
  return new Promise((resolve, reject) => {
    try {
      amqp.connect(
        `amqp://${creds.username}:${creds.password}@${creds.ip}:${creds.port}`,
        function(err) {
          if (err) {
            reject(err.toString());
          } else {
            resolve("success");
          }
        }
      );
    } catch (error) {
      console.error("Error in checkRMQConnection");
      console.error(error);
      reject(error);
    }
  });
};

const checkMongoDBConnection = creds => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`mongodb://${creds.username}:${creds.password}@${creds.ip}:${creds.port}/${creds.database}`);
      
      mongo.connect(
        `mongodb://${creds.username}:${creds.password}@${creds.ip}:${creds.port}/${creds.database}?authSource=admin`,
        err => {
          if (err) {
            reject(err.toString());
          } else {
            resolve("success");
          }
        }
      );
    } catch (error) {
      console.error("Error in checkMongoDBConnection");
      console.error(error);
      reject(error);
    }
  });
};

const checkMSSQLConnection = creds => {
  return new Promise((resolve, reject) => {
    try {
      const pool = new mssql.ConnectionPool({
        server: creds.ip,
        port: Number(creds.port),
        user: creds.username,
        password: creds.password,
        database: creds.database
      });

      pool.connect(err => {
        if (err) {
          reject(err.toString());
        } else {
          resolve("success");
        }
      });
    } catch (error) {
      console.error("Error in checkMSSQLConnection");
      console.error(error);
      reject(error);
    }
  });
};
