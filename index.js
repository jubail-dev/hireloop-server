import express from "express"
import cors from "cors"
import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb';


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
const applicationsCollection = database.collection("applications")


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

app.get("/jobs", async(req,res) =>{

  const query = {}

  console.log(req.query)

  if(req.query){
    if(req.query.jobType){
      query.jobType = req.query.jobType
    }
    if(req.query.isRemote){
      query.isRemote = req.query.isRemote === 'true'
    }
    if(req.query.category){
      query.category = req.query.category
    }
    if(req.query.search){
      const search = req.query.search
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        {responsibilities: { $regex: search, $options: 'i' } },
        {qualifications: { $regex: search, $options: 'i' } },
      ]
    }
  }

  const cursor = await jobsCollection.find(query).toArray()
  res.send(cursor)
})
app.get("/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Invalid job ID",
      })
    }

    const job = await jobsCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!job) {
      return res.status(404).send({
        message: "Job not found",
      })
    }

    res.send(job)
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch job",
    })
  }
})

app.post("/jobs", async(req,res) => {
  const job = req.body
  const result = await jobsCollection.insertOne(job)
  res.send(result)
})

app.delete("/jobs/:id", async(req,res) => {
  const id = req.params.id
  const query = {_id: new ObjectId(id)}
  const result = await jobsCollection.deleteOne(query)
  res.send(result)
})

// Applications Related API
app.post("/applications", async(req,res) => {
  const application = req.body
  const result = await applicationsCollection.insertOne(application)
  res.send(result)
})

app.listen(port, () => {
    console.log(`Server is Running on Port ${port}`);
})