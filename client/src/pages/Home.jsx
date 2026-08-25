import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSlides, useNotifications, useAdministration } from '../api/public.js';
import { HeroSlider, NoticeCard, EventsSlider } from '../components/index.js';

const UNITS = [
  ['JNTUACEA Ananthapuramu', 'https://www.jntuacea.ac.in/', '/campuses/cea.jpg'],
  ['JNTUACEA Pulivendula', 'https://www.jntuacep.ac.in/', '/campuses/cep.jpg'],
  ['JNTUACEA Kalikiri', 'https://www.jntuacea.ac.in/', '/campuses/cek.jpg'],
  ['JNTUA OTPRI', 'https://www.jntua.ac.in/otpri', '/campuses/otpri.jpg'],
  ['JNTUA SMS', 'https://www.jntua.ac.in/profile/school-of-management-studies', '/campuses/sms.jpg'],
];
const RECOGNITIONS = [
  ['UGC', 'https://www.ugc.gov.in/', '/logos/ugc.png'],
  ['AICTE', 'https://www.aicte-india.org/', '/logos/aicte.png'],
  ['APSCHE', 'https://cets.apsche.ap.gov.in/', '/logos/apsche.png'],
  ['NAAC', 'https://www.naac.gov.in/', '/logos/naac-full.png'],
  ['NIRF', 'https://www.nirfindia.org/', '/logos/nirf.png'],
  ['MoE', 'https://www.education.gov.in/', '/logos/mhrd.png'],
  ['Govt. of AP', 'https://www.ap.gov.in/', '/logos/ap-emblem.png'],
];
const NOTIF_TABS = [['news', 'Latest News'], ['exam', 'Examinations'], ['admission', 'Admissions'], ['research', 'R&D'], ['placement', 'Placements'], ['sports', 'Sports'], ['tenders', 'Tenders']];

