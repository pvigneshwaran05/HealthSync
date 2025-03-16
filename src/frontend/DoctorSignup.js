import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/PatientSignUp.css"

export default function DoctorSignUp() {
    const [doctorInfo, setDoctorInfo] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        speciality: "",
        hospitalName: "",
        experience: ""
    })

    const handleChange = (e) => {
        setDoctorInfo((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value 
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form from refreshing
        console.log("Submitting Form..."); // Check if function is called
        console.log("Sending Data:", doctorInfo);

        if (doctorInfo.password !== doctorInfo.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        const doctor = {
            name: doctorInfo.name,
            email: doctorInfo.email,
            password: doctorInfo.password,
            phone: doctorInfo.phoneNumber,
            speciality: doctorInfo.speciality,
            hospital: doctorInfo.hospitalName,
            experience: doctorInfo.experience,
        }
        console.log("sending data: ", doctor);
        try {
            console.log("sending data: ", doctor);
            const response = await axios.post('http://localhost:8000/doctor/signup', doctor);
            console.log(response);
            console.log(response.response.data.message);
            
            if(response.data.success) {
                alert("Doctor Signed Up Successfully");
            } else {
                alert("Failed to Sign Up");
            }
        } catch(e) {
            console.log(e);
            if(e.status === 400) {
                alert(e.response.data.message);
                return;
            }
        }
    }

    return (
        <div className="signup-container">
          <div className="signup-box">
            <h2 className="signup-title">Doctor Signup</h2>
    
            <form onSubmit={handleSubmit} className="signup-form">
              <label htmlFor="name">Name: </label>
              <input type="text" placeholder="Name" value={doctorInfo.name} name="name" onChange={handleChange} required
                className="" />

              <label htmlFor="email">Email: </label>
              <input type="email" placeholder="Email" value={doctorInfo.email} name="email" onChange={handleChange} required
                className="" />

              <label htmlFor="password">Password: </label>
              <input type="password" placeholder="Password" value={doctorInfo.password} name="password" onChange={handleChange} required
                className="" />

              <label htmlFor="confirmPassword">Confirm Password: </label>
              <input type="password" placeholder="Confirm Password" value={doctorInfo.confirmPassword} name="confirmPassword" onChange={handleChange} required
                className="" />

              <label htmlFor="phoneNumber">Phone Number: </label>
              <input type="tel" placeholder="Phone no." value={doctorInfo.phoneNumber} name="phoneNumber" onChange={handleChange} required
                className="" />

              <label htmlFor="speciality">Speciality: </label>
              <input type="text" placeholder="Speciality" value={doctorInfo.speciality} name="speciality" onChange={handleChange} required
                className="" />

              <label htmlFor="hospitalName">Hospital: </label>
              <input type="text" placeholder="Hospital Name" value={doctorInfo.hospitalName} name="hospitalName" onChange={handleChange} required
                className="" />

              <label htmlFor="experience">Experience(in years): </label>
              <input type="number" placeholder="experience" value={doctorInfo.experience} name="experience" onChange={handleChange} required
                className="" />
    
              <button type="submit" className="signup-button">
                Signup
              </button>
            </form>
    
            <p className="login-link">
              Already have an account?{" "}
              <a href="/doctor-login" className="">Login</a>
            </p>
          </div>
        </div>
      );
}