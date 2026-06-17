import './Trends.css'
import {useState, useEffect} from 'react'
import Loader from '../components/Loader'
import TrendChart from '../components/TrendChart'
import RolesTable from '../components/RolesTable'
import SalaryTable from '../components/SalaryTable'

const baseUrl = process.env.REACT_APP_API_URL

export default function Trends() {
  const [loading, setLoading] = useState(true);
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
          async function fetchIndustries() {
            const url = baseUrl + "/industries"
            const response = await fetch(url);
            const [json] = await Promise.all([
                fetch(url).then(r => r.json()),
                new Promise(resolve => setTimeout(resolve, 600))
            ]);
            setIndustries(json);
            setLoading(false);
          }
          fetchIndustries();
      }, []);

  return(
    <div className='trendsRoot'>
      {loading ?
        <Loader text='Fetching latest Data' /> :
        <TrendsContent industries={industries} />
      }
    </div>
  );
}

function TrendsContent({industries}) {
  const [industry, setIndustry] = useState(industries[0]);
  const [search, setSearch] = useState("");

  const visible = industries.filter(ind =>
    ind.toLowerCase().includes(search.toLowerCase())
  );

  return(
    <div className='trendsContent row' >
      <div className='industrySidebar col'>
        <span className='industryLabel h3'>Industry</span>
        <div className='searchBox row'>
          <svg className='searchIcon' viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M42 42L33.3 33.3M38 22C38 30.8366 30.8366 38 22 38C13.1634 38 6 30.8366 6 22C6 13.1634 13.1634 6 22 6C30.8366 6 38 13.1634 38 22Z" stroke="var(--color-muted)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/> </svg>
          <input className='industrySearch h4' 
          type='text'
          placeholder="Search…"
          onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className='industryOptions col'>
          {visible.map(ind => (
            <span key={ind} className={ind == industry ? 'industryOption selectedInd' : 'industryOption'} onClick={() => setIndustry(ind)}>{ind}</span>
          ))}
        </div>
      </div>
        <TrendsBody industry={industry}/>
    </div>
  );
}


function TrendsBody({industry}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  useEffect(() => {
          setLoading(true);
          async function fetchData() {
            const url = baseUrl + "/trends?industry=" + industry;
            const [json] = await Promise.all([
                fetch(url).then(r => r.json()),
                new Promise(resolve => setTimeout(resolve, 1200))
            ]);
            setData(json);
            setLoading(false);
          }
          fetchData();
      }, [industry]);
  return(
    <div className='trendsBodyWrapper'>
      {loading ?
        <Loader text='Fetching latest Data' /> :
        <div className='trendsBody col'>
          <span className='h2'>{industry}</span>
          <div className='chartWrap'>
            <TrendChart data={data.trend} xLabel='Month' yLabel='Postings' />
          </div>
          <div className='industryTables row'>
            <RolesTable data={data.growing_roles}/>
            <SalaryTable data={data.subcategory_salaries}/>
          </div>
        </div>
      }
    </div>
  );
}
