/*
https://www.youtube.com/watch?v=ZGymN8aFsv4&t=991s
serves the public folder
require('dotenv').config();
*/
const express = require('express');
const needle = require('needle');
const cors = require('cors');
const url = require('url');

/*instead of making a new request each time to the 
api, you can cache the previous response not to overload server
*/
const apicache = require('apicache');
let cache = apicache.middleware;

/*
get the public folder path so as to server it in the frontend
*/
const path = require('path');
const app = express();
// solved all cors issues
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/test', (req, res) => {
	return res.json({ message: 'Hello World' });
});
app.get('/api', cache('10 minutes'), async (req, res) => {
	//cache('30 minutes')
	// const parsedurl = url.parse(req.url, true);
	const country_code = JSON.stringify(req.url);
	let trimedcode = country_code.split('=')[1];
	console.log(trimedcode);
	const apime = 'https://wakatime.com/api/v1/leaders';
	try {
		const response = await needle('get', apime, {
			headers: {
				Authorization: `Bearer ${process.env.WAKATIME_API_KEY}`,
			},
		});
		const data = response.body;
		const filteredData = data.data.filter(
			(item) => item.country_code === trimedcode
		);
		return res.json(filteredData);
	} catch (error) {
		console.error(error);
	} finally {
		console.log('API call done');
	}
});
/*
if not port is set on the .env file, use the default 3000
Then give the URL to the user
*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port http://localhost:${PORT}/`);
});
