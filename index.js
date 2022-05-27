const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
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