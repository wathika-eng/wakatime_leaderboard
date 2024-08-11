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

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(`${BaseURL}?page=${page}`);
				setData(response.data.data);
				setTotalPages(response.data.totalPages);
				setLoading(false);
			} catch (error) {
				setError(error);
				setLoading(false);
			}
		};
		fetchData();
	}, [page]);

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
	};


	const filteredData = data.filter((item) =>
		item.user.display_name.toLowerCase().includes(searchTerm) ||
		item.user.username.toLowerCase().includes(searchTerm)
	);

	return (
		<>
			<Navbar onSearch={handleSearch} />
			<div className="App">
				<h1 className='xl'><b>WakaTime LeaderBoard</b></h1>
				{loading && <div>Loading...</div>}
				{error && <div>Error: {error.message}</div>}
				{!loading && !error && <Table data={filteredData} />}
				<div className="pagination-controls">
					<button className='previousBtn' onClick={handlePrevious} disabled={page === 1}>
						Previous
					</button>
					<span><b>Page {page} of {totalPages}</b></span>
					<button className='nextBtn' onClick={handleNext} disabled={page === totalPages}>
						Next
					</button>
				</div>
			</div>
		</>
	);
}

export default App;
