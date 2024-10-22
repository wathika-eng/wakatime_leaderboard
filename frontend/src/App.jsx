import { useState, useEffect, useCallback } from 'react';
import './App.css';
import Table from './Components/Table';
import Navbar from './Components/Navbar';
import axios from 'axios';
import { debounce } from 'lodash'; // For debouncing search

function App() {
	const BaseURL = 'https://wakatime-leaderboard.onrender.com/api/fetch';

	// State variables
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [countryCode, setCountryCode] = useState('');
	const [locationPermission, setLocationPermission] = useState('prompt');

	// Fetch user's IP address
	const fetchIPAddress = async () => {
		try {
			const response = await axios.get('https://api.ipify.org?format=json');
			return response.data.ip;
		} catch (error) {
			console.error('Error fetching IP address:', error);
			return null;
		}
	};

	// Get user's location and set country code
	useEffect(() => {
		const getUserLocation = async () => {
			try {
				const permission = await navigator.permissions.query({ name: 'geolocation' });
				setLocationPermission(permission.state);

				if (permission.state === 'denied') {
					setCountryCode('KE'); // Default to Kenya if permission denied
					return;
				}

				navigator.geolocation.getCurrentPosition(
					async (position) => {
						const { latitude, longitude } = position.coords;
						const response = await axios.get(
							`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
						);
						setCountryCode(response.data.countryCode);
					},
					(error) => {
						console.error('Geolocation error:', error);
						setCountryCode('KE');
					}
				);
			} catch (error) {
				console.error('Permission error:', error);
				setCountryCode('KE'); // Default to Kenya if permission check fails
			}
		};

		const init = async () => {
			const ip = await fetchIPAddress();
			console.log('User IP:', ip); // Debugging IP address
			getUserLocation();
		};

		init(); // Fetch IP and get user location
	}, []);

	// Fetch leaderboard data
	const fetchData = useCallback(async () => {
		if (!countryCode) return; // Exit if country code is not available

		setLoading(true);
		setError(null); // Reset error state before fetching

		try {
			const response = await axios.post(BaseURL, {
				params: {
					country_code: countryCode,
					page,
					search: searchTerm
				}
			});
			setData(response.data.data);
			setTotalPages(response.data.totalPages);
		} catch (error) {
			console.error('Error fetching leaderboard data:', error);
			setError(error); // Handle the error
		} finally {
			setLoading(false); // Set loading state to false
		}
	}, [countryCode, page, searchTerm]);

	useEffect(() => {
		fetchData(); // Call the fetch function when dependencies change
	}, [fetchData]);

	// Debounced search handler
	const handleSearch = useCallback(
		debounce((term) => {
			setSearchTerm(term.toLowerCase());
			setPage(1); // Reset to first page on new search
		}, 300), // Adjust delay as needed
		[]
	);

	// Pagination controls
	const handleNext = () => {
		if (page < totalPages) setPage((prev) => prev + 1);
	};

	const handlePrevious = () => {
		if (page > 1) setPage((prev) => prev - 1);
	};

	const handleCountryChange = (country) => {
		setCountryCode(country);
		setPage(1); // Reset to first page on country change
	};

	const handleLocationRequest = () => {
		if (locationPermission !== 'denied') {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const { latitude, longitude } = position.coords;
					const response = await axios.get(
						`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
					);
					setCountryCode(response.data.countryCode);
				},
				(error) => {
					console.error('Geolocation error:', error);
				}
			);
		}
	};

	return (
		<>
			<Navbar
				onSearch={handleSearch}
				onCountryChange={handleCountryChange}
				selectedCountry={countryCode}
				onLocationRequest={handleLocationRequest}
				locationPermission={locationPermission}
			/>
			<div className="App">
				<h1 className='xl'><b>WakaTime LeaderBoard</b></h1>
				{loading && <div>Loading...</div>}
				{error && <div>Error: {error.message}</div>}
				{!loading && !error && <Table data={data} />}
				<div className="pagination-controls">
					<button
						className='previousBtn'
						onClick={handlePrevious}
						disabled={page === 1}
					>
						Previous
					</button>
					<span><b>Page {page} of {totalPages}</b></span>
					<button
						className='nextBtn'
						onClick={handleNext}
						disabled={page === totalPages}
					>
						Next
					</button>
				</div>
			</div>
		</>
	);
}

export default App;
