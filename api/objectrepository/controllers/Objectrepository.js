'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
    async create(ctx) {
        let response;
        if (ctx.is('multipart')) {
          const { data, files } = parseMultipartData(ctx);
          response = await strapi.services.objectrepository.create(data, { files });
        } else {
          response = await strapi.services.objectrepository.create(ctx.request.body);
        }
        // let response = model.attributes;

        await strapi.services.objectrepository.sendtoamq(response)

        return sanitizeEntity(response, { model: strapi.models.objectrepository });
    },
    async update(ctx) {
      let entity;
      let pushtomq = ctx.request.body.hasOwnProperty("rmq") ? true : false;
      pushtomq ? delete ctx.request.body.rmq : ""
      if (ctx.is('multipart')) {
        const { data, files } = parseMultipartData(ctx);
        entity = await strapi.services.objectrepository.update(ctx.params, data, {
          files,
        });
      } else {
        entity = await strapi.services.objectrepository.update(
          ctx.params,
          ctx.request.body
        );
      }
      if (pushtomq) {
	console.log("pushing from update")
        await strapi.services.objectrepository.sendtoamq(entity)
      }

      return sanitizeEntity(entity, { model: strapi.models.objectrepository });
    },
};
