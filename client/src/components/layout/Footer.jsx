export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-900 py-8 text-center text-sm text-white/80">
      <div className="container">
        © {new Date().getFullYear()} JNTUA Oil Technological &amp; Pharmaceutical Research Institute (OTPRI).
        All rights reserved. &nbsp;|&nbsp; A Constituent Institute of Jawaharlal Nehru Technological University Anantapur.
      </div>
    </footer>
  );
}
