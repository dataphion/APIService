'use strict';

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
    bulk: async (ctx) => {

        // delete the object repositories
        const or_delete = await strapi.models.objectrepository.deleteMany({ id: { $in: ctx.request.body.objectrepositories}});
        console.log("\n\nor_delete:");
        console.log(or_delete);
        
        // delete the testcasecomponents
        const tc_delete = await strapi.models.testcasecomponent.deleteMany({ id: { $in: ctx.request.body.testcasecomponents}});
        console.log("\n\ntc_delete:");
        console.log(tc_delete);
        
        // delete the testcases
        const testcase_delete = await strapi.models.testcase.deleteMany({ id: { $in: ctx.request.body.testcases}});
        console.log("\n\ntestcase_delete:");
        console.log(testcase_delete);

        // delete feature
        const feature_delete = await strapi.models.feature.deleteOne({id: ctx.request.body.feature});
        console.log("\nfeature_delete:");
        console.log(feature_delete);
    }
};
