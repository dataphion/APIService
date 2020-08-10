module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "f472369bd356df6c306df56e309af8eb"),
    },
  },
  rmq: env("RMQ_HOST", "amqp://localhost"),
  rmq_queue: env("RMQ_QUEUE_NAME", "highlight_queue"),
  strapi_host: env("STRAPI_HOST", "http://localhost:1337"),
  vision_api_host: env("API_HOST", ""),
  protractor_host: env("PROTRACTOR_HOST", ""),
  protractor_path: env("PROTRACTOR_PATH", "/usr/bin/protractor"),
  executor_path: env("EXECUTOR_PATH", "/usr/src/dataphion/ai_testing"),
  testdecider: "testdecider",
  decider: "decider",

  // FOR PERMISSIONS SCRIPT
  admin_firstname: env("STRAPI_ADMIN_FIRSTNAME", "EASEL"),
  admin_lastname: env("STRAPI_ADMIN_LASTNAME", "QA"),
  admin_email: env("STRAPI_ADMIN_EMAIL", "urvesh.dungrani@dataphion.com"),
  admin_password: env("STRAPI_ADMIN_PASSWORD", "Aitester@123"),
  admin_login_url: env("STRAPI_ADMIN_LOGIN_URL", "http://localhost:1337/admin/login"),
  admin_register_url: env("STRAPI_ADMIN_REGISTER_URL", "http://localhost:1337/admin/register-admin"),
  role_public_url: env("STRAPI_ROLE_PUBLIC_URL", "http://localhost:1337/users-permissions/roles/2"),
});
