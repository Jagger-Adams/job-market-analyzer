import './Overview.css'
import {useState, useEffect} from 'react'

import Loader from '../components/Loader'
import CustomPieChart from '../components/CustomPieChart'
import IndustryTable from '../components/IndustryTable'



export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const url = process.env.REACT_APP_API_URL +"/overview";

  useEffect(() => {
          async function fetchData() {
            const response = await fetch(url);
            const [json] = await Promise.all([
                fetch(url).then(r => r.json()),
                new Promise(resolve => setTimeout(resolve, 1200))
            ]);
            setData(json);
            setLoading(false);
          }
          fetchData();
      }, []);

  return(
    <div className='overviewRoot'>
      {loading ?
        <Loader text='Fetching latest Data' /> :
        <OverviewContent data={data} />
      }
    </div>
  );
}

function OverviewContent({ data }) {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const yearMonth = date.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
  return (
    <div className='overviewContent col'>
        <div className='overviewHeader row fadeIn' style={{'--i': 1}}>
          <div className='col fadeIn'>
            <span className='h1'>Canadian job market</span>
            <span className='h3'>{yearMonth} - Most recent data</span>
          </div>
          <div className='sourceBox col'>
            <span className='h5' style={{color: "var(--color-muted)"}}>Source</span>
            <a href="https://open.canada.ca/data/en/dataset/ea639e28-c0fc-48bf-b5dd-b8899bd43072" className='sourceCapsule h4'>
              ⛃ Canada Job Bank Open Data
            </a>
          </div>
        </div>
        <div className='overviewCards row fadeIn' style={{'--i': 2}}>
          <OverviewCard title="Postings this month" value={Math.round(data["posting_count"]).toLocaleString()} />
          <OverviewCard title="Avg annual salary" value={"$" + Math.round(data["average_salary"]).toLocaleString()} />
          <OverviewCard title="Full-time %" value={Math.round(data["fulltime_percent"]) + "%"} />
          <OverviewCard title="Permanent %" value={Math.round(data["permanent_percent"]) + "%"} />
          <OverviewCard title="Top industry" value={data['top_industries'][0].industry} />
        </div>
        <div className='overviewBody row fadeIn' style={{'--i': 3}}>
          <CustomPieChart data={data['province_postings']} dataKey="postings" nameKey="province" title='Postings by province' />
          <IndustryTable data={data['top_industries']} />
        </div>
    </div>
  );
}


function OverviewCard({title, value}){
  return(
    <div className='overviewCard col'>
      <span className='h3 overviewCardHeader' >{title}</span>
      <span className='h1' style={{color: title.includes("salary") ? "var(--color-positive)" : "var(--color-txt)"}}>{value}</span>
    </div>
  )
}