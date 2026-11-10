import express from "express"
import cors from "cors"
import 'dotenv/config'
import { MongoClient } from 'mongodb';


const app = express()
const port = process.env.PORT ||  5000

const client = new MongoClient(process.env.MONGODB_USER_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectedClient = await connectToMongoDB()
const database = connectedClient.db("hire-loop")

const usersCollection = database.collection("user")
const jobsCollection = database.collection("jobs")


app.use(cors())
app.use(express.json())

app.get("/", (req,res) =>{
    res.send({message: "hireLoop is Looping"})
})

app.get("/users" , async (req,res) =>{
    const cursor = await usersCollection.find({}).toArray()
    res.send(cursor)
})

// Jobs Related API

app.post("/jobs", async(req,res) => {
  const job = req.body
  const result = await jobsCollection.insertOne(job)
  res.send(result)
})

app.listen(port, () => {
    console.log(`Server is Running on Port ${port}`);
})