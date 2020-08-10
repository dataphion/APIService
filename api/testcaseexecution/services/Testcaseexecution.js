'use strict';
var _ = require('lodash')
/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {
    // update: async (ctx) => {
    //     let params = ctx.params;
    //     let values = ctx.request.body;

    //     // console.log(params)
    //     // console.log(values)

    //     // Extract values related to relational data.
    //     const relations = _.pick(values, Testcaseexecution.associations.map(a => a.alias));
    //     // console.log(relations);

    //     const data = _.omit(values, Testcaseexecution.associations.map(a => a.alias));
    //     // console.log(data)
    //     // Update entry with no-relational data.
    //     const entry = await Testcaseexecution.updateOne(params, data, { multi: true });
    //     // console.log(entry);

    //     // Update relational data and return the entry.
    //     const relentry = await Testcaseexecution.updateRelations(Object.assign(params, { values: relations }));
    //     console.log(relentry.testsessionexecution.id);
    //     let updateParam = { id: relentry.testsessionexecution.id }
    //     let updateValues = {}
    //     if (values.status === "completed") {
    //         if (relentry.testsessionexecution.total_pass) {
    //             updateValues = { total_pass: (parseInt(relentry.testsessionexecution.total_pass, 10) + parseInt(1, 10)) + "" }
    //         } else {
    //             updateValues = { total_pass: "1" }
    //         }
    //     }
    //     else if (values.status === "failed") {
    //         if (relentry.testsessionexecution.total_fail) {
    //             updateValues = { total_fail: (parseInt(relentry.testsessionexecution.total_fail, 10) + parseInt(1, 10)) + "" }
    //         } else {
    //             updateValues = { total_fail: "1" }
    //         }
    //     }


    //     ctx.params = updateParam
    //     ctx.request.body = updateValues
    //     const temp = strapi.controllers.testsessionexecution.update(ctx)
    //     // console.log(temp);

    //     return relentry
    // }
};
