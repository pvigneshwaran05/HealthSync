import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../styles/MedicalBlogs.css"

const MedicalBlogs = ({ doctor }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/blogs`, {
        params: {
          page: page,
          limit: 6, // 6 blogs per page
          excludeAuthor: doctor.email // Exclude the current doctor's blogs
        }
      });

      // If it's the first page, replace the blogs
      // If it's a subsequent page, append the blogs
      setBlogs(prevBlogs => 
        page === 1 ? response.data.blogs : [...prevBlogs, ...response.data.blogs]
      );

      // Check if there are more blogs to load
      setHasMore(response.data.blogs.length === 6);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  const loadMoreBlogs = () => {
    setPage(prevPage => prevPage + 1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="medical-blogs-container">
      <div className="blogs-header">
        <h2>Medical Insights & Blogs</h2>
        <button className="create-blog-btn">
          <span>📝</span> Write New Blog
        </button>
      </div>

      {loading && page === 1 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blogs...</p>
        </div>
      ) : (
        <>
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <div key={blog._id} className="blog-card">
                <div className="blog-header">
                  <div className="blog-author-info">
                    <div className="author-avatar">
                      {blog.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="author-details">
                      <h4>{blog.author.name}</h4>
                      <p>{blog.author.speciality}</p>
                    </div>
                  </div>
                  <span className="blog-date">{formatDate(blog.createdAt)}</span>
                </div>
                <div className="blog-content">
                  <h3>{blog.title}</h3>
                  <p>{blog.summary}</p>
                </div>
                <div className="blog-footer">
                  <button className="read-more-btn">Read Full Article</button>
                  <div className="blog-stats">
                    <span>👀 {blog.views || 0} Views</span>
                    <span>💬 {blog.comments || 0} Comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="load-more-container">
              <button 
                className="load-more-btn" 
                onClick={loadMoreBlogs}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Blogs'}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && blogs.length === 0 && (
        <div className="no-blogs-message">
          <p>No medical blogs available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default MedicalBlogs;