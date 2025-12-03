const mongoose = require("mongoose");

DB_URL = "mongodb://localhost:27017/jobsdb"

// connecting to the database:

const dbConnect = async() => {
    try {
        await mongoose.connect(DB_URL);
        console.log("MONGODB IS CONNECTED!!");
        
    } catch (error) {
        console.error("Some issue with the db connection", error);
        await mongoose.connection.close(false); // this will allow active ops to finish and then exit.
        process.exit(1);

    }
};

module.exports = dbConnect;
