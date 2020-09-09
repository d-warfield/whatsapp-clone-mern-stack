// import 
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: '1069467',
  key: '19540d82bde150d7b8fa',
  secret: '0996c2c9c52fa2e23387',
  cluster: 'us2',
  encrypted: true
});

// middleware
app.use(express.json());
app.use(cors());

// DB config
const connection_url = 'mongodb+srv://admin:<>@cluster0.azts0.mongodb.net/whatsappdb?retryWrites=true&w=majority'

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.once('open', () => {
  console.log('DB is connected');
  const msgCollection = db.collection('messagecontents');
  const changeStream = msgCollection.watch();

  changeStream.on('change', (change) => {
    console.log("A change occured: ", change);

    if (change.operationType === 'insert') {
      const messageDetails = change.fullDocument;
      pusher.trigger('messages', 'inserted',
        {
          name: messageDetails.name,
          message: messageDetails.message,
          timestamp: messageDetails.timestamp,
        }
      );
    } else {
      console.log('Error triggering Pusher')
    }
  });
});


// API routes
app.get('/', (req, res) => res.status(200).send('hello world'));

app.get('/messages/sync', (req, res) => {

  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(200).send(data)
    }
  })
})

app.post('/messages/new', (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(201).send(data)
    }
  })
})

// listener
app.listen(port, () => console.log(`Homie is listening on localhost: ${port}`));

// qVL6G9d0i7nZdrcp
