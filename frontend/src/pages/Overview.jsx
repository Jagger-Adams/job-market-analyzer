import './Overview.css'
import {useState, useEffect} from 'react'

import Loader from '../components/Loader';


export default function Overview() {
  const [loading, setLoading] = useState(true);

  return(
    <div className='overviewRoot'>
      {loading ?
        <Loader text='Fetching latest Data' /> :
        <div>
          <OverviewContent setLoading={setLoading} />
        </div>
      }
    </div>
  );
}

function OverviewContent({ setLoading }) {
    useEffect(() => {
        console.log("hi")
        setLoading(false);
    }, []);

    return <div>content</div>;
}