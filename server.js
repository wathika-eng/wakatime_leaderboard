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

// cache('10 minutes'),
app.get('/api', async (req, res) => {
    const country_code = req.query.country_code;
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = 10; // Items per page
    const apime = 'https://wakatime.com/api/v1/leaders';
    
    try {
        const response = await needle('get', apime, {
            headers: {
                Authorization: `Bearer ${process.env.WAKATIME_API_KEY}`,
            },
        });
        const data = response.body;
        const filteredData = data.data.filter(
            (item) => item.country_code === country_code
        );
        
        // Pagination logic
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        return res.json({
            page,
            totalItems: filteredData.length,
            totalPages: Math.ceil(filteredData.length / limit),
            data: paginatedData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching data' });
    } finally {
        console.log('API call done');
    }
});

/*
if not port is set on the .env file, use the default 3000
Then give the URL to the user
*/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port http://localhost:${PORT}/`);
});
