import './Header.css'
import {useState} from 'react'
import { NavLink } from 'react-router-dom';


function Header() {
    const[activeTab, setActiveTab] = useState("overview");
    return(
    <div className="header row">
        <span className='h2'>Job Market App</span>
        <div className='headerBtnBox row h3'>
            <NavLink to="/">Overview</NavLink>
            <NavLink to="/trends">Trends</NavLink>
            <NavLink to="/explore">Explore</NavLink>
        </div>
    </div>
    );
}

export default Header;