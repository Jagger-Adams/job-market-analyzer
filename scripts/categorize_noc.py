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

        prompt = f"""You are categorizing Canadian job occupations for a Canadian job market app.

Assign each NOC code to one industry_category and one subcategory from the lists below where possible.
Only create a NEW subcategory if none of the existing ones fit — this should be rare.

Allowed industry categories (use ONLY these):
Technology, Healthcare, Trades, Finance, Education, Legal, Retail, Transportation, Agriculture, Government, Hospitality, Manufacturing, Arts, Engineering

Subcategory rules:
- 2-3 words max, broad and user-friendly (e.g. "Software Development", "Nursing", "Mechanical Engineering", "Sales", "Accounting")
- Industry-specific: "Financial Management" not just "Management"
- Multiple NOC codes MUST share a subcategory if they are related — do not give each code its own unique subcategory
- Never copy the job title

Existing subcategories already in use — REUSE THESE:
{cats_text}

Return a JSON array only. Each element:
- noc21_code: as given
- industry_category: from allowed list
- subcategory: reuse existing or create new if truly necessary

No explanation, no markdown, no code fences.

NOC codes:
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