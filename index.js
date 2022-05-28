const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
require('dotenv').config();


// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.himqs6g.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
await client.connect();
const productsCollection = client.db('agroTools').collection('products');

const orderCollection = client.db('agroTools').collection('order');


//product showing in ui 
app.get('/products', async(req, res) =>{
    const query = {};
    const cursor = productsCollection.find(query);
    const products = await cursor.toArray();
    res.send(products);
});

//ordered product showing in ui
app.get('/ordered-products', async(req, res) =>{
    const email = req.query.email;
    const query = {email: email};
    const cursor = orderCollection.find(query);
    const orders = await cursor.toArray();
    res.send(orders);
});




//placing order
app.get('/place-order/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const product = await productsCollection.findOne(query);
    res.send(product);
});

//order collection 
app.post('/order', async(req, res) =>{
    const order = req.body;
    const result = await orderCollection.insertOne(order);
    res.send(result);
})




}

    finally {

    }


}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello form agro world!')
})

app.listen(port, () => {
    console.log(`Agro tools is running in ${port}`)
})