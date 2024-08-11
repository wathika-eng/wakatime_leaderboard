import React from 'react';

const Table = ({ data }) => {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                {/* head */}
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Location</th>
                        <th>Total Hours</th>
                        <th>Daily Average</th>
                        {/* <th>Website</th> */}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className='pointer'>
                            <td>{item.rank}</td>
                            <td>
                                <div className="avatar">
                                    <div className="mask mask-squircle h-12 w-12">
                                        <img
                                            src={item.user.photo}
                                            alt={`${item.user.display_name}'s avatar`}
                                        />
                                    </div>
                                </div>
                            </td>
                            <td>{item.user.display_name}</td>
                            <td>{item.user.username}</td>
                            <td>{item.user.city ? item.user.city.title_including_country : 'N/A'}</td>
                            <td>{item.running_total.human_readable_total}</td>
                            <td>{item.running_total.human_readable_daily_average}</td>
                            {/* <td>{item.website}</td> */}
                        </tr>
                    ))}
                </tbody>
                {/* foot */}
                {/* <tfoot>
                    <tr>
                        <th>Rank</th>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Location</th>
                        <th>Total Hours</th>
                        <th>Daily Average</th>
                    </tr>
                </tfoot> */}
            </table>
        </div>
    );
};

export default Table;
