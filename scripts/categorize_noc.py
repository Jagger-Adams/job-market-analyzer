import psycopg2
from dotenv import load_dotenv
import os
from psycopg2.extras import execute_values
import requests
import json

# Deterministic industry mapping by first 2 digits of NOC code
NOC_INDUSTRY_MAP = {
    "00": "Government and Management",
    "10": "Business and Administration",
    "11": "Finance",
    "12": "Business and Administration",
    "13": "Business and Administration",
    "14": "Business and Administration",
    "20": "Engineering",
    "21": "Engineering",  # split below by 3rd digit
    "22": "Technology",
    "30": "Healthcare",
    "31": "Healthcare",
    "32": "Healthcare",
    "33": "Healthcare",
    "40": "Government and Management",
    "41": "Education and Social Services",
    "42": "Legal and Public Safety",
    "43": "Education and Social Services",
    "44": "Education and Social Services",
    "45": "Education and Social Services",
    "50": "Arts and Recreation",
    "51": "Arts and Recreation",
    "52": "Arts and Recreation",
    "53": "Arts and Recreation",
    "54": "Arts and Recreation",
    "55": "Arts and Recreation",
    "60": "Retail and Sales",
    "62": "Retail and Sales",
    "63": "Retail and Sales",
    "64": "Retail and Sales",
    "65": "Retail and Sales",
    "70": "Trades and Transportation",
    "72": "Trades and Transportation",
    "73": "Trades and Transportation",
    "74": "Trades and Transportation",
    "75": "Trades and Transportation",
    "80": "Agriculture and Resources",
    "82": "Agriculture and Resources",
    "83": "Agriculture and Resources",
    "84": "Agriculture and Resources",
    "85": "Agriculture and Resources",
    "90": "Manufacturing",
    "92": "Manufacturing",
    "93": "Manufacturing",
    "94": "Manufacturing",
    "95": "Manufacturing",
}

# Sub-major group 211/212/221/222 = natural/applied sciences = Technology
# 213/223 = engineering = Engineering
NOC_21_SPLIT = {
    "211": "Technology",
    "212": "Technology",
    "213": "Engineering",
    "221": "Technology",
    "222": "Technology",
    "223": "Engineering",
}

def get_industry(noc_code):
    prefix3 = noc_code[:3]
    if prefix3 in NOC_21_SPLIT:
        return NOC_21_SPLIT[prefix3]
    return NOC_INDUSTRY_MAP.get(noc_code[:2], "Other")

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
    to_categorize = [(code, name) for code, name in cur.fetchall() if code not in existing_codes]

    print(f"Categorizing {len(to_categorize)} NOC codes...")

    for i in range(0, len(to_categorize), 20):
        batch = to_categorize[i:i+20]
        industry_map = {code: get_industry(code) for code, name in batch}
        batch_text = "\n".join([f"{code}: {name} [industry: {industry_map[code]}]" for code, name in batch])

        cur.execute("SELECT DISTINCT industry_category, subcategory FROM noc_categories")
        existing_cats = cur.fetchall()
        cats_text = "\n".join([f"{cat} > {sub}" for cat, sub in existing_cats]) if existing_cats else "None yet"

        prompt = f"""You are assigning subcategories to Canadian job occupations for a job market app.

The industry_category is already assigned for each code — use it exactly as given.

Subcategory rules:
- 2-3 words max, broad and user-friendly
- Must be specific to the assigned industry (e.g. "Software Development" not just "Development")
- Multiple related NOC codes MUST share the same subcategory — do not give each code a unique one
- Never copy the job title
- Reuse existing subcategories below wherever they fit

Existing subcategories in use — REUSE THESE:
{cats_text}

Return a JSON array only. Each element:
- noc21_code: as given
- industry_category: exactly as given in brackets
- subcategory: 2-3 word grouping label

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