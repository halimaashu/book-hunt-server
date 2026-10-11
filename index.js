import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

async function runStableAPIConnect() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });
    const db = client.db("book-hunt");
    const bookCollection = db.collection("books");
    const userCollection = db.collection("user");
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
        const id=req.params.id

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

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exitCode = 1;
  }
}

runStableAPIConnect();
