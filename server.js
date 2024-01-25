const express = require("express");
const axios = require("axios");
const request = require('request');
const app = express();


app.set("view engine", "ejs");

// Serve the public folder as static files
app.use(express.static("public"));

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const hours = date.getHours();
    const minutes = `0${date.getMinutes()}`.slice(-2); // Add leading zero if needed
    return `${hours}:${minutes}`;
}

app.get("/", (req, res) => {
    res.render("index", { weather: null, facts: null, error: null });
});

app.get("/weather", async (req, res) => {
    const city = req.query.city;
    const apiKey = "PUT_YOUR_OWN_API_KEY";
    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/weather?q=%20${city}&units=metric&appid=${apiKey}`;
    let weather;
    let error = null;

    try {
        const weatherResponse = await axios.get(weatherAPIUrl);
        weather = weatherResponse.data;
        // Example of Formatting the Time from the OpenWeatherAPI.
        const sunriseTime = formatTime(weather.sys.sunrise);
        const sunsetTime = formatTime(weather.sys.sunset);
        const factsAPIUrl = 'https://api.api-ninjas.com/v1/facts?limit=1';
        request.get({
            url: factsAPIUrl,
            headers: {
                'X-Api-Key': 'PUT_YOUR_OWN_API_KEY'
            },
        }, function (factsError, factsResponse, factsBody) {
            if (factsError) {
                console.error('Facts API request failed:', factsError);
            } else if (factsResponse.statusCode !== 200) {
                console.error('Facts API Error:', factsResponse.statusCode, factsBody.toString('utf8'));
            } else {
                const facts = JSON.parse(factsBody);
                res.render("index", { weather, facts, error, formatTime });
            }
        });
    } catch (error) {
        weather = null;
        error = "Error, Please try again";
        res.render("index", { weather, error, formatTime });
    }
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
