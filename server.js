const app = require('./app');

//: SERVER
const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));