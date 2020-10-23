"use strict";
const mysql = require("mysql2/promise");
const oracledb = require("oracledb");
const asyncRedis = require("async-redis");
const amqp = require("amqplib/callback_api");
const mongo = require("mongodb").MongoClient;
const mssql = require("mssql");
var kafka = require("kafka-node"),
  Producer = kafka.Producer;
const cassandra = require("cassandra-driver");
const { Client } = require("pg");
var Imap = require("imap");

/**
 * `ConnectionCheck` service.
 */

module.exports = {
  check: async (data) => {
    try {
      let status = "";
      let get_offset = null;
      let email_count = null;
      console.log(data);

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
      } else if (data.database_type === "kafka") {
        status = await checkKafkaConnection(data);
      } else if (data.database_type === "kafkaOoffsetcheck") {
        get_offset = await getKafkaOffset(data);
      } else if (data.database_type === "cassandra") {
        status = await checkCassandraConnection(data);
      } else if (data.database_type === "postgres") {
        status = await checkPostgresConnection(data);
      } else if (data.database_type === "checkEmailCount") {
        email_count = await getEmailCount(data);
      }

      return {
        status: status,
        offset_value: get_offset,
        current_email_count: email_count,
      };
    } catch (error) {
      console.error("Error in connection checking");
      console.error(error);
      return { status: "failed", error };
    }
  },
};

const getEmailCount = (creds) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("check email countss", creds);
      let user = creds.email.toString();
      let password = creds.password.toString();
      var imap = new Imap({
        user: user,
        password: password,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
      });

      imap.once("ready", function () {
        console.log("connection ready -->");
        imap.openBox("INBOX", false, function (err, mailBox) {
          if (err) {
            console.error("err ---->", err);
            reject(err);
          }
          imap.search(["UNSEEN"], function (err, results) {
            console.log("unseen emails --->", results.length);
            imap.end();
            resolve(results.length);
          });
        });
      });

      imap.once("error", function (err) {
        console.log("after connection---->", err);
        reject(err);
      });

      imap.once("end", function () {
        console.log("Connection ended");
      });

      imap.connect();
    } catch (error) {
      console.log("error --->", error);
      reject(error);
    }
  });
};

const checkPostgresConnection = (creds) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("check postgres connection", creds);
      const client = new Client({
        user: creds.username,
        host: creds.ip,
        database: creds.database,
        password: creds.password,
        port: creds.port,
      });

      client.connect((err) => {
        if (err) {
          reject(err.toString());
        } else {
          console.log("success");
          resolve("success");
        }
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const checkCassandraConnection = (creds) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(creds);

      const dataCenter = "datacenter1";
      const authProvider = new cassandra.auth.PlainTextAuthProvider(
        creds.username,
        creds.password
      );
      let host = `${creds.ip}:${creds.port}`;
      const contactPoints = [host];
      const client = new cassandra.Client({
        contactPoints: contactPoints,
        authProvider: authProvider,
        keyspace: creds.database,
        localDataCenter: dataCenter,
      });

      client.connect((err) => {
        if (err) {
          reject(err.toString());
        } else {
          resolve("success");
        }
      });
    } catch (error) {
      console.error("Error in cassandra connection");
      console.error(error);
      reject(error);
    }
  });
};

const getKafkaOffset = (creds) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(creds);
      console.log(" ---------check kafka offset---------------");
      let host = `${creds.ip}:${creds.port}`;
      const client = new kafka.KafkaClient({
        kafkaHost: host,
      });

      /* Print latest offset. */
      var offset = new kafka.Offset(client);

      offset.fetch(
        [{ topic: creds.kafkaTopic, partition: 0, time: -1 }],
        function (err, data) {
          var latestOffset = data[creds.kafkaTopic]["0"][0];
          console.log("Consumer current offset: " + latestOffset);
          resolve(latestOffset);
        }
      );
    } catch (error) {
      console.error("Error in kafka Connection", error);
    }
  });
};

/**
 * @param  {object} creds
 * @description check the mysql connectivity
 */
const checkMysqlConnection = (creds) => {
  return new Promise((resolve, reject) => {
    try {
      const connectionObject = {
        host: creds.ip,
        port: creds.port,
        user: creds.username,
        password: creds.password,
        database: creds.database,
      };

      mysql
        .createConnection(connectionObject)
        .then(() => {
          resolve("success");
        })
        .catch((err) => {
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
 * @description check the kafka connectivity
 */
const checkKafkaConnection = (creds) => {
  return new Promise((resolve, reject) => {
    try {
      const client = new kafka.KafkaClient({
        kafkaHost: `${creds.ip}:${creds.port}`,
      });
      let producer = new Producer(client);

      // console.log(producer);

      producer.on("ready", function () {
        console.log("Connected");
        resolve("success");
      });

      producer.on("error", function (err) {
        console.error("Error occurred:", err);
        reject(err);
      });
    } catch (error) {
      console.error("Error in kafka connection");
      console.error(error);
      reject(error);
    }
  });
};

/**
 * @param  {object} creds
 * @description check the oracle connectivity
 */
const checkOracleConnection = (creds) => {
  return new Promise((resolve, reject) => {
    try {
      const connectionObject = {
        user: creds.username,
        password: creds.password,
        connectString: `${creds.ip}:${creds.port}/${creds.database}`,
      };

      oracledb
        .getConnection(connectionObject)
        .then(() => {
          resolve("success");
        })
        .catch((err) => {
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
const checkRedisConnection = (creds) => {
  return new Promise((resolve, reject) => {
    try {
      const client = asyncRedis.createClient(creds.port, creds.ip);

      client.on("error", (err) => {
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
const checkRMQConnection = (creds) => {
  return new Promise((resolve, reject) => {
    try {
      amqp.connect(
        `amqp://${creds.username}:${creds.password}@${creds.ip}:${creds.port}`,
        function (err) {
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

const checkMongoDBConnection = (creds) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        `mongodb://${creds.username}:${creds.password}@${creds.ip}:${creds.port}/${creds.database}`
      );

      mongo.connect(
        `mongodb://${creds.username}:${creds.password}@${creds.ip}:${creds.port}/${creds.database}?authSource=admin`,
        (err) => {
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

const checkMSSQLConnection = (creds) => {
  return new Promise((resolve, reject) => {
    try {
      const pool = new mssql.ConnectionPool({
        server: creds.ip,
        port: Number(creds.port),
        user: creds.username,
        password: creds.password,
        database: creds.database,
      });

      pool.connect((err) => {
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
