require('dotenv').config()
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const {SERVER_PORT} = process.env;
const {seed, postSalaries, postOffer, getDropDown, getChart, deleteEntry, login, register} = require('./controller.js');

const salaryDataArray = [];
const dropDownArray = [];

app.use(express.json());
app.use(cors());


//Dev
// Run this seed command in POSTMAN
app.post('/seed', seed);

app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, "../public/index.html"))
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.js"))
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, "../public/upload.html"));
});

app.get('/charts', (req, res) =>{
    res.sendFile(path.join(__dirname, "../public/charts.html"));
})

app.get('/upload-js', (req, res) => {
    res.sendFile(path.join(__dirname, "../public/upload.js"))
});

app.get('/styles', (req, res) => {
    res.sendFile(path.join(__dirname, "../public/styles.css"))
})

app.get('/charts-js', (req, res) =>{
    res.sendFile(path.join(__dirname, "../public/charts.js"));
})

app.post('/login', login);

app.post('/register', register);

app.get('/drop-down', getDropDown);

app.post('/get-chart', getChart)

app.post('/salaries', postSalaries);

app.post('/offer', postOffer);

app.delete('/:id', deleteEntry);

app.listen(3000, ()=> {
    console.log(`Server is running on ${SERVER_PORT}`);
})