import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/PatientSignUp.css"

export default function PatientSignUp() {
    const [patientInfo, setPatientInfo] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        address: "",
        dob: "",
        gender:"",
        bloodGroup: ""
    })

    const handleChange = (e) => {
        setPatientInfo((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value 
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form from refreshing
        console.log("Submitting Form..."); // Check if function is called
        console.log("Sending Data:", patientInfo);

        if (patientInfo.password !== patientInfo.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        const patient = {
            name: patientInfo.name,
            email: patientInfo.email,
            password: patientInfo.password,
            phone: patientInfo.phoneNumber,
            address: patientInfo.address,
            dateOfBirth: patientInfo.dob,
            gender: patientInfo.gender,
            bloodGroup: patientInfo.bloodGroup,
        }
        console.log("sending data: ", patient);
        try {
            console.log("sending data: ", patient);
            const response = await axios.post('http://localhost:8000/patient/signup', patient);
            console.log(response);
            console.log(response.response.data.message);
            
            if(response.data.success) {
                alert("Patient Signed Up Successfully");
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
            <h2 className="signup-title">Patient Signup</h2>
    
            <form onSubmit={handleSubmit} className="signup-form">
              <label htmlFor="name">Name: </label>
              <input type="text" placeholder="Name" value={patientInfo.name} name="name" onChange={handleChange} required
                className="" />

              <label htmlFor="email">Email: </label>
              <input type="email" placeholder="Email" value={patientInfo.email} name="email" onChange={handleChange} required
                className="" />

              <label htmlFor="password">Password: </label>
              <input type="password" placeholder="Password" value={patientInfo.password} name="password" onChange={handleChange} required
                className="" />

              <label htmlFor="confirmPassword">Confirm Password: </label>
              <input type="password" placeholder="Confirm Password" value={patientInfo.confirmPassword} name="confirmPassword" onChange={handleChange} required
                className="" />

              <label htmlFor="phoneNumber">Phone Number: </label>
              <input type="tel" placeholder="Phone no." value={patientInfo.phoneNumber} name="phoneNumber" onChange={handleChange} required
                className="" />

              <label htmlFor="address">Address: </label>
              <input type="text" placeholder="Address" value={patientInfo.address} name="address" onChange={handleChange} required
                className="" />

              <label htmlFor="dob">Date of Birth: </label>
              <input type="date" placeholder="Date of Birth" value={patientInfo.dob} name="dob" onChange={handleChange} required
                className="" />

              <label htmlFor="gender">Gender: </label>
              <input type="text" placeholder="Gender" value={patientInfo.gender} name="gender" onChange={handleChange} required
                className="" />

              <label htmlFor="bloodGroup">Blood Group: </label>
              <input type="text" placeholder="Blood Group" value={patientInfo.bloodGroup} name="bloodGroup" onChange={handleChange} required
                className="" />
    
              <button type="submit" className="signup-button">
                Signup
              </button>
            </form>
    
            <p className="login-link">
              Already have an account?{" "}
              <a href="/patient-login" className="">Login</a>
            </p>
          </div>
        </div>
      );
}