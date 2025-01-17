import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ReviewTicketPage = () => {
    const { ticketId } = useParams(); // Get the ticket ID from the URL
    const [review, setReview] = useState('');
    const [rating, setRating] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const submitReview = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/tickets/review/${ticketId}`,
                { review, rating },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Review submitted successfully!');
            setTimeout(() => navigate('/view-tickets'), 2000); // Redirect after submission
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to submit review');
        }
    };

    return (
        <div>
            <h1>Submit Your Review</h1>
            <textarea
                placeholder="Write your review here"
                value={review}
                onChange={(e) => setReview(e.target.value)}
            />
            <br />
            <label>Rating:</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="">Select Rating</option>
                {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                        {r}
                    </option>
                ))}
            </select>
            <br />
            <button onClick={submitReview}>Submit Review</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ReviewTicketPage;
