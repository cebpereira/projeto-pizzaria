var request = require('request');
request('www.google.com', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.

  // var parsedWeather = JSON.parse(body);
  // console.log('A temperatura atual em São Paulo é ' + parsedWeather['main']['temp']); 
});