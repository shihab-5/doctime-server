const express = require('express')
const app = express()
const dotenv=require('dotenv')
const cors=require('cors')
dotenv.config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT|| 5000

app.use(cors())
app.use(express.json())

const uri = process.env.MONGODB_URI;

// doctime-fMrR3YMWiHvtRr0Y

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const run= async()=>{

  try {

    const database = client.db("doctime");
    const userCollection = database.collection("appointments");
    const bookings = database.collection("bookings");
    const user=database.collection("user")


    app.get('/appointments',async(req,res)=>{
      const cursor=userCollection.find();
      const result=await cursor.toArray();
      res.send(result);

    })
    app.get('/user',async(req,res)=>{
      const cursor=user.find();
      const result=await cursor.toArray();
      res.send(result);

    })

        app.get('/appointments/:id',(req,res,next)=>{
      const header=req.headers.authorization
      if(header=='logged in'){
        next()
      }
      else
      {
        res.status(401).json({message:"unauthorized"})
      }
        }, 
          async(req,res)=>{
          const id=req.params.id;
        console.log(id);
        const query ={
          _id:new ObjectId(id)
        }
        const user=await userCollection.findOne(query);
        console.log(id)
        res.send(user);
        })
        

        // app.delete('/users/:id',async(req,res)=>{
        //   const id =req.params.id;
        //   const query={
        //     _id:new ObjectId(id)
        //   }
        //   const user=await userCollection.deleteOne(query);
        //   res.send(user);
        // })
        app.patch('/user/:id',async(req,res)=>{
          const {id}=req.params;
          const updateData= req.body;

          const result=await user.updateOne(
            {_id:new ObjectId(id)},
            {$set:updateData}
          )

          res.json(result)
          
        })

        // app.post('/users',async(req,res)=>{
        //   const newUser=req.body;
        //   const result=await userCollection.insertOne(newUser);
        //   console.log("new user",newUser)
        //   res.send(result)

        // })
           app.post('/bookings',async(req,res)=>{
          const newUser=req.body;
          const result=await bookings.insertOne(newUser);
          console.log("new user",newUser)
          res.send(result)

        })
        
        app.get('/bookings/:userId',async(req,res)=>{
          const {userId}=req.params;

          const result=await bookings.find({ userId :userId}).toArray();
          res.json(result)
          
        })
        app.delete('/bookings/:bookingId',async(req,res)=>{
          const {bookingId}=req.params;

          const result=await bookings.deleteOne({ _id :new ObjectId(bookingId)});
          res.json(result)
          
        })

//         app.patch('/bookings/:bookingId', async (req, res) => {
//   const { bookingId } = req.params;
//   const updateData = req.body;

//   // try {
//     const result = await bookings.updateOne(
//       { _id: new ObjectId(bookingId) },
//       { $set: updateData }
//     );
//     res.json(result);
//   // } catch (err) {
//   //   console.error('Error updating booking:', err);
//   //   res.status(500).json({ error: 'Failed to update booking' });
//   // }
// });

            app.patch('/bookings/:bookingId',async(req,res)=>{
          const {bookingId}=req.params;
          const updateData= req.body;

          const result=await bookings.updateOne(
            {_id: new ObjectId(bookingId) },
            {$set:updateData}
          )

          res.json(result)
          
        })

//         app.patch('/bookings/:bookingId', async (req, res) => {
//   const { bookingId } = req.params;
//   const updateData = req.body;

//   const result = await user.updateOne(
//     { _id: new ObjectId(bookingId) },  // ✅ wrap with ObjectId
//     { $set: updateData }
//   );

//   res.json(result);
// });





    //       app.get('/bookings',async(req,res)=>{
    //   const cursor=bookings.find();
    //   const result=await cursor.toArray();
    //   res.send(result);

    // })


    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }

}


run().catch(console.dir)