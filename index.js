const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mym2gsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const menucollection = client.db('bistrodb').collection('menu')
        const reviewcollection = client.db('bistrodb').collection('review')
        const cartcollection = client.db('bistrodb').collection('cart')

        app.get('/menu', async(req, res) => {
            const result =await menucollection.find().toArray()
            res.send(result)
        })
        app.get('/review', async(req, res) => {
            const result =await reviewcollection.find().toArray()
            res.send(result)
        })
        // cart api

        app.post('/cart', async(req, res)=>{
            const cartItem = req.body;
            const result = await cartcollection.insertOne(cartItem);
            res.send(result)
        })
        app.get('/cart', async(req, res)=>{
            const email = req.query.email;
            const query = {email: email}
            const result = await cartcollection.find(query).toArray();
            res.send(result);
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('bistro boss server is running')
})
app.listen(port, () => {
    console.log(`bistro boss server is running on port : ${port}`)
})