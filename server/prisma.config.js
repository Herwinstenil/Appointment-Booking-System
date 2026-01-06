// prisma.config.js
require('dotenv').config();

module.exports = {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:STENIL@2003@localhost:5432/appointment_booking?schema=public',
  },
};
