import './Header.css'
import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

function Header() {
    const location = useLocation();
    const containerRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const [theme, setTheme] = useState(prefersDark ? 'dark' : 'light')

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const active = containerRef.current?.querySelector('a.active');
        setIndicatorStyle({
            left: active?.offsetLeft ?? 0,
            width: active?.offsetWidth ?? 0,
        });
    }, [location]);

    return(
        <div className="header row">
            <div className='headerLogoBox row'>
                <img src="/logo.svg" className='logo' alt="logo" />
                <span className='h1'>Job Trends Canada</span>
            </div>
            <div className='headerAnimationBox col'>
                <div className='headerBtnBox row h3' ref={containerRef}>
                    <NavLink to="/">Overview</NavLink>
                    <NavLink to="/trends">Trends</NavLink>
                    <NavLink to="/explore">Explore</NavLink>
                </div>
                <div className='headerIndicator' style={{ ...indicatorStyle, transition: 'all 0.3s ease' }} />
            </div>
            <div className='themeBox row'>
                <span className='h3 themeLabel'>Theme</span>
                <select className="themeSelect h4" value={theme} onChange={(e) => setTheme(e.target.value)}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>
        </div>
    );
}

export default Header;