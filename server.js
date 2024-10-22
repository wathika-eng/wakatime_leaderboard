require('dotenv').config();
const express = require('express');
const needle = require('needle');
const cors = require('cors');
const apicache = require('apicache');
const path = require('path');
const geoip = require('geoip-lite');
const e = require('express');

const app = express();
const cache = apicache.middleware;
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend/build')));

const getCountryFromIP = (ip) => {
	try {
		const cleanIP = ip.replace(/^::ffff:/, '');
		const geo = geoip.lookup(cleanIP);
		console.log(`IP: ${cleanIP}, Country: ${geo ? geo.country : 'Unknown'}`);
		return geo ? geo.country : null;
	} catch (error) {
		console.error('Error getting country from IP:', error);
		return null;
	}
};

// Serve the frontend application
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Location endpoint to get the user's country based on their IP
app.get('/api/location', (req, res) => {
	try {
		const ip =
			req.headers['x-forwarded-for']?.split(',')[0] ||
			req.headers['x-real-ip'] ||
			req.socket.remoteAddress;

		const countryCode = getCountryFromIP(ip) || 'KE'; // Default to Kenya if unknown
		res.json({ countryCode });
	} catch (error) {
		console.error('Error in /api/location endpoint:', error);
		res.json({ countryCode: 'KE' }); // Default response in case of failure
	}
});

app.get('/api', cache('60 minutes'), async (req, res) => {
	try {
		// Get parameters from query string
		let country_code = req.query.country_code;
		const page = parseInt(req.query.page) || 1;
		const limit = 10;
		const search = req.query.search?.toLowerCase() || '';

		// If no country code provided, determine from IP
		if (!country_code) {
			const ip =
				req.headers['x-forwarded-for']?.split(',')[0] ||
				req.headers['x-real-ip'] ||
				req.socket.remoteAddress;

			country_code = getCountryFromIP(ip) || 'KE'; // Default to Kenya if unknown
		}

		// WakaTime API endpoint with country filtering
		const wakatimeUrl = `https://wakatime.com/api/v1/leaders?country_code=${country_code}`;
		console.log(`Fetching data from WakaTime API: ${wakatimeUrl}`);

		// Make the API request to WakaTime
		const response = await needle('get', wakatimeUrl, {
			headers: {
				Authorization: `Bearer ${process.env.WAKATIME_API_KEY}`,
			},
		});

		const data = response.body;

		if (!data || !data.data) {
			return res
				.status(404)
				.json({ error: 'No data received from WakaTime API' });
		}

		// Extract and clean the data
		const cleanedData = data.data.map((item) => ({
			rank: item.rank,
			display_name: item.user.display_name,
			username: item.user.username,
			country_code: item.user.country_code,
			total_seconds: item.running_total.total_seconds,
			total_hours: (item.running_total.total_seconds / 3600).toFixed(2), // Convert to hours
		}));

		// Filter the data based on search term (if provided)
		const filteredData = cleanedData.filter((item) => {
			return search
				? item.display_name.toLowerCase().includes(search) ||
						item.username.toLowerCase().includes(search)
				: true;
		});

		// Paginate results
		const startIndex = (page - 1) * limit;
		const paginatedData = filteredData.slice(startIndex, startIndex + limit);

		// Send the cleaned and paginated data back to the client
		return res.json({
			page,
			totalItems: filteredData.length,
			totalPages: Math.ceil(filteredData.length / limit),
			data: paginatedData,
			detectedCountry: country_code,
		});
	} catch (error) {
		console.error('Error in /api endpoint:', error);
		return res.status(500).json({
			error: 'An error occurred while fetching data',
			details:
				process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}/`);
});