function Notifications() {
  const [cat, setCat] = useState('news');
  const { data = [] } = useNotifications(cat);
  return (
    <section className="w-full px-4 sm:px-8 lg:px-16 py-14">
      <div className="text-center"><h2 className="text-2xl">University Notifications</h2><div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" /></div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {NOTIF_TABS.map(([k, l]) => (
          k === 'exam' ? (
            <Link key={k} to="/academics/exam-calendars" className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-slate-200">{l}</Link>
          ) : (
            <button key={k} onClick={() => setCat(k)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${cat === k ? 'bg-navy text-white' : 'bg-slate-100 text-navy hover:bg-slate-200'}`}>{l}</button>
          )
        ))}
      </div>
      <div className="mx-auto mt-6 max-w-3xl">
        {data.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No notifications in this category yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 rounded-lg bg-white shadow-card">
            {data.slice(0, 8).map((n) => <NoticeCard key={n._id} id={n._id} title={n.title} category={n.category} date={n.publishedAt || n.createdAt} attachments={n.attachments} attachmentsNames={n.attachmentsNames} />)}
          </div>
        )}
        <div className="mt-4 text-center"><Link to="/notifications" className="btn-ghost text-sm">View all notifications</Link></div>
      </div>
    </section>
  );
}

function Hero() { const { data: slides = [] } = useSlides(); return <HeroSlider slides={slides} />; }

export default function Home() {
  const { data: vc } = useAdministration('vc');
  return (
    <>
      <title>JNTUA — Jawaharlal Nehru Technological University Anantapur</title>
      <Hero />

      {/* VC message */}
      <section className="section-tint">
        <div className="w-full px-4 sm:px-8 lg:px-16 grid gap-8 py-14 md:grid-cols-[320px_1fr] md:items-start">
          <div className="text-center">
            {vc?.photo ? (
              <img src={vc.photo} alt={vc?.name || 'Vice Chancellor'} className="mx-auto h-72 w-72 rounded-lg border-4 border-white object-cover shadow-lift ring-1 ring-gold/40" />
            ) : (
              <div className="mx-auto grid h-72 w-72 place-items-center rounded-lg border-4 border-white bg-navy/5 font-display text-lg text-navy shadow-lift ring-1 ring-gold/40">Photo</div>
            )}
            <p className="mt-3 font-display text-lg font-bold text-navy">Prof. H. Sudarsana Rao</p>
            <p className="text-sm text-slate-500">Vice Chancellor, JNTUA</p>
            {vc?.attachment ? (
              <a href={vc.attachment} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-3 text-sm">View Profile</a>
            ) : (
              <Link to="/administration/vice-chancellor" className="btn-ghost mt-3 text-sm">View Profile</Link>
            )}
          </div>
          <div className="relative">
            <i className="fa-solid fa-quote-left absolute -left-2 -top-4 text-5xl text-gold/20" aria-hidden="true" />
            <h3 className="text-2xl">Vice-Chancellor's Message</h3>
            <div className="mt-3 space-y-3 text-slate-700">
            <p>It is a matter of honor and immense pleasure that destiny has given me an opportunity to lead JNT University Anantapur.</p>
            <p>Higher education globally has witnessed significant change and remarkable growth. Every institution has geared up to meet global challenges by harnessing the latest technologies. The move towards inter-disciplinary studies, research-based and interactive learning with technology integration has opened up several options as well as multiple challenges.</p>
            <p>At JNTU Anantapur, our constant endeavor is to provide a conducive environment for teaching, learning and research, while fostering innovation, industry collaboration and holistic development of our students to prepare them for the challenges of tomorrow.</p>
              <Link to="/administration/vice-chancellor" className="inline-flex items-center gap-1 font-semibold text-crimson">Read more <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome + Events */}
      <section className="bg-paper">
        <div className="w-full px-4 sm:px-8 lg:px-16 py-14">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl">Welcome to JNTUA</h2>
              <div className="mt-2 h-1 w-16 rounded bg-gold" />
              <div className="mt-6 space-y-4 text-slate-700">
                <p>The College of Engineering, Anantapur was started at Guindy, Madras in 1946 and shifted to Anantapur in 1948. Initially affiliated to Madras University (1946–1955) and Sri Venkateswara University, Tirupathi (1955–1972). In 1972, by an Act of State Legislature, JNT University was established at Hyderabad and the College of Engineering, Anantapur went into the fold of JNTU. In 2008, JNTU was trifurcated into three independent universities — JNTU Hyderabad, JNTU Kakinada and JNTU Anantapur.</p>
                <p>Since its inception, JNTUA is committed to nurturing technological education and producing technical manpower comparable to the best in the world.</p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="stat-chip"><p className="font-display text-2xl font-bold text-navy">65</p><p className="text-xs text-slate-500">Engineering Colleges</p></div>
                <div className="stat-chip"><p className="font-display text-2xl font-bold text-navy">45</p><p className="text-xs text-slate-500">Pharmacy Colleges</p></div>
                <div className="stat-chip"><p className="font-display text-2xl font-bold text-navy">24</p><p className="text-xs text-slate-500">MBA/MCA Colleges</p></div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl">Latest University Events</h2>
              <div className="mt-2 h-1 w-16 rounded bg-gold" />
              <div className="mt-6">
                <EventsSlider />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Constituent units */}
      <section className="w-full px-4 sm:px-8 lg:px-16 py-14">
        <div className="text-center"><h2 className="text-2xl">Constituent Units</h2><div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" /></div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {UNITS.map(([name, url, photo]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="card-rich overflow-hidden text-center">
              <div className="h-24 w-full overflow-hidden bg-navy/5">
                <img src={photo} alt={name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <span className="block p-4 text-sm font-semibold text-navy">{name}</span>
            </a>
          ))}
        </div>
      </section>

      <Notifications />

      {/* Recognitions */}
      <section className="section-tint">
        <div className="w-full px-4 sm:px-8 lg:px-16 py-14">
          <div className="text-center"><h2 className="text-2xl">Our Recognitions & Approvals</h2><div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" /></div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {RECOGNITIONS.map(([label, url, logo]) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="badge-foil h-24 w-32">
                <img src={logo} alt={label} className="h-10 w-auto object-contain" />
                <span className="text-xs font-semibold text-navy">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="w-full px-4 sm:px-8 lg:px-16 grid gap-8 py-14 md:grid-cols-2">
        <div>
          <h3 className="text-2xl"><i className="fa-solid fa-address-card text-crimson" aria-hidden="true" /> Contact Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li><i className="fa-solid fa-location-dot mr-2 text-navy" aria-hidden="true" /><strong>JNTU Anantapur</strong>, Ananthapuramu – 515002, Andhra Pradesh, India</li>
            <li><i className="fa-solid fa-envelope mr-2 text-navy" aria-hidden="true" />registrar@jntua.ac.in · vc@jntua.ac.in</li>
            <li><i className="fa-solid fa-globe mr-2 text-navy" aria-hidden="true" /><a href="https://www.jntua.ac.in" target="_blank" rel="noopener noreferrer">www.jntua.ac.in</a></li>
          </ul>
        </div>
        <div className="overflow-hidden rounded-lg shadow-card">
          <iframe title="JNTUA location" className="h-64 w-full border-0" loading="lazy"
            src="https://www.google.com/maps?q=Jawaharlal+Nehru+Technological+University+Anantapur&output=embed" />
        </div>
      </section>
    </>
  );
}
