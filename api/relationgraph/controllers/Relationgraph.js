'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {

  creates: async ctx => {
    var bodyData = ctx.request.body;
    let pg_conf = strapi.config.connections.default.settings
    pg_conf['user'] = strapi.config.connections.default.settings.username

    if (!bodyData.hasOwnProperty('edges')) {
      return {status: "fail"}
    }

    if (bodyData.edges.length <= 0) {
      return {
        status: "success"
      }
    }
    const {
      Client
    } = require("pg");
    const client = new Client(pg_conf);
    client.connect();
	  console.log("data---", bodyData)
    const query_start = `insert into relationgraphs(source,destination,node_name,node_request,data_key,source_label,destination_label, destination_method, source_method,application) values('${bodyData.edges[0].source}','${bodyData.edges[0].destination}','${bodyData.edges[0].node_name}','${bodyData.edges[0].node_request}','${bodyData.edges[0].data_key}','${bodyData.edges[0].source_label}','${bodyData.edges[0].destination_label}', '${bodyData.edges[0].destination_method}', '${bodyData.edges[0].source_method}','${bodyData.edges[0].application}')`
    let query_betw = ``;
    const query_end = ` on conflict(source,destination,node_name,node_request,data_key) do nothing;`;
    if (bodyData.edges.length > 1) {
      for (let index = 1; index < bodyData.edges.length; index++) {
        const edge = bodyData.edges[index];
        console.log(edge)
        query_betw = query_betw + `,('${edge.source}','${edge.destination}','${edge.node_name}','${edge.node_request}','${edge.data_key}','${edge.source_label}','${edge.destination_label}','${edge.destination_method}', '${edge.source_method}','${edge.application}')`
      }
    }
    const query = query_start;
    // console.log(query)
    // console.log(query_start)
    // console.log(query_end)
    // console.log(query_betw)
    let resp = await client.query(query);
    console.log(resp);
    client.end();

    return {
      status: "success"
    }
  }
};
