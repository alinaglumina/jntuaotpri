import Modal from './Modal.jsx';
import Button from './Button.jsx';
// Confirmation popup built on Modal.
export default function ConfirmDialog({ open, title = 'Are you sure?', body = 'This action cannot be undone.', confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  return (
    <Modal open={open} onClose={onCancel} size="sm" title={title}
      footer={<><Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>Cancel</Button>
               <Button variant="danger" size="sm" onClick={onConfirm} loading={busy}>{confirmLabel}</Button></>}>
      <p className="text-sm text-slate-600">{body}</p>
    </Modal>
  );
}
