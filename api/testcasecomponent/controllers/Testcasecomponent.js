"use strict";

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  create: async ctx => {
    const body = ctx.request.body;
    let tcdata = await strapi.services.testcasecomponent.create(body);

    let data = tcdata.testcase;
    if (!tcdata.type) {
      return null;
    }
    if (tcdata.type === "ui") {
      let applicationdata = await strapi
        .query("application")
        .findOne({ id: data.application });
      if (applicationdata.user.id) {
        const new_data = {
          testcase: {
            id: data.id,
            group_name: null,
            sequence_number: tcdata.sequence_number,
            objectrepository: tcdata.objectrepository,
            playback: false,
            record: true
          },
          user_id: applicationdata.user.id
        };
        // send the newly created step id to frontend for realtime update
        strapi.updatePortal(new_data);
      }
    }
    return tcdata;
  }
};
