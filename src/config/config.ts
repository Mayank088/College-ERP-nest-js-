/* eslint-disable prettier/prettier */
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  mongodbUrl: process.env.MONGODB_URL,
  jwtSecret: process.env.SECRET_KEY,
});
