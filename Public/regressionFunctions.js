
module.exports = { 
//Create the regression equation and plot
buildModel: function(values){
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
  
    //write The equation on the screen
    // document.getElementById('regressionEquation').innerHTML = "<b>Salary Prediction Equation: </b>" + String(regressor['slope']) + "X + " + String(regressor['intercept']);
  },
  
  createRegressor: function(x_vals, y_vals){
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
    
  },
  
  plotRegChart: function(x_vals, y_vals, y_hat, r2){
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
  
}