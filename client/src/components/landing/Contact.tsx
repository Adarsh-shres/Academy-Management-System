export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Request Submitted!");
  };

  return (
    <section className="contact" id="contact">
        <div>
            <h1>Shape Academic Future</h1>
            <p>Join institutions worldwide.</p>
            <div className="contact-badge">2,400+ Institutions Worldwide</div>
            <p className="contact-quote">"Life is not about finding yourself it is about creating yourself"</p>
        </div>

        <div className="contact-right">
            <h2>Contact Us</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Full Name" required />
              <input type="email" placeholder="Email Address" required />
              <input type="tel" placeholder="Phone Number" required />
              <input type="text" placeholder="Institution / Organization" required />
              <textarea placeholder="Your Message" rows={4} required></textarea>
              <button type="submit" id="submitBtn">Send Message</button>
            </form>
        </div>
    </section>
  );
}
