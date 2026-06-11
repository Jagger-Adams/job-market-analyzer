from fastapi import APIRouter, Request, Query
from datetime import date, timedelta

router = APIRouter()

@router.get("/industries")
def get_industries(request: Request):
    cur = request.app.state.conn.cursor()
    cur.execute("SELECT DISTINCT industry_category FROM monthly_aggregates WHERE industry_category IS NOT NULL ORDER BY industry_category")
    result = cur.fetchall()
    cur.close()
    return [r[0] for r in result]


@router.get("/trends")
def get_trends(request: Request, industry: str = Query(default=None)):
    response = {}
    cur = request.app.state.conn.cursor()
    today = date.today()
    start = today.replace(day=1, year=today.year - 2).strftime("%Y-%m")
    yearMonth = (today.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")
    prevMonth = (today.replace(day=1) - timedelta(days=32)).replace(day=1).strftime("%Y-%m")
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

    cur.execute("""
                    SELECT
                        curr.role,
                        ROUND(((curr.postings - prev.postings)::numeric / prev.postings) * 100, 1) AS pct_growth
                    FROM
                        (SELECT noc21_name AS role, SUM(posting_count) AS postings
                        FROM monthly_aggregates
                        WHERE industry_category = %s AND year_month = %s
                        GROUP BY noc21_name) curr
                    JOIN
                        (SELECT noc21_name AS role, SUM(posting_count) AS postings
                        FROM monthly_aggregates
                        WHERE industry_category = %s AND year_month = %s
                        GROUP BY noc21_name) prev
                    USING (role)
                    ORDER BY pct_growth DESC
                    LIMIT 5; """, (industry, yearMonth, industry, prevMonth))
    result = cur.fetchall()
    response['growing_roles'] = [{'role': str(r[0]), 'pct_growth': float(r[1])} for r in result]

    cur.execute("""
                    SELECT
                        subcategory,
                        ROUND(SUM(avg_salary_annual * posting_count)::numeric / SUM(posting_count)) AS salary
                    FROM monthly_aggregates
                    WHERE industry_category = %s AND avg_salary_annual IS NOT NULL
                    GROUP BY subcategory
                    ORDER BY salary DESC
                    LIMIT 5; """, (industry,))
    result = cur.fetchall()
    response['subcategory_salaries'] = [{'subcategory': str(r[0]), 'salary': int(r[1])} for r in result]

    cur.close()

    return response
