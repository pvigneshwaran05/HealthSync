from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from model.NamePredictor import MedicalReportNameClassifier
from model.extractData import extract_health_data, update_patient_data
from model.recommendation_engine import BlogRecommendationEngine
from pymongo import MongoClient
import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

preprocessor = joblib.load("model/medical_condition_preprocessor.pkl")
model = joblib.load("model/medical_condition_model.pkl")
# recommendation_engine = BlogRecommendationEngine(mongo_uri="mongodb://localhost:27017/", db_name="test")
recommendation_engine = BlogRecommendationEngine(
    mongo_uri="mongodb+srv://admin:dkLF3xJGnS6C0DAp@cluster0.e3xkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    db_name="test"
)

classifier = MedicalReportNameClassifier()

MONGO_URI = "mongodb+srv://admin:dkLF3xJGnS6C0DAp@cluster0.e3xkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

try:
    client = MongoClient(MONGO_URI)
    db = client.get_database("test")  # Use 'test' or your actual DB name
    print("✅ Connected to MongoDB")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")

@app.route("/")
def home():
    return jsonify({"message": "Flask MongoDB Connection Successful!"})



@app.route("/predict", methods=["POST"])
def predict():
    """API endpoint to predict report type from user input."""
    try:
        data = request.get_json()
        report_name = data.get("report_name", "")

        if not report_name:
            return jsonify({"error": "Report name is required!"}), 400

        if len(report_name) > 50:
            # If input is too long, treat it as report content
            predictions = classifier.suggest_from_content(report_name)
        else:
            # Otherwise, treat it as a report name
            predictions = classifier.find_best_match(report_name)

        if not predictions:
            return jsonify({"message": "No suitable match found!"}), 404

        response = [
            {"report": p[0], "category": p[1], "confidence": round(p[2], 2)}
            for p in predictions
        ]

        return jsonify({"predictions": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# @app.route('/extractText', methods=['POST'])
# def process_text():
#     data = request.get_json()

#     if not data or "extracted_text" not in data or "upload_date" not in data or "existing_patient_data" not in data:
#         return jsonify({"error": "Missing required fields (extracted_text, upload_date, existing_patient_data)"}), 400

#     extracted_text = data["extracted_text"]
#     upload_date = data["upload_date"]
#     existing_patient_data = data["existing_patient_data"]

#     new_data = extract_health_data(extracted_text, upload_date)

#     # Update existing data with new data
#     updated_data = update_patient_data(existing_patient_data, new_data)

#     return jsonify({"message": "Text processed successfully", "data": updated_data})


@app.route('/extractText', methods=['POST'])
def process_text():
    data = request.get_json()

    if not data or "extracted_text" not in data or "upload_date" not in data:
        return jsonify({"error": "Missing required fields (extracted_text, upload_date)"}), 400

    extracted_text = data["extracted_text"]
    # upload_date = data["upload_date"]
    raw_upload_date = data["upload_date"]
    try:
        from dateutil import parser
        upload_date = parser.parse(raw_upload_date)
    except:
        # Fallback to current date if parsing fails
        upload_date = datetime.now()
    
    print("Formatted date:", upload_date)
    
    # Get existing_patient_data if provided, otherwise initialize empty dict
    existing_patient_data = data.get("existing_patient_data", {})
    if existing_patient_data == {}:
        existing_patient_data = None

    # Extract data from the text
    # new_data = extract_health_data(extracted_text, upload_date)

    # for key in new_data:
    #     if new_data[key]['value'] is not None and new_data[key]['date'] is None:
    #         new_data[key]['date'] = upload_date
    
    # Debug - check what was extracted
    # print("Extracted data:", new_data)
    
    # Only update if new data was found
    updated_data = update_patient_data(existing_patient_data, new_data)
    
    # Debug - check final result
    # print("Updated data:", updated_data)

    return jsonify({"message": "Text processed successfully", "data": updated_data})


@app.route('/predict_condition', methods=['POST'])
def predict_medical_condition():
    try:
        # Parse input JSON data
        data = request.get_json()

        # Convert to DataFrame
        input_data = pd.DataFrame([data])

        # Preprocess the data
        processed_data = preprocessor.transform(input_data)

        # Predict condition
        prediction = model.predict(processed_data)[0]
        probabilities = model.predict_proba(processed_data)[0]

        # Create a dictionary of condition probabilities
        condition_probabilities = dict(zip(model.classes_, probabilities))

        return jsonify({
            "predicted_condition": prediction,
            "probabilities": condition_probabilities
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/patient/blog-recommendations", methods=["GET"])
def get_blog_recommendations():
    """Get personalized blog recommendations for a patient."""
    user_email = request.args.get("email")
    limit = int(request.args.get("limit", 5))
    
    if not user_email:
        return jsonify({"error": "Email parameter is required"}), 400
    
    try:
        recommendations = recommendation_engine.get_recommendations(user_email, limit)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        print(f"Error getting recommendations: {str(e)}")
        return jsonify({"error": "Failed to get recommendations", "message": str(e)}), 500

@app.route("/patient/doctor-recommendations", methods=["GET"])
def get_doctor_recommendations():
    """Get doctor recommendations for a patient based on reading behavior."""
    user_email = request.args.get("email")
    limit = int(request.args.get("limit", 3))
    
    if not user_email:
        return jsonify({"error": "Email parameter is required"}), 400
    
    try:
        recommendations = recommendation_engine.get_category_recommendations(
            user_email, "doctor", limit)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        print(f"Error getting doctor recommendations: {str(e)}")
        return jsonify({"error": "Failed to get recommendations", "message": str(e)}), 500

@app.route("/patient/specialty-recommendations", methods=["GET"])
def get_specialty_recommendations():
    """Get specialty recommendations for a patient based on reading behavior."""
    user_email = request.args.get("email")
    limit = int(request.args.get("limit", 3))
    
    if not user_email:
        return jsonify({"error": "Email parameter is required"}), 400
    
    try:
        recommendations = recommendation_engine.get_category_recommendations(
            user_email, "specialty", limit)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        print(f"Error getting specialty recommendations: {str(e)}")
        return jsonify({"error": "Failed to get recommendations", "message": str(e)}), 500

@app.route("/patient/hospital-recommendations", methods=["GET"])
def get_hospital_recommendations():
    """Get hospital recommendations for a patient based on reading behavior."""
    user_email = request.args.get("email")
    limit = int(request.args.get("limit", 3))
    
    if not user_email:
        return jsonify({"error": "Email parameter is required"}), 400
    
    try:
        recommendations = recommendation_engine.get_category_recommendations(
            user_email, "hospital", limit)
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        print(f"Error getting hospital recommendations: {str(e)}")
        return jsonify({"error": "Failed to get recommendations", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)

