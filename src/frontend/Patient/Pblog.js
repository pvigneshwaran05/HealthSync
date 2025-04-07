import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/patientSidebar";
import "../../styles/PatientDashboard.css";
import "../../styles/PatientSidebar.css";
import "../../styles/Pblog.css";

export default function Pblog() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");
  const [blogs, setBlogs] = useState([]);
  const [recommendedBlogs, setRecommendedBlogs] = useState([]);
  const [doctorRecommendations, setDoctorRecommendations] = useState([]);
  const [specialtyRecommendations, setSpecialtyRecommendations] = useState([]);
  const [hospitalRecommendations, setHospitalRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [activeTab, setActiveTab] = useState("blogs");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (!email) {
      navigate("/patient-login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all blogs
        const blogsResponse = await axios.get("http://localhost:8000/patient/blogs");
        setBlogs(blogsResponse.data);
        
        // Fetch personalized recommendations
        const recommendationsResponse = await axios.get(
          `http://127.0.0.1:5000/patient/blog-recommendations?email=${email}&limit=5`
        );
        setRecommendedBlogs(recommendationsResponse.data.recommendations || []);
        
        // Fetch doctor recommendations
        const doctorRecsResponse = await axios.get(
          `http://127.0.0.1:5000/patient/doctor-recommendations?email=${email}&limit=3`
        );
        setDoctorRecommendations(doctorRecsResponse.data.recommendations || []);
        
        // Fetch specialty recommendations
        const specialtyRecsResponse = await axios.get(
          `http://127.0.0.1:5000/patient/specialty-recommendations?email=${email}&limit=3`
        );
        setSpecialtyRecommendations(specialtyRecsResponse.data.recommendations || []);
        
        // Fetch hospital recommendations
        const hospitalRecsResponse = await axios.get(
          `http://127.0.0.1:5000/patient/hospital-recommendations?email=${email}&limit=3`
        );
        setHospitalRecommendations(hospitalRecsResponse.data.recommendations || []);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [email, navigate]);

  // Add event listener for handling page unload when a blog is open
  useEffect(() => {
    const handlePageUnload = async () => {
      if (selectedBlog && email) {
        try {
          // Use navigator.sendBeacon for more reliable data sending during page unload
          const data = JSON.stringify({
            user_email: email,
            blog_id: selectedBlog._id,
            exited_at: new Date()
          });
          
          navigator.sendBeacon(
            "http://localhost:8000/patient/track-blog-exit", 
            new Blob([data], { type: 'application/json' })
          );
        } catch (error) {
          console.error("Error tracking blog exit on page unload:", error);
        }
      }
    };

    window.addEventListener('beforeunload', handlePageUnload);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('beforeunload', handlePageUnload);
    };
  }, [email, selectedBlog]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleToggleSidebar = (newState) => {
    setSidebarCollapsed(newState);
  };

  const openBlogModal = async (blog) => {
    setSelectedBlog(blog);

    // Track blog click with start time
    if (email) {
      try {
        await axios.post("http://localhost:8000/patient/track-blog-click", {
          user_email: email,
          blog_id: blog._id,
          clicked_at: new Date() // Send the current timestamp
        });
      } catch (error) {
        console.error("Error tracking blog click:", error);
      }
    }
  };

  const closeBlogModal = async () => {
    if (email && selectedBlog) {
      try {
        await axios.post("http://localhost:8000/patient/track-blog-exit", {
          user_email: email,
          blog_id: selectedBlog._id,
          exited_at: new Date() // Send the exit timestamp
        });
        
        // Refresh recommendations after closing a blog
        refreshRecommendations();
      } catch (error) {
        console.error("Error tracking blog exit:", error);
      }
    }
    
    setSelectedBlog(null);
  };
  
  const refreshRecommendations = async () => {
    try {
      // Fetch personalized recommendations
      const recommendationsResponse = await axios.get(
        `http://127.0.0.1:5000/patient/blog-recommendations?email=${email}&limit=5`
      );
      setRecommendedBlogs(recommendationsResponse.data.recommendations || []);
      
      // Fetch category recommendations
      const doctorRecsResponse = await axios.get(
        `http://127.0.0.1:5000/patient/doctor-recommendations?email=${email}&limit=3`
      );
      setDoctorRecommendations(doctorRecsResponse.data.recommendations || []);
      
      const specialtyRecsResponse = await axios.get(
        `http://127.0.0.1:5000/patient/specialty-recommendations?email=${email}&limit=3`
      );
      setSpecialtyRecommendations(specialtyRecsResponse.data.recommendations || []);
      
      const hospitalRecsResponse = await axios.get(
        `http://127.0.0.1:5000/patient/hospital-recommendations?email=${email}&limit=3`
      );
      setHospitalRecommendations(hospitalRecsResponse.data.recommendations || []);
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
    }
  };

  // Prepare blogs for display: recommended first, then others
  const getSortedBlogs = () => {
    if (!blogs.length) return [];

    // Get IDs of recommended blogs
    const recommendedBlogIds = recommendedBlogs.map(rec => rec._id);
    
    // Split blogs into recommended and others
    const recommended = [];
    const others = [];
    
    blogs.forEach(blog => {
      if (recommendedBlogIds.includes(blog._id.toString())) {
        recommended.push(blog);
      } else {
        others.push(blog);
      }
    });
    
    // Return recommended blogs first, followed by others
    return [...recommended, ...others];
  };

  if (loading) {
    return (
      <motion.div 
        className="loading-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="loading-spinner"></div>
        <p>Loading insights...</p>
      </motion.div>
    );
  }

  const sortedBlogs = getSortedBlogs();

  return (
    <div className="patient-dashboard">
      <nav className="enhanced-nav">
        <div className="nav-content">
          <div className="logo-container">
            <span className="logo-icon">📖</span>
            <h1 className="site-title">MediCare Insights</h1>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        <Sidebar 
          onToggleSidebar={handleToggleSidebar}
          initialCollapsed={sidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className={`content-area ${sidebarCollapsed ? "expanded" : ""}`}>
          <motion.div 
            className="page-header"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="section-title">Medical Blog Insights</h2>
            <p className="section-subtitle">
              Discover expert medical knowledge from our healthcare professionals
            </p>
            
            {recommendedBlogs.length > 0 && (
              <motion.div 
                className="recommendations-banner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="recommendation-tag">
                  <span className="tag-icon">🤖</span>
                  <span className="tag-text">Personalized recommendations shown first based on your reading habits</span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {sortedBlogs.length === 0 ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="empty-content">
                <span className="empty-icon">🩺</span>
                <p>No blogs available at the moment</p>
                <p className="empty-subtext">Check back soon for the latest medical insights</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="blog-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {sortedBlogs.map((blog, index) => {
                const isRecommended = recommendedBlogs.some(rec => rec._id === blog._id.toString());
                return (
                  <motion.div
                    key={blog._id}
                    className={`blog-card ${isRecommended ? "recommended" : ""}`}
                    onClick={() => openBlogModal(blog)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="blog-card-content">
                      {isRecommended && (
                        <div className="recommendation-badge">
                          <span className="recommendation-icon">⭐</span>
                          <span className="recommendation-text">Recommended</span>
                        </div>
                      )}
                      <h3 className="blog-title">{blog.title}</h3>
                      <div className="blog-meta">
                        <div className="blog-author">
                          <span className="author-avatar">👨‍⚕️</span>
                          <span className="author-name">{blog.doctor_name}</span>
                        </div>
                        <div className="blog-specialty">{blog.specialty || "General Medicine"}</div>
                      </div>
                      <div className="blog-preview">
                        {blog.content.substring(0, 80)}...
                      </div>
                      <button className="read-more-btn">Read Article</button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {selectedBlog && (
          <motion.div 
            className="blog-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBlogModal}
          >
            <motion.div 
              className="blog-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close-btn" onClick={closeBlogModal}>
                ✕
              </button>

              <div className="modal-header">
                <h2 className="modal-title">{selectedBlog.title}</h2>
                <div className="modal-meta">
                  <span className="meta-author">
                    <i className="icon-user"></i> {selectedBlog.doctor_name}
                  </span>
                  <span className="meta-date">
                    <i className="icon-calendar"></i> {formatDate(selectedBlog._id)}
                  </span>
                </div>
              </div>

              <div className="modal-body">
                <section className="blog-content">
                  <h3>Article Overview</h3>
                  <p>{selectedBlog.content}</p>
                </section>

                <section className="doctor-profile">
                  <h3>About the Author</h3>
                  <div className="profile-details">
                    <div className="profile-item">
                      <span className="profile-label">Hospital</span>
                      <span className="profile-value">
                        {selectedBlog.hospital || 'Not specified'}
                      </span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Specialty</span>
                      <span className="profile-value">
                        {selectedBlog.specialty || 'Not specified'}
                      </span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Contact</span>
                      <span className="profile-value">
                        {selectedBlog.doctor_email}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="blog-comments">
                  <h3>Community Insights</h3>
                  {selectedBlog.comments.length === 0 ? (
                    <div className="no-comments">
                      <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    <div className="comments-list">
                      {selectedBlog.comments.map((comment, index) => (
                        <div key={index} className="comment-item">
                          <p className="comment-text">{comment.text}</p>
                          <div className="comment-footer">
                            <span className="comment-author">{comment.author}</span>
                            <span className="comment-date">
                              {formatDate(comment.date)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                
                {/* Related Blogs Section */}
                {recommendedBlogs.length > 0 && (
                  <section className="related-blogs">
                    <h3>You Might Also Like</h3>
                    <div className="related-blogs-grid">
                      {recommendedBlogs
                        .filter(rec => rec._id !== selectedBlog._id.toString())
                        .slice(0, 3)
                        .map((rec, idx) => {
                          const relatedBlog = blogs.find(b => b._id.toString() === rec._id);
                          if (!relatedBlog) return null;
                          
                          return (
                            <div 
                              key={idx} 
                              className="related-blog-card"
                              onClick={(e) => {
                                e.stopPropagation();
                                closeBlogModal().then(() => {
                                  setTimeout(() => openBlogModal(relatedBlog), 300);
                                });
                              }}
                            >
                              <h4 className="related-blog-title">{relatedBlog.title}</h4>
                              <div className="related-blog-meta">
                                <span className="related-blog-author">By {relatedBlog.doctor_name}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </section>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}