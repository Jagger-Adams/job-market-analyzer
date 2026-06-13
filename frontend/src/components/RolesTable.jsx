import './RolesTable.css'
import { PercentCapsule } from './IndustryTable';

export default function RolesTable({data}) {
    return(
    <div className="rolesTable col">
        <span className='h2 rolesTableTitle'>Fastest growing roles</span>
        <div className='rolesTableBody col'>
            {data.map((record) => {
                return <RolesTableRow  record={record}/>
            })}
        </div>

    </div>
    );
}

function RolesTableRow({ record }) {
    return(
        <div className='rolesTableRow row'>
            <div className='col'>
                <span className='h3'>{record.role}</span>
            </div>
            <PercentCapsule pct={record.pct_growth} />
        </div>
    );
}
