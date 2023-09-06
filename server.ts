require("dotenv").config()
const GOOGLE_KEY = process.env.GOOGLE_API_KEY;

const DB_FILE = process.env.DB_FILE_LOCATION;

import express from 'express';

var cron = require('node-cron');
const sqlite3 = require('sqlite3');

import {Client} from "@googlemaps/google-maps-services-js";

const db = new sqlite3.Database(DB_FILE);

const app = express();
const port = 3000;

function initMap(): void {
	console.log("initializing map");
	const client = new Client({});

	cron.schedule('0/10 8-20 * * 1-5', () => {
  		recordDirections(client);
	});
	
	recordDirections(client);
}

function recordDirections(client : Client){
	console.log("requesting directions");
	// to Stonehill
	client.directions(
	{
		params: {origin: {lat:43.0862, lng:-70.9341},
			destination: {lat:42.0579, lng: -71.0808},
			departure_time: "now",
			key: GOOGLE_KEY,
		}
	}).then( (response) => {
		console.log(response.data);
		const duration = response.data.routes[0].legs[0].duration.value;
		const durationInTraffic = response.data.routes[0].legs[0].duration_in_traffic.value;
		const distance = response.data.routes[0].legs[0].distance.value;
		return db.exec(
			`INSERT INTO time_to_stonehill (duration,duration_in_traffic,distance) 
			VALUES (${duration},${durationInTraffic},${distance})`);
	}).then( ( completed ) => {
		console.log("Completed");
	}).catch( (e) => console.log("Request failed" + e.toString()));

	// to Newmarket
	client.directions(
	{
		params: {origin: {lat:42.0579, lng: -71.0808},
			destination: {lat:43.0862, lng:-70.9341},
			departure_time: "now",
			key: GOOGLE_KEY,
		}
	}).then( (response) => {
		console.log(response.data);
		const duration = response.data.routes[0].legs[0].duration.value;
		const durationInTraffic = response.data.routes[0].legs[0].duration_in_traffic.value;
		const distance = response.data.routes[0].legs[0].distance.value;
		return db.exec(
			`INSERT INTO time_to_newmarket (duration,duration_in_traffic,distance) 
			VALUES (${duration},${durationInTraffic},${distance})`);
	}).then( ( completed ) => {
		console.log("Completed");
	}).catch( (e) => console.log("Request failed" + e.toString()));
}

initMap();

app.get('/', (req, res) => {
	res.sendFile('/Users/sgoree/traffic-analytics/index.html')
});

app.listen(port, () => {
	console.log('Server Listening on port', port);
});