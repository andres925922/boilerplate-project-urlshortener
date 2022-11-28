require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true}).
  then(
    () => { console.log('connected') }
  ).
  catch(
    (err) => { console.log('connection error', err) }
  )

// Basic Configuration
const port = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// SCHEMA
const urlSchema = new mongoose.Schema({
  url: {type: String, required: true},
  no: Number
});

const url = mongoose.model('url', urlSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let incremental = 1;

let arrayOfUrl = []

app.post('/api/shorturl', (req, res) => {
  
  const _url = req.body["url"]
  let responseObject = {original_url: _url}
  console.log(responseObject)

  // Evaluamos con una regex si la url enviada corresponde al formato de url
  const urlRegEx = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);
  if(!_url.match(urlRegEx)){
    res.json({error: "invalid url"})
    return
  }

  url.findOne({})
    .sort({short: "desc"})
    .exec( (err, data) => {
      if (!err && data != undefined) {
        incremental = incremental + 1
      }
      if(!err){
        url.findOneAndUpdate(
          {url: _url}, // filter
          {url: _url, no: incremental}, // update data
          {new: true, upsert: true}, // new true devuelve el elemento luego de creado
          (err, data) => { // callback
            if(!err){
              responseObject["short_url"] = data.no;
              console.log(responseObject)
              res.json(responseObject)
            }
          }
        )
      }
      
    })


 
})


app.get('/api/shorturl/:input?', (req, res) => {
  const shortUrl = req.params.input;
  console.log(shortUrl)
  url.findOne(
    {no: shortUrl}, (err, data) => {
      if (err || data == undefined) res.json({error: "URL Does Not Exist" })
      console.log(data.url)
const Database = require("@replit/database")
      res.redirect(data.url)
      
    }
  )
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
