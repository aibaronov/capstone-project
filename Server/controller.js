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


const salaryDataArray = [];

module.exports ={
    seed: (req, res) =>{
        sequelize.query(`
        drop table if exists salaries;
        
        create table salaries (
            department_id serial primary key,
            department VARCHAR(40),
            years float8[100],
            salary_vals INTEGER[100]
        );
        
        INSERT INTO salaries (department, years, salary_vals)
        VALUES('test department', ARRAY[1, 2, 3, 4, 5], ARRAY[10000, 11000, 12000, 13000, 14000]);
        
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
      years.push(Number(salaryValues[i]["YearsExperience"]));
      salary.push(Number(salaryValues[i]["Salary"]));
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
        console.log(req.body);
        let {amount, department, YearsExperience} = req.body;
        let newSalaryData = {
            YearsExperience: YearsExperience,
            Salary: amount
        }
        let yearsSorted = [];
        let salariesSorted = [];
        salaryDataArray.forEach((element) => {
            if (element["department"] === department){
                element.salaryValues.push(newSalaryData);
                //sort data 
                element = objectSort(element);
                for (let i = 0; i < element.salaryValues.length; i++){
                    yearsSorted.push(Number(element.salaryValues[i]['YearsExperience']));
                    salariesSorted.push(Number(element.salaryValues[i]['Salary']));
                }
                console.log(element);
            }

        })
        sequelize.query(`
            INSERT INTO salaries (department, years, salary_vals)
            VALUES('${department}', ARRAY[${yearsSorted}], ARRAY[${salariesSorted}]);
            `);


        res.status(200).send(`Offer has been submitted and employee's salary information has been added to the ${department} department's database.`);
    }
}
//Sort the salary values object after each new entry is added.
function objectSort(obj){
    let vals = obj.salaryValues;
    let length = vals.length;
    
    for (let i = 0; i < length - 1; i++){

      if(Number(vals[i]["YearsExperience"]) > Number(vals[length-1]["YearsExperience"])){
        let temp = vals[length-1];
        vals[length-1] = vals[i];
        vals[i] = temp;
        break;
      }
    }
    obj.salaryValues = vals;
    return obj;
  }