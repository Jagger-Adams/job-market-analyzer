import csv
import psycopg2
from dotenv import load_dotenv
import os
from psycopg2.extras import execute_values
import requests
from datetime import datetime, timedelta

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

    #Hit Canada Job Bank API endpoint to fetch posting metadata
    response = requests.get('https://open.canada.ca/data/api/3/action/package_show?id=ea639e28-c0fc-48bf-b5dd-b8899bd43072')

    cutoff = (datetime.now() - timedelta(days=365*2)).strftime("%Y-%m")

    for posting in response.json()['result']['resources']:
        if posting['language'] != ['en'] or not posting['url']: continue
        rawPostingDate = " ".join(posting['name'].split()[:2])
        yearMonth = datetime.strptime(rawPostingDate, "%B %Y").strftime("%Y-%m")

        cur.execute("SELECT 1 FROM import_batches WHERE year_month = %s", (yearMonth,))
        if cur.fetchone():
            print(f"{yearMonth} already imported, skipping.")
            continue
        if yearMonth < cutoff:
            print(f"Reached cutoff at {yearMonth}, stopping.")
            break
        else:
            url = posting['url']
            response = requests.get(url)
            filepath = f"scripts/{yearMonth}_data.csv"
            with open(filepath, "wb") as f:
                f.write(response.content)
            saveToDatabase(yearMonth, filepath, cur, conn)


        
# Check DB and parse csv and save to DB
def saveToDatabase(yearMonth, filepath, cur, conn):
    cur.execute("INSERT INTO import_batches (year_month, source_file) VALUES (%s, %s) RETURNING id", (yearMonth, filepath))
    batch_id = cur.fetchone()[0]

    def na(val):
        return None if val in ("NA", "") else val

    def to_bool(val):
        if val == "Yes": return True
        if val == "No": return False
        else: return None

    with open(filepath, encoding="utf-16") as file:
        rd = csv.DictReader(file, delimiter="\t", quotechar='"')
        records = []
        for row in rd:
            records.append((batch_id, row['WIC Job Location Snapshot ID'], na(row['Job Title']),na(row['NOC21 Code']),na(row['NOC21 Code Name']),na(row['Province/Territory']),na(row['City']),na(row['First Posting Date']),na(row['Vacancy Count']),na(row['Employment Type']),na(row['Employment Term']),na(row['Salary Per']),na(row['Salary Minimum']),na(row['Salary Maximum']),to_bool(row['Employment Term Telework'])))


    execute_values(cur, 
                "INSERT INTO raw_postings (import_batch_id," \
                "                          snapshot_id," \
                "                          job_title, " \
                "                          noc21_code, " \
                "                          noc21_name, " \
                "                          province, " \
                "                          city, " \
                "                          first_posting_date," \
                "                          vacancy_count," \
                "                          employment_type," \
                "                          employment_term," \
                "                          salary_per," \
                "                          salary_min_raw," \
                "                          salary_max_raw," \
                "                          telework) " \
                "VALUES %s",
                    records)

    cur.execute("" \
        "UPDATE import_batches " \
        "SET row_count = %s "
        "WHERE id = %s ", 
        (len(records), batch_id))

    conn.commit()


    query = """
        WITH normalized AS (
        SELECT
            *,
            CASE
                WHEN salary_per = 'Hour' AND (salary_min_raw + salary_max_raw) / 2 * 40 * 52 BETWEEN 15000 AND 500000
                    THEN (salary_min_raw + salary_max_raw) / 2 * 40 * 52
                WHEN salary_per = 'Day' AND (salary_min_raw + salary_max_raw) / 2 * 5 * 52 BETWEEN 15000 AND 500000
                    THEN (salary_min_raw + salary_max_raw) / 2 * 5 * 52
                WHEN salary_per = 'Week' AND (salary_min_raw + salary_max_raw) / 2 * 52 BETWEEN 15000 AND 500000
                    THEN (salary_min_raw + salary_max_raw) / 2 * 52
                WHEN salary_per = 'Bi-Weekly' AND (salary_min_raw + salary_max_raw) / 2 * 26 BETWEEN 15000 AND 500000
                    THEN (salary_min_raw + salary_max_raw) / 2 * 26
                WHEN salary_per = 'Month' AND (salary_min_raw + salary_max_raw) / 2 * 12 BETWEEN 15000 AND 500000
                    THEN (salary_min_raw + salary_max_raw) / 2 * 12
                WHEN salary_per = 'Year' AND (salary_min_raw + salary_max_raw) / 2 BETWEEN 15000 AND 500000
                    THEN (salary_min_raw + salary_max_raw) / 2
                ELSE NULL
            END as annual_salary
        FROM raw_postings
    )
    select 
        year_month,
        rp.noc21_code,
        rp.noc21_name,
        industry_category,
        province,
        count(*) as posting_count,
        sum(vacancy_count) as total_vacancies,
        avg(annual_salary) as avg_salary_annual,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY annual_salary) AS median_salary,
        AVG(CASE WHEN employment_type = 'Full time' THEN 1.0 ELSE 0 END) as pct_full_time,
        AVG(CASE WHEN employment_term = 'Permanent employment' THEN 1.0 ELSE 0 END) as pct_permanent,
        AVG(CASE WHEN telework = TRUE THEN 1.0 ELSE 0 END) as pct_telework
    from normalized rp 
    join import_batches ib on
        rp.import_batch_id = ib.id
    left join noc_categories nc on 
        rp.noc21_code = nc.noc21_code
    where 
        rp.import_batch_id=%s AND
        rp.noc21_code IS NOT NULL
    group by
        year_month,
        rp.noc21_code,
        rp.noc21_name,
        industry_category,
        province
    """

    cur.execute(query, (batch_id,))
    rows = cur.fetchall()


    execute_values(cur, 
                "INSERT INTO monthly_aggregates (" \
                "                          year_month," \
                "                          noc21_code, " \
                "                          noc21_name, " \
                "                          industry_category, " \
                "                          province, " \
                "                          posting_count," \
                "                          total_vacancies," \
                "                          avg_salary_annual," \
                "                          median_salary," \
                "                          pct_full_time," \
                "                          pct_permanent," \
                "                          pct_telework) " \
                "VALUES %s",
                    rows)

    conn.commit()




if __name__ == "__main__":
    main()