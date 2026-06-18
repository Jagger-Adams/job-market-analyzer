import './Explore.css'
import Loader from '../components/Loader';
import {useState, useEffect} from 'react'

const CHART_COLORS = [
  'var(--color-chart1)', 'var(--color-chart2)', 'var(--color-chart3)',
  'var(--color-chart4)', 'var(--color-chart5)', 'var(--color-chart6)',
  'var(--color-chart7)', 'var(--color-chart8)',
];
const baseUrl = process.env.REACT_APP_API_URL;
const MAX_SERIES = 8;

export default function Explore() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [series, setSeries] = useState([]);
  const [filters, setFilters] = useState({});
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
    <div className='exploreRoot col'>
      {loading ? <Loader text='Loading industries' /> : (
        <div className='wizard col'>
        <div className='steps row'>
          <span className={step >= 1 ? 'stepNode completeNode h2':'stepNode h2'}>{step > 1 ? '✔':'1'}</span>
          <span className='h2'>Series</span>
          <div className="stepLine" style={{backgroundColor: step > 1 ? "var(--color-primary)" : "var(--color-border)" }}/>
          <span className={step >= 2 ? 'stepNode completeNode h2':'stepNode h2'}>{step > 2 ? '✔':'2'}</span>
          <span className='h2'>Filters & Range</span>
          <div className="stepLine" style={{backgroundColor: step > 2 ? "var(--color-primary)" : "var(--color-border)" }}/>
          <span className={step >= 3 ? 'stepNode completeNode h2':'stepNode h2'}>3</span>
          <span className='h2'>Visualize</span>
        </div>
        <div className='filterBody row'>
          {step == 1 ?
            <SeriesSelector industries={industries} series={series} setSeries={setSeries} /> :
            step == 2 ?
              <FilterSelector filters={filters} setFilters={setFilters} /> :
              <Visualizer series={series} filters={filters} />
          }
        </div>
        <div className='filterButtons row'>
          <button
            className='backBtn h3'
            style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
            onClick={() => setStep(Math.max(1, step - 1))}>← Back</button>
          {step < 3 &&
            <button className='nextBtn h3'
              onClick={() => setStep(Math.min(3, step + 1))}>Next →</button>}
        </div>   
      </div>
      )}
    </div>       
  );}
      
function SeriesSelector({ industries, series, setSeries }) {
  const [search, setSearch] = useState("");

  const available = industries.filter(ind =>
    !series.includes(ind) &&
    ind.toLowerCase().includes(search.toLowerCase())
  );

  const addSeries = (ind) => {
    if (series.length >= MAX_SERIES) return;
    setSeries([...series, ind]);
  };

  const removeSeries = (ind) => {
    setSeries(series.filter(s => s !== ind));
  };

  return (
    <div className='seriesSelector row'>
      <div className='seriesOptions col'>
        <div className='exploreSearchBox row'>
          <svg className='searchIcon' viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M42 42L33.3 33.3M38 22C38 30.8366 30.8366 38 22 38C13.1634 38 6 30.8366 6 22C6 13.1634 13.1634 6 22 6C30.8366 6 38 13.1634 38 22Z"
              stroke="var(--color-muted)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input className='exploreSearch h4'
            type='text'
            placeholder="Search industries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className='seriesOptionsBody col'>
          {available.map(ind => (
            <span key={ind} className='seriesOption' onClick={() => addSeries(ind)}>
              {ind}
            </span>
          ))}
          {available.length === 0 &&
            <span className='noMatch text'>No matches</span>}
        </div>
      </div>

      <div className='selectedSeries col'>
        <div className='selectedHeader row'>
          <div className='selectedSeriesTitle row'>
            <span className='h2'>Selected series</span>
            <span className='text selectedCounter'>{series.length} of {MAX_SERIES}</span>
          </div>
          {series.length > 0 &&
            <span className='clearAll text' onClick={() => setSeries([])}>Clear all</span>}
        </div>

        <div className='selectedBody col'>
          {series.map((ind, i) => (
            <div key={ind} className='seriesPill h5 row'>
              <span className='seriesDot'
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span>{ind}</span>
              <span className='pillRemove' onClick={() => removeSeries(ind)}>✕</span>
            </div>
          ))}
          {series.length === 0 &&
            <span className='noMatch text'>Click an industry to add it</span>}
        </div>
      </div>
    </div>
  );
}
function FilterSelector({filters, setFilters}) { 
  return(
    <div className='filterSelector'>
      
    </div>
  );
 }
function Visualizer({series, filters}) { 
  return(
    <div className='visualizer'>
      
    </div>
  );
 }