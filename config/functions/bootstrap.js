"use strict";

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/3.0.0-beta.x/configurations/configurations.html#bootstrap
 */

module.exports = () => {
  setTimeout(async () => {
    try {
      const axios = require("axios");
      const io = require("socket.io")(strapi.server);
      // ==================== AUTO PERMISSIONS SCRIPT ====================
      permissions(axios);

      // ============================== SOCKET IO START==============================
      // listen for user connection
      io.on("connection", (socket) => {
        strapi.log.debug("connected");
        // listen for user diconnect
        // _socket = socket;
        // strapi._socket = socket;
        socket.on("api_execution", function (data) {
          socket.emit("broadcast", data);
          socket.broadcast.emit("broadcast", data);
          console.log("I received ", data);
        });
        socket.on("ui_execution", function (data) {
          socket.broadcast.emit(data.testcase_id + "_play_back", data);
          console.log("I received ", data);
        });

        // ============================== FOR MOBILE TESTCASE ==============================
        socket.on("connected_desktop_agent", async (data) => {
          socket.broadcast.emit(`connected_desktop_agent_${data.ip}`, data);
          // const getAgents = await strapi
          //   .query("nativeagents")
          //   .findOne({ ip: data.ip });
          // if (!getAgents && data.status === "online") {
          //   strapi.services.nativeagents.create({
          //     os: data.os,
          //     ip: data.ip,
          //     status: data.status,
          //   });
          // } else if (getAgents.id && data.status === "offline") {
          //   strapi.services.nativeagents.delete({ id: getAgents.id });
          // }
        });

        socket.on("create_recording_session", (data) => {
          socket.broadcast.emit(`create_recording_session_${data.ip}`, data);
        });

        socket.on("send_created_session_data", (data) => {
          socket.broadcast.emit(`send_created_session_data_${data.ip}`, data);
        });

        socket.on("REFRESH", (data) => {
          socket.broadcast.emit(`REFRESH_${data.ip}`, data);
        });

        socket.on("TAP", (data) => {
          socket.broadcast.emit(`TAP_${data.ip}`, data);
        });

        socket.on("FOCUS", (data) => {
          socket.broadcast.emit(`FOCUS_${data.ip}`, data);
        });

        socket.on("SENDKEYS", (data) => {
          socket.broadcast.emit(`SENDKEYS_${data.ip}`, data);
        });

        socket.on("PLAYBACK", (data) => {
          socket.broadcast.emit(`PLAYBACK_${data.ip}`, data);
        });

        // ============================== END MOBILE TESTCASE ==============================

        socket.on("disconnect", () =>
          strapi.log.debug("A user disconnected\n")
        );
      });
      strapi.io = io; // register socket io inside strapi main object to use it globally anywhere

      strapi.updatePortal = (data) => {
        // let socketid=Object.keys(io.engine.clients)[1]
        io.emit(data.user_id + "_record", data);
        console.log("SENDING TO " + data.user_id + "\n");
        console.log(data);
        console.log("DATA SENT TO PORTAL FOR RECORD\n");
      };
      strapi.updatePortalPlayback = (data) => {
        // let socketid=Object.keys(io.engine.clients)[1]

        io.emit(data.user_id + "_play_back", data);
        console.log("SENDING TO " + data.user_id + "\n");
        console.log(data);
        console.log("\nDATA SENT TO PORTAL FOR PLAYBACK\n");
      };
    } catch (error) {
      console.log(error);
      console.log("ERROR IN BOOTSTRAP.JS");
    }
  }, 7000);
};

// ============================== Functions for AUTO PERMISSIONS SCRIPT START ==============================
const permissions = async (axios) => {
  try {
    // Check if admin is created or not
    const token = await checkAdmin(axios);

    // Get all schema and permissions
    const getPermission = await axios({
      method: "get",
      url: strapi.config.get(
        "server.role_public_url",
        "http://localhost:1337/users-permissions/roles/2"
      ),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const role = getPermission.data.role;

    for (const i0 of Object.keys(role.permissions)) {
      const type = role.permissions[i0].controllers;
      for (const i1 of Object.keys(type)) {
        for (const i2 of Object.keys(type[i1])) {
          if (type[i1][i2].enabled == false) {
            type[i1][i2].enabled = true;
          }
        }
      }
    }

    // Enable all necessary permissions.
    await axios({
      method: "put",
      url: strapi.config.get(
        "server.role_public_url",
        "http://localhost:1337/users-permissions/roles/2"
      ),
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: role,
    });

    strapi.log.debug("All permissions given successfully.");
    return "done";
  } catch (error) {
    console.log(error);
  }
};

const checkAdmin = async (axios) => {
  // Login admin
  try {
    const loginBody = {
      email: strapi.config.get(
        "server.admin_email",
        "admin@easelqa.com"
      ),
      password: strapi.config.get("server.admin_password", "easelqa@123"),
    };
    const checkAdmin = await axios.post(
      strapi.config.get(
        "server.admin_login_url",
        "http://localhost:1337/admin/login"
      ),
      loginBody
    );
    strapi.log.debug("Admin login successfully.");
    return checkAdmin.data.data.token;
  } catch (error) {
    // If login fail
    strapi.log.debug("Admin login failed.");
    return registerAdmin(axios);
  }
};

const registerAdmin = async (axios) => {
  // Register admin
  try {
    const regBody = {
      firstname: strapi.config.get("server.admin_firstname", "EASEL"),
      lastname: strapi.config.get("server.admin_lastname", "QA"),
      email: strapi.config.get(
        "server.admin_email",
        "admin@easelqa.com"
      ),
      password: strapi.config.get("server.admin_password", "easelqa@123"),
    };
    const createAdmin = await axios.post(
      strapi.config.get(
        "server.admin_register_url",
        "http://localhost:1337/admin/register-admin"
      ),
      regBody
    );
    strapi.log.debug("Admin registered successfully.");
    return createAdmin.data.data.token;
  } catch (error) {
    console.log(error);
  }
};
// ============================== Functions for AUTO PERMISSIONS SCRIPT END ==============================
