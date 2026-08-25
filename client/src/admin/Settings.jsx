import { useState, useEffect } from 'react';
import { useSettingsMap, useSaveSettings } from '../api/cms.js';
import { Loading, ErrorState, Card, Button, FormField, Input, useToast } from '../components/ui/index.js';

// Grouped website settings editor (Website Settings + SEO defaults + socials).
const GROUPS = [
  { title: 'General', fields: [['university_name', 'University name'], ['contact_email', 'Contact email'], ['contact_phone', 'Contact phone'], ['vc_name', 'Vice-Chancellor']] },
  { title: 'Social Links', fields: [['facebook_url', 'Facebook'], ['twitter_url', 'Twitter / X'], ['linkedin_url', 'LinkedIn'], ['youtube_url', 'YouTube'], ['instagram_url', 'Instagram']] },
  { title: 'SEO Defaults', fields: [['seo_title', 'Default title'], ['seo_description', 'Default description'], ['seo_keywords', 'Keywords']] },
];

export default function Settings() {
  const toast = useToast();
  const { data, isLoading, isError, error } = useSettingsMap();
  const save = useSaveSettings();
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState error={error} />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async () => { try { await save.mutateAsync(form); toast.success('Settings saved.'); } catch (e) { toast.error(e.message); } };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl"><i className="fa-solid fa-gear mr-2 text-crimson" /> Website Settings</h1>
      <div className="mt-6 space-y-6">
        {GROUPS.map((g) => (
          <Card key={g.title} className="p-5">
            <h2 className="mb-4 text-lg">{g.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.fields.map(([key, label]) => (
                <FormField key={key} label={label}><Input value={form[key] || ''} onChange={(e) => set(key, e.target.value)} /></FormField>
              ))}
            </div>
          </Card>
        ))}
        <Button loading={save.isPending} onClick={submit}>Save settings</Button>
      </div>
    </div>
  );
}
