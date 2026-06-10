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

today = date.today()
yearMonth = (today.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")
cur.execute("""
    SELECT
        AVG(avg_salary_annual) AS avgSalary,
        SUM(posting_count) AS postingCount,
        AVG(pct_full_time) * 100 AS pctFullTime,
        AVG(pct_permanent) * 100 AS pctPermanent
    FROM monthly_aggregates
    WHERE year_month = %s
""", (yearMonth,))

result = cur.fetchone()
response = {
    'average salary': float(result[0]), 
    'posting count': float(result[1]),
    'fulltime percent': float(result[2]),
    'permanent percent': float(result[3])
}

print(response)