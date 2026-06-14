const express = require('express')
const app = express()
const dotenv=require('dotenv')
const cors=require('cors')
dotenv.config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs')
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

const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

const run= async()=>{

  try {

    const database = client.db("doctime");
    const userCollection = database.collection("appointments");
    const bookings = database.collection("bookings");
    const user=database.collection("user")


    app.get('/appointments',async(req,res)=>{
      let cursor;
      const { search } = req.query;
      if(search){
      cursor=await userCollection.find({
        // title: {$regex:search,$options:'i'}
                 $or: [
            {
              title: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              name: {
                $regex: search,
                $options: 'i',
              },
            },
          ],
      })
      }
      else
        {
          cursor=userCollection.find();
        } 
      const result=await cursor.toArray();
      res.send(result);

    })
    app.get('/user',async(req,res)=>{
      const cursor=user.find();
      const result=await cursor.toArray();
      res.send(result);

    })

        app.get('/appointments/:id',verifyToken, async(req,res)=>{
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
        app.patch('/user/:id',verifyToken,async(req,res)=>{
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
           app.post('/bookings',verifyToken,async(req,res)=>{
          const newUser=req.body;
          const result=await bookings.insertOne(newUser);
          console.log("new user",newUser)
          res.send(result)

        })
        
        app.get('/bookings/:userId',verifyToken,async(req,res)=>{
          const {userId}=req.params;

          const result=await bookings.find({ userId :userId}).toArray();
          res.json(result)
          
        })
        app.delete('/bookings/:bookingId',verifyToken,async(req,res)=>{
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

            app.patch('/bookings/:bookingId',verifyToken,async(req,res)=>{
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


    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }

}


run().catch(console.dir)