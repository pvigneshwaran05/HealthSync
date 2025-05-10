import React, { useState, useEffect } from "react";
import axios from "axios";
import WriteBlog from "./WriteBlog";
import "../../styles/MedicalBlogs.css";

const MedicalBlogs = ({ doctor }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("allBlogs"); // allBlogs, myBlogs, writeBlog
  const [selectedBlog, setSelectedBlog] = useState(null);
  
  useEffect(() => {
    fetchBlogs();
  }, []);
  
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/doctor/blogs");
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/doctor/blogs/${doctor.email}`);
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching doctor's blogs:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveView(tab);
    if (tab === "allBlogs") {
      fetchBlogs();
    } else if (tab === "myBlogs") {
      fetchMyBlogs();
    }
    // For writeBlog, we just change the view
  };
  
  const handleBlogSubmission = async (blogData) => {
    try {
      if (selectedBlog) {
        // Update existing blog
        await axios.put(`http://localhost:8000/blogs/${selectedBlog._id}`, blogData);
      } else {
        // Create new blog
        const res = await axios.post("http://localhost:8000/doctor/blogs", {
          ...blogData,
          doctor_email: doctor.email,
          doctor_name: doctor.name,
        });
        if (res.data.success) {
          alert(res.data.message);
        }
      }
      
      // Reset and fetch updated blogs
      setSelectedBlog(null);
      setActiveView("myBlogs");
      fetchMyBlogs();
    } catch (error) {
      console.error("Error saving blog:", error);
      alert("Failed to save blog. Please try again.");
    }
  };
  
  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setActiveView("writeBlog");
  };
  
  const handleDeleteBlog = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await axios.delete(`http://localhost:8000/blogs/${blogId}`);
        // Refresh blogs list
        if (activeView === "myBlogs") {
          fetchMyBlogs();
        } else {
          fetchBlogs();
        }
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Failed to delete blog.");
      }
    }
  };
  
  return (
    <div className="medical-blogs-container">
      <div className="blogs-nav">
        <button 
          className={`blog-nav-btn ${activeView === "allBlogs" ? "active" : ""}`}
          onClick={() => handleTabChange("allBlogs")}
        >
          All Blogs
        </button>
        <button 
          className={`blog-nav-btn ${activeView === "myBlogs" ? "active" : ""}`}
          onClick={() => handleTabChange("myBlogs")}
        >
          My Blogs
        </button>
        <button 
          className={`blog-nav-btn write-blog-btn ${activeView === "writeBlog" ? "active" : ""}`}
          onClick={() => {
            setSelectedBlog(null); // Reset selected blog when creating new
            handleTabChange("writeBlog");
          }}
        >
          <span>✏️</span> Write New Blog
        </button>
      </div>
      
      {activeView === "writeBlog" ? (
        <WriteBlog 
          doctor={doctor}
          existingBlog={selectedBlog} 
          onSubmit={handleBlogSubmission}
          onCancel={() => setActiveView(selectedBlog ? "myBlogs" : "allBlogs")}
        />
      ) : (
        <div className="blogs-content">
          <h3>{activeView === "myBlogs" ? "My Medical Blogs" : "All Medical Blogs"}</h3>
          
          {loading ? (
            <div className="blogs-loading">
              <div className="loading-spinner"></div>
              <p>Loading blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="no-blogs-message">
              <p>No blogs found. {activeView === "myBlogs" && "Start by writing your first medical blog!"}</p>
              {activeView === "myBlogs" && (
                <button 
                  className="start-writing-btn"
                  onClick={() => handleTabChange("writeBlog")}
                >
                  Start Writing
                </button>
              )}
            </div>
          ) : (
            <div className="blogs-grid">
              {blogs.map(blog => (
                <div key={blog._id} className="blog-card">
                  <div className="blog-header">
                    <h4>{blog.title}</h4>
                    <span className="blog-category">{blog.category}</span>
                  </div>
                  <div className="blog-preview">
                    {blog.content}
                  </div>
                  <div className="blog-footer">
                    <div className="blog-author">
                      <span className="author-name">{blog.doctor_name}</span>
                      <span className="author-specialty">{blog.doctor_email}</span>
                    </div>
                    <div className="blog-date">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="blog-actions">
                    {/* <button className="blog-action-btn view-btn">Read More</button> */}
                    {activeView === "myBlogs" && (
                      <>
                        <button 
                          className="blog-action-btn edit-btn"
                          onClick={() => handleEditBlog(blog)}
                        >
                          Edit
                        </button>
                        <button 
                          className="blog-action-btn delete-btn"
                          onClick={() => handleDeleteBlog(blog._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalBlogs;