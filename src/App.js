import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import PatientSignUp from './frontend/PatientSignUP'
import PatientLogin from "./frontend/PatientLogin";
import PatientDashboard from "./frontend/PatientDashboard"
import DoctorLogin from "./frontend/DoctorLogin";
import DoctorSignup from "./frontend/DoctorSignup";
import DoctorDashboard from "./frontend/DoctorDashboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/patient-signup" element={<PatientSignUp />} />
                <Route path="/patient-login" element={<PatientLogin />} />
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/doctor-signup" element={<DoctorSignup />} />
                <Route path="/doctor-login" element={<DoctorLogin />} />
                <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
