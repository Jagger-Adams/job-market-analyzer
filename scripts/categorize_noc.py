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

        prompt = f"""You are categorizing Canadian job occupations into broad industry categories.

                    Categories already in use (reuse these where appropriate to avoid duplicates):
                    {cats_text}

                    For each NOC code below, return a JSON array where each element has:
                    - noc21_code: the code as given
                    - industry_category: broad industry (e.g. Technology, Healthcare, Trades, Education, Finance, Legal, Retail, Transportation, Agriculture, Government, Arts, Hospitality)
                    - subcategory: specific role within that industry (e.g. Software Development, Nursing, Electrical, Primary Education)

                    Return ONLY the JSON array, no explanation, no markdown, no code fences.

                    NOC codes to categorize:
                    {batch_text}
                """

        response = requests.post("http://localhost:11434/api/generate", json={
            "model": "qwen2.5:7b",
            "prompt": prompt,
            "stream": False
        })

        try:
            results = json.loads(response.json()["response"])
            records = [(r["noc21_code"], dict(batch)[r["noc21_code"]], r["industry_category"], r["subcategory"]) for r in results]
            execute_values(cur,
                "INSERT INTO noc_categories (noc21_code, noc21_name, industry_category, subcategory) VALUES %s ON CONFLICT DO NOTHING",
                records)
            conn.commit()
            print(f"Batch {i//20 + 1} done ({len(records)} records)")
        except Exception as e:
            print(f"Batch {i//20 + 1} failed: {e}")
            continue

    print("Done.")

if __name__ == "__main__":
    main()