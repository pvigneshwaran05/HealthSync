import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css"

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Health Sync</h1>
        <p className="subtitle">Manage patient reports seamlessly</p>
        <div className="button-group">
          <button onClick={() => navigate("/patient-login")} className="patient-button">
            Sign in as Patient
          </button>
          <button onClick={() => navigate("/doctor-login")} className="doctor-button">
            Sign in as Doctor
          </button>
        </div>
      </div>
    </div>
  );
}