import './Trends.css'
import {useState, useEffect} from 'react'
import Loader from '../components/Loader'
import TrendChart from '../components/TrendChart'

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
  return(
    <div className='trendsContent row' >
      <div className='industrySidebar col'>
        <span className='industryLabel h3'>Industry</span>
        {industries.map(ind => (
          <span key={ind} className='industryOption' onClick={() => setIndustry(ind)}>{ind}</span>
        ))}
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
        <div className='trendsBody col' >
          <TrendChart data={data.trend} xLabel='Month' yLabel='Postings' />
        </div>
      }
    </div>
  );
}
