export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Request Submitted!");
  };

  return (
    <section className="flex flex-col lg:flex-row gap-12 mt-12 items-start" id="contact">
        <div className="flex-1">
            <h2 className="text-[36px] md:text-[44px] font-extrabold text-[#4b3f68] mb-4 tracking-tight leading-tight">Shape Academic Future</h2>
            <p className="text-[16px] text-[#7c8697] leading-relaxed font-medium">Join institutions worldwide.</p>
            <div className="inline-block mt-8 px-4 py-2 text-[11px] font-bold tracking-[0.1em] uppercase text-primary bg-[#f5effa] rounded-sm shadow-sm border border-[#e2d9ed]">
                2,400+ Institutions Worldwide
            </div>
            <p className="mt-8 italic font-semibold text-[#7c8697]">"Life is not about finding yourself it is about creating yourself"</p>
        </div>

        <div className="w-full lg:w-[480px] bg-white p-8 md:p-10 rounded-sm shadow-[0_16px_36px_rgba(57,31,86,0.06)] border border-[#e7dff0]">
            <h2 className="text-[16px] font-bold text-[#4b3f68] mb-6 uppercase tracking-[0.1em] pb-4 border-b border-[#e2d9ed]">Contact Us</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="text" placeholder="Full Name" required className="w-full px-4 py-3 text-[14px] font-medium text-[#1e293b] border border-[#e2d9ed] rounded-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white" />
              <input type="email" placeholder="Email Address" required className="w-full px-4 py-3 text-[14px] font-medium text-[#1e293b] border border-[#e2d9ed] rounded-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white" />
              <input type="tel" placeholder="Phone Number" required className="w-full px-4 py-3 text-[14px] font-medium text-[#1e293b] border border-[#e2d9ed] rounded-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white" />
              <input type="text" placeholder="Institution / Organization" required className="w-full px-4 py-3 text-[14px] font-medium text-[#1e293b] border border-[#e2d9ed] rounded-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white" />
              <textarea placeholder="Your Message" rows={4} required className="w-full px-4 py-3 text-[14px] font-medium text-[#1e293b] border border-[#e2d9ed] rounded-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white resize-y min-h-[100px]"></textarea>
              <button type="submit" id="submitBtn" className="w-full mt-2 px-6 py-3.5 bg-primary text-white text-[14px] font-bold uppercase tracking-wide rounded-sm shadow-sm hover:-translate-y-px hover:shadow-md transition-all">Send Message</button>
            </form>
        </div>
    </section>
  );
}
