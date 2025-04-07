import React, { useState, useEffect } from "react";
import "../../styles/DoctorWriteBlog.css";

const WriteBlog = ({ doctor, existingBlog, onSubmit, onCancel }) => {
  const [blogData, setBlogData] = useState({
    title: "",
    // category: "General Medicine",
    content: "",
    // tags: ""
  });
  
  // Initialize form with existing blog data if editing
  useEffect(() => {
    if (existingBlog) {
      setBlogData({
        title: existingBlog.title || "",
        // category: existingBlog.category || "General Medicine",
        content: existingBlog.content || "",
        // tags: existingBlog.tags ? existingBlog.tags.join(", ") : ""
      });
    }
  }, [existingBlog]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlogData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!blogData.title.trim() || !blogData.content.trim()) {
      alert("Please fill out all required fields");
      return;
    }
    
    // Process tags
    // const processedTags = blogData.tags
    //   .split(",")
    //   .map(tag => tag.trim())
    //   .filter(tag => tag.length > 0);
    
    onSubmit({
      ...blogData,
    });
  };
  
  return (
    <div className="write-blog-container">
      <h3>{existingBlog ? "Edit Blog" : "Write New Medical Blog"}</h3>
      
      <form className="blog-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={blogData.title}
            onChange={handleChange}
            placeholder="Enter blog title"
            required
          />
        </div>
        
        {/* <div className="form-group">
          <label htmlFor="category">Category*</label>
          <select
            id="category"
            name="category"
            value={blogData.category}
            onChange={handleChange}
            required
          >
            <option value="General Medicine">General Medicine</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Nutrition">Nutrition</option>
            <option value="Wellness">Wellness</option>
            <option value="Medical Research">Medical Research</option>
            <option value="Healthcare Policy">Healthcare Policy</option>
            <option value="Other">Other</option>
          </select>
        </div> */}
        
        <div className="form-group">
          <label htmlFor="content">Content*</label>
          <textarea
            id="content"
            name="content"
            value={blogData.content}
            onChange={handleChange}
            placeholder="Write your blog content here..."
            rows="12"
            required
          ></textarea>
        </div>
        
        {/* <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={blogData.tags}
            onChange={handleChange}
            placeholder="e.g. healthcare, medicine, wellness"
          />
        </div> */}
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {existingBlog ? "Update Blog" : "Publish Blog"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteBlog;