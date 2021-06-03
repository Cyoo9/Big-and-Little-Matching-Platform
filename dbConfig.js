require('dotenv').config();

const { Client } = require("pg");


const isProduction = process.env.NODE_ENV === "production"; 

//const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
//const connectionString = 'postgresql://pjdhybmqyktzdi:d0669e368ec16f0076bb2953e7fabdf6adc9db7c75cd63272432f4db37a0894e@ec2-34-195-233-155.compute-1.amazonaws.com:5432/dapbrp5btf89rj';
const connectionString = 'postgres://pjdhybmqyktzdi:d0669e368ec16f0076bb2953e7fabdf6adc9db7c75cd63272432f4db37a0894e@ec2-34-195-233-155.compute-1.amazonaws.com:5432/dapbrp5btf89rj'
console.log(connectionString);
/*const pool = new Pool({ 
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString
});*/


const client = new Client({
    user: "pjdhybmqyktzdi",
    password: "d0669e368ec16f0076bb2953e7fabdf6adc9db7c75cd63272432f4db37a0894e",
    database: "dapbrp5btf89rj",
    port: 5432,
    host: "ec2-34-195-233-155.compute-1.amazonaws.com",
    ssl: { rejectUnauthorized: false }
}); 
//client.connect();

client.connect((err, client, release) => {
  console.log("TRYING TO CONNECT...");
  if (err) {
    return console.error('Error acquiring client', err.stack)
  }
  console.log("Connected Successfully!");
});

module.exports = { client };
