const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PATH_TO_DATABASE = '..\\data\\database.db';
const Datastore = require('nedb');
const db = new Datastore({ filename: PATH_TO_DATABASE, autoload: true });

let familyData = null;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());     // used to parse incoming data

app.get('/api/people', function (req, res) {
    db.find({}, function (err, docs) {
        familyData = {"class": docs[0].class, "nodeDataArray": docs[0].nodeDataArray};
        res.send(familyData);
    });
});

app.put('/api/people', function (req, res) {
    familyData = req.body;
    db.update({}, familyData, {});
    res.send("successfully updated family data");
});

app.listen(3000, function () {
    console.log('server listening on port 3000!');
});