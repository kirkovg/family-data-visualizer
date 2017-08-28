const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// n: name, s: sex, m: mother, f: father, ux: wife, vir: husband, a: attributes/markers
// in memory array of people
let familyData = [
    {"key": 0, "n": "Aaron", "s": "M", "m": -10, "f": -11, "ux": 1, "vir": "", "a": ["C", "F", "K"]},
    {"key": 1, "n": "Alice", "s": "F", "m": -12, "f": -13, "ux": "", "vir": "", "a": ["B", "H", "K"]},
    {"key": 2, "n": "Bob", "s": "M", "m": 1, "f": 0, "ux": 3, "vir": "", "a": ["C", "H", "L"]},
    {"key": 3, "n": "Barbara", "s": "F", "m": "", "f": "", "ux": "", "vir": "", "a": ["C"]},
    {"key": 4, "n": "Bill", "s": "M", "m": 1, "f": 0, "ux": 5, "vir": "", "a": ["E", "H"]},
    {"key": 5, "n": "Brooke", "s": "F", "m": "", "f": "", "ux": "", "vir": "", "a": ["B", "H", "L"]},
    {"key": 6, "n": "Claire", "s": "F", "m": 1, "f": 0, "ux": "", "vir": "", "a": ["C"]},
    {"key": 7, "n": "Carol", "s": "F", "m": 1, "f": 0, "ux": "", "vir": "", "a": ["C", "I"]},
    {"key": 8, "n": "Chloe", "s": "F", "m": 1, "f": 0, "ux": "", "vir": 9, "a": ["E"]},
    {"key": 9, "n": "Chris", "s": "M", "m": "", "f": "", "ux": "", "vir": "", "a": ["B", "H"]},
    {"key": 10, "n": "Ellie", "s": "F", "m": 3, "f": 2, "ux": "", "vir": "", "a": ["E", "G"]},
    {"key": 11, "n": "Dan", "s": "M", "m": 3, "f": 2, "ux": "", "vir": "", "a": ["B", "J"]},
    {"key": 12, "n": "Elizabeth", "s": "F", "m": "", "f": "", "ux": "", "vir": 13, "a": ["J"]},
    {"key": 13, "n": "David", "s": "M", "m": 5, "f": 4, "ux": "", "vir": "", "a": ["B", "H"]},
    {"key": 14, "n": "Emma", "s": "F", "m": 5, "f": 4, "ux": "", "vir": "", "a": ["E", "G"]},
    {"key": 15, "n": "Evan", "s": "M", "m": 8, "f": 9, "ux": "", "vir": "", "a": ["F", "H"]},
    {"key": 16, "n": "Ethan", "s": "M", "m": 8, "f": 9, "ux": "", "vir": "", "a": ["D", "K"]},
    {"key": 17, "n": "Eve", "s": "F", "m": "", "f": "", "ux": "", "vir": 16, "a": ["B", "F", "L"]},
    {"key": 18, "n": "Emily", "s": "F", "m": 8, "f": 9, "ux": "", "vir": "", "a": ""},
    {"key": 19, "n": "Fred", "s": "M", "m": 17, "f": 16, "ux": "", "vir": "", "a": ["B"]},
    {"key": 20, "n": "Faith", "s": "F", "m": 17, "f": 16, "ux": "", "vir": "", "a": ["L"]},
    {"key": 21, "n": "Felicia", "s": "F", "m": 12, "f": 13, "ux": "", "vir": "", "a": ["H"]},
    {"key": 22, "n": "Frank", "s": "M", "m": 12, "f": 13, "ux": "", "vir": "", "a": ["B", "H"]},

    {"key": -10, "n": "Paternal Grandfather", "s": "M", "m": -33, "f": -32, "ux": -11, "vir": "", "a": ["A", "S"]},
    {"key": -11, "n": "Paternal Grandmother", "s": "F", "m": "", "f": "", "ux": "", "vir": "", "a": ["E", "S"]},
    {"key": -32, "n": "Paternal Great", "s": "M", "m": "", "f": "", "ux": -33, "vir": "", "a": ["F", "H", "S"]},
    {"key": -33, "n": "Paternal Great", "s": "F", "m": "", "f": "", "ux": "", "vir": "", "a": ["S"]},
    {"key": -40, "n": "Great Uncle", "s": "M", "m": -33, "f": -32, "ux": "", "vir": "", "a": ["F", "H", "S"]},
    {"key": -41, "n": "Great Aunt", "s": "F", "m": -33, "f": -32, "ux": "", "vir": "", "a": ["B", "I", "S"]},
    {"key": -20, "n": "Uncle", "s": "M", "m": -11, "f": -10, "ux": "", "vir": "", "a": ["A", "S"]},

    {"key": -12, "n": "Maternal Grandfather", "s": "M", "m": "", "f": "", "ux": -13, "vir": "", "a": ["D", "L", "S"]},
    {"key": -13, "n": "Maternal Grandmother", "s": "F", "m": -31, "f": -30, "ux": "", "vir": "", "a": ["H", "S"]},
    {"key": -21, "n": "Aunt", "s": "F", "m": -13, "f": -12, "ux": "", "vir": "", "a": ["C", "I"]},
    {"key": -22, "n": "Uncle", "s": "M", "m": "", "f": "", "ux": -21, "vir": "", "a": ""},
    {"key": -23, "n": "Cousin", "s": "M", "m": -21, "f": -22, "ux": "", "vir": "", "a": ""},
    {"key": -30, "n": "Maternal Great", "s": "M", "m": "", "f": "", "ux": -31, "vir": "", "a": ["D", "J", "S"]},
    {"key": -31, "n": "Maternal Great", "s": "F", "m": -50, "f": -51, "ux": "", "vir": "", "a": ["B", "H", "L", "S"]},
    {"key": -42, "n": "Great Uncle", "s": "M", "m": -30, "f": -31, "ux": "", "vir": "", "a": ["C", "J", "S"]},
    {"key": -43, "n": "Great Aunt", "s": "F", "m": -30, "f": -31, "ux": "", "vir": "", "a": ["E", "G", "S"]},
    {"key": -50, "n": "Maternal Great Great", "s": "F", "m": "", "f": "", "ux": -51, "vir": "", "a": ["D", "I", "S"]},
    {"key": -51, "n": "Maternal Great Great", "s": "M", "m": "", "f": "", "ux": "", "vir": "", "a": ["B", "H", "S"]}
];

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());     // used to parse incoming data

app.get('/api/people', function (req, res) {
    res.send(familyData)
});

app.put('/api/people', function (req, res) {
    console.log(req.body);  // debug purposes
    familyData = [req.body];
    familyData.forEach(item => {console.log(item)});    // debug purposes
    res.send("successfully updated family data");
});

app.listen(3000, function () {
    console.log('server listening on port 3000!')
});