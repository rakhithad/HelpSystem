import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/tickets/reviews', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReviews(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch reviews');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading reviews...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-blue-600 text-white flex-shrink-0">
                <div className="p-6">
                    <h2 className="text-2xl font-bold">Admin Panel</h2>
                </div>
                <ul className="space-y-2">
                    <li className="px-6 py-3 hover:bg-blue-700">
                        <a href="/dashboard" className="block">Dashboard</a>
                    </li>
                    <li className="px-6 py-3 hover:bg-blue-700">
                        <a href="/reviews" className="block">View Reviews</a>
                    </li>
                    <li className="px-6 py-3 hover:bg-blue-700">
                        <a href="/reports" className="block">Reports</a>
                    </li>
                </ul>
            </div>

            {/* Main content */}
            <div className="flex-1 p-8 bg-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Reviews</h1>
                {reviews.length === 0 ? (
                    <p className="text-gray-600">No reviews available</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white shadow-md rounded">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border px-4 py-2 text-left">Ticket Title</th>
                                    <th className="border px-4 py-2 text-left">Customer Account</th>
                                    <th className="border px-4 py-2 text-left">Review</th>
                                    <th className="border px-4 py-2 text-left">Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-gray-100">
                                        <td className="border px-4 py-2">{review.title}</td>
                                        <td className="border px-4 py-2">{review.uid}</td>
                                        <td className="border px-4 py-2">{review.review}</td>
                                        <td className="border px-4 py-2">{review.rating} / 5</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewReviewsPage;
