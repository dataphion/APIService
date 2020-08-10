"use strict";

/**
 * Lifecycle callbacks for the `Testcasecomponent` model.
 */

module.exports = {
  // Before saving a value.
  // Fired before an `insert` or `update` query.
  // beforeSave: async (model) => {},
  // After saving a value.
  // Fired after an `insert` or `update` query.
  // afterSave: async (model, result) => {
  //   try {
  //     console.log("---------------");
      
  //     console.log(model);
  //     console.log("---------------");
  //     let response = model.attributes;
      
  //     let tcdata = response
  //     console.log(tcdata);
  //     let data = tcdata.testcase
  //     if (!tcdata.type) {
  //       return null;
  //     }
  //     if (tcdata.type === "ui") {

  //       let applicationdata = await strapi.query('application').findOne({id:data.application})
  //       if (applicationdata.user.id) {
  //         const new_data = {
  //           testcase: {
  //             id: data.id,
  //             group_name: null,
  //             sequence_number: tcdata.sequence_number,
  //             objectrepository: tcdata.objectrepository,
  //             playback: false,
  //             record: true
  //           },
  //           user_id: applicationdata.user.id
  //         };
  //         // send the newly created step id to frontend for realtime update
  //         strapi.updatePortal(new_data);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error while pushing the data to portal");
  //     console.error(error);
  //   }
  // }
  // Before fetching all values.
  // Fired before a `fetchAll` operation.
  // beforeFetchAll: async (model) => {},
  // After fetching all values.
  // Fired after a `fetchAll` operation.
  // afterFetchAll: async (model, results) => {},
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
  // afterCreate: async (model, result) => {},
  // Before updating a value.
  // Fired before an `update` query.
  // beforeUpdate: async (model) => {},
  // After updating a value.
  // Fired after an `update` query.
  // afterUpdate: async (model, result) => {},
  // Before destroying a value.
  // Fired before a `delete` query.
  // beforeDestroy: async (model) => {},
  // After destroying a value.
  // Fired after a `delete` query.
  // afterDestroy: async (model, result) => {}
};
