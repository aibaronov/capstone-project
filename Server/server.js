const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const salaryDataArray = [];
const dropDownArray = [];

app.use(express.json());
app.use(cors());


//Sort data before pushing to data array
function objectSort(obj){
    let vals = obj.salaryValues;
    let length = vals.length;
    
    for (let i = 0; i < length - 1; i++){
      console.log(vals[i]["YearsExperience"]);
      if(vals[i]["YearsExperience"] > vals[length-1]["YearsExperience"]){
        vals.splice(i-1, 0, vals[length-1]);
        vals.pop();
        break;
      }
    }
    obj.salaryValues = vals;
    return obj;
  }

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

app.get('/drop-down', (req, res) => {
    // let dropDownItems = ['Engineering', 'Software', 'Finance'];
    let dropDownItems = [];
    salaryDataArray.forEach((element) => {
        dropDownItems.push(element.department);
    });
    console.log(dropDownItems);
    res.status(200).send(dropDownItems);
})

app.post('/get-chart', (req, res) =>{
    let {department} = req.body;
    let responseData = [];
    salaryDataArray.forEach((element) => {
        if(element["department"] === department){
            responseData.push(element.salaryValues);
        }
    })
    res.status(200).send(responseData);
})

app.post('/salaries', (req, res) => {
    let{department, salaryValues, yearsExperience} = req.body;
    let departmentData = {department, salaryValues};
    console.log(departmentData);
    let responseData = {department, yearsExperience, salaryValues};
    salaryDataArray.push(departmentData);
    res.status(200).send(responseData);
    // res.status(200).send("Data Received");
})

app.post('/offer', (req, res) => {
    let {amount, department, YearsExperience} = req.body;
    let newSalaryData = {
        YearsExperience: YearsExperience,
        Salary: amount
    }
    salaryDataArray.forEach((element) => {
        if (element["department"] === department){
            element.salaryValues.push(newSalaryData);
            //sort data 
            element = objectSort(element);
            console.log(element);
        }
    })
    //console.log(salaryDataArray);
    res.status(200).send(`Offer has been submitted and employee's salary information has been added to the ${department} department's database.`);
})

app.delete('/:id', (req, res) => {

    console.log(req.params);
    let {id} = req.params;
    console.log(id);
    console.log(salaryDataArray);
    for (let i = 0; i < salaryDataArray.length; i++){
        if(salaryDataArray[i]["department"] === id){
            console.log(`deleted the ${salaryDataArray[i]["department"]} department.`)
            salaryDataArray.splice(i, 1);
        }
    }
    console.log(salaryDataArray);
    res.status(200).send("Data removed");
})

app.listen(3000, ()=> {
    console.log("Server is running on port 3000");
})