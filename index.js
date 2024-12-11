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

// const uri = 'mongodb://localhost:27017';

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

    const campaignCollection = client.db("crowdDB").collection('campaign');

    await client.db("crowdDB").command({
      ping: 1
    });
    console.log("Pinged your deployment.You successfully connected to MongoDB!");

    app.get('/getAllCampaigns', async (req, res) => {
      const allCampaigns = campaignCollection.find();
      const result = await allCampaigns.toArray();
      res.send(result);
    });

    app.post('/addCampaign', async (req, res) => {
      const newCampaign = req.body;
      const result = await campaignCollection.insertOne(newCampaign);
      res.send(result);
    });

    app.get('/getMyCampaign/:email', async (req, res) => {
      const email = {
        email: req.params.email,
      };

      const getMyCampaign = await (campaignCollection.find(email)).toArray();
      res.send(getMyCampaign);
    })
  } catch (err) {
    await client.close();
    console.log(err);
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('server is running');
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});