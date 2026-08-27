import './Hamburger.css'

export default function Hamburger({ isOpen, onClick }) {
    return (
        <button className='hamburger' onClick={onClick}>
            <span className={`burgerLine l1 ${isOpen ? 'open' : ''}`}></span>
            <span className={`burgerLine l2 ${isOpen ? 'open' : ''}`}></span>
            <span className={`burgerLine l3 ${isOpen ? 'open' : ''}`}></span>
        </button>
    );
}