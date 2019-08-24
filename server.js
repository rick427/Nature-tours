const mongoose = require('mongoose');
require('dotenv').config({
  path: './config.env'
});

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

//: DATABASE CONNECTION
const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful'));


//: SERVER
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});