import './Overview.css'
import {useState, useEffect} from 'react'

import Loader from '../components/Loader';


export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const url = process.env.REACT_APP_API_URL +"/overview";

  useEffect(() => {
          async function fetchData() {
            const response = await fetch(url);
            const json = await response.json();
            console.log(json);
            setData(json);
            setLoading(false);
          }
          fetchData();
      }, []);

  return(
    <div className='overviewRoot'>
      {loading ?
        <Loader text='Fetching latest Data' /> :
        <div>
          <OverviewContent data={data} />
        </div>
      }
    </div>
  );
}

function OverviewContent({ data }) {
    return <div>data</div>;
}