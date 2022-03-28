console.log("Hello World");
const requestChartForm = document.querySelector("#get-charts-form");
const dropDownMenu = document.querySelector("#departments-drop-down");
const populateBtn = document.querySelector("#populate-menu");
const getChartBtn = document.querySelector("#request-charts");
const equationDisplay = document.querySelector("#regression-equation-review");
const removeDepartmentBtn = document.querySelector("#delete-data");

let dropDownArray = [];
let displayedDepartment = '';

function populateDropDown(event){
    event.preventDefault();

    axios.get('/drop-down').then((res) =>{
          res.data.forEach((element) => {
            console.log(element["department"]);
            if(!dropDownArray.includes(element["department"])){
              
              dropDownMenu.innerHTML += `<option id="${element["department"]}" value="${element["department"]}">${element["department"]}</option>`;
              dropDownArray.push(element["department"]);
              console.log(dropDownArray);
            }
          })
    }).catch((err) => {
        console.log(err);
    })
}
populateBtn.addEventListener("click", populateDropDown);


function getModel(event){
    event.preventDefault();
    const chartArea = document.querySelector('.chart-area');
    let departmentChoice = dropDownMenu.options[dropDownMenu.selectedIndex];
    displayedDepartment = departmentChoice.value;
    let bodyObj = {
        department: departmentChoice.value
    }
    if(!chartArea){
      axios.post('/get-chart', bodyObj).then((res) => {
        console.log(res.data['0']['salary_vals']);
        let salaryArray = res.data['0']['salary_vals'];
        let yearsArray = res.data['0']['years'];
        let values = [];
        for (let i = 0; i < salaryArray.length; i++){
          values.push({"years": yearsArray[i], "salary_vals": salaryArray[i]});
        }
        console.log(values);
        buildModel(values);

      }).catch((err) => {
          console.log(err);
    })
  }
}
getChartBtn.addEventListener("click", getModel);

function removeData(event){
  event.preventDefault();
  if (dropDownArray.length === 0){
    alert("No items have been selected to be deleted.");
    return;
  }

  axios.delete(`/${displayedDepartment}`).then((res) => {
    console.log(res.data);
    alert("Database Entry Deleted");
    const removeElement = document.getElementById(`${res.data}`)
    removeElement.remove();
  }).catch((err) => {console.log(err)})
  for (let i = 0; i < dropDownArray.length; i++){
    if(dropDownArray[i] === displayedDepartment){
      dropDownArray.splice(i, 1);
      console.log(dropDownArray);
    }
  }
  //dropDownMenu.innerHTML = '';
}
removeDepartmentBtn.addEventListener("click", removeData);


//Create the regression equation and plot
function buildModel(values){
    let years = [];
    let salary = [];
    //Create arrays for Years and Salary amounts
    for (let i = 0; i < values.length; i++){
      years.push(Number(values[i]["years"]));
      salary.push(Number(values[i]["salary_vals"]));
    }
    //Get the slope, intercept and R2 score
    const regressor = createRegressor(years, salary);
    let slope = regressor["slope"].toPrecision(6);
    let y_int = regressor['y-intercept'].toPrecision(7);

    const equationDisplay = document.createElement('h5');
    const graphContainer = document.querySelector("#graph-container")
  
    equationDisplay.innerHTML = `<b>Salary Prediction Equation</b> <br> <h6><strong>Salary = ${String(slope)}X + ${String(y_int)}</strong></h6>`
    graphContainer.appendChild(equationDisplay);

    plotRegChart(years, salary, regressor['y_hat'], regressor['r2']);
    
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
    let x_coordinates = [0];
    let counter = 0;
    let coordLength = Math.ceil(Number(x_vals[x_vals.length-1]))/.1;
    for (let i = 0; i < coordLength; i++){
      counter = counter += 0.1;
      x_coordinates.push(counter.toPrecision(3));
    }

    let y_hat = [];
    for (let i = 0; i < coordLength; i++){
      y_hat.push(x_coordinates[i]*regressor['slope']+regressor['y-intercept']);
    }
    regressor['y_hat'] = y_hat;
  
    //Find R2 score
    // let residual_sum_squares = 0, total_sum_squares = 0, r2 = 0;
  
    // for(let i = 0; i < y_vals.length; i++){
    //   residual_sum_squares += Math.pow((y_hat[i] - y_vals[i]), 2);
    //   total_sum_squares += Math.pow((y_hat[i] - y_avg), 2);
    // }
    // r2 = 1 - residual_sum_squares/total_sum_squares;
  
    // regressor['r2'] = r2;
  
    return regressor;
    
  }
 
  function plotRegChart(x_vals, y_vals, y_hat){
    let x_coordinates = [0];
    let counter = 0;
    let coordLength = Math.ceil(Number(x_vals[x_vals.length-1]))/.1;
    for (let i = 0; i < coordLength; i++){
      counter += 0.1;
      x_coordinates.push(counter.toPrecision(3));
    }

    const regression = [];
    for (let i = 0; i < y_hat.length; i++){
      regression.push({x:x_coordinates[i], y:y_hat[i]})
    }

    const data_vals = [];
    for (let i = 0; i < y_vals.length; i++){
      data_vals.push({x: x_vals[i].toPrecision(3), y: y_vals[i] });
    }

    ctx = document.createElement('canvas');
    ctx.className = "chart-area";
    const graphContainer = document.querySelector('#graph-container');
    graphContainer.appendChild(ctx);
    let regChart = new Chart(ctx, {
      data: {
        datasets: [{
          type: 'line',
          label: 'Salary Predictor',
          data: regression,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)'
      }, {
        type: 'scatter',
      label: 'Actual Values',
      data: data_vals,
      backgroundColor: 'rb(0, 0, 0)',
      }], 
       labels: x_coordinates
      },
      options: {
        scales: {    
          yAxes: [{
              ticks: {
                  fontSize: 100
              }
          }]
      },
      
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    const deleteBtn = document.createElement("button");
    deleteBtn.id = 'delete-button';
    deleteBtn.innerHTML = `Clear Graph`;
    let offerContainer = document.querySelector("#enter-offer");
    graphContainer.appendChild(deleteBtn);
    deleteBtn.addEventListener("click", ()=>{
      regChart.reset();
      deleteBtn.innerHTML = "";
      graphContainer.innerHTML = "";
    })
  }
  
  