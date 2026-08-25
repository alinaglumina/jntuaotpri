import { useForm, Controller } from 'react-hook-form';
import { FormField, Input, Textarea, Select, Checkbox, FileUpload, MultiImageUpload, MultiFileUpload, RichTextEditor, Button } from '../../components/ui/index.js';

// Builds a create/edit form from a resource's field defs, using the UI kit.
// html → RichTextEditor, file/image → FileUpload, plus text/select/date/checkbox.
export default function ResourceForm({ fields, initial, onSubmit, onCancel, busy, error }) {
  const defaults = {};
  for (const f of fields) {
    if (f.type === 'file' || f.type === 'image' || f.type === 'images' || f.type === 'files') continue;
    if (f.type === 'multiselect') { defaults[f.name] = Array.isArray(initial?.[f.name]) ? initial[f.name] : (f.default || []); continue; }
    if (f.type === 'date' && initial?.[f.name]) defaults[f.name] = String(initial[f.name]).slice(0, 10);
    else defaults[f.name] = initial?.[f.name] ?? (f.type === 'checkbox' ? (f.default ?? false) : '');
  }
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({ defaultValues: defaults });

  const submit = (values) => {
    const out = { ...values };
    for (const f of fields) if ((f.type === 'file' || f.type === 'image') && !(out[f.name] instanceof File)) delete out[f.name];
    for (const f of fields) if ((f.type === 'images' || f.type === 'files') && !(Array.isArray(out[f.name]) && out[f.name].every((v) => v instanceof File))) delete out[f.name];
    onSubmit(out);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {fields.map((f) => {
        if (f.type === 'file' || f.type === 'image') {
          return <FileUpload key={f.name} label={f.label} accept={f.type === 'image' ? 'image/*' : undefined}
            current={initial?.[f.name]} onFile={(file) => setValue(f.name, file)} />;
        }
        if (f.type === 'images') {
          return <MultiImageUpload key={f.name} label={f.label} min={f.min || 4} max={f.max || 8}
            current={Array.isArray(initial?.[f.name]) ? initial[f.name] : []} onFiles={(files) => setValue(f.name, files)} />;
        }
        if (f.type === 'files') {
          return <MultiFileUpload key={f.name} label={f.label} max={f.max || 8}
            current={Array.isArray(initial?.[f.name]) ? initial[f.name] : []} onFiles={(files) => setValue(f.name, files)} />;
        }
        if (f.type === 'checkbox') return <Controller key={f.name} name={f.name} control={control} render={({ field }) => <Checkbox label={f.label} checked={!!field.value} onChange={field.onChange} />} />;
        if (f.type === 'multiselect') {
          return (
            <FormField key={f.name} label={f.label} required={f.required} error={errors[f.name] && `${f.label} is required`}>
              <Controller name={f.name} control={control} rules={{ required: f.required ? (v) => (v && v.length > 0) : false }}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-3">
                    {f.options.map((o) => {
                      const opt = typeof o === 'string' ? { value: o, label: o } : o;
                      const checked = Array.isArray(field.value) && field.value.includes(opt.value);
                      return (
                        <label key={opt.value} className="flex items-center gap-1.5 text-sm text-slate-700">
                          <input type="checkbox" className="h-4 w-4 rounded border-line text-navy focus:ring-crimson/30" checked={checked}
                            onChange={(e) => {
                              const current = Array.isArray(field.value) ? field.value : [];
                              field.onChange(e.target.checked ? [...current, opt.value] : current.filter((v) => v !== opt.value));
                            }} />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                )} />
            </FormField>
          );
        }
        if (f.type === 'html') {
          return (
            <FormField key={f.name} label={f.label} required={f.required} error={errors[f.name] && `${f.label} is required`}>
              <Controller name={f.name} control={control} rules={{ required: f.required }}
                render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} />} />
            </FormField>
          );
        }
        return (
          <FormField key={f.name} label={f.label} required={f.required} error={errors[f.name] && `${f.label} is required`}>
            {f.type === 'select' ? <Select options={f.options} {...register(f.name, { required: f.required })} />
              : f.type === 'textarea' ? <Textarea {...register(f.name, { required: f.required })} />
              : <Input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} {...register(f.name, { required: f.required })} />}
          </FormField>
        );
      })}
      {error && <div className="rounded-md bg-crimson/10 px-3 py-2 text-sm text-crimson-700">{error.message}</div>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" size="sm" loading={busy}>Save</Button>
      </div>
    </form>
  );
}
