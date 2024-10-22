require('dotenv').config();
const express = require('express');
const needle = require('needle');
const cors = require('cors');
const apicache = require('apicache');
const path = require('path');
const geoip = require('geoip-lite');
const moment = require('moment');

const app = express();
const cache = apicache.middleware; // Caching middleware
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Initialize dailyUserData as a Map for better performance
const dailyUserData = new Map();

// Function to get country from IP
const getCountryFromIP = (ip) => {
	const cleanIP = ip.replace(/^::ffff:/, '');
	const geo = geoip.lookup(cleanIP);
	return geo ? geo.country : 'KE'; // Default to Kenya
};

// Serve the frontend application
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Location endpoint to get the user's country based on their IP
app.get('/api/location', (req, res) => {
	const ip =
		req.headers['x-forwarded-for']?.split(',')[0] ||
		req.headers['x-real-ip'] ||
		req.socket.remoteAddress;
	const countryCode = getCountryFromIP(ip);
	res.json({ countryCode });
});

// Fetch leaderboard data with caching
app.post('/api/fetch', cache('40 minutes'), async (req, res) => {
	try {
		const { country_code, page, search = '' } = req.body.params;
		const baseUrl = 'https://wakatime.com/api/v1/leaders';
		const url = `${baseUrl}?country_code=${country_code}&page=${page}&search=${encodeURIComponent(
			search
		)}`;

		// Fetch data from WakaTime API
		const response = await needle('get', url, {
			headers: { Authorization: `Bearer ${process.env.WAKATIME_API_KEY}` },
		});

		if (!response.body || !response.body.data) {
			return res
				.status(500)
				.json({ error: 'No data available from WakaTime API' });
		}

		const data = response.body.data;
		const date = moment().format('YYYY-MM-DD');

		// Store daily user data efficiently
		if (!dailyUserData.has(date)) {
			dailyUserData.set(date, new Map());
		}

		const userMap = dailyUserData.get(date);

		data.forEach((item) => {
			const userEntry = {
				username: item.user.username,
				display_name: item.user.display_name,
				running_total: item.running_total.total_time,
				rank: item.rank,
				country_code: country_code,
			};

			// Add or update user entry
			userMap.set(userEntry.username, userEntry);
		});

		// Return the response with total pages
		return res.json({ data, totalPages: response.body.total_pages });
	} catch (error) {
		console.error('Error fetching data:', error);
		return res
			.status(500)
			.json({ error: 'An error occurred while fetching data' });
	}
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}/`);
});
