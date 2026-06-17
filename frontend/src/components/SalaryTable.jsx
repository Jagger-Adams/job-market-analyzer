import './SalaryTable.css'

export default function SalaryTable({data}) {
    const maxSalary = Math.max(...data.map(item => item.salary));
    return(
    <div className="salaryTable col">
        <span className='h3 salaryTableTitle'>Salary by subcategory</span>
        <div className='salaryTableBody col'>
            {data.map((record) => {
                return <SalaryTableRow  record={record} maxSalary={maxSalary}/>
            })}
        </div>

    </div>
    );
}

function SalaryTableRow({record, maxSalary}) {
    const pct = Math.max(1, (record.salary / maxSalary) * 100 - 5)
    return(
        <div className='salaryRow col'>
            <span className='h4'>{record.subcategory}</span>
            <span className='h3 salaryLabel'>${record.salary}</span>
            <ProgressBar percent={pct} />
        </div>
    );
}

export function ProgressBar({ percent }) {
    return (
        <div className='progressBarParent' style={{ width: '100%' }}>
            <span className='progressBarChild' style={{ width: percent + '%' }} />
        </div>
    );
}