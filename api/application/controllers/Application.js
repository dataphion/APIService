"use strict";
const util = require("util");
const diff = require("deep-diff").diff;
const fetch = require("node-fetch");
const $RefParser = require("json-schema-ref-parser");
/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  swagger: async ctx => {
    var SwaggerParser = require("swagger-parser");
    var parser = new SwaggerParser();
    var bodyData = ctx.request.body;
    console.log("bodyData ----->", bodyData);
    

    let addIfExists = function(out, k1, k2, inp) {
      if (k2 in inp) {
        out[k1] = inp[k2];
      }else{
      	out[k1] = null
      }
      return out;
    };

    return parser.bundle("http://localhost:1337"+bodyData.swagger_url).then(
      async function(api, err) {
        console.log(err);
	console.log("api data --->", api)
        let host_url;
        if (api["host"]) {
          host_url = api["host"];
        } else if (api["servers"][0]["url"]) {
          host_url = api["servers"][0]["url"];
        }
        ctx.params = { id: bodyData.endpointpack_id };
        ctx.request.body = {
          host_url: host_url,
          swagger_url: bodyData.swagger_url
        };
        strapi.controllers.endpointpack.update(ctx);

        for (const ep of Object.keys(api.paths)) {
          for (const method of Object.keys(api.paths[ep])) {
            let obj = api.paths[ep][method];
            console.log("------method-------");
            console.log(method);

            let resp = {};
            resp = addIfExists(resp, "tags", "tags", obj);
            resp = addIfExists(resp, "consumes", "consumes", obj);
            resp = addIfExists(resp, "produces", "produces", obj);
            resp = addIfExists(resp, "parameters", "parameters", obj);
            resp = addIfExists(resp, "summary", "summary", obj);
            resp = addIfExists(resp, "description", "description", obj);
            resp = addIfExists(resp, "responses", "responses", obj);
            resp["endpoint"] = ep;
            resp["method"] = method;
            resp["endpointpack"] = { id: bodyData.endpointpack_id };
	//	console.log("endpoints payloads", resp)
            let endpointId = null;
            let parameterRef;
	   if(!!resp["parameters"]){
            if (typeof resp["parameters"] === "object") {
              for (const key of resp["parameters"]) {
                if (key["schema"] && key["schema"]["$ref"]) {
                  parameterRef = key["schema"]["$ref"];
                } else if (
                  key["schema"] &&
                  key["schema"]["items"] &&
                  key["schema"]["items"]["$ref"]
                ) {
                  parameterRef = key["schema"]["items"]["$ref"];
                }
              }
            }
	  }

            let responseRefs = [];
            for (const key of Object.keys(resp["responses"])) {
              // console.log(resp["responses"][key]["content"])

              if (
                resp["responses"][key]["schema"] &&
                resp["responses"][key]["schema"]["$ref"]
              ) {
                responseRefs.push(resp["responses"][key]["schema"]["$ref"]);
                resp["responses"][key] = resp["responses"][key]["schema"];
                // resp["responses"][key] = resp["responses"][key]["schema"]["$ref"]
              } else if (
                resp["responses"][key]["schema"] &&
                resp["responses"][key]["schema"]["items"] &&
                resp["responses"][key]["schema"]["items"]["$ref"]
              ) {
                responseRefs.push(
                  resp["responses"][key]["schema"]["items"]["$ref"]
                );
                resp["responses"][key] = resp["responses"][key]["schema"];
                // resp["responses"][key] = resp["responses"][key]["schema"]["items"]["$ref"]
              } else if ("content" in resp["responses"][key]) {
                let content = resp["responses"][key]["content"];
                let content_types = [
                  "application/json",
                  "application/xml",
                  "application/x-www-form-urlencoded",
                  "multipart/form-data",
                  "text/plain; charset=utf-8",
                  "text/html",
                  "application/pdf",
                  "image/png"
                ];
                for (const content_key of Object.keys(content)) {
                  let content_type_index = content_types.indexOf(content_key);
                  if (content_type_index > -1) {
                    let content_type = content_types[content_type_index];
                    // console.log(content_type)
                    let schema =
                      resp["responses"][key]["content"][content_type]["schema"];
                    if ("type" in schema) {
                      if (schema["type"] == "array") {
                        responseRefs.push(schema["items"]["$ref"]);
                        // resp["responses"][key] = schema["items"]["$ref"]
                      } else if (schema["type"] == "integer") {
                        responseRefs.push(schema);
                        // resp["responses"][key] = schema
                      }
                    } else if ("$ref" in schema) {
                      responseRefs.push(schema["$ref"]);
                      // resp["responses"][key] = schema["$ref"]
                    } else if ("properties" in schema) {
                      responseRefs.push(schema);
                      // resp["responses"][key] = schema
                    }
                    resp["responses"][key] = schema;
                  }
                }
              }
            }

            if (responseRefs.length > 0) {
              // console.log(responseRefs)
              console.log("------creating endpoints-----");
              console.log(resp);
              
              endpointId = await strapi.services.endpoints.create(resp);
              console.log("endpoint id --->", endpointId);
              
              for (let responseRef of responseRefs) {
                // console.log(responseRef)
                let structure;
                if ((typeof responseRef).toLocaleLowerCase() === "string") {
                  for (const splitresponse of responseRef.split("/")) {
                    if (splitresponse != responseRef.split("/")[0]) {
                      if (structure == null) structure = api[splitresponse];
                      else structure = structure[splitresponse];
                    }
                  }
                  // structure = api[responseRef.split("/")[1]][responseRef.split("/")[2]][responseRef.split("/")[3]]
                } else {
                  structure = responseRef;
                  // responseRef = JSON.stringify(responseRef)
                }

                const endResp = {
                  ref_name: responseRef,
                  type: "response",
                  structure: structure,
                  endpoint: {
                    id: endpointId.id
                  }
                };
                console.log("-------endpointref data----");
                console.log(endResp);
                
                strapi.services.endpointref.create(endResp);
              }
            }

            if (endpointId == null) {
              endpointId = await strapi.services.endpoints.create(resp);
            }

            console.log("storing paramters");
            
            if (parameterRef) {
              let structure;
              if ((typeof parameterRef).toLocaleLowerCase() === "string") {
                for (const splitresponse of parameterRef.split("/")) {
                  if (splitresponse != parameterRef.split("/")[0]) {
                    if (structure == null) structure = api[splitresponse];
                    else structure = structure[splitresponse];
                  }
                }
                // structure = api[responseRef.split("/")[1]][responseRef.split("/")[2]][responseRef.split("/")[3]]
              } else {
                structure = responseRef;
                // responseRef = JSON.stringify(responseRef)
              }
              const endResp = {
                ref_name: parameterRef,
                type: "paramter",
                structure: structure,
                endpoint: {
                  id: endpointId.id
                }
              };
              strapi.services.endpointref.create(endResp);
            }
          }
        }
        return { status: "success" };
      },
      function(err) {
        console.log("Error");
        console.log(err);
      }
    );
  },
  swaggerupdate: async ctx => {
    var bodyData = ctx.request.body;
    var SwaggerParser = require("swagger-parser");
    var parser = new SwaggerParser();

    return parser.bundle("http://localhost:1337"+bodyData.swagger_url).then(
      async function(newapi, err) {
        ctx.params = { id: bodyData.endpointpack_id };
        const id = bodyData.endpointpack_id;
        const endpointpack = await strapi.services.endpointpack.findOne({
          id: id
        });
        console.log(endpointpack.swagger_url);
        let return_json = {}
        let data = await parser
          .bundle("http://localhost:1337"+endpointpack.swagger_url)
          .then(
            async function(oldapi, err) {
              console.log("-----------------------------------------");

              newapi = await $RefParser.dereference(newapi);
              // console.log(util.inspect(newapi, false, null));
              // console.log("-----------------------------------------");
              oldapi = await $RefParser.dereference(oldapi);
              // console.log(util.inspect(oldapi, false, null));
              // console.log("-----------------------------------------");

              let endpointIds = {};
              var differences = await diff(oldapi, newapi); 
              if (typeof differences === 'undefined') {
                return_json['status'] = "nochanges"
                return endpointIds
              }
              differences = JSON.parse(JSON.stringify(differences));
              // console.log(util.inspect(differences, false, null));
              let editdiff = [];
              let newdiff = [];
              let deldiff = [];
              let adddiff = [];

              for (const difference of differences) {
                if (difference.path.includes("paths")) {
                  var index = difference.path.findIndex(p => p == "paths");
                  console.log(difference.path.length);
                  
                  if (difference.path.length > (index + 2)) {
                    
                  }

                  console.log(difference.path.length);
                  console.log(index);

                  ///change in ednpoint method items
                  if (difference.path.length > 3) {
                    console.log("change in ednpoint method items");
                    await fetch("http://localhost:1337/graphql", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                      },
                      body: JSON.stringify({
                        query: `{  
                              application(id: "${bodyData.applicationid}") {
                                endpointpacks(where:{id:"${bodyData.endpointpack_id}"}) {
                                  endpoints(where:{endpoint:"${difference.path[index + 1]}" method:"${difference.path[index + 2]}"}) {
                                      id endpoint method description summary 
                                      flows{ 
                                        id 
                                        testcase{
                                          id
                                          name
                                          application{
                                            name
                                          }
                                        }
                                      }
                                  }
                                }
                              }
                            }`
                      })
                    })
                      .then(response => response.json())
                      .then(response => {
  
                        let obj = {
                          endpoints: response.data.application.endpointpacks[0].endpoints,
                          difference: difference
                        };
                        ///its edited
                        editdiff.push(obj);
                      })
                      .catch(error => {
                        Alert.error("Something went wrong");
                        console.log(error);
                      });
                  }
                  ///change in endpoint method
                  else if (difference.path.length === 3) {
                    console.log("change in ednpoint method");
                    await fetch("http://localhost:1337/graphql", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                      },
                      body: JSON.stringify({
                        query: `{  
                              application(id: "${bodyData.applicationid}") {
                                endpointpacks(where:{id:"${bodyData.endpointpack_id}"}) {
                                  endpoints(where:{endpoint:"${difference.path[index + 1]}" method:"${difference.path[index + 2]}"}) {
                                      id endpoint method description summary 
                                      flows{ 
                                        id 
                                        testcase{
                                          id
                                          name
                                          application{
                                            name
                                          }
                                        }
                                      }
                                  }
                                }
                              }
                            }`
                      })
                    })
                      .then(response => response.json())
                      .then(response => {
  
                        let obj = {
                          endpoints: response.data.application.endpointpacks[0].endpoints,
                          difference: difference
                        };
                        if (difference.kind == "E") {
                          editdiff.push(obj);
                        }
                        else if (difference.kind == "N") {
                          newdiff.push(obj);
                        }
                        else if (difference.kind == "D") {
                          deldiff.push(obj);
                        }
                        else if (difference.kind == "A") {
                          adddiff.push(obj);
                        }
                      })
                      .catch(error => {
                        Alert.error("Something went wrong");
                        console.log(error);
                      });                    
                  }
                  ///change in endpoint
                  else if (difference.path.length === 2) {
                    console.log("change in endpoint");
                    await fetch("http://localhost:1337/graphql", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                      },
                      body: JSON.stringify({
                        query: `{  
                              application(id: "${bodyData.applicationid}") {
                                endpointpacks(where:{id:"${bodyData.endpointpack_id}"}) {
                                  endpoints(where:{endpoint:"${difference.path[index + 1]}"}) {
                                      id endpoint method description summary 
                                      flows{ 
                                        id 
                                        testcase{
                                          id
                                          name
                                          application{
                                            name
                                          }
                                        }
                                      }
                                  }
                                }
                              }
                            }`
                      })
                    })
                      .then(response => response.json())
                      .then(response => {
  
                        let obj = {
                          endpoints: response.data.application.endpointpacks[0].endpoints,
                          difference: difference
                        };
                        if (difference.kind == "E") {
                          editdiff.push(obj);
                        }
                        else if (difference.kind == "N") {
                          newdiff.push(obj);
                        }
                        else if (difference.kind == "D") {
                          deldiff.push(obj);
                        }
                        else if (difference.kind == "A") {
                          adddiff.push(obj);
                        }
                      })
                      .catch(error => {
                        Alert.error("Something went wrong");
                        console.log(error);
                      });
                  }else{
                    let obj = {
                      endpoints: [],
                      difference: difference
                    };
                    adddiff.push(obj);
                  }
                  
                }
              }
              endpointIds['Edited'] = editdiff
              endpointIds['Deleted'] = deldiff
              endpointIds['New'] = newdiff
              endpointIds['Added'] = adddiff
              return_json['status'] = "success"

              return endpointIds;
            },
            function(err) {
              console.log("Error");
              console.log(err);
              return_json['status'] = "fail"
            }
          );
        
        let endpointpack_data = {
          endpointpack_id:bodyData.endpointpack_id,
          new_swagger_url:bodyData.swagger_url
        }
        return_json['data'] = data
	      return_json['endpointpack_data'] = endpointpack_data;

        return return_json;
      },
      function(err) {
        console.log("Error");
        console.log(err);
      }
    );
  },
  swaggerconfirm: async ctx => {

    try {
      var bodyData = ctx.request.body;
      console.log(bodyData);
      for (const key in bodyData.endpoints) {
        for (const diffs of bodyData.endpoints[key]) {
          for (const endpoint of diffs.endpoints) {
            console.log(endpoint.id);
            let request_data = {
              conflict: true,
              conflict_message: JSON.stringify(diffs.difference)
            };
            await strapi.services.endpoints.update({ id: endpoint.id }, request_data);
            for (const flow of endpoint.flows) {
              console.log(flow);
              await strapi.services.testcase.update({ id: flow.testcase.id }, request_data);
            }
          }
        }
      }
      let req_data = {
        swagger_url:bodyData.endpointpack_data.new_swagger_url
      }
      await strapi.services.endpointpack.update({ id: bodyData.endpointpack_data.endpointpack_id }, req_data);
  
      return { status: "success" };
    } catch (error) {
      return { status: "fail"}
    }
  }
};
