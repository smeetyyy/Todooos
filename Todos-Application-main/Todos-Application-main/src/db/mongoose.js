const mongoose = require("mongoose")

const connectionString = process.env.CONNECTION_STRING ||  "mongodb://localhost:27017/main_db"

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then((value) => console.log("Connected to database"))
    .catch((error) => console.log("Error:", error))