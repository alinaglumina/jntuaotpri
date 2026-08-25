import { useState } from 'react';
import {
  Button, Card, CardHeader, CardBody, Badge, Banner, Breadcrumb, Spinner,
  FormField, Input, Select, Checkbox, SearchBar, FileUpload, RichTextEditor,
  Table, Pagination, StatWidget, Chart, Modal, ConfirmDialog, useToast,
  PdfViewer,
} from '../components/ui/index.js';
import { HeroSlider, NoticeCard, NewsCard, GalleryGrid } from '../components/index.js';

const Section = ({ title, children }) => (
  <section className="border-b border-slate-200 py-8">
    <h2 className="mb-4 font-display text-2xl text-navy">{title}</h2>
    {children}
  </section>
);

const chartData = [{ name: 'Eng', value: 98 }, { name: 'Pharm', value: 33 }, { name: 'MBA', value: 29 }, { name: 'MCA', value: 14 }];

// Living reference of the JNTUA component library. Route: /ui-kit
export default function UIKit() {
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [page, setPage] = useState(2);
  const [html, setHtml] = useState('<p>Edit <b>me</b>…</p>');

  return (
    <div>
      <title>UI Kit — JNTUA</title>
      <Banner title="JNTUA Component Library" subtitle="Every reusable building block, in one place." eyebrow="Design System" />
      <div className="container">
        <Section title="Breadcrumb"><Breadcrumb items={[{ label: 'About', to: '/about/genesis' }, { label: 'UI Kit' }]} /></Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button><Button variant="crimson">Crimson</Button><Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button><Button variant="subtle">Subtle</Button><Button variant="danger" icon="fa-trash">Delete</Button>
            <Button loading>Loading</Button><Button size="sm">Small</Button><Button size="lg" icon="fa-download">Large</Button>
          </div>
        </Section>

        <Section title="Badges & Widgets">
          <div className="mb-4 flex gap-2">
            <Badge>navy</Badge><Badge tone="crimson">crimson</Badge><Badge tone="gold">gold</Badge><Badge tone="green">green</Badge><Badge tone="slate">slate</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatWidget icon="fa-bell" label="Notifications" value="128" tone="navy" />
            <StatWidget icon="fa-graduation-cap" label="Faculty" value="20" tone="crimson" />
            <StatWidget icon="fa-handshake" label="MOUs" value="12" tone="gold" />
            <StatWidget icon="fa-file-lines" label="Documents" value="66" tone="green" />
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader title="With header" subtitle="subtitle" icon="fa-star" /><CardBody>Card body content.</CardBody></Card>
            <NewsCard title="Convocation 2026 announced" date="2026-05-01" excerpt="<p>The annual convocation will be held...</p>" href="#" />
            <NoticeCard title="B.Tech R21 exam schedule released" category="exam" date="2026-06-10" href="#" />
          </div>
        </Section>

        <Section title="Forms & Inputs">
          <div className="grid max-w-xl gap-4">
            <FormField label="Text input" required hint="With a hint"><Input placeholder="Type here" /></FormField>
            <FormField label="Select"><Select options={['National', 'International']} /></FormField>
            <Checkbox label="A checkbox" />
            <SearchBar placeholder="Search components…" />
            <FormField label="File upload"><FileUpload label="" hint="PDF or image" onFile={() => toast.info('File selected')} /></FormField>
            <FormField label="Rich text editor"><RichTextEditor value={html} onChange={setHtml} /></FormField>
          </div>
        </Section>

        <Section title="Table & Pagination">
          <Table columns={[{ key: 'name' }, { key: 'value', label: 'Count' }]} rows={chartData.map((d, i) => ({ _id: i, ...d }))}
            actions={() => <Button size="sm" variant="ghost">Edit</Button>} />
          <Pagination page={page} total={200} pageSize={20} onPage={setPage} />
        </Section>

        <Section title="Charts">
          <div className="grid gap-6 md:grid-cols-3">
            <Card><CardBody><p className="mb-2 text-sm font-semibold text-slate-500">Bar</p><Chart type="bar" data={chartData} series={[{ key: 'value' }]} height={220} /></CardBody></Card>
            <Card><CardBody><p className="mb-2 text-sm font-semibold text-slate-500">Line</p><Chart type="line" data={chartData} series={[{ key: 'value' }]} height={220} /></CardBody></Card>
            <Card><CardBody><p className="mb-2 text-sm font-semibold text-slate-500">Pie</p><Chart type="pie" data={chartData} series={[{ key: 'value' }]} height={220} /></CardBody></Card>
          </div>
        </Section>

        <Section title="Overlays">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setModal(true)}>Open Modal</Button>
            <Button variant="danger" onClick={() => setConfirm(true)}>Confirm Dialog</Button>
            <Button variant="ghost" onClick={() => toast.success('Saved successfully!')}>Toast: success</Button>
            <Button variant="ghost" onClick={() => toast.error('Something failed.')}>Toast: error</Button>
          </div>
          <Modal open={modal} onClose={() => setModal(false)} title="Example Modal"
            footer={<Button size="sm" onClick={() => setModal(false)}>Close</Button>}>
            <p className="text-sm text-slate-600">Backdrop click or Esc closes this. Scroll is locked while open.</p>
          </Modal>
          <ConfirmDialog open={confirm} onConfirm={() => { setConfirm(false); toast.success('Confirmed'); }} onCancel={() => setConfirm(false)} />
        </Section>

        <Section title="Gallery (click to open lightbox)">
          <GalleryGrid items={[1, 2, 3, 4].map((n) => ({ src: `https://picsum.photos/seed/jntua${n}/400/300`, caption: `Sample ${n}` }))} />
        </Section>

        <Section title="Loader"><div className="flex items-center gap-3"><Spinner /><span className="text-sm text-slate-500">Inline spinner</span></div></Section>
      </div>
    </div>
  );
}
