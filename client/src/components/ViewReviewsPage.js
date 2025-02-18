import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/reviews`,
          
        );

        // Filter only reviewed tickets
        const reviewedTickets = response.data.filter(
          (review) => review.review && review.review.trim() !== ""
        );

        setReviews(reviewedTickets);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    return "⭐".repeat(rating) || "No rating";
  };

  if (loading) {
    return <p className="text-center text-white">Loading reviews...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-8">
      <h2 className="text-3xl font-bold text-white text-center mb-6">Customer Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-center text-white text-opacity-80">No reviews available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-2xl shadow-2xl hover:bg-opacity-20 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white text-opacity-90">{review.title}</h3>
              <p className="text-sm text-white text-opacity-70 mb-2">Customer: {review.uid}</p>
              <p className="text-white text-opacity-90 mb-4">{review.review}</p>
              <p className="text-yellow-400 font-bold">{renderStars(review.rating)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewReviewsPage;
