import TrendChart from '../components/TrendChart';
import SalaryTable from '../components/SalaryTable';

function Overview() {
  const data = {
  "trend": [
    {
      "year_month": "2024-10",
      "postings": 4343
    },
    {
      "year_month": "2024-11",
      "postings": 3840
    },
    {
      "year_month": "2024-12",
      "postings": 2874
    },
    {
      "year_month": "2025-01",
      "postings": 4370
    },
    {
      "year_month": "2025-02",
      "postings": 3628
    },
    {
      "year_month": "2025-03",
      "postings": 3387
    },
    {
      "year_month": "2025-04",
      "postings": 2077
    },
    {
      "year_month": "2025-05",
      "postings": 2161
    },
    {
      "year_month": "2025-06",
      "postings": 2140
    },
    {
      "year_month": "2025-07",
      "postings": 1444
    },
    {
      "year_month": "2025-08",
      "postings": 1308
    },
    {
      "year_month": "2025-09",
      "postings": 1481
    },
    {
      "year_month": "2025-10",
      "postings": 1645
    },
    {
      "year_month": "2025-11",
      "postings": 1322
    },
    {
      "year_month": "2025-12",
      "postings": 1156
    },
    {
      "year_month": "2026-01",
      "postings": 1634
    },
    {
      "year_month": "2026-02",
      "postings": 1545
    },
    {
      "year_month": "2026-03",
      "postings": 1695
    },
    {
      "year_month": "2026-04",
      "postings": 1603
    },
    {
      "year_month": "2026-05",
      "postings": 1518
    }
  ],
  "growing_roles": [
    {
      "role": "Information systems testing technicians",
      "pct_growth": 250
    },
    {
      "role": "Telecommunication carriers managers",
      "pct_growth": 100
    },
    {
      "role": "Electricians (except industrial and power system)",
      "pct_growth": 49.1
    },
    {
      "role": "Telecommunications line and cable installers and repairers",
      "pct_growth": 47.6
    },
    {
      "role": "Database analysts and data administrators",
      "pct_growth": 20
    }
  ],
  "subcategory_salaries": [
    {
      "subcategory": "Data Science and Analytics",
      "salary": 99840
    },
    {
      "subcategory": "Software Development",
      "salary": 96964
    },
    {
      "subcategory": "Telecommunication Management",
      "salary": 94953
    },
    {
      "subcategory": "Cybersecurity",
      "salary": 91875
    },
    {
      "subcategory": "Database Administration",
      "salary": 84741
    }
  ]
}


  return(
    <div style={{ width: '100%', height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box', padding: '3rem' }}>
      <SalaryTable data={data.subcategory_salaries}/>
    </div>
  );
}

export default Overview;