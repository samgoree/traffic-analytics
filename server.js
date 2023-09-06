"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
var GOOGLE_KEY = process.env.GOOGLE_API_KEY;
var DB_FILE = process.env.DB_FILE_LOCATION;
var express_1 = __importDefault(require("express"));
var cron = require('node-cron');
var sqlite3 = require('sqlite3');
var google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
var db = new sqlite3.Database(DB_FILE);
var app = (0, express_1.default)();
var port = 3000;
function initMap() {
    console.log("initializing map");
    var client = new google_maps_services_js_1.Client({});
    cron.schedule('0/10 8-20 * * 1-5', function () {
        recordDirections(client);
    });
    recordDirections(client);
}
function recordDirections(client) {
    console.log("requesting directions");
    // to Stonehill
    client.directions({
        params: { origin: { lat: 43.0862, lng: -70.9341 },
            destination: { lat: 42.0579, lng: -71.0808 },
            departure_time: "now",
            key: GOOGLE_KEY,
        }
    }).then(function (response) {
        console.log(response.data);
        var duration = response.data.routes[0].legs[0].duration.value;
        var durationInTraffic = response.data.routes[0].legs[0].duration_in_traffic.value;
        var distance = response.data.routes[0].legs[0].distance.value;
        return db.exec("INSERT INTO time_to_stonehill (duration,duration_in_traffic,distance) \n\t\t\tVALUES (".concat(duration, ",").concat(durationInTraffic, ",").concat(distance, ")"));
    }).then(function (completed) {
        console.log("Completed");
    }).catch(function (e) { return console.log("Request failed" + e.toString()); });
    // to Newmarket
    client.directions({
        params: { origin: { lat: 42.0579, lng: -71.0808 },
            destination: { lat: 43.0862, lng: -70.9341 },
            departure_time: "now",
            key: GOOGLE_KEY,
        }
    }).then(function (response) {
        console.log(response.data);
        var duration = response.data.routes[0].legs[0].duration.value;
        var durationInTraffic = response.data.routes[0].legs[0].duration_in_traffic.value;
        var distance = response.data.routes[0].legs[0].distance.value;
        return db.exec("INSERT INTO time_to_newmarket (duration,duration_in_traffic,distance) \n\t\t\tVALUES (".concat(duration, ",").concat(durationInTraffic, ",").concat(distance, ")"));
    }).then(function (completed) {
        console.log("Completed");
    }).catch(function (e) { return console.log("Request failed" + e.toString()); });
}
initMap();
app.get('/', function (req, res) {
    res.sendFile('/Users/sgoree/traffic-analytics/index.html');
});
app.listen(port, function () {
    console.log('Server Listening on port', port);
});
