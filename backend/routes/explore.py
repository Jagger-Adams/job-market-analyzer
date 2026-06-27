from fastapi import APIRouter, Request, Query
from typing import List, Optional

router = APIRouter()

@router.get("/explore")
def explore(
    request: Request,
    series: List[str] = Query(default=[]),
    province: Optional[str] = Query(default=None),
    min_salary: Optional[int] = Query(default=None),
    employment_type: Optional[str] = Query(default=None),
    employment_term: Optional[str] = Query(default=None),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
):
    
    cur = request.app.state.conn.cursor()
    response = {}

    fullTimeRatio = '1'
    permanentRatio = '1'

    if employment_type == 'Full-time': fullTimeRatio = 'pct_full_time'
    elif employment_type == 'Part-time': fullTimeRatio = '(1 - pct_full_time)'

    if employment_term == 'Permanent': permanentRatio = 'pct_permanent'
    elif employment_term == 'Temporary': permanentRatio = '(1 - pct_permanent)'

    for ind in series:
        query = f"""
                SELECT
                    year_month,
                    ROUND(SUM(posting_count * {fullTimeRatio} * {permanentRatio}))::int AS postings
                FROM monthly_aggregates
                WHERE
                    industry_category = %s
                    AND year_month >= %s AND year_month <= %s
                    AND (%s IS NULL OR province = %s)
                    AND (%s IS NULL OR avg_salary_annual >= %s)
                GROUP BY year_month
                ORDER BY year_month ASC
            """
        cur.execute(query, (ind, start_date, end_date, province, province, min_salary, min_salary))
        
        result = cur.fetchall()
        response[ind] = [{'year_month': str(r[0]), 'postings': int(r[1]) if r[1] else 0} for r in result]

    cur.close()
    return response