const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nluq1.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
  res.send("Hello World!")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const ServiceCollection = client.db("creativeAgency").collection("services");
  const FeedbackCollection = client.db("creativeAgency").collection("feedback");
  const OrderCollection = client.db("creativeAgency").collection("orders");
  const AdminCollection = client.db("creativeAgency").collection("admins");
  const MessageCollection = client.db("creativeAgency").collection("messages");

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const service = req.body.service;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    };
    ServiceCollection.insertOne({ service, description, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.get('/services', (req, res) => {
    ServiceCollection.find({})
      .toArray((error, documents) => {
        res.send(documents)
      })
  });

  app.post('/addFeedback', (req, res) => {
    const name = req.body.name;
    const company = req.body.company;
    const description = req.body.description;
    const photo = req.body.photo;
    FeedbackCollection.insertOne({ name, company, description, photo })
      .then(result => {
        res.send(result.insertedCount > 0)
        console.log(result);
      })
  });

  app.get('/feedbacks', (req, res) => {
    FeedbackCollection.find({}).limit(6)
      .toArray((error, documents) => {
        res.send(documents)
      })
  });

  app.post('/addOrder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const service = req.body.service;
    const details = req.body.details;
    const price = req.body.price;
    const status = req.body.status;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    };
    OrderCollection.insertOne({ name, email, service, details, price, status, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.get('/orders', (req, res) => {
    OrderCollection.find({})
      .toArray((error, documents) => {
        res.send(documents)
      })
  });

  app.get('/orderedService', (req, res) => {
    OrderCollection.find({ email: req.query.email })
      .toArray((error, documents) => {
        res.send(documents)
      });
  });

  app.patch('/updateOrderStatus/:_id', (req, res) => {
    OrderCollection.updateOne(
      {
        _id: ObjectId(req.params._id)
      },
      {
        $set: { status: req.body.status },
      }
    )
      .then((result) => {
        console.log(result);
        res.send(result.modifiedCount > 0);
      });
  });

  app.post('/addAdmin', (req, res) => {
    const email = req.body.email;
    AdminCollection.insertOne({ email })
      .then(result => {
        res.send(result.insertedCount > 0)
        console.log(result);
      })
  });

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    AdminCollection.find({ email: email })
      .toArray((error, admin) => {
        res.send(admin.length > 0)
      })
  });

  app.post('/messages', (req, res) => {
    const documents = req.body;
    MessageCollection.insertOne(documents)
      .then(result => {
        res.send(result.insertedCount > 0)
        console.log(result);
      })
  });
});

app.listen(process.env.PORT || port);

