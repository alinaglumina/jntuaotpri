import Card from './ui/Card.jsx';
import Img from './ui/Img.jsx';
import SafeHtml from './SafeHtml.jsx';
// News item card with optional image, excerpt (HTML), and read-more link.
export default function NewsCard({ title, image, excerpt, date, href }) {
  return (
    <Card hoverable className="overflow-hidden">
      {image && <Img src={image} alt="" ratio="16/9" className="h-40 w-full" />}
      <div className="p-5">
        {date && <p className="mb-1 text-xs text-slate-400">{new Date(date).toLocaleDateString('en-IN')}</p>}
        <h3 className="font-display text-lg text-navy">{title}</h3>
        {excerpt && <div className="mt-1 line-clamp-3 text-sm text-muted"><SafeHtml html={excerpt} /></div>}
        {href && <a href={href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-crimson">Read more <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" /></a>}
      </div>
    </Card>
  );
}
