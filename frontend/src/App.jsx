import { useState, useEffect } from 'react';
import './App.css';
import Table from './Components/Table';
import Navbar from './Components/Navbar';
import axios from 'axios';

function App() {
	const BaseURL = 'https://wakatime-leaderboard.vercel.app/api';
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [countryCode, setCountryCode] = useState('');
	const [locationPermission, setLocationPermission] = useState('prompt');

	// Get user's location and set country code
	useEffect(() => {
		const getUserLocation = async () => {
			try {

				const permission = await navigator.permissions.query({ name: 'geolocation' });
				setLocationPermission(permission.state);

				if (permission.state === 'denied') {
					setCountryCode('BR'); // Default to Brazil if permission denied
					return;
				}

				// Request location
				navigator.geolocation.getCurrentPosition(
					async (position) => {
						try {
							// Use reverse geocoding to get country code
							const { latitude, longitude } = position.coords;
							const response = await axios.get(
								`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
							);
							setCountryCode(response.data.countryCode);
						} catch (error) {
							console.error('Error getting country:', error);
							setCountryCode('BR'); // Default to Brazil if geocoding fails
						}
					},
					(error) => {
						console.error('Geolocation error:', error);
						setCountryCode('BR'); // Default to Brazil if geolocation fails
					},
					{
						enableHighAccuracy: false,
						timeout: 5000,
						maximumAge: 0
					}
				);
			} catch (error) {
				console.error('Permission error:', error);
				setCountryCode('BR'); // Default to Brazil if permission check fails
			}
		};

		getUserLocation();
	}, []);

	// Fetch data effect
	useEffect(() => {
		// Only fetch if we have a country code
		if (countryCode) {
			const fetchData = async () => {
				try {
					setLoading(true);
					const response = await axios.get(
						`${BaseURL}?page=${page}&search=${searchTerm}&country_code=${countryCode}`
					);
					setData(response.data.data);
					setTotalPages(response.data.totalPages);
				} catch (error) {
					setError(error);
				} finally {
					setLoading(false);
				}
			};

			const timeoutId = setTimeout(fetchData, 300);
			return () => clearTimeout(timeoutId);
		}
	}, [page, searchTerm, countryCode]);

	const handleNext = () => {
		if (page < totalPages) {
			setPage(page + 1);
		}
	};

	const handlePrevious = () => {
		if (page > 1) {
			setPage(page - 1);
		}
	};

	const handleSearch = (term) => {
		setSearchTerm(term.toLowerCase());
		setPage(1);
	};

	const handleCountryChange = (country) => {
		setCountryCode(country);
		setPage(1);
	};

	const handleLocationRequest = () => {
		if (locationPermission !== 'denied') {
			// Re-trigger location detection
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					try {
						const { latitude, longitude } = position.coords;
						const response = await axios.get(
							`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
						);
						setCountryCode(response.data.countryCode);
					} catch (error) {
						console.error('Error getting country:', error);
					}
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