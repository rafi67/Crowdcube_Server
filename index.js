const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const {
  MongoClient,
  ServerApiVersion,
  ObjectId
} = require('mongodb');
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());


// const uri = `mongodb+srv://${process.env.NAME}:${process.env.SECURITY_KEY}@cluster0.bk0nm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const uri = 'mongodb://localhost:27017';

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
    const donationCollection = client.db('crowdDB').collection('donation');

    await client.db("crowdDB").command({
      ping: 1
    });
    console.log("Pinged your deployment.You successfully connected to MongoDB!");

    app.get('/getAllCampaigns', async (req, res) => {
      const allCampaigns = campaignCollection.find();
      const result = await allCampaigns.toArray();
      res.send(result);
    });

    app.post('/addMultipleCampaign', async (req, res) => {
      const campaigns = req.body;
      const options = {
        ordered: true
      };
      const result = await campaignCollection.insertMany(campaigns, options);
      res.send(result);
    });

    app.post('/addCampaign', async (req, res) => {
      const newCampaign = req.body;
      const result = await campaignCollection.insertOne(newCampaign);
      res.send(result);
    });

    app.post('/addDonation', async (req, res) => {
      const newDonation = req.body;
      const result = await donationCollection.insertOne(newDonation);
      res.send(result);
    });

    app.put('/updateCampaign/:id', async (req, res) => {
      const update = req.body;
      const id = req.params.id;
      const filter = {
        _id: new ObjectId(id),
      };

      const options = {
        upsert: true
      };
      const campaign = {
        $set: {
          name: update.name,
          email: update.email,
          title: update.title,
          type: update.type,
          amount: parseInt(update.amount),
          deadLine: update.deadLine,
          photo: update.photo,
          description: update.description,
        },
      };
      const result = await campaignCollection.updateOne(filter, campaign, options);

      res.send(result);
    });

    app.delete('/deleteCampaign/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await campaignCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/getCampaign/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await campaignCollection.findOne(query);
      res.send(result);
    });

    app.get('/getDonation/:email', async (req, res) => {
      const email = req.params.email;
      const filter = {
        email: email,
      };

      const campaigns = await campaignCollection.find().toArray();

      const donations = await donationCollection.find(filter).toArray();

      let donationData = [];

      donations.map(donation => {
        const campaign = campaigns.find(c => c._id.toString() === donation.donatedId.toString());

        if (campaign !== 'undefined') {
          const title = campaign.title;
          const photo = campaign.photo;
          const type = campaign.type;
          const amount = donation.donatedAmount;

          const data = {
            title: title,
            photo: photo,
            type: type,
            amount: amount,
          };

          donationData.push(data);
        }

      });

      console.log(donationData);

      res.send(donationData);
    });

    app.get('/getMyCampaign/:email', async (req, res) => {
      const filter = {
        email: req.params.email,
      };

      const getMyCampaign = await (campaignCollection.find(filter)).toArray();
      res.send(getMyCampaign);
    });
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