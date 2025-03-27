import "../../styles/PatientLogin.css"
import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function DoctorLogin() {
    const [credential, setCredential] = useState({
        email: "",
        password: ""
    })
    const navigate = useNavigate();


    const handleChange = (e) => {
        setCredential((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        //console.log(credential);
        try {
            const response = await axios.post("http://localhost:8000/doctor/login", 
                credential
            );
            if (response.status === 200) {
                console.log(response);
                sessionStorage.setItem("email", credential.email);
                navigate("/doctor-dashboard")
            }
            
        } catch(e) {
            alert(e.response.data.message);
            return;
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h4>Doctor Login</h4>
                <form onSubmit={handleSubmit}>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={credential.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />

                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={credential.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />

                    <button type="submit">Login</button>
                </form>
                <p>
                    Don't have an account? <a href="/doctor-signup">Sign Up</a>
                </p>
            </div>
        </div>
    );
}