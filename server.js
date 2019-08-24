const mongoose = require('mongoose');
require('dotenv').config({
  path: './config.env'
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
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});