"use strict";
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const spawn = require("child_process").spawn;
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  delete: async (ctx) => {
    // console.log("-------delete--------");

    // console.log(ctx);
    // console.log(ctx.params);
    const response = await strapi
      .query("testcase")
      .findOne({ id: ctx.params.id });
    // console.log(response);
    if (response.type == "ui") {
      for (const data of response.testcasecomponents) {
        const tcResp = await strapi
          .query("testcasecomponent")
          .delete({ id: data.id });
        await strapi
          .query("objectrepository")
          .delete({ id: tcResp.objectrepository.id });
      }
    } else {
      await strapi.query("flow").delete({ id: response.flow.id });
    }
    // for (const data1 of response.testcaseexecutions) {
    //   const tscResp = await strapi
    //     .query("testcaseexecution")
    //     .findOne({ id: data1.id });
    //   const tssResp = await strapi
    //     .query("testsessionexecution")
    //     .findOne({ id: tscResp.testsessionexecution.id });
    //   const tsuResp = await strapi
    //     .query("testsuites")
    //     .findOne({ id: tssResp.testsuite.id });

    //   if (tsuResp.suite_name === "default") {
    //     for (const data2 of tscResp.flowsteps) {
    //       const tscResp = await strapi
    //         .query("flowsteps")
    //         .delete({ id: data2.id });
    //     }
    //     await strapi
    //     .query("testcaseexecution")
    //     .findOne({ id: data1.id });
    //   }

    // }
    const entity = await strapi.services.testcase.delete(ctx.params);
    return sanitizeEntity(entity, { model: strapi.models.testcase });
  },
  run: async (ctx) => {
    console.log("inside the run function");

    const testcase_data = await strapi.services.testcase.findOne({
      id: ctx.request.body.testcaseid,
    });
    console.log(testcase_data);
    const selenium_configure = await strapi.services[
      "selenium-configure"
    ].findOne({
      application: testcase_data.application.id,
    });
    console.log(selenium_configure);
    const protractor_host = `http://${selenium_configure.host}:${selenium_configure.port}/wd/hub`;

    //   const cmd = `export TESTCASE_ID="${ctx.request.body.testcaseid}" &&
    //               export TESTSESSIONEXECUTION_ID="${ctx.request.body.testsessionid}" &&
    //               export ENVIRONMENT_ID="${ctx.request.body.environment_id}" &&
    //               export BROWSER_NAME="${ctx.request.body.browser}" &&
    //                export STRAPI_HOST="${strapi.config.environments.production.strapi_host}" &&
    //                export VISION_API_HOST="${strapi.config.environments.production.vision_api_host}" &&
    //                export PROTRACTOR_HOST="${ctx.request.body.protractor_host}" &&
    //                export PROTRACTOR_PATH="${strapi.config.environments.production.protractor_path}" &&
    //                ${strapi.config.environments.production.protractor_path} ${strapi.config.environments.production.executor_path}/executor/conf.js`;

    const cmd = `export TESTCASE_ID="${ctx.request.body.testcaseid}" &&
                export TESTSESSIONEXECUTION_ID="${
                  ctx.request.body.testsessionid
                }" &&
                export TESTCASEEXECUTION_ID="${
                  ctx.request.body.testcaseexecutionid
                }" &&
                export API_TESTCASE_ID="${ctx.request.body.api_testcase_id}" &&
                export TITLE="${ctx.request.body.title}" &&
                export NODE_ID="${ctx.request.body.node_id}" &&
                export ENVIRONMENT_ID="${ctx.request.body.environment_id}" &&
                export BROWSER_NAME="${ctx.request.body.browser}" &&
                export STRAPI_HOST="${strapi.config.get(
                  "server.strapi_host",
                  "http://localhost:1337"
                )}" &&
                export VISION_API_HOST="${strapi.config.get(
                  "server.vision_api_host",
                  ""
                )}" &&
                export PROTRACTOR_HOST="${protractor_host}" &&
                export IMG_PATH="${strapi.config.get("server.img_path", "")}" &&
                export ERR_IMG_PATH="${strapi.config.get(
                  "server.err_img_path",
                  ""
                )}" &&
                ${strapi.config.get(
                  "server.protractor_path",
                  "/usr/bin/protractor"
                )} ${strapi.config.get(
      "server.executor_path",
      "/usr/src/dataphion/ai_testing"
    )}/executor/conf.js`;
    console.log(cmd);

    if (ctx.request.body.testcaseid && ctx.request.body.testsessionid) {
      try {
        const { stdout, stderr } = exec(cmd);
        console.log("stdout");
        console.log(stdout);
        console.log("stderr");
        console.log(stderr);
        if (stderr) {
          ctx.response.badRequest("failed");
        }
        ctx.send({ status: "success" });
      } catch (error) {
        ctx.response.badRequest("failed");
      }
    } else {
      ctx.response.badRequest("invalid query");
    }
  },
  runapi: async (ctx) => {
    const args = ctx.request.body;
    let data;
    if ("testsuiteid" in args) {
      console.log("Inside Testsuiteid");
      console.log("----------------------------------\n");
      data = {
        testsuiteid: args["testsuiteid"],
        environment_id: args["environment_id"],
        browser: args["browser"],
      };
      data = await strapi.services.testcase.sendtoamq(data, true);
    } else {
      console.log("Inside Testsessionid");
      console.log("----------------------------------\n");
      data = {
        testsessionid: args["testsessionid"],
        testcaseid: args["testcaseid"],
        environment_id: args["environment_id"],
      };
      data = await strapi.services.testcase.sendtoamq(data);
    }
    return data;
  },
};
