# from flask import Flask, request, jsonify
# from model.classifier import MedicalReportClassifier

# app = Flask(__name__)
# classifier = MedicalReportClassifier()

# @app.route('/classify', methods=['POST'])
# def classify_report():
#     data = request.get_json()
#     report_name = data.get("report_name")

#     if not report_name:
#         return jsonify({"error": "Report name is required"}), 400

#     result = classifier.find_best_match(report_name)
#     return jsonify({"best_match": result})

# if __name__ == '__main__':
#     app.run(host="0.0.0.0", port=5001, debug=True)


from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/classify', methods=['POST'])
def classify_report():
    data = request.get_json()
    report_name = data.get("report_name")

    if not report_name:
        return jsonify({"error": "Report name is required"}), 400

    print(f"Received Report Name: {report_name}")  # Print report name to console

    return jsonify({"message": "Report name received successfully", "report_name": report_name})

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5001, debug=True)
