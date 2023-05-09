if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const healthcheck = require("./routes/api");
const auth = require("./routes/auth");
const clas = require("./routes/class");
const timetable = require("./routes/timetable");
const buysell = require("./routes/buysell");
const helmet = require("helmet");
const { student, teacher } = require("./models/user");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const URI = process.env.URI;

const connectWithRetry = (uris, options, maxAttempts = 5) => {
  connectWithRetry.timeout = connectWithRetry.timeout || 0;
  return mongoose.connect(uris, options, (err) => {
    if (err)
      if (connectWithRetry.timeout <= (maxAttempts - 1) * 5000) {
        console.error(
          `Failed to connect to mongo on startup - retrying in ${
            (connectWithRetry.timeout += 5000) / 1000
          } sec`,
          connectWithRetry.previousError != "" + err
            ? `\n${(connectWithRetry.previousError = err)}`
            : ""
        );
        setTimeout(connectWithRetry, connectWithRetry.timeout, uris, options);
      } else process.exit(1);
    else console.log("Connected to MongoDB successfully!");
  });
};

connectWithRetry(URI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(helmet());
app.use(
  cors({
    allowedHeaders: [
      "Content-Type",
      "token",
      "authorization",
      "*",
      "Content-Length",
      "X-Requested-With",
    ],
    origin: "*",
    preflightContinue: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// var students = [{
//         role:"student",
//         email: "student@gmail.com",
//         profileName:"demo",
//         rollno: "BT19CSE000",
//         batch:"2019-2023",
//         branch: "CSE",
//         profilePhotoUri:"",
//         section: "A",
//         password:"qwerty123#",
//         e_card: "https://firebasestorage.googleapis.com/v0/b/our-e-college-app-909e3.appspot.com/o/Batch%2F2019-2023%2FBranch%2FCSE%2FStudents%2FBT19CSE005%2FE-Card%2Fchota.PNG?alt=media&token=19d84d07-f707-48f9-9ccc-e9a768a9dfbd"}];
// students.forEach(function(item){
//   student.create(item,function(err,algo){
//   if(err){
//   console.log(err);}
//   else
//   {console.log(algo);}
// });
// });
// var teachers = [{
//         role:"teacher",
//         email: "teacher@gmail.com",
//         password:"qwerty123#",
//         profileName:"teacher",
//         profilePhotoUri:""}];
// teachers.forEach(function(item){
//   student.create(item,function(err,algo){
//   if(err){
//   console.log(err);}
//   else
//   {console.log(algo);}
// });
// });

app.use("/api", healthcheck);
app.use("/api", auth);
app.use("/api", clas);
app.use("/api", buysell);
app.use("/api", timetable);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(422).send({ success: false, error: err.message });
});

const server = require("http").createServer(app);

server.listen(port, () => {
  console.log("Server has started! on http://localhost:" + port + "/");
});
