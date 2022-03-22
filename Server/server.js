const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const salaryDataArray = [];

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../public/upload.html"));
});

app.get('/js', (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.js"))
});

app.get('/styles', (req, res) => {
    res.sendFile(path.join(__dirname, "../public/styles.css"))
})

app.post('/salaries', (req, res) => {
    // console.log(req.body);
    salaryDataArray.push(req.body);
    console.log(salaryDataArray);
    res.status(200).send(salaryDataArray[0]);
})
app.listen(3000, ()=> {
    console.log("Server is running on port 3000");
})