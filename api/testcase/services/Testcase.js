"use strict";

const amqp = require("amqplib/callback_api");
/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {
  sendtoamq: async (data, testsuite = false) => {
    const json_payload = { status: "started" };
    const jobs_result = await strapi.services.jobs.create(json_payload);
    data["job_id"] = jobs_result["id"];

    amqp.connect(
      strapi.config.get("server.rmq", "amqp://localhost"),
      (err, conn) => {
        conn.createChannel((err, ch) => {
          const q = testsuite
            ? strapi.config.get("server.testdecider", "testdecider")
            : strapi.config.get("server.decider", "decider");
          const msg = JSON.stringify(data);
          console.log(`\n PUSHING ${msg} TO QUEUE ${q}`);

          ch.assertQueue(q, { durable: false });
          ch.sendToQueue(q, Buffer.from(msg));
        });
        setTimeout(() => {
          conn.close();
        }, 500);
      }
    );

    return { message: "Test started", job_id: jobs_result["id"] };
  },
};
