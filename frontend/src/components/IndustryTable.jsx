import './IndustryTable.css'

export default function IndustryTable({data}) {
    return(
    <div className="industryTable col">
        <span className='h2 industryTableTitle'>Top industries this month</span>
        <div className='industryTableBody col'>
            {data.map((record) => {
                return <IndustryTableRow  record={record}/>
            })}
        </div>

    </div>
    );
}

function IndustryTableRow({ record }) {
    return(
        <div className='industryTableRow row'>
            <div className='col'>
                <span className='h3'>{record.industry}</span>
                <span className='text industryPostingCount'>{record.postings} postings</span>
            </div>
            <PercentCapsule pct={record.percent_change} />
        </div>
    );
}

export function PercentCapsule({ pct }) {
    const str = pct < 0 ? `${pct}%` : `+${pct}%`;
    const color = pct < 0 ? 'var(--color-negative)' : 'var(--color-positive)';
    const bgColor = pct < 0 
        ? 'color-mix(in srgb, var(--color-negative) 20%, transparent)' 
        : 'color-mix(in srgb, var(--color-positive) 20%, transparent)';

    return (
        <span className='pctCapsule' style={{ color: color, backgroundColor: bgColor }}>
            {str}
        </span>
    );
}