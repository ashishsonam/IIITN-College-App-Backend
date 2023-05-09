const express = require("express");
const router = express.Router();
var request = require('request');

url = TIMETABLE_URL

router.get("/timetable", function(req,res){
  request(url,
  function(err,response,body){
    console.log("some one is fetching time table");
    if(err)
    {
      res.send('something went wrong');
    }
    else{
      var data = JSON.parse(body);
      res.send(body);
    }
  })
});

module.exports = router;