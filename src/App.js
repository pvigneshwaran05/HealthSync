import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PatientDashboard from "./PatientDashboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/dashboard" element={<PatientDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
