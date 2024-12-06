const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const {
  MongoClient,
  ServerApiVersion
} = require('mongodb');
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.NAME}:${process.env.SECURITY_KEY}@cluster0.bk0nm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const crowdCollection = client.db("crowdDB").collection('crowd');

    await client.db("crowdDB").command({
      ping: 1
    });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/getCrowd', async (req, res) => {
      const result = JSON.stringify(client.db('crowdDB').collection('crowd'));
      res.send(result);
    })

    app.post('/addCrowd', async (req, res) => {
      const newCrowd = req.body;
      const result = await crowdCollection.insertOne(newCrowd);
      res.send(result);
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('server is running');
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});