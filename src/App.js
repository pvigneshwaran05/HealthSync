import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import PatientSignUp from './frontend/PatientSignUP'
import PatientLogin from "./frontend/PatientLogin";
import PatientDashboard from "./frontend/PatientDashboard"
import DoctorLogin from "./frontend/DoctorLogin";
import DoctorSignup from "./frontend/DoctorSignup";
import DoctorDashboard from "./frontend/DoctorDashboard";
import HomePage from "./frontend/HomePage";
import DocumentUpload from "./frontend/DocumentUpload";
import Prediction from "./frontend/Prediction";
import Pblog from "./frontend/Pblog";
import PatientDocuments from "./frontend/PatientDocuments";
import DocumentDetails from "./frontend/DocumentDetails";

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
