import re
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from difflib import get_close_matches

class MedicalReportNameClassifier:
    def __init__(self):
        # Define the report structure
        self.reports_dict = {
            "General Reports": [
                "Prescription", "Discharge Summary", "Medical History Report", "Consultation Notes"
            ],
            "Diagnostic Reports": [
                "Blood Test Report", "Urine Test Report", "Stool Test Report",
                "Hormone Test Report", "Genetic Test Report"
            ],
            "Imaging Reports": [
                "X-ray Report", "MRI Report", "CT Scan Report", "Ultrasound Report",
                "Mammogram Report", "PET Scan Report", "Doppler Scan Report"
            ],
            "Cardiovascular Reports": [
                "ECG Report", "Echocardiogram Report", "Holter Monitor Report", "Cardiac Stress Test Report"
            ],
            "Pulmonary Reports": [
                "Spirometry Report", "Chest X-ray Report", "Sleep Study Report"
            ],
            "Pathology & Microbiology Reports": [
                "Biopsy Report", "Culture & Sensitivity Report", "Allergy Test Report"
            ],
            "Endocrinology Reports": [
                "Diabetes Report", "Thyroid Function Report", "Bone Density Report"
            ],
            "Gastroenterology Reports": [
                "Endoscopy Report", "Colonoscopy Report", "Liver Function Test Report",
                "Pancreatic Function Test Report"
            ],
            "Neurology Reports": [
                "EEG Report", "Nerve Conduction Study Report", "CSF Analysis Report"
            ],
            "Orthopedic Reports": [
                "Bone X-ray Report", "Arthroscopy Report", "DEXA Scan Report"
            ],
            "Ophthalmology Reports": [
                "Vision Test Report", "Retinal Scan Report", "OCT Report", "Corneal Topography Report"
            ],
            "Dermatology Reports": [
                "Skin Biopsy Report", "Allergy Patch Test Report", "Mole Mapping Report"
            ],
            "Gynecology & Obstetrics Reports": [
                "Pregnancy Test Report", "Ultrasound OB/GYN Report", "Pap Smear Report", "Hormone Panel Report"
            ],
            "Oncology Reports": [
                "Tumor Marker Report", "Chemotherapy Report", "Radiotherapy Report", "PET Scan Report"
            ]
        }

        # Define keyword mappings to categories
        self.keyword_to_category = {
            "heart": "Cardiovascular Reports",
            "cardiac": "Cardiovascular Reports",
            "cardio": "Cardiovascular Reports",
            "ecg": "Cardiovascular Reports",
            "ekg": "Cardiovascular Reports",
            "blood": "Diagnostic Reports",
            "urine": "Diagnostic Reports",
            "x-ray": "Imaging Reports",
            "xray": "Imaging Reports",
            "mri": "Imaging Reports",
            "ct": "Imaging Reports",
            "scan": "Imaging Reports",
            "ultrasound": "Imaging Reports",
            "lung": "Pulmonary Reports",
            "pulmonary": "Pulmonary Reports",
            "respiratory": "Pulmonary Reports",
            "thyroid": "Endocrinology Reports",
            "diabetes": "Endocrinology Reports",
            "hormone": "Endocrinology Reports",
            "brain": "Neurology Reports",
            "neuro": "Neurology Reports",
            "eye": "Ophthalmology Reports",
            "vision": "Ophthalmology Reports",
            "skin": "Dermatology Reports",
            "pregnancy": "Gynecology & Obstetrics Reports",
            "gynec": "Gynecology & Obstetrics Reports",
            "obgyn": "Gynecology & Obstetrics Reports",
            "cancer": "Oncology Reports",
            "tumor": "Oncology Reports",
            "bone": "Orthopedic Reports",
            "joint": "Orthopedic Reports",
            "liver": "Gastroenterology Reports",
            "gastro": "Gastroenterology Reports",
            "digestive": "Gastroenterology Reports",
            "pancreas": "Gastroenterology Reports",
            "pancreatic": "Gastroenterology Reports",
            "biopsy": "Pathology & Microbiology Reports",
            "allergy": "Pathology & Microbiology Reports",
            "prescription": "General Reports",
            "discharge": "General Reports",
            "consultation": "General Reports",
            "genetic": "Diagnostic Reports"
        }

        # Flatten the structure for easy searching
        self.all_reports = []
        self.category_map = {}

        for category, reports in self.reports_dict.items():
            for report in reports:
                self.all_reports.append(report)
                self.category_map[report] = category

        # Initialize NLP tools
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        nltk.download('wordnet', quiet=True)
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()

        # Create TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words='english',
            ngram_range=(1, 2)
        )

        # Fit the vectorizer on our report types
        self.report_vectors = self.vectorizer.fit_transform(self.all_reports)
        
        # Extract report names without "Report" suffix for better matching
        self.report_name_parts = {}
        for report in self.all_reports:
            parts = report.lower().replace(" report", "").split()
            for part in parts:
                if part not in self.report_name_parts:
                    self.report_name_parts[part] = []
                self.report_name_parts[part].append(report)

    def preprocess_text(self, text):
        """Clean and preprocess text for better matching"""
        # Remove special characters and convert to lowercase
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())

        # Tokenize
        tokens = nltk.word_tokenize(text)

        # Remove stopwords and lemmatize
        cleaned_tokens = [self.lemmatizer.lemmatize(token) for token in tokens
                          if token not in self.stop_words]

        return ' '.join(cleaned_tokens)

    def find_best_match(self, report_name, top_n=3, threshold=0.3):
        """Find the most similar report type from the predefined list"""
        # Check for exact match first (case insensitive)
        for report in self.all_reports:
            if report_name.lower() == report.lower():
                return [(report, self.category_map[report], 1.0)]

        # Try fuzzy matching on full report names
        report_names_lower = [r.lower() for r in self.all_reports]
        close_matches = get_close_matches(report_name.lower(), report_names_lower, n=3, cutoff=0.7)
        if close_matches:
            results = []
            for match in close_matches:
                idx = report_names_lower.index(match)
                best_match = self.all_reports[idx]
                results.append((best_match, self.category_map[best_match], 0.9))
            return results

        # Try fuzzy matching on keywords
        close_keyword_matches = get_close_matches(report_name.lower(), list(self.keyword_to_category.keys()), n=1, cutoff=0.65)
        if close_keyword_matches:
            keyword = close_keyword_matches[0]
            mapped_category = self.keyword_to_category[keyword]
            
            # Find reports in this category
            category_reports = []
            for report in self.all_reports:
                if self.category_map[report] == mapped_category:
                    # Give higher confidence if the keyword is in the report name
                    confidence = 0.75 if keyword in report.lower() else 0.6
                    category_reports.append((report, mapped_category, confidence))
            
            # Sort by confidence in descending order
            category_reports.sort(key=lambda x: x[2], reverse=True)
            return category_reports[:top_n]

        # Try matching individual words in the input
        input_words = report_name.lower().split()
        matched_reports = set()
        
        for word in input_words:
            # Try fuzzy matching on individual words
            close_word_matches = get_close_matches(word, self.report_name_parts.keys(), n=1, cutoff=0.7)
            if close_word_matches:
                matched_word = close_word_matches[0]
                for report in self.report_name_parts[matched_word]:
                    matched_reports.add(report)
        
        if matched_reports:
            results = []
            for report in matched_reports:
                results.append((report, self.category_map[report], 0.7))
            # Sort by alphabetical order to make results consistent
            results.sort(key=lambda x: x[0])
            return results[:top_n]

        # Check for partial matches in report names
        for report in self.all_reports:
            if report_name.lower() in report.lower():
                return [(report, self.category_map[report], 0.95)]

        # If no match found yet, proceed with TF-IDF similarity
        processed_name = self.preprocess_text(report_name)
        input_vector = self.vectorizer.transform([processed_name])
        similarities = cosine_similarity(input_vector, self.report_vectors).flatten()
        top_indices = similarities.argsort()[-top_n:][::-1]

        results = []
        for idx in top_indices:
            best_match = self.all_reports[idx]
            category = self.category_map[best_match]
            similarity = similarities[idx]
            if similarity > threshold:
                results.append((best_match, category, similarity))
            else:
                # For low confidence matches, include the threshold but mark as low confidence
                results.append((best_match, category, max(0.1, similarity)))

        return results

    def suggest_from_content(self, report_content, top_n=3):
        """Suggest report types based on content analysis"""
        processed_content = self.preprocess_text(report_content)
        content_vector = self.vectorizer.transform([processed_content])
        similarities = cosine_similarity(content_vector, self.report_vectors).flatten()
        top_indices = similarities.argsort()[-top_n:][::-1]

        results = []
        for idx in top_indices:
            report = self.all_reports[idx]
            category = self.category_map[report]
            similarity = similarities[idx]
            results.append((report, category, similarity))

        return results

def demo_classifier():
    classifier = MedicalReportNameClassifier()

    while True:
        user_input = input("\nEnter the medical report name (or type 'exit' to quit): ").strip()

        if user_input.lower() == "exit":
            print("Exiting the classifier. Goodbye!")
            break

        # matches = classifier.find_best_match(user_input)
        if len(user_input) > 50:
            # If input is too long, assume it's report content
            print(f"Input exceeds 50 characters. Analyzing report content...\n")
            matches = classifier.suggest_from_content(user_input)
        else:
            # Otherwise, treat it as a report name
            matches = classifier.find_best_match(user_input)

        if not matches:
            print("No suitable match found. Try a different input.")
        else:
            print(f"\nTop matches for '{user_input}':")
            for i, (report, category, confidence) in enumerate(matches, 1):
                print(f"{i}. {report} (Category: {category}, Confidence: {confidence:.2f})")

        print("-" * 50)

if __name__ == "__main__":
    demo_classifier()