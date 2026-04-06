import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col items-center justify-center text-center mt-14" id="home">
        <h1 className="font-sans text-[42px] md:text-[54px] font-extrabold text-[#4b3f68] tracking-tight leading-tight">
          The Future of <br/>Academic Precision
        </h1>
        <p className="text-[14px] md:text-[15px] text-[#7c8697] mt-6 max-w-2xl leading-relaxed mb-8">
           Modern academic management system for forward-thinking institutions.<br/> Real-time performance tracking and resource monitoring built on a robust architecture.
        </p>

        <button 
           className="flex items-center justify-center gap-2 rounded-sm border border-transparent bg-[#6a5182] px-6 py-3 text-[13px] font-bold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
           onClick={() => navigate('/login')}>
           Login to Dashboard →
        </button>
    </section>
  );
}
