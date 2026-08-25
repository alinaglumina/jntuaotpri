import PdfViewer from './PdfViewer.jsx';
import Img from './Img.jsx';

// Universal preview that routes by file type:
//  image → inline image · pdf → PdfViewer · video → <video> · office → Office
//  Online embed · everything else → a download card. `type` is the server's
//  fileType (image|pdf|word|excel|powerpoint|video|archive|text|other).
const ICONS = {
  pdf: 'fa-file-pdf text-crimson', word: 'fa-file-word text-blue-600',
  excel: 'fa-file-excel text-green-600', powerpoint: 'fa-file-powerpoint text-orange-500',
  video: 'fa-file-video text-purple-600', archive: 'fa-file-zipper text-amber-600',
  text: 'fa-file-lines text-slate-500', image: 'fa-file-image text-teal-600', other: 'fa-file text-slate-500',
};
const OFFICE = new Set(['word', 'excel', 'powerpoint']);

export default function FilePreview({ url, type = 'other', name = 'File', height = 600 }) {
  if (!url) return null;

  if (type === 'image') return <div className="grid place-items-center rounded-lg bg-line/30 p-4"><Img src={url} alt={name} className="max-h-[70vh] w-auto" imgClassName="object-contain" /></div>;
  if (type === 'pdf') return <PdfViewer url={url} title={name} height={height} />;
  if (type === 'video') return (
    <video controls preload="metadata" className="w-full rounded-lg bg-black" style={{ maxHeight: height }}>
      <source src={url} /> Your browser can’t play this video. <a href={url}>Download it</a>.
    </video>
  );
  if (OFFICE.has(type)) {
    const embed = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    return (
      <div className="overflow-hidden rounded-lg border border-line">
        <iframe title={name} src={embed} width="100%" height={height} className="border-0" />
      </div>
    );
  }
  // archive / text / other → download card
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-line p-10 text-center">
      <i className={`fa-solid ${ICONS[type] || ICONS.other} mb-3 text-5xl`} aria-hidden="true" />
      <p className="font-medium text-content">{name}</p>
      <p className="text-sm text-muted">Preview isn’t available for this file type.</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 text-sm"><i className="fa-solid fa-download mr-1" />Download</a>
    </div>
  );
}
export const fileIcon = (type) => ICONS[type] || ICONS.other;
