import re
from datetime import datetime

def extract_health_data(text, external_date):
    # Dictionary to store results with dates
    data = {
        # 'age': {'value': None, 'date': None},
        # 'gender': {'value': None, 'date': None},
        'smoking_status': {'value': None, 'date': None},
        'bmi': {'value': None, 'date': None},
        'blood_pressure': {'value': None, 'date': None},
        'glucose_levels': {'value': None, 'date': None},
        # New parameters
        'cholesterol_ldl': {'value': None, 'date': None},
        'cholesterol_hdl': {'value': None, 'date': None},
        'cholesterol_total': {'value': None, 'date': None},
        'hemoglobin': {'value': None, 'date': None},
        'alt': {'value': None, 'date': None},
        'ast': {'value': None, 'date': None},
        'bilirubin': {'value': None, 'date': None},
        'creatinine': {'value': None, 'date': None},
        'egfr': {'value': None, 'date': None},
        'bun': {'value': None, 'date': None},
        'hba1c': {'value': None, 'date': None},
        'wbc': {'value': None, 'date': None}
    }

    # Date patterns
    date_patterns = [
        r'date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'date[:\s]*(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})',
        r'report date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})'
    ]

    # Extract date from the PDF
    pdf_date = None
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            try:
                # Try different date formats
                if re.match(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', date_str):
                    if '/' in date_str:
                        separator = '/'
                    else:
                        separator = '-'
                    parts = date_str.split(separator)
                    if len(parts[2]) == 2:
                        date_format = f"%d{separator}%m{separator}%y"
                    else:
                        date_format = f"%d{separator}%m{separator}%Y"
                    pdf_date = datetime.strptime(date_str, date_format)
                else:
                    # Try to parse text month format
                    pdf_date = datetime.strptime(date_str, "%d %b %Y")
            except ValueError:
                continue
            break

    # If no date found in PDF, use external date
    if pdf_date is None and external_date is not None:
        try:
            if isinstance(external_date, str):
                # Try common formats
                for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%d %b %Y"]:
                    try:
                        pdf_date = datetime.strptime(external_date, fmt)
                        break
                    except ValueError:
                        continue
            elif isinstance(external_date, datetime):
                pdf_date = external_date
        except:
            pdf_date = None

    # Age patterns
    # age_patterns = [
    #     r'age[:\s]*(\d+)',
    #     r'patient age[:\s]*(\d+)',
    #     r'(\d+)[\s]*years old',
    #     r'age[\s]*of[\s]*(\d+)'
    # ]

    # # Gender patterns
    # gender_patterns = [
    #     r'gender[:\s]*(male|female|m|f)',
    #     r'sex[:\s]*(male|female|m|f)',
    #     r'patient is a[n]* (\d+)[\s]*(year old)*[\s]*(male|female)'
    # ]

    # Smoking status patterns
    smoking_patterns = [
        r'smoking status[:\s]*(current smoker|former smoker|never smoker|non-smoker|smoker)',
        r'smoking[:\s]*(yes|no|former)',
        r'(smoker|non-smoker)'
    ]

    # BMI patterns
    bmi_patterns = [
        r'bmi[:\s]*(\d+\.?\d*)',
        r'body mass index[:\s]*(\d+\.?\d*)'
    ]

    # Blood pressure patterns
    bp_patterns = [
        r'blood pressure[:\s]*(\d+/\d+)',
        r'bp[:\s]*(\d+/\d+)',
        r'(\d+/\d+)[\s]*mmhg'
    ]

    # Glucose levels patterns
    glucose_patterns = [
        r'glucose[:\s]*(\d+\.?\d*)',
        r'blood glucose[:\s]*(\d+\.?\d*)',
        r'fasting glucose[:\s]*(\d+\.?\d*)'
    ]

    # New parameter patterns
    # Cholesterol patterns
    ldl_patterns = [
        r'ldl[:\s]*(?:cholesterol)?[:\s]*(\d+\.?\d*)',
        r'ldl-c[:\s]*(\d+\.?\d*)',
        r'low density lipoprotein[:\s]*(\d+\.?\d*)'
    ]

    hdl_patterns = [
        r'hdl[:\s]*(?:cholesterol)?[:\s]*(\d+\.?\d*)',
        r'hdl-c[:\s]*(\d+\.?\d*)',
        r'high density lipoprotein[:\s]*(\d+\.?\d*)'
    ]

    total_cholesterol_patterns = [
        r'total cholesterol[:\s]*(\d+\.?\d*)',
        r'cholesterol[,\s]*total[:\s]*(\d+\.?\d*)',
        r'cholesterol[:\s]*(\d+\.?\d*)'
    ]

    # Hemoglobin patterns
    hemoglobin_patterns = [
        r'hemoglobin[:\s]*(\d+\.?\d*)',
        r'hb[:\s]*(\d+\.?\d*)',
        r'hgb[:\s]*(\d+\.?\d*)'
    ]

    # Liver function patterns
    alt_patterns = [
        r'alt[:\s]*(\d+\.?\d*)',
        r'alanine(?:\s*amino)?[\s]*transferase[:\s]*(\d+\.?\d*)',
        r'sgpt[:\s]*(\d+\.?\d*)'
    ]

    ast_patterns = [
        r'ast[:\s]*(\d+\.?\d*)',
        r'aspartate(?:\s*amino)?[\s]*transferase[:\s]*(\d+\.?\d*)',
        r'sgot[:\s]*(\d+\.?\d*)'
    ]

    bilirubin_patterns = [
        r'(?:total[\s]*)?bilirubin[:\s]*(\d+\.?\d*)',
        r'bilirubin[\s]*total[:\s]*(\d+\.?\d*)'
    ]

    # Kidney function patterns
    creatinine_patterns = [
        r'creatinine[:\s]*(\d+\.?\d*)',
        r'serum creatinine[:\s]*(\d+\.?\d*)',
        r'cr[:\s]*(\d+\.?\d*)'
    ]

    egfr_patterns = [
        r'egfr[:\s]*(\d+\.?\d*)',
        r'estimated glomerular filtration rate[:\s]*(\d+\.?\d*)',
        r'gfr[:\s]*(\d+\.?\d*)'
    ]

    bun_patterns = [
        r'bun[:\s]*(\d+\.?\d*)',
        r'blood urea nitrogen[:\s]*(\d+\.?\d*)',
        r'urea nitrogen[:\s]*(\d+\.?\d*)'
    ]

    # HbA1c patterns
    hba1c_patterns = [
        r'hba1c[:\s]*(\d+\.?\d*)',
        r'a1c[:\s]*(\d+\.?\d*)',
        r'glycosylated hemoglobin[:\s]*(\d+\.?\d*)',
        r'glycated hemoglobin[:\s]*(\d+\.?\d*)'
    ]

    # WBC patterns
    wbc_patterns = [
        r'wbc[:\s]*(\d+\.?\d*)',
        r'white blood cell[s]?[:\s]*(?:count)?[:\s]*(\d+\.?\d*)',
        r'leukocytes?[:\s]*(\d+\.?\d*)'
    ]

    # Extract age
    # for pattern in age_patterns:
    #     match = re.search(pattern, text, re.IGNORECASE)
    #     if match:
    #         data['age']['value'] = int(match.group(1))
    #         data['age']['date'] = pdf_date
    #         break

    # # Extract gender
    # for pattern in gender_patterns:
    #     match = re.search(pattern, text, re.IGNORECASE)
    #     if match:
    #         if pattern == gender_patterns[2]:  # Special case for "patient is a..."
    #             gender = match.group(3).lower()
    #         else:
    #             gender = match.group(1).lower()

    #         if gender in ['m', 'male']:
    #             data['gender']['value'] = 'male'
    #         elif gender in ['f', 'female']:
    #             data['gender']['value'] = 'female'
    #         data['gender']['date'] = pdf_date
    #         break

    # Extract smoking status
    for pattern in smoking_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['smoking_status']['value'] = match.group(1).lower()
            data['smoking_status']['date'] = pdf_date
            break

    # Extract BMI
    for pattern in bmi_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['bmi']['value'] = float(match.group(1))
            data['bmi']['date'] = pdf_date
            break

    # Extract blood pressure
    for pattern in bp_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['blood_pressure']['value'] = match.group(1)
            data['blood_pressure']['date'] = pdf_date
            break

    # Extract glucose levels
    for pattern in glucose_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['glucose_levels']['value'] = float(match.group(1))
            data['glucose_levels']['date'] = pdf_date
            break

    # Extract new parameters
    # LDL Cholesterol
    for pattern in ldl_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['cholesterol_ldl']['value'] = float(match.group(1))
            data['cholesterol_ldl']['date'] = pdf_date
            break

    # HDL Cholesterol
    for pattern in hdl_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['cholesterol_hdl']['value'] = float(match.group(1))
            data['cholesterol_hdl']['date'] = pdf_date
            break

    # Total Cholesterol
    for pattern in total_cholesterol_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['cholesterol_total']['value'] = float(match.group(1))
            data['cholesterol_total']['date'] = pdf_date
            break

    # Hemoglobin
    for pattern in hemoglobin_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['hemoglobin']['value'] = float(match.group(1))
            data['hemoglobin']['date'] = pdf_date
            break

    # ALT (Liver)
    for pattern in alt_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['alt']['value'] = float(match.group(1))
            data['alt']['date'] = pdf_date
            break

    # AST (Liver)
    for pattern in ast_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['ast']['value'] = float(match.group(1))
            data['ast']['date'] = pdf_date
            break

    # Bilirubin (Liver)
    for pattern in bilirubin_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['bilirubin']['value'] = float(match.group(1))
            data['bilirubin']['date'] = pdf_date
            break

    # Creatinine (Kidney)
    for pattern in creatinine_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['creatinine']['value'] = float(match.group(1))
            data['creatinine']['date'] = pdf_date
            break

    # eGFR (Kidney)
    for pattern in egfr_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['egfr']['value'] = float(match.group(1))
            data['egfr']['date'] = pdf_date
            break

    # BUN (Kidney)
    for pattern in bun_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['bun']['value'] = float(match.group(1))
            data['bun']['date'] = pdf_date
            break

    # HbA1c
    for pattern in hba1c_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['hba1c']['value'] = float(match.group(1))
            data['hba1c']['date'] = pdf_date
            break

    # WBC
    for pattern in wbc_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['wbc']['value'] = float(match.group(1))
            data['wbc']['date'] = pdf_date
            break

    return data
def to_datetime(date_val):
    """Convert a string date to a datetime object if it's a string."""
    if isinstance(date_val, datetime):
        return date_val
    elif isinstance(date_val, str):
        try:
            return datetime.strptime(date_val, "%Y-%m-%d")
        except ValueError:
            return None
    return None

def update_patient_data(existing_data, new_data):
    """
    Update existing patient data with new data based on dates.
    If new data has a more recent date, update the value.
    """
    if existing_data is None:
        existing_data = {
            'smoking_status': {'value': None, 'date': None},
            'bmi': {'value': None, 'date': None},
            'blood_pressure': {'value': None, 'date': None},
            'glucose_levels': {'value': None, 'date': None},
            'cholesterol_ldl': {'value': None, 'date': None},
            'cholesterol_hdl': {'value': None, 'date': None},
            'cholesterol_total': {'value': None, 'date': None},
            'hemoglobin': {'value': None, 'date': None},
            'alt': {'value': None, 'date': None},
            'ast': {'value': None, 'date': None},
            'bilirubin': {'value': None, 'date': None},
            'creatinine': {'value': None, 'date': None},
            'egfr': {'value': None, 'date': None},
            'bun': {'value': None, 'date': None},
            'hba1c': {'value': None, 'date': None},
            'wbc': {'value': None, 'date': None}
        }

    for param in existing_data:
        new_val = new_data.get(param, {})
        existing_val = existing_data.get(param, {})

        # Convert dates to datetime objects for comparison
        new_date = to_datetime(new_val.get('date'))
        existing_date = to_datetime(existing_val.get('date'))

        # Case 1: Existing value is None, update unconditionally
        if existing_val.get('value') is None and new_val.get('value') is not None:
            existing_data[param]['value'] = new_val.get('value')
            existing_data[param]['date'] = new_val.get('date')

        # Case 2: Both values exist, update if new date is more recent
        elif (existing_val.get('value') is not None and 
              new_val.get('value') is not None and 
              new_date is not None and 
              existing_date is not None and 
              new_date > existing_date):
            existing_data[param]['value'] = new_val.get('value')
            existing_data[param]['date'] = new_date.strftime("%Y-%m-%d")  # Store as string for consistency

    return existing_data

def get_model_input(patient_data):
    """
    Extract values from patient data to feed into ML model
    """
    return [
        # patient_data['age']['value'],
        # patient_data['gender']['value'],
        patient_data['smoking_status']['value'],
        patient_data['bmi']['value'],
        patient_data['blood_pressure']['value'],
        patient_data['glucose_levels']['value'],
        # New parameters
        patient_data['cholesterol_ldl']['value'],
        patient_data['cholesterol_hdl']['value'],
        patient_data['cholesterol_total']['value'],
        patient_data['hemoglobin']['value'],
        patient_data['alt']['value'],
        patient_data['ast']['value'],
        patient_data['bilirubin']['value'],
        patient_data['creatinine']['value'],
        patient_data['egfr']['value'],
        patient_data['bun']['value'],
        patient_data['hba1c']['value'],
        patient_data['wbc']['value']
    ]

# Example usage
def process_new_pdf(pdf_text, existing_patient_data=None, upload_date=None):
    """
    Process a new PDF and update patient data

    Args:
        pdf_text: Text extracted from the PDF
        existing_patient_data: Existing patient data (if any)
        upload_date: Date when the PDF was uploaded (as a fallback)

    Returns:
        Updated patient data
    """
    # Extract data from the new PDF
    new_data = extract_health_data(pdf_text, upload_date)

    # Update existing data with new data
    updated_data = update_patient_data(existing_patient_data, new_data)

    # Check if we have all required fields for the model
    missing_fields = [field for field, data in updated_data.items()
                     if data['value'] is None]

    if missing_fields:
        print(f"Warning: Missing fields for ML model: {', '.join(missing_fields)}")

    return updated_data