import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import SSLCommerzPayment from "sslcommerz-lts";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { createRemoteJWKSet, jwtVerify } from "jose-cjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = false; //true for live, false for sandbox
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_DB_URI;

if (!uri) {
  throw new Error("MONGO_DB_URI is missing. Check your .env file.");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.FRONTEND_URL}api/auth/jwks`),
);

// very fy jwt
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      message: "You are unAuthorize",
    });
  }
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "You are unAuthorize",
    });
  }

  try{
    const {payload}=await jwtVerify(token,JWKS)
    console.log(payload)
    next()

  }catch(error){
    console.log(error)
    return res.status(401).json({
      message: "You are unAuthorize",})
  }
};


async function runStableAPIConnect() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });
    const db = client.db("book-hunt");
    const bookCollection = db.collection("books");
    const userCollection = db.collection("user");
    const ordersCollection = db.collection("orders");
    // simple a example for store data at database
    //   const doc = {
    //   title: "Charade",
    //   genres: ["Comedy", "Romance", "Thriller"],
    //   year: 1963,
    //   cast: ["Cary Grant", "Audrey Hepburn", "Walter Matthau"],
    // }
    // const result = await bookCollection.insertOne(doc);

    console.log("Successfully connected to MongoDB!");

    app.get("/", (req, res) => {
      res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ashik | Software Engineer</title>

      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: Arial, sans-serif;
          color: #e2e8f0;
          background: #08111f;
        }

        .card {
          width: 100%;
          max-width: 850px;
          padding: 45px;
          border: 1px solid #263852;
          border-radius: 24px;
          background: linear-gradient(145deg, #111d30, #0b1423);
          box-shadow: 0 25px 70px #0008;
        }

        .tag {
          display: inline-block;
          padding: 8px 14px;
          border: 1px solid #2563eb;
          border-radius: 30px;
          color: #93c5fd;
          background: #1d4ed822;
          font-size: 13px;
          margin-bottom: 22px;
        }

        h1 {
          font-size: clamp(36px, 7vw, 58px);
          margin-bottom: 12px;
          color: #60a5fa;
        }

        h2 {
          font-size: 23px;
          margin-bottom: 18px;
          color: #f8fafc;
        }

        p {
          line-height: 1.8;
          color: #b8c6dc;
          margin-bottom: 20px;
        }

        .info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin: 25px 0;
        }

        .item {
          padding: 17px;
          border: 1px solid #263852;
          border-radius: 14px;
          background: #172439;
        }

        .item strong {
          display: block;
          margin-bottom: 8px;
          color: #60a5fa;
        }

        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .skills span {
          padding: 9px 13px;
          border-radius: 9px;
          color: #bfdbfe;
          background: #1e3a5f;
          border: 1px solid #315783;
          font-size: 14px;
        }

        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #263852;
          color: #93c5fd;
          text-align: center;
        }
      </style>
    </head>

    <body>
      <main class="card">
        <span class="tag">WELCOME TO MY SPACE</span>

        <h1>Ashikur Rahman</h1>
        <h2>Software Engineer in Progress | Web Developer</h2>

        <p>
          Hi, I'm Ashik, a Computer Science and Technology diploma student
          from Bangladesh. I'm passionate about software engineering,
          web development, problem-solving, and building useful applications.
          I enjoy learning new technologies and turning ideas into real projects.
        </p>

        <div class="info">
          <div class="item">
            <strong>Education</strong>
            Diploma in Engineering — CST
          </div>

          <div class="item">
            <strong>Profession</strong>
            Aspiring Software Engineer
          </div>

          <div class="item">
            <strong>Location</strong>
            Bangladesh
          </div>
        </div>

        <h2>Technologies I Work With</h2>

        <div class="skills">
          <span>HTML</span>
          <span>CSS</span>
          <span>JavaScript</span>
          <span>TypeScript</span>
          <span>React</span>
          <span>Next.js</span>
          <span>Node.js</span>
          <span>Express.js</span>
          <span>MongoDB</span>
          <span>Git & GitHub</span>
          <span>Tailwind CSS</span>
        </div>

        <div class="footer">
          Build today. Learn every day. Create tomorrow.
        </div>
      </main>
    </body>
    </html>
  `);
    });

    // this api for get all users
    app.get("/users", async (req, res) => {
      try {
        const users = await userCollection.find().toArray();
        res.status(200).json({
          message: "Access user success full",
          data: users,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "failed to fetch all users",
        });
      }
    });

    // This api for Added a new book
    app.post("/book", async (req, res) => {
      try {
        const bookData = req.body;
        console.log(bookData, "its post from the books datas");
        const result = await bookCollection.insertOne(bookData);
        res.status(201).json({
          message: "Book Added Success",
          insertId: result.insertedId,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "Booked added Failed",
        });
      }
    });
    // this api made for gate all books
    app.get("/books", async (req, res) => {
      try {
        const data = await bookCollection.find().toArray();
        res.status(200).send(data);
      } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "Failed to Loaded the books",
        });
      }
    });
    // this api for delete a book from the books
    app.delete("/books/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await bookCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).json({
            message: "Book not found",
          });
        }
        res.status(200).json({
          message: "Book deleted successfully",
          deletedCount: result.deletedCount,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "Failed to delete the book",
        });
      }
    });
    // this api made for gate speacefic book
    app.get("/books/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const data = await bookCollection.findOne({
          _id: new ObjectId(id),
        });
        res.status(200).send(data);
      } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "Failed to Loaded the books",
        });
      }
    });

    // this api for update book data
    app.patch("/books/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const data = req.body;
        const result = await bookCollection.updateOne(
          {
            _id: new ObjectId(id),
          },
          {
            $set: data,
          },
        );
        res.status(200).json({
          message: "Update Book data success full",
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "Failed to update this book data",
        });
      }
    });
    // payment get way
    app.post("/order",verifyToken, async (req, res) => {
      // const authHeader = req.headers.authorization;

      // console.log("Authorization Header:", authHeader);

      // const token = authHeader?.split(" ")[1];

      // console.log("My JWT Token:", token);
      const trasitionId = new ObjectId().toString();
      const buyBook = await bookCollection.findOne({
        _id: new ObjectId(req.body.bookId),
      });
      const order = req.body;
      // console.log(buyBook,"from but book")
      const properAddress = `district:${order.district} thana:${order.thana} address:${order.address} `;
      try {
        // quantity

        const data = {
          total_amount: buyBook.price * order.quantity,
          currency: "BDT",
          tran_id: trasitionId, // use unique tran_id for each api call
          success_url: `${process.env.BACKEND_URL}success/payment/${trasitionId}`,
          fail_url: `${process.env.BACKEND_URL}fail/payment/${trasitionId}`,
          cancel_url: "http://localhost:3030/cancel/:${trasitionId}",
          ipn_url: "http://localhost:3030/ipn",
          shipping_method: "Courier",
          product_name: buyBook.title,
          product_category: "Electronic",
          product_profile: "general",
          cus_name: order.fullName,
          cus_email: order.email,
          cus_add1: order.division,
          cus_add2: properAddress,
          cus_city: "Dhaka",
          cus_state: "Dhaka",
          cus_postcode: order.postCode,
          cus_country: "Bangladesh",
          cus_phone: order.phone,
          cus_fax: "01711111111",
          ship_name: "Customer Name",
          ship_add1: "Dhaka",
          ship_add2: "Dhaka",
          ship_city: "Dhaka",
          ship_state: "Dhaka",
          ship_postcode: 1000,
          ship_country: "Bangladesh",
        };
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        sslcz.init(data).then(async (apiResponse) => {
          // Redirect the user to payment gateway
          let GatewayPageURL = apiResponse.GatewayPageURL;
          res.send({ url: GatewayPageURL });
          // console.log("Redirecting to: ", GatewayPageURL);
          // added this data at mongo db after payment
          const finalOrder = {
            name: order.fullName,
            phone: order.phone,
            email: order.email,
            bookId: buyBook._id,
            bookTitle: buyBook.title,
            price: buyBook.price,
            quantity: Number(order.quantity),
            properAddress,
            transitionId: trasitionId,
            isPaid: false,
            createdAt: new Date(),
          };
          const result = await ordersCollection.insertOne(finalOrder);
          console.log("compleate the post irder in DDDDDDDDDDDD");
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          message: "Mock payment failed",
        });
      }
    });
    // after success url hit
    app.post("/success/payment/:transitionId", async (req, res) => {
      console.log(
        req.params.transitionId,
        "trassition id from success url ttttttttttt",
      );
      const result = await ordersCollection.updateOne(
        { transitionId: req.params.transitionId },
        {
          $set: {
            isPaid: true,
          },
        },
      );
      if (result.modifiedCount > 0) {
        res.redirect(
          `${process.env.FRONTEND_URL}payment/success/${req.params.transitionId}`,
        );
      }
    });
    // after fail payment
    app.post("/fail/payment/:tran_id", async (req, res) => {
      console.log("fail paying system");
      const result = await ordersCollection.deleteOne({
        transitionId: req.params.tran_id,
      });
      if (result) {
        res.redirect(
          `${process.env.FRONTEND_URL}payment/fail/${req.params.tran_id}`,
        );
      }
    });

    // get user my order
    app.get("/order/:email",async(req,res)=>{
      try{
        const result=await ordersCollection.find({email:req.params.email}).toArray()
        res.status(201).json({
          data:result
        })

      }catch(error){
        console.log(error)
        res.status(401).json({message:"Failed to access the order"})
      }
    })

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exitCode = 1;
  }
}

runStableAPIConnect();
