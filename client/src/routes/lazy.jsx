import { Suspense } from 'react';
import { Spinner } from '../components/ui/index.js';

const Fallback = () => <div className="grid min-h-[50vh] place-items-center"><Spinner /></div>;

// Wraps a lazy element in Suspense — shared by all route modules.
export const S = (el) => <Suspense fallback={<Fallback />}>{el}</Suspense>;
