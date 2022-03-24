const myForm = document.querySelector("#upload-salary-form");
const uploadBtn = document.querySelector("#csvFile");
const equationDisplay = document.querySelector("#regressionEquation");
const followUp = document.querySelector("#follow-up");
const enterOffer = document.querySelector("#enter-offer");
// const offerAmount = document.querySelector("#offer-amount");



function offerSubmitHandler(event){
  event.preventDefault();
  const department = document.querySelector("#department");
  const offerAmount = document.querySelector("#offer-amount");
  const yearsField = document.querySelector("#employee-years");
  let bodyObj = {
    amount: offerAmount.value,
    department: department.value,
    YearsExperience: yearsField.value
  }

  axios.post('/offer', bodyObj).then((res) =>{
    alert(res.data)
  }).catch((err) => {
    alert(err);
  })
}


myForm.addEventListener("submit", function(event){
    event.preventDefault();
    const input = csvFile.files[0];
    const reader = new FileReader();

    function csvToArray(str, delimiter = ","){
        //Slice from start of text to the first \n
        //Use split to create an array from the string using ","
        const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

        //slice from \n index + 1 to the end of the text
        //use split to create an array of each csv value row
        const rows = str.slice(str.indexOf("\n") + 1).split("\n");

        //Map the rows
        //split the values from each row into an array
        //use headers.reduce to create an object
        //object properties derived from headers:values
        //the object passed as an element of the array

        const arr = rows.map(function (row){
            const values = row.split(delimiter);
            const el = headers.reduce(function (object, header, index){
                object[header] = values[index];
                return object;
            }, {});
            return el;
        });
        return arr;
    }

    reader.onload = function (event){
        const text = event.target.result;
        //This is the object that will be sent to the back end
        const salaryData = csvToArray(text);

        //Remove \r from the salary key
        for (let i = 0; i < salaryData.length; i++){
            salaryData[i]['Salary'] = salaryData[i]['Salary\r']
            delete salaryData[i]['Salary\r'];
          }
        //This can be used to check that data is read correctly
        // console.log(data[0]["Salary\r"]);
        // document.write(JSON.stringify(data));
        const yearsField = document.querySelector("#employee-years");
        const departmentField = document.querySelector("#department");
        let bodyObj = {
          department: departmentField.value,
          yearsExperience: yearsField.value,
          salaryValues: salaryData
        }

        axios.post('/salaries', bodyObj).then((res) => {
            // console.log(res.data);
            let {salaryValues, yearsExperience, department} = res.data;
            console.log(salaryValues);
            buildModel(salaryValues, yearsExperience, department);
        }).catch((err) =>{
            alert(err);
        })
    };

    reader.readAsText(input);
});


//Create the regression equation and plot
function buildModel(values, yearsExperience, department){
    let years = [];
    let salary = [];
    //Create arrays for Years and Salary amounts
    for (let i = 0; i < values.length; i++){
      years.push(Number(values[i]["YearsExperience"]));
      salary.push(Number(values[i]["Salary"]));
    }
    //Get the slope, intercept and R2 score
    const regressor = createRegressor(years, salary);
  
    plotRegChart(years, salary, regressor['y_hat'], regressor['r2']);
    
    let slope = regressor["slope"].toPrecision(6);
    let y_int = regressor['y-intercept'].toPrecision(7);
    let predictedSalary = Number(slope)*Number(yearsExperience)+Number(y_int);
    //write The equation on the screen
    equationDisplay.innerHTML = `<b>Salary Prediction Equation: </b> <br> <h6>Salary = ${String(slope)}*X + ${String(y_int)}</h6>`
    
    // followUp.innerHTML = `<p class="response-offer" id="response-information">The recommended salary for an employee with ${yearsExperience} of experience is $${predictedSalary} per year while working for the ${department} department.</p>`;

    enterOffer.innerHTML = `<div id="offer-container">

                              <form id=offer-form>
                              <p class="response-offer" id="response-information">The recommended salary for an employee with ${yearsExperience} of experience is $${predictedSalary} per year while working for the ${department} department.</p>
                              <p class="response-offer">What salary would you like to offer the new employee?</p>
                              <form id=offer-form>
                                <input id="offer-amount" type="text" value="Offer Amount">
                                <button id="offer-amount-submit" type="submit">Submit</button>
                              </form>
                            </div>`;
    const offerSubmitBtn = document.querySelector("#offer-amount-submit");
    offerSubmitBtn.addEventListener("click", offerSubmitHandler);
  }

  

  
  function createRegressor(x_vals, y_vals){
    //Store equations data
    let regressor = {};
  
    const x_avg = x_vals.reduce((val1, val2) => val1 + val2, 0)/x_vals.length;
    const y_avg = y_vals.reduce((val1, val2) => val1 + val2, 0)/y_vals.length;
  
    //Solve for the slope:
    let slope = 0, numerator = 0, denominator = 0;
    for(let i = 0; i < x_vals.length; i++){
      numerator += (x_vals[i] - x_avg)*(y_vals[i] - y_avg);
      denominator += Math.pow((x_vals[i] - x_avg), 2);
    }
  
    slope = numerator/denominator;
    console.log(`Slope: ${slope}`);
    regressor['slope'] = slope;
  
    //Solve for y-int
    const y_int = y_avg - x_avg*slope;
    regressor['y-intercept'] = y_int;
  
    //Get predicted values of y based on x values
    let y_hat = [];
    for (let i = 0; i < x_vals.length; i++){
      y_hat.push(x_vals[i]*regressor['slope']+regressor['y-intercept']);
    }
    regressor['y_hat'] = y_hat;
  
    //Find R2 score
    let residual_sum_squares = 0, total_sum_squares = 0, r2 = 0;
  
    for(let i = 0; i < y_vals.length; i++){
      residual_sum_squares += Math.pow((y_hat[i] - y_vals[i]), 2);
      total_sum_squares += Math.pow((y_hat[i] - y_avg), 2);
    }
    r2 = 1 - residual_sum_squares/total_sum_squares;
  
    regressor['r2'] = r2;
  
    return regressor;
    
  }
  
  function plotRegChart(x_vals, y_vals, y_hat, r2){
    ctx = document.getElementById('regressionChart');
    let mixedChart = new Chart(ctx, {
      data: {
        datasets: [{
          type: 'line',
          label: 'Employee Salary Predictor',
          data: y_hat,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)'
      }, {
        type: 'scatter',
      label: 'Values',
      data: y_vals,
      backgroundColor: 'rb(0, 0, 0)',
      }], 
       labels: x_vals
      },
      options: {
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  