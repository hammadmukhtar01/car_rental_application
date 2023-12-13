/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const db = process.env.DATABASE;
mongoose.set('strictQuery', true);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connection Success!'));

const port = process.env.PORT || 8000;

const server = http.createServer(app);

const io = new Server(server, {});

console.log(`Server is Running in ${process.env.NODE_ENV} mode`);

// eslint-disable-next-line no-unused-vars
const server1 = server.listen(port, () => {
  console.log(`Server is listening on Port ${port}`);
});

// const io = require('socket.io')(server);

// const socket = require('./utils/chatSocket');

// socket(io);
