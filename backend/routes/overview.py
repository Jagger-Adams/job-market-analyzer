from fastapi import APIRouter, Request
from datetime import datetime, date, timedelta

router = APIRouter()

@router.get("/overview")
def get_overview(request: Request):
    return {"the api updates": "work"}
    cur = request.app.state.conn.cursor()
    today = date.today()
    yearMonth = (today.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")
    prevMonth = (today.replace(day=1) - timedelta(days=32)).replace(day=1).strftime("%Y-%m")
    
    #fetch overview metadata
    cur.execute("""
                    SELECT
                        AVG(avg_salary_annual) AS avgSalary,
                        SUM(posting_count) AS postingCount,
                        AVG(pct_full_time) * 100 AS pctFullTime,
                        AVG(pct_permanent) * 100 AS pctPermanent
                    FROM monthly_aggregates
                    WHERE
                        year_month = %s """, (yearMonth,))
    result = cur.fetchone()
    response = {
        'average_salary': float(result[0]), 
        'posting_count': float(result[1]),
        'fulltime_percent': float(result[2]),
        'permanent_percent': float(result[3])
    }

    #fetch top industries
    cur.execute("""
                    SELECT 
                        curr.industry_category,
                        curr.postings,
                        ROUND(((curr.postings - prev.postings)::numeric / prev.postings) * 100, 1) AS pct_change
                    FROM (
                        SELECT industry_category, SUM(posting_count) AS postings
                        FROM monthly_aggregates WHERE year_month = %s
                        GROUP BY industry_category
                    ) curr
                    LEFT JOIN (
                        SELECT industry_category, SUM(posting_count) AS postings
                        FROM monthly_aggregates WHERE year_month = %s
                        GROUP BY industry_category
                    ) prev USING (industry_category)
                    ORDER BY postings DESC LIMIT 5
                """, (yearMonth, prevMonth))
    result = cur.fetchall()
    topIndustries = [{"industry": str(r[0]), 'postings': int(r[1]), "percent_change": float(r[2]) if r[2] is not None else None} for r in result]
    response['top_industries'] = topIndustries
    
    #fetch province posting counts
    cur.execute("""
                    SELECT 
                        province,
                        SUM(posting_count) as postings
                    FROM monthly_aggregates
                    WHERE year_month = %s
                    GROUP BY province
                    ORDER BY postings DESC
                """, (yearMonth,))
    result = cur.fetchall()
    provincePostings = [{"province": str(r[0]), 'postings': int(r[1])} for r in result]
    response['province_postings'] = provincePostings
    cur.close()
    return response