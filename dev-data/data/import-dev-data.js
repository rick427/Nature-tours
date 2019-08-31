const mongoose = require('mongoose');
require('dotenv').config({
    path: './config.env'
});
const fs = require('fs');
const Tours = require('../../models/Tour');

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

(async () => {
    try {
        await mongoose.connect(db, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useFindAndModify: false
        })
        console.log('Database Connection Secured..');
    } catch (error) {
        console.log(error);
    }
})();

//READ FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tours.create(tours);
        console.log('Data successfully loaded!..');
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

//DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tours.deleteMany();
        console.log('Data successfully deleted!..');
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}
//console.log(process.argv);