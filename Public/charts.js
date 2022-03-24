console.log("Hello World");
const requestChartForm = document.querySelector("#get-charts-form");
const dropDownMenu = document.querySelector("#departments-drop-down");
const populateBtn = document.querySelector("#populate-menu");
const getChartBtn = document.querySelector("#request-charts");
const equationDisplay = document.querySelector("#regression-equation-review");


function populateDropDown(event){
    event.preventDefault();
    // let departments = ['Software', 'Finance', 'Engineering'];
    axios.get('/drop-down').then((res) =>{
        let dropDownItems = res.data;
        dropDownItems.forEach((element) => {
            dropDownMenu.innerHTML += `<option value="${element}">${element}</option>`;
        })
    }).catch((err) => {
        console.log(err);
    })
}

populateBtn.addEventListener("click", populateDropDown);


function getModel(event){
    event.preventDefault();
    let departmentChoice = dropDownMenu.options[dropDownMenu.selectedIndex];
    let departmentParam = departmentChoice.value;
    let bodyObj = {
        department: departmentChoice.value
    }
    axios.post('/get-chart', bodyObj).then((res) => {

        console.log(res.data);
        // let years = [];
        // let salary = [];
        let values = res.data[0];
        console.log(values);

        // for (let i = 0; i < values.length; i++){
        //   years.push(Number(values[i]["YearsExperience"]));
        //   salary.push(Number(values[i]["Salary"]));
        // }
        // console.log(years);
        // console.log(salary);
        buildModel(values);
    }).catch((err) => {
        console.log(err);
    })
}

getChartBtn.addEventListener("click", getModel);


//Create the regression equation and plot
function buildModel(values){
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
    // let predictedSalary = Number(slope)*Number(yearsExperience)+Number(y_int);
    //write The equation on the screen
    equationDisplay.innerHTML = `<b>Salary Prediction Equation: </b> <br> <h6>Salary = ${String(slope)}*X + ${String(y_int)}</h6>`
    
    // followUp.innerHTML = `<p class="response-offer" id="response-information">The recommended salary for an employee with ${yearsExperience} of experience is $${predictedSalary} per year while working for the ${department} department.</p>`;

    // enterOffer.innerHTML = `<div id="offer-container">

    //                           <form id=offer-form>
    //                           <p class="response-offer" id="response-information">The recommended salary for an employee with ${yearsExperience} of experience is $${predictedSalary} per year while working for the ${department} department.</p>
    //                           <p class="response-offer">What salary would you like to offer the new employee?</p>
    //                           <form id=offer-form>
    //                             <input id="offer-amount" type="text" value="Offer Amount">
    //                             <button id="offer-amount-submit" type="submit">Submit</button>
    //                           </form>
    //                         </div>`;
    // const offerSubmitBtn = document.querySelector("#offer-amount-submit");
    // offerSubmitBtn.addEventListener("click", offerSubmitHandler);
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
    ctx = document.getElementById('regression-chart-review');
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
  
  