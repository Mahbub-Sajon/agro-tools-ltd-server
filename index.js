const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


// middleware
app.use(cors({origin: "*"}));
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.himqs6g.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
await client.connect();
const productsCollection = client.db('agroTools').collection('products');
const orderCollection = client.db('agroTools').collection('order');
const reviewCollection = client.db('agroTools').collection('review');
const userCollection = client.db('agroTools').collection('users');


function verifyJWT (req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unAuthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){

            return res.status(403).send({message: 'Forbidden access'})
        }
        req.decoded = decoded;
        next();
    });
} 


//product showing in ui 
app.get('/products', async(req, res) =>{
    const query = {};
    const cursor = productsCollection.find(query);
    const products = await cursor.toArray();
    res.send(products);
});

//review showing
app.get('/review', async(req, res) =>{
    const query = {};
    const cursor = reviewCollection.find(query);
    const review = await cursor.toArray();
    res.send(review);
});



//ordered product showing in ui
app.get('/ordered-products', verifyJWT, async(req, res) =>{
    const email = req.query.email;

    const decodedEmail = req.query.email;
    if( email === decodedEmail){
        const query = {email: email};
        const cursor = orderCollection.find(query);
        const orders = await cursor.toArray();
        return res.send(orders);
    }
    else{
        return res.status(403).send({message: 'Forbidden access'});
    }
});

//canceling order
app.delete('/ordered-products/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result = await orderCollection.deleteOne(query);
    res.send(result);
})


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
});

app.get('/order/:id', verifyJWT, async(req, res) => {
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const order = await orderCollection.findOne(query);
    res.send(order);
})



app.post('/create-payment-intent', verifyJWT, async (req, res) => {
    const product = req.body;
    const price = product.price;
    const amount = price*100;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
    });
    res.send({clientSecret: paymentIntent.client_secret})
});



app.get('/all-users', verifyJWT, async(req, res) => {
    const users = await userCollection.find().toArray();
    res.send(users);
});



app.get('/admin/:email', async(req, res) =>{
    const email = req.params.email;
    const user = await userCollection.findOne({email: email});
    const isAdmin = user.role === 'admin';
    res.send({admin: isAdmin})
})



app.put('/user/admin/:email', verifyJWT, async(req, res) => {
    const email = req.params.email;
    const requester = req.decoded.email;
    const requesterAccount = await userCollection.findOne({email: requester});
    if(requesterAccount.role === 'admin'){
        const filter = {email: email};
        const updateDoc = {
            $set: {role: 'admin'}, 
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
    }
    else{
        res.status(403).send({message: 'forbidden'});
    }
   
})


app.put('/user/:email', async(req, res) => {
    const email = req.params.email;
    const user = req.body;
    const filter = {email: email};
    const options = {upsert: true};
    const updateDoc = {
        $set: user, 
    };
    const result = await userCollection.updateOne(filter, updateDoc, options);
    const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
    res.send({result, token});
})

// review
app.post('/review', async(req, res) =>{
    const review = req.body;
    const result = await reviewCollection.insertOne(review);
    res.send(result);
});



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