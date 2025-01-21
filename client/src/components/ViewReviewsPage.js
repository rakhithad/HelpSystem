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
        return <div>Loading reviews...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Customer Reviews</h1>
            {reviews.length === 0 ? (
                <p>No reviews available</p>
            ) : (
                <table className="w-full bg-white shadow-md rounded">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Ticket Title</th>
                            <th className="border px-4 py-2">Customer Account</th>
                            <th className="border px-4 py-2">Review</th>
                            <th className="border px-4 py-2">Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review._id}>
                                <td className="border px-4 py-2">{review.title}</td>
                                <td className="border px-4 py-2">{review.account}</td>
                                <td className="border px-4 py-2">{review.review}</td>
                                <td className="border px-4 py-2">{review.rating} / 5</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ViewReviewsPage;
