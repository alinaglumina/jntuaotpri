import { lazy } from 'react';
import DirectoratePage from '../components/DirectoratePage.jsx';
import { S } from './lazy.jsx';

const NotificationCentre = lazy(() => import('../pages/NotificationCentre.jsx'));
const NotificationDetail = lazy(() => import('../pages/NotificationDetail.jsx'));
const SearchResults      = lazy(() => import('../pages/SearchResults.jsx'));

// Build a `crumb` handle: an array of { label, to? }.
const crumb = (arr) => ({ crumb: () => arr });

// OTPRI's entire site is the dynamic tab system already built for directorate
// pages — Home/About/Academics/Examinations/Administration/Department/Student
// Corner/Online Resources/Programmes Organised/Student Achievements/Gallery/
// Contact Us all come from DirectorateMenuItem records (directorateKey: 'otpri').
export const publicRoutes = [
  { index: true, element: S(<DirectoratePage resolveKey={() => 'otpri'} />) },
  { path: 'notifications', element: S(<NotificationCentre />), handle: crumb([{ label: 'Notification Centre' }]) },
  { path: 'notifications/:id', element: S(<NotificationDetail />), handle: crumb([{ label: 'Notification Centre', to: '/notifications' }, { label: 'Notification' }]) },
  { path: 'search', element: S(<SearchResults />), handle: crumb([{ label: 'Search' }]) },
];
