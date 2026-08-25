export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-900 py-8 text-center text-sm text-white/80">
      <div className="container">
        © {new Date().getFullYear()} Jawaharlal Nehru Technological University Anantapur.
        All rights reserved. &nbsp;|&nbsp; Designed &amp; maintained by the JNTUA Web Team.
      </div>
    </footer>
  );
}
