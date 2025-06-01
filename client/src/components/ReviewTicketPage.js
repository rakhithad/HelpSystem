import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

const ReviewTicketPage = () => {
    const { ticketId } = useParams(); // Get the ticket ID from the URL
    const [review, setReview] = useState('');
    const [rating, setRating] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const submitReview = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/review/${ticketId}`,
                { review, rating },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Review submitted successfully!');
            // Pass the updated ticket back to ManageTickets
            setTimeout(() => {
                navigate('/view-tickets', {
                    state: { updatedTicket: { ...response.data.ticket, reviewed: true } }
                });
            }, 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to submit review');
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
            <div className="ml-64 w-full p-8">
                <div className="space-y-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                        Submit Your Review
                    </h1>

                    <nav className="text-white text-opacity-80 mb-4">
                        <Link to="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <Link to="/view-tickets" className="hover:underline">View Tickets</Link> {' / '}
                        <span className="text-purple-300">Review Ticket</span>
                    </nav>

                    <div className="p-6 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl">
                        <div className="space-y-6">
                            <textarea
                                placeholder="Write your review here"
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                className="w-full px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                rows="5"
                            />

                            <div className="flex items-center space-x-4">
                                <label className="text-white text-opacity-80">Rating:</label>
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    className="px-4 py-2 bg-white bg-opacity-10 backdrop-blur-md text-white rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">Select Rating</option>
                                    {[1, 2, 3, 4, 5].map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={submitReview}
                                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-300"
                            >
                                Submit Review
                            </button>

                            {message && (
                                <p className={`text-white text-opacity-80 ${message.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                                    {message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewTicketPage;