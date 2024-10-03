const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
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
        const usercollection = client.db('bistrodb').collection('user')
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

        // jwt related api's
        app.post('/jwt', async(req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
            res.send({token})
        })

        // user's api

        app.get('/user', async(req, res)=>{
            const result = await usercollection.find().toArray();
            res.send(result)
        })
        app.post('/user', async(req, res)=>{
            const newUser = req.body;
            // check if user already exist using email as an unique entity
            const query={email: newUser.email}
            const existUser = await usercollection.findOne(query)
            if(existUser){
                return res.send({message:'user already exist', insertedId:null})
            }
            const result = await usercollection.insertOne(newUser);
            res.send(result);
        })
        app.patch('/user/admin/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const updatedDoc = {
                $set:{
                    role:'admin'
                }
            }
            const result = await usercollection.updateOne(filter, updatedDoc);
            res.send(result)
        })
        app.delete('/user/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result= await usercollection.deleteOne(query);
            res.send(result);
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
        app.delete(`/cart/:id`, async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await cartcollection.deleteOne(query);
            res.send(result)
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