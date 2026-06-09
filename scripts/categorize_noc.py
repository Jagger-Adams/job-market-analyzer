import psycopg2
from dotenv import load_dotenv
import os
from psycopg2.extras import execute_values
import requests
import json

def main():
    load_dotenv()

    conn = psycopg2.connect(
        host=os.getenv("POSTGRES_HOST"),
        port=os.getenv("POSTGRES_PORT"),
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD")
    )
    cur = conn.cursor()

    cur.execute("SELECT noc21_code FROM noc_categories")
    existing_codes = {row[0] for row in cur.fetchall()}

    cur.execute("SELECT DISTINCT noc21_code, noc21_name FROM raw_postings WHERE noc21_code IS NOT NULL")
    to_categorize = [row for row in cur.fetchall() if row[0] not in existing_codes]

    print(f"Categorizing {len(to_categorize)} NOC codes...")

    for i in range(0, len(to_categorize), 20):
        batch = to_categorize[i:i+20]
        batch_text = "\n".join([f"{code}: {name}" for code, name in batch])

        cur.execute("SELECT DISTINCT industry_category, subcategory FROM noc_categories")
        existing_cats = cur.fetchall()
        cats_text = "\n".join([f"{cat} > {sub}" for cat, sub in existing_cats]) if existing_cats else "None yet"

        prompt = f"""You are categorizing Canadian job occupations into a two-level hierarchy for a job market app.

Level 1 - industry_category: A broad industry bucket. Use only 10-15 total across all occupations.
Examples: Technology, Healthcare, Trades, Education, Finance, Legal, Retail, Transportation, Agriculture, Government, Arts, Hospitality, Manufacturing

Level 2 - subcategory: A mid-level grouping shared by MULTIPLE related NOC codes within the same industry.
Rules:
- 2-4 words maximum. Short, broad, user-friendly.
- Industry-specific: never use a bare generic like "Management" — use "Financial Management", "Healthcare Management" etc.
- Think about what end users care about: "Software Development", "Nursing", "Electrical", "Sales" — not "Correspondence and Regulatory Clerical Work"
- Every subcategory must belong to exactly one industry. No subcategory should appear under multiple industries.
- Multiple NOC codes in this batch should share the same subcategory where they are related.
- DO NOT copy the job title as the subcategory.
- The number of unique subcategories in your response will vary — some batches may have 1, others 10+. Do not aim for a fixed number.

Categories already in use (reuse these where appropriate):
{cats_text}

For each NOC code below, return a JSON array where each element has:
- noc21_code: the code as given
- industry_category: broad industry
- subcategory: short industry-specific grouping label (NOT the job title, 2-4 words max)

Return ONLY the JSON array, no explanation, no markdown, no code fences.

NOC codes to categorize:
{batch_text}
"""

        for attempt in range(2):
            try:
                response = requests.post("http://localhost:11434/api/generate", json={
                    "model": "qwen2.5:7b",
                    "prompt": prompt,
                    "stream": False
                }, timeout=480)
                results = json.loads(response.json()["response"])
                records = [(r["noc21_code"], dict(batch)[r["noc21_code"]], r["industry_category"], r["subcategory"]) for r in results]
                execute_values(cur,
                    "INSERT INTO noc_categories (noc21_code, noc21_name, industry_category, subcategory) VALUES %s ON CONFLICT DO NOTHING",
                    records)
                conn.commit()
                print(f"Batch {i//20 + 1} done ({len(records)} records)")
                break
            except Exception as e:
                if attempt == 1:
                    print(f"Batch {i//20 + 1} failed after retry: {e}")

    print("Done.")

if __name__ == "__main__":
    main()