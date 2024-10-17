// src/config/adminjs.config.js

import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import db from '../db/index.js';

AdminJS.registerAdapter(AdminJSSequelize);

const adminJsConfig = {
  databases: [db],
  rootPath: '/admin',
  resources: Object.values(db.models).map(model => ({
    resource: model,
    options: {
      navigation: {
        name: model.name,
        icon: 'Database',
      },
    },
  })),
  branding: {
    companyName: 'LagProperty Admin',
    logo: false,
    softwareBrothers: false
  },
};

const adminJs = new AdminJS(adminJsConfig);
const adminRouter = AdminJSExpress.buildRouter(adminJs);

export { adminJs, adminRouter };