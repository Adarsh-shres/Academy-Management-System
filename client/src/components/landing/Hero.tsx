import { useNavigate } from 'react-router-dom';
import heroImage from '../../assets/hero-image.png';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero" id="benefits">
        <div className="hero-text">

            <h1>The Future of <br/><span>Academic Precision</span></h1>
            <p>Modern academic management system for institutions.</p>

            <div className="hero-buttons">
                <button className="primary" onClick={() => navigate('/login')}>Get Started</button>
                <button className="secondary"
                    onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Learn
                    More</button>
            </div>
        </div>

        <div className="hero-image">
            <img src={heroImage} alt="Academic Professional" />
        </div>
    </section>
  );
}
