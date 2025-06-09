import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { FaSpinner, FaBars, FaHome, FaUser } from 'react-icons/fa';
import Sidebar from './Sidebar';

const ViewReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar-container');
      const toggleButton = document.querySelector('.sidebar-toggle');
      if (
        window.innerWidth < 1024 &&
        isSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        toggleButton &&
        !toggleButton.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  // Disable body scroll when sidebar is open on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = isSidebarOpen ? 'hidden' : 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASEURL}/tickets/reviews`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
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
  }, [navigate]);

  const renderStars = (rating) => {
    return rating ? "⭐".repeat(rating) : "No rating";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="flex-1 pb-20 overflow-y-auto lg:ml-72">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
              Customer Reviews
            </h2>
            <nav className="text-gray-300 text-sm mt-2">
              <Link to="/dashboard" className="hover:underline hover:text-purple-300">
                Dashboard
              </Link>
              {' / '}
              <span className="text-purple-300">Customer Reviews</span>
            </nav>
          </div>
          {loading && (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin h-8 w-8 text-purple-400" />
              <span className="ml-2 text-gray-200">Loading reviews...</span>
            </div>
          )}
          {error && (
            <div className="p-4 text-sm text-center text-red-400 bg-red-900 bg-opacity-50 rounded-xl mb-6">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg">
              {reviews.length === 0 ? (
                <p className="text-gray-300 text-center py-8">No reviews available</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="bg-gray-900 bg-opacity-50 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg hover:bg-opacity-70 transition-all duration-300"
                    >
                      <h3 className="text-lg font-semibold text-gray-200 truncate">{review.title}</h3>
                      <p className="text-sm text-gray-300 mb-2">
                        Customer: {review.firstName || 'Unknown'}
                      </p>
                      <p className="text-gray-200 mb-4 line-clamp-3">{review.review}</p>
                      <p className="text-yellow-400 font-bold">{renderStars(review.rating)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-purple-600 border-opacity-30 z-50">
        <div className="flex justify-around items-center p-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 text-purple-400 hover:text-white transition-colors sidebar-toggle"
          >
            <FaBars className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="p-3 text-purple-400 hover:text-white transition-colors"
          >
            <FaHome className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/account')}
            className="p-3 text-purple-400 hover:text-white transition-colors"
          >
            <FaUser className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewReviewsPage;