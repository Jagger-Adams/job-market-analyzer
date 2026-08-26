from fastapi import APIRouter, Request, Query
from datetime import date, timedelta

router = APIRouter()

@router.get("/industries")
def get_industries(request: Request):
    cur = request.app.state.conn.cursor()
    cur.execute("SELECT name FROM industries ORDER BY name")
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
                        ma.year_month,
                        SUM(ma.posting_count) AS postings
                    FROM monthly_aggregates ma
                    JOIN noc_categories nc ON ma.noc21_code = nc.noc21_code
                    JOIN industries i ON nc.industry_id = i.id
                    WHERE i.name = %s
                    AND ma.year_month >= %s
                    GROUP BY ma.year_month
                    ORDER BY ma.year_month ASC; """, (industry, start))
    result = cur.fetchall()
    response['trend'] = [{'year_month': str(r[0]), 'postings': int(r[1])} for r in result]

    cur.execute("""
                    SELECT
                        curr.role,
                        ROUND(((curr.postings - prev.postings)::numeric / prev.postings) * 100, 1) AS pct_growth
                    FROM
                        (SELECT ma.noc21_name AS role, SUM(ma.posting_count) AS postings
                        FROM monthly_aggregates ma
                        JOIN noc_categories nc ON ma.noc21_code = nc.noc21_code
                        JOIN industries i ON nc.industry_id = i.id
                        WHERE i.name = %s AND ma.year_month = %s
                        GROUP BY ma.noc21_name) curr
                    JOIN
                        (SELECT ma.noc21_name AS role, SUM(ma.posting_count) AS postings
                        FROM monthly_aggregates ma
                        JOIN noc_categories nc ON ma.noc21_code = nc.noc21_code
                        JOIN industries i ON nc.industry_id = i.id
                        WHERE i.name = %s AND ma.year_month = %s
                        GROUP BY ma.noc21_name) prev
                    USING (role)
                    ORDER BY pct_growth DESC
                    LIMIT 5; """, (industry, yearMonth, industry, prevMonth))
    result = cur.fetchall()
    response['growing_roles'] = [{'role': str(r[0]), 'pct_growth': float(r[1])} for r in result]

    cur.execute("""
                    SELECT
                        s.name AS subcategory,
                        ROUND(SUM(ma.avg_salary_annual * ma.posting_count)::numeric / SUM(ma.posting_count)) AS salary
                    FROM monthly_aggregates ma
                    JOIN noc_categories nc ON ma.noc21_code = nc.noc21_code
                    JOIN industries i ON nc.industry_id = i.id
                    JOIN subcategories s ON nc.subcategory_id = s.id
                    WHERE i.name = %s AND ma.avg_salary_annual IS NOT NULL
                    GROUP BY s.name
                    ORDER BY salary DESC
                    LIMIT 5; """, (industry,))
    result = cur.fetchall()
    response['subcategory_salaries'] = [{'subcategory': str(r[0]), 'salary': int(r[1])} for r in result]

    cur.close()

    return response
