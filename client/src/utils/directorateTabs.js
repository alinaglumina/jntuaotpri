// Shared tab-tree logic for OTPRI's menu system — used by both the header
// mega-nav (navigation) and the homepage content area (rendering), fed by
// the same DirectorateMenuItem data so they always stay in sync.

// Builds a nested {label, children, dynamic, item} tree from the flat
// menuKey/parentKey list of admin-managed menu items.
export function buildDynamicTabs(items) {
  const byKey = {};
  items.forEach((it) => { byKey[it.menuKey] = { label: it.label, dynamic: true, item: it, order: it.sortOrder || 0, children: [] }; });
  const roots = [];
  items.forEach((it) => {
    const node = byKey[it.menuKey];
    if (it.parentKey && byKey[it.parentKey]) byKey[it.parentKey].children.push(node);
    else if (!it.parentKey) roots.push(node);
  });
  function cleanup(node) {
    node.children.sort((a, b) => a.order - b.order);
    node.children.forEach(cleanup);
    if (node.children.length === 0) delete node.children;
  }
  roots.sort((a, b) => a.order - b.order);
  roots.forEach(cleanup);
  return roots;
}

// Recursively walks a node tree, assigning each leaf a stable path key like
// "1.0.2" (for internal active-tracking) while keeping the original
// item.menuKey available for stable URL-based navigation.
export function flattenLeaves(nodes, prefix = '') {
  let out = [];
  nodes.forEach((n, i) => {
    const key = prefix ? `${prefix}.${i}` : `${i}`;
    if (n.children) out = out.concat(flattenLeaves(n.children, key));
    else out.push({ key, label: n.label, blocks: n.blocks, dynamic: n.dynamic, item: n.item });
  });
  return out;
}
