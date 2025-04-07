import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import PatientSignUp from './frontend/Patient/PatientSignUP'
import PatientLogin from "./frontend/Patient/PatientLogin";
import PatientDashboard from "./frontend/Patient/PatientDashboard"
import DoctorLogin from "./frontend/Doctor/DoctorLogin";
import DoctorSignup from "./frontend/Doctor/DoctorSignup";
import DoctorDashboard from "./frontend/Doctor/DoctorDashboard";
import HomePage from "./frontend/HomePage";
import DocumentUpload from "./frontend/Patient/DocumentUpload";
import Prediction from "./frontend/Patient/Prediction";
import Pblog from "./frontend/Patient/Pblog";
import PatientDocuments from "./frontend/Patient/PatientDocuments";
import DocumentDetails from "./frontend/Patient/DocumentDetails";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/patient-signup" element={<PatientSignUp />} />
                <Route path="/patient-login" element={<PatientLogin />} />
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/doctor-signup" element={<DoctorSignup />} />
                <Route path="/doctor-login" element={<DoctorLogin />} />
                <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                <Route path="/upload-documents" element={<DocumentUpload />} />
                <Route path="/prediction" element={<Prediction />} />
                <Route path="/Pblogs" element={<Pblog />}/>
                <Route path="/medical-report" element={<PatientDocuments />} />
                <Route path="/patient/document/:id" element={<DocumentDetails />} />

            </Routes>
        </Router>
    );
}

export default App;
