"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  device_validate: async ctx => {
    try {
      const find_type = await strapi
        .query("devicetype")
        .find({ type: ctx.request.body.type });
      if (find_type.length > 0) {
        return find_type[0].id;
      } else {
        const create_type = await strapi.services.devicetype.create(
          ctx.request.body
        );
        return create_type.id;
      }
    } catch (error) {
      console.log(error);
      console.log("error in device_validate api");
    }
  }
};
