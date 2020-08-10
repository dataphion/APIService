"use strict";
const amqp = require("amqplib/callback_api");

/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {
  sendtoamq: async (response) => {
    if (response.action !== "open_url") {
      amqp.connect(
        strapi.config.get("server.rmq", "amqp://localhost"),
        (err, conn) => {
          conn.createChannel((err, ch) => {
            const q = strapi.config.get("server.rmq_queue", "highlight_queue");
            const msg = JSON.stringify({ id: response.id });
            console.log(
              `\n PUSHING ${response.id} TO QUEUE ${q} `
            );

            ch.assertQueue(q, { durable: false });
            ch.sendToQueue(q, Buffer.from(JSON.stringify(msg)));
          });
          setTimeout(() => {
            conn.close();
          }, 500);
        }
      );
    }
  },
};
