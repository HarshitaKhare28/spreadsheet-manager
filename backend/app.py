from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from transformers import pipeline
import re

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Initialize summarizer (for insights)
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

def load_latest_file():
    """Load the most recent uploaded CSV/XLSX file."""
    files = [os.path.join(UPLOAD_FOLDER, f) for f in os.listdir(UPLOAD_FOLDER)
             if f.endswith(('.csv', '.xlsx'))]
    if not files:
        return None, None
    latest_file = max(files, key=os.path.getctime)
    if latest_file.endswith('.csv'):
        df = pd.read_csv(latest_file)
    else:
        df = pd.read_excel(latest_file)
    return df, latest_file


@app.route('/')
def home():
    return jsonify({"message": "Backend is running!"})


@app.route('/upload', methods=['POST'])
def upload_file():
    """Upload and summarize spreadsheet."""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)

        columns = df.columns.tolist()
        rows = len(df)

        # Summarize first few rows
        text = " ".join(df.astype(str).head(10).values.flatten())
        text = text[:1000]

        summary = summarizer(
            text,
            max_length=60,
            min_length=25,
            do_sample=False
        )[0]["summary_text"]

        return jsonify({
            "columns": columns,
            "rows": rows,
            "summary": summary
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/query', methods=['POST'])
def query_data():
    """Dynamic query handling for any dataset."""
    import re
    data = request.json
    query = data.get("query", "").lower()
    clean_query = re.sub(r'[^a-z0-9]', '', query)  # remove symbols/spaces for matching

    df, path = load_latest_file()
    if df is None:
        return jsonify({"error": "No uploaded file found"}), 400

    try:
        # Separate numeric and categorical columns
        numeric_cols = df.select_dtypes(include='number').columns.tolist()
        categorical_cols = df.select_dtypes(exclude='number').columns.tolist()

        # Convert numeric columns safely
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        # Clean numeric column names for matching
        clean_numeric_cols = {col: re.sub(r'[^a-z0-9]', '', col.lower()) for col in numeric_cols}

        # Helper to match numeric column from query
        matched = [col for col, clean_col in clean_numeric_cols.items() if clean_col in clean_query]
        if not matched and numeric_cols:
            matched = [numeric_cols[0]]  # fallback first numeric column
        num_col = matched[0] if matched else None

        # --- Row count ---
        if any(k in clean_query for k in ["howmanyrows", "numberofrows"]):
            return jsonify({"query": query, "answer": f"{len(df)} rows", "type": "count"})

        # --- Total / Sum ---
        elif any(k in clean_query for k in ["total", "sum"]):
            if num_col:
                total = df[num_col].sum()
                return jsonify({"query": query, "answer": f"Total {num_col}: {total}", "type": "sum"})
            return jsonify({"query": query, "answer": "No numeric column found for total."})

        # --- Average / Mean ---
        elif any(k in clean_query for k in ["average", "avg", "mean"]):
            if num_col:
                avg = df[num_col].mean()
                return jsonify({"query": query, "answer": f"Average {num_col}: {round(avg,2)}", "type": "average"})
            return jsonify({"query": query, "answer": "No numeric column found for average."})

        # --- Highest / Maximum ---
        elif any(k in clean_query for k in ["highest", "maximum", "max"]):
            if num_col:
                max_value = df[num_col].max()
                rows_with_max = df[df[num_col] == max_value]  # all rows with max value

                label_col = categorical_cols[0] if categorical_cols else None
                if label_col:
                    answer = f"{label_col}(s) {[row[label_col] for idx, row in rows_with_max.iterrows()]} have highest {num_col} = {max_value}"
                else:
                    answer = f"Highest {num_col} = {max_value}"

                return jsonify({
                    "query": query,
                    "answer": answer,
                    "details": rows_with_max.to_dict(orient='records'),
                    "type": "max"
                })
            return jsonify({"query": query, "answer": "No numeric column found for maximum."})

        # --- Lowest / Minimum ---
        elif any(k in clean_query for k in ["lowest", "minimum", "min"]):
            if num_col:
                min_value = df[num_col].min()
                rows_with_min = df[df[num_col] == min_value]

                label_col = categorical_cols[0] if categorical_cols else None
                if label_col:
                    answer = f"{label_col}(s) {[row[label_col] for idx, row in rows_with_min.iterrows()]} have lowest {num_col} = {min_value}"
                else:
                    answer = f"Lowest {num_col} = {min_value}"

                return jsonify({
                    "query": query,
                    "answer": answer,
                    "details": rows_with_min.to_dict(orient='records'),
                    "type": "min"
                })
            return jsonify({"query": query, "answer": "No numeric column found for minimum."})

        # --- Fallback ---
        else:
            return jsonify({"query": query, "answer": "Could not interpret query. Try total, average, highest, lowest, or row count."})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
