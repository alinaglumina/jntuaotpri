import { useParams } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import { EmptyState } from '../components/AsyncState.jsx';
import { ACADEMICS } from '../content/nav.js';
import Sidebar from '../components/Sidebar.jsx';
import { ACADEMICS_SIDEBAR_GROUPS } from '../content/academicsSidebar.js';
import { useQuery } from '@tanstack/react-query';
import SafeHtml from '../components/SafeHtml.jsx';
import { pageContentQuery } from '../api/queries.js';
import DownloadsTable from '../components/DownloadsTable.jsx';

// Academics document pages (regulations, syllabi, exam calendars, downloads).
// These render the university's document tables, which are migrated in Phase 4
// (dacp_* / dap_regulations) and wired to their read endpoints in Phase 5.
export default function AcademicDocs() {
  const { slug } = useParams();
  const entry = ACADEMICS.find(([, , s]) => s === slug);
  const id = entry?.[0];
  const title = entry ? entry[1] : 'Academics';
  const { data: override } = useQuery({ ...pageContentQuery(id), enabled: !!id });
  const sidebarEl = <Sidebar variant="light" header={<h3 className="font-display text-lg font-bold">Academics</h3>} groups={ACADEMICS_SIDEBAR_GROUPS} />;
  return (
    <PageShell title={override?.heading || title} subtitle="Academic documents and downloads." sidebar={sidebarEl}>
      {slug === 'downloads' ? (
        <DownloadsTable section="academics-downloads" />
      ) : override?.body ? (
        <SafeHtml html={override.body} />
      ) : (
        <EmptyState label="Document listings are migrated with the ETL (Phase 4) and connected here in Phase 5." />
      )}
    </PageShell>
  );
}
