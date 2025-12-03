require('dotenv').config({
    
    path: "C:/Users/Ritik Roushan/Desktop/lab/jss/.env"
});

const connection = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    
}
module.exports = connection;
