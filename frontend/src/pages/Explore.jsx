import './Explore.css'
import Loader from '../components/Loader';
import MultiSeriesChart from '../components/MultiSeriesChart';
import {useState, useEffect} from 'react'

const CHART_COLORS = [
  'var(--color-chart1)', 'var(--color-chart2)', 'var(--color-chart3)',
  'var(--color-chart4)', 'var(--color-chart5)', 'var(--color-chart6)',
  'var(--color-chart7)', 'var(--color-chart8)',
];

const PROVINCE_OPTIONS = [
  'All Provinces',
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Québec',
  'Saskatchewan',
  'Yukon',
];

const EMPLOYMENT_TYPE_OPTIONS = [
  'Full-time',
  'Part-time',
  'Any'
]

const EMPLOYMENT_TERM_OPTIONS = ['Permanent', 'Temporary', 'Any'];

const NOW = new Date();
const MAX_MONTH = toYearMonth(NOW);
const MIN_MONTH = toYearMonth(new Date(NOW.getFullYear() - 2, NOW.getMonth(), 1));

const baseUrl = process.env.REACT_APP_API_URL;
const MAX_SERIES = 8;

export default function Explore() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [series, setSeries] = useState([]);
  const [filters, setFilters] = useState({
    startDate: MIN_MONTH,
    endDate: MAX_MONTH,
    province: 'All Provinces',
    employment_term: 'Permanent',
    employment_type: 'Full-time'

  });
  const [industries, setIndustries] = useState([]);
  const [showChart, setShowChart] = useState(false);

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
        showChart ? (
          <div className='col chartViewWrapper' >
            <button className='editFilterBtn' onClick={() => setShowChart(false)} > ← Edit filters </button>
            <ChartView series={series} filters={filters}/>
          </div>
        ) : (
          <div className='wizard col'>
            <div className='steps row fadeIn' style={{'--i': 1}}>
              <span className={step >= 1 ? 'stepNode completeNode h2':'stepNode h2'}>{step > 1 ? '✔':'1'}</span>
              <span className='h2'>Series</span>
              <div className="stepLine" style={{backgroundColor: step > 1 ? "var(--color-primary)" : "var(--color-border)" }}/>
              <span className={step >= 2 ? 'stepNode completeNode h2':'stepNode h2'}>{step > 2 ? '✔':'2'}</span>
              <span className='h2'>Filters & Range</span>
              <div className="stepLine" style={{backgroundColor: step > 2 ? "var(--color-primary)" : "var(--color-border)" }}/>
              <span className={step >= 3 ? 'stepNode completeNode h2':'stepNode h2'}>3</span>
              <span className='h2'>Visualize</span>
            </div>
            <div className='filterBody row fadeIn' style={{'--i': 2}}>
              {step == 1 ?
                <SeriesSelector industries={industries} series={series} setSeries={setSeries} /> :
                step == 2 ?
                  <FilterSelector filters={filters} setFilters={setFilters} /> :
                  <Visualizer series={series} filters={filters} setShowChart={setShowChart} />
              }
            </div>
            <div className='filterButtons row fadeIn' style={{'--i': 3}}>
              <button
                className='backBtn h3'
                style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
                onClick={() => setStep(Math.max(1, step - 1))}>← Back</button>
              {step < 3 &&
                <button className='nextBtn h3'
                  onClick={() => setStep(Math.min(3, step + 1))}>Next →</button>}
            </div>   
          </div>
        )
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
  const update = (key, value) => setFilters({ ...filters, [key]: value });
  const salary = filters.minSalary ?? 0;
  const employment_type = filters.employment_type ?? 'Full-time';
  const employment_term = filters.employment_term ?? 'Any';


  return(
    <div className='filterSelector col'>
      <div className='jobFilters row'>
        <div className='filtersLeft col'>
        <div className='col filterInput'>
          <span className='h4'>Employment Term</span>
          <div className='selector row'>
              {EMPLOYMENT_TERM_OPTIONS.map(opt => (
                <span key={opt}
                      className={employment_term === opt ? 'selectedType' : 'selectorOption'}
                      onClick={() => update("employment_term", opt)}>
                  {opt}
                </span>
              ))}
            </div>
        </div>
        <div className='col filterInput'>
          <div className='salHeader row'>
            <span className='h4'>Minimum Salary</span>
            <span className='h5'>{"$"+salary}</span>

          </div>
          <input
            className='minSalInput'
            type='range'
            min={0}
            max={200000}
            step={5000}
            value={salary}
            onChange={(e) => update('minSalary', Number(e.target.value))}
          />
        </div>
      </div>
      <div className='filtersRight col'>
          <div className='col filterInput'>
            <span className='h4'>Employment Type</span>
            <div className='selector row'>
              {EMPLOYMENT_TYPE_OPTIONS.map(opt => (
                <span key={opt}
                      className={employment_type === opt ? 'selectedType' : 'selectorOption'}
                      onClick={() => update("employment_type", opt)}>
                  {opt}
                </span>
              ))}
            </div>
        </div>
        <div className='col filterInput'>
          <span className='h4'>Province/Territory</span>
          <select value={filters.province ?? PROVINCE_OPTIONS[0]} onChange={(e) => update("province", e.target.value)}>
            {PROVINCE_OPTIONS.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>
      </div>
      </div>
      <div className='rangeSelector row'>
        <input
          type='month'
          className='dateInput h5'
          value={filters.startDate ?? ''}
          min={MIN_MONTH}
          max={filters.endDate ?? MAX_MONTH}
          onChange={(e) => update('startDate', e.target.value)}
        />
        <span className='dateArrow'>→</span>
        <input
          type='month'
          className='dateInput h5'
          value={filters.endDate ?? ''}
          min={filters.startDate ?? MIN_MONTH}
          max={MAX_MONTH}
          onChange={(e) => update('endDate', e.target.value)}
        />
      </div>
    </div>
  );
 }
function Visualizer({series, filters, setShowChart}) { 
  return(
    <div className='visualizer row'>
      <button className='visualizeBtn h3'
              onClick={() =>  setShowChart(true)}>Visualize Data</button>
    </div>
  );
 }


 function ChartView({ series, filters }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const url = baseUrl + "/explore?" + buildParams(series, filters);
      const [json] = await Promise.all([
        fetch(url).then(r => r.json()),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      setData(json);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <Loader text='Building your chart' />;

  return (
    <MultiSeriesChart data={data} yLabel='Postings' xLabel='Month' />
  );
}

function toYearMonth(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function buildParams(series, filters) {
  const params = new URLSearchParams();

  series.forEach(s => params.append('series', s));

  if (filters.province && filters.province !== 'All Provinces') {
    params.append('province', filters.province);
  }
  if (filters.minSalary) {
    params.append('min_salary', filters.minSalary);
  }
  if (filters.employment_type && filters.employment_type !== 'Any') {
    params.append('employment_type', filters.employment_type);
  }
  if (filters.employment_term && filters.employment_term !== 'Any') {
    params.append('employment_term', filters.employment_term);
  }
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate)   params.append('end_date', filters.endDate);

  return params.toString();
}