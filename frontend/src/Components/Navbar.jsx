import React, { useState } from 'react';

const Navbar = ({ onSearch }) => {
    const [searchInput, setSearchInput] = useState('');

    const handleChange = (event) => {
        setSearchInput(event.target.value);
        onSearch(event.target.value);
    };

    return (
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">WakaTime</a>
            </div>
            <div className="flex-none gap-2">
                <div className="form-control">
                    <input
                        type="text"
                        placeholder="Search"
                        className="input input-bordered w-24 md:w-auto"
                        value={searchInput}
                        onChange={handleChange}
                    />
                </div>
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="Wakatime Logo"
                                src="https://avatars.githubusercontent.com/u/4814844?s=200&v=4"
                            />
                        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                        <li>
                            <a className="justify-between">
                                Profile
                                <span className="badge">New</span>
                            </a>
                        </li>
                        <li><a>Settings</a></li>
                        {/* <li><a>Logout</a></li> */}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
