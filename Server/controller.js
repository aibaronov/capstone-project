require('dotenv').config();
const {CONNECTION_STRING} = process.env;
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

let salaryDataArray = [];

module.exports ={
    seed: (req, res) =>{
        sequelize.query(`
        drop table if exists salaries;
        
        create table salaries (
            department_id serial primary key,
            department VARCHAR(40) UNIQUE,
            years float8[100],
            salary_vals INTEGER[100]
        );
        
        `).then(()=>{
            console.log("DB Seeded!");
            res.sendStatus(200);
        }).catch((err) => {
            console.log('Error seeding DB', err)
        });
    },

    postSalaries: (req, res) => {

        let{department, salaryValues, yearsExperience} = req.body;
        let departmentData = {department, salaryValues};
        //create arrays for years and salaries
        let years = [];
        let salary = [];

    //Create arrays for Years and Salary amounts
        for (let i = 0; i < salaryValues.length; i++){
            years.push(Number(salaryValues[i]["years"]));
            salary.push(Number(salaryValues[i]["salary_vals"]));
        }

        // sequelize.query(`
        //     INSERT INTO salaries (department, years, salary_vals)
        //     VALUES('${department}', ARRAY[${years}], ARRAY[${salary}]);`)
            let responseData = {department, yearsExperience, salaryValues};
            salaryDataArray.push(departmentData);
            res.status(200).send(responseData);
            // res.status(200).send("Data Received");
     },

    postOffer: (req, res) => {
        // console.log(req.body);
        let {amount, department, YearsExperience} = req.body;
        let newSalaryData = {
            years: YearsExperience,
            salary_vals: amount
        }
        let yearsSorted = [];
        let salariesSorted = [];
        salaryDataArray.forEach((element) => {
            if (element["department"] === department){
                element.salaryValues.push(newSalaryData);
                //sort data 
                element = objectSort(element);
                console.log(element);
                for (let i = 0; i < element.salaryValues.length; i++){
                    yearsSorted.push(Number(element.salaryValues[i]['years']));
                    salariesSorted.push(Number(element.salaryValues[i]['salary_vals']));
                }
                console.log(element);
            }

        })
        salaryDataArray = [];
        sequelize.query(`
            INSERT INTO salaries (department, years, salary_vals)
            VALUES('${department}', ARRAY[${yearsSorted}], ARRAY[${salariesSorted}]);
            `).then(dbRes => res.status(200).send(`Offer has been submitted and employee's salary information has been added to the ${department} department's database.`))
            .catch((err) => res.send(`You've attempted to post the same department twice. Please delete the ${department} entry in the View Salary Charts section and try again.`));
    },

    getDropDown: (req, res) => {
        sequelize.query(`
            SELECT department FROM salaries`)
            .then((dbRes) => {
                console.log(dbRes[0]);
                res.status(200).send(dbRes[0])
            })
            .catch((err) => console.log(err));
    },

    getChart: (req, res) =>{
        let {department} = req.body;
        sequelize.query(`
            SELECT years, salary_vals FROM salaries
            WHERE department = '${department}';`)
            .then((dbRes) => {
                res.status(200).send(dbRes[0]);
            })
            .catch((err) => console.log(err));
    },

    deleteEntry: (req, res) => {
        console.log(req.params);
        let {id} = req.params;
        console.log(id);
        console.log(salaryDataArray);
        sequelize.query(`
            DELETE FROM salaries
            WHERE department = '${id}'`)
            .then(() => res.status(200).send(id))
            .catch((err) => console.log(err));
        // for (let i = 0; i < salaryDataArray.length; i++){
        //     if(salaryDataArray[i]["department"] === id){
        //         console.log(`deleted the ${salaryDataArray[i]["department"]} department.`)
        //         salaryDataArray.splice(i, 1);
        //     }
        // }
        // console.log(salaryDataArray);
        // res.status(200).send("Data removed");
    }
}
//Sort the salary values object after each new entry is added.
function objectSort(obj){
    let vals = obj.salaryValues;
    let length = vals.length;
    for (let i = 0; i < length - 1; i++){

      if(Number(vals[i]["years"]) > Number(vals[length-1]["years"])){
        let lastVal = vals[length-1];
        vals.splice(i, 0, lastVal);
        vals.pop();
        break;
      }
    }
    obj.salaryValues = vals;
    return obj;
  }
