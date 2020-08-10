"use strict";
const amqp = require("amqplib/callback_api");

/**
 * Lifecycle callbacks for the `Objectrepository` model.
 */

module.exports = {
  // Before saving a value.
  // Fired before an `insert` or `update` query.
  // beforeSave: async (model) => {},
  // After saving a value.
  // Fired after an `insert` or `update` query.
  // afterSave: async (model, result) => {
  //   if (result.action !== "open_url") {
  //     amqp.connect(strapi.config.environments.production.rmq, (err, conn) => {
  //       conn.createChannel((err, ch) => {
  //         const q = strapi.config.environments.production.rmq_queue;
  //         const msg = JSON.stringify({ id: result.id });
  //         console.log(
  //           `\n PUSHING ${result.id} TO QUEUE ${q} ON ${
  //             strapi.config.environments.production.rmq
  //           }`
  //         );
  //         ch.assertQueue(q, { durable: false });
  //         ch.sendToQueue(q, Buffer.from(JSON.stringify(msg)));
  //       });
  //       setTimeout(() => {
  //         conn.close();
  //       }, 500);
  //     });
  //   }
  // },
  // Before fetching all values.
  // Fired before a `fetchAll` operation.
  // beforeFetchAll: async (model) => {},
  // After fetching all values.
  // Fired after a `fetchAll` operation.
  // afterFetchAll: async (model, results) => {
  //   console.log("inside afterall fetch");
  // },
  // Fired before a `fetch` operation.
  // beforeFetch: async (model) => {},
  // After fetching a value.
  // Fired after a `fetch` operation.
  // afterFetch: async (model, result) => {},
  // Before creating a value.
  // Fired before an `insert` query.
  // beforeCreate: async (model) => {},
  // After creating a value.
  // Fired after an `insert` query.
  //afterCreate: async (model, result) => {
  //  let response = model.attributes;

  //  if (response.action !== "open_url") {
  //    amqp.connect(strapi.config.environments.production.rmq, (err, conn) => {
  //      conn.createChannel((err, ch) => {
  //        const q = strapi.config.environments.production.rmq_queue;
  //        const msg = JSON.stringify({ id: response.id });
  //        console.log(
  //          `\n PUSHING ${response.id} TO QUEUE ${q} ON ${strapi.config.environments.production.rmq}`
  //        );

  //        ch.assertQueue(q, { durable: false });
  //        ch.sendToQueue(q, Buffer.from(JSON.stringify(msg)));
  //      });
  //      setTimeout(() => {
  //        conn.close();
  //      }, 500);
  //    });
  //  }
  //}

  // Before updating a value.
  // Fired before an `update` query.
  // beforeUpdate: async (model, value) => {
  //   console.log("inside object repo, before update");
  //   try {
  //     setTimeout(() => {
  //       strapi.models.testcasecomponent
  //         .find()
  //         .where({ objectrepository: model._conditions.id })
  //         .populate("objectrepository")
  //         .populate("testcase")
  //         .exec((err, respdata) => {
  //           // console.log("---------------------------\n\n");
  //           if (respdata) {
  //             let data = respdata[0];
  //             //console.log(data);
  //             if (data) {
  //               if (data.type === "ui") {
  //                 //console.log(data);
  //                 //we have application id from testcomponent table
  //                 //find query in application table
  //                 strapi.models.application
  //                   .findById(data.testcase.application)
  //                   .populate("user")
  //                   .exec((err, applicationdata) => {
  //                     // console.log(applicationdata);
  //                     // console.log(applicationdata.user);
  //                     if (applicationdata.user.id) {
  //                       //console.log(data);
  //                       const new_data = {
  //                         testcase: {
  //                           id: data.testcase.id,
  //                           group_name: null,
  //                           sequence_number: data.sequence_number,
  //                           objectrepository: data.objectrepository,
  //                           playback: true
  //                         },
  //                         user_id: applicationdata.user.id
  //                       };
  //                       data["user_id"] = applicationdata.user.id;
  //                       //console.log("new_data\n\n",new_data);
  //                       // send the newly created step id to frontend for realtime update
  //                       strapi.updatePortalPlayback(new_data);
  //                     }
  //                   });
  //               }
  //             }
  //           }
  //         });
  //     }, 1000);
  //   } catch (error) {
  //     console.error("Error while pushing the data to portal");
  //     console.error(error);
  //   }
  // }
  // After updating a value.
  // Fired after an `update` query.
  // afterUpdate: async (model, result) => {
  //   try {
  //     setTimeout(() => {
  //       strapi.models.testcasecomponent
  //         .find()
  //         .where({ objectrepository: model._conditions.id })
  //         .populate("objectrepository")
  //         .populate("testcase")
  //         .exec((err, respdata) => {
  //           let data = respdata[0];
  //           if (typeof data === "undefined") {
  //             return null;
  //           }
  //           if (typeof data.type === "undefined") {
  //             return null;
  //           }
  //           if (data.type === "ui") {
  //             //we have application id from testcomponent table
  //             //find query in application table
  //             strapi.models.application
  //               .findById(data.testcase.application)
  //               .populate("user")
  //               .exec((err, applicationdata) => {
  //                 if (applicationdata.user.id) {
  //                   const new_data = {
  //                     testcase: {
  //                       id: data.testcase.id,
  //                       group_name: null,
  //                       sequence_number: data.sequence_number,
  //                       objectrepository: data.objectrepository,
  //                       playback: true,
  //                       record: false
  //                     },
  //                     user_id: applicationdata.user.id
  //                   };
  //                   data["user_id"] = applicationdata.user.id;
  //                   // send the newly created step id to frontend for realtime update
  //                   strapi.updatePortalPlayback(new_data);
  //                 }
  //               });
  //           }
  //         });
  //     }, 1000);
  //   } catch (error) {
  //     console.error("Error while pushing the data to portal");
  //     console.error(error);
  //   }
  // }
  // Before destroying a value.
  // Fired before a `delete` query.
  // beforeDestroy: async (model) => {},
  // After destroying a value.
  // Fired after a `delete` query.
  // afterDestroy: async (model, result) => {}
};
