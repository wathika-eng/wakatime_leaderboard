import { useState, useEffect } from 'react';
import './App.css';
import Table from './Components/Table';
import Navbar from './Components/Navbar';

function App() {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	useEffect(() => {
		fetch('/api?country_code=US')
			.then((res) => res.json())
			.then((data) => {
				setData(data);
				setLoading(false);
			})
			.catch((error) => {
				setError(error);
				setLoading(false);
			});
	}, []);
	console.log(data);
	return (
		<>
			<Navbar />
			<div className="App">
				<header className="App-header">
					<h1>Wakatime Leaders</h1>
				</header>
				{loading && <div>Loading...</div>}
				{error && <div>Error: {error.message}</div>}
				{!loading && !error && <Table data={data} />}
			</div>
		</>
	);
}

export default App;
