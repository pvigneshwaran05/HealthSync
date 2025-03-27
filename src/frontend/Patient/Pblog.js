import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import "../styles/PatientDashboard.css";
import "../styles/Pblog.css";

export default function Pblog() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [activeTab, setActiveTab] = useState("blogs");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (!email) {
      navigate("/patient-login");
      return;
    }

    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:8000/patient/blogs");
        setBlogs(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [email, navigate]);

  const handleToggleSidebar = (newState) => {
    setSidebarCollapsed(newState);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // const handleBlogClick = (blog) => {
  //   setSelectedBlog(selectedBlog?._id === blog._id ? null : blog);
  // };

  const handleBlogClick = async (blog) => {
    // Toggle selected blog
    setSelectedBlog(selectedBlog?._id === blog._id ? null : blog);

    // Only track click if a blog is being selected (not deselected)
    if (selectedBlog?._id !== blog._id && email) {
      try {
        await axios.post("http://localhost:8000/patient/track-blog-click", {
          user_email: email,
          blog_id: blog._id
        });
      } catch (error) {
        console.error("Error tracking blog click:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <div className="logo">
            <span className="logo-icon">📖</span>
            <h2>MediCare Blogs</h2>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        <Sidebar 
          userInfo={{}} 
          onToggleSidebar={handleToggleSidebar}
          initialCollapsed={sidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className={`content-area ${sidebarCollapsed ? "expanded" : ""}`}>
          <div className="content-header">
            <h2>Medical Insights</h2>
            <div className="date-display">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <div className="blog-section">
            {blogs.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <p>No blogs available</p>
                <p className="empty-subtext">Check back later for medical insights</p>
              </div>
            ) : (
              <div className="blog-list">
                {blogs.map((blog) => (
                  <div 
                    key={blog._id} 
                    className="blog-card"
                    onClick={() => handleBlogClick(blog)}
                  >
                    <div className="blog-header">
                      <h3 className="blog-title">{blog.title}</h3>
                      <div className="blog-meta">
                        <span className="blog-author">By {blog.doctor_name}</span>
                        <span className="blog-date">
                          {formatDate(blog._id)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="blog-excerpt">
                      {blog.content.length > 200 
                        ? `${blog.content.substring(0, 200)}...` 
                        : blog.content}
                    </p>

                    {selectedBlog?._id === blog._id && (
                      <div className="blog-additional-details">
                        <div className="blog-doctor-info">
                          <h4>Doctor Details</h4>
                          <div className="doctor-detail">
                            <span className="detail-label">Hospital:</span>
                            <span className="detail-value">{blog.hospital || 'Not specified'}</span>
                          </div>
                          <div className="doctor-detail">
                            <span className="detail-label">Specialty:</span>
                            <span className="detail-value">{blog.specialty || 'Not specified'}</span>
                          </div>
                          <div className="doctor-detail">
                            <span className="detail-label">Contact:</span>
                            <span className="detail-value">{blog.doctor_email}</span>
                          </div>
                        </div>

                        <div className="blog-comments">
                          <h4>Comments</h4>
                          {blog.comments.length === 0 ? (
                            <p className="no-comments">No comments yet</p>
                          ) : (
                            blog.comments.map((comment, index) => (
                              <div key={index} className="comment">
                                <p>{comment.text}</p>
                                <div className="comment-meta">
                                  <span>{comment.author}</span>
                                  <span>{formatDate(comment.date)}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}