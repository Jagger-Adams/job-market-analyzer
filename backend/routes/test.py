import psycopg2
from dotenv import load_dotenv
import os
from datetime import date, timedelta
load_dotenv()

result = {}

conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST"),
    port=os.getenv("POSTGRES_PORT"),
    dbname=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD")
)
cur = conn.cursor()


response = {}
today = date.today()
start = today.replace(day=1, year=today.year - 2).strftime("%Y-%m")
industry = 'Technology'
cur.execute("""
                SELECT
                    year_month,
                    SUM(posting_count) AS postings
                FROM monthly_aggregates
                WHERE industry_category = %s
                AND year_month >= %s
                GROUP BY year_month
                ORDER BY year_month ASC; """, (industry, start))
result = cur.fetchall()
response['trend'] = [{'year_month': str(r[0]), 'postings': int(r[1])} for r in result]

print(response)
