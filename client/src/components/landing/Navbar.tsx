import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  
  return (
    <nav>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/image - Edited.png" alt="Yogify Logo" style={{ height: '32px', width: '32px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          Yogify
        </h2>
        <ul>
            <li><a href="#benefits">Benefits</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
        <button onClick={() => navigate('/login')}>Request Demo</button>
    </nav>
  );
}
