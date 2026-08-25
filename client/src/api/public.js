import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api from '../lib/axios.js';
import {
  slidesQuery, galleryQuery, mousQuery, emagazinesQuery, honorisQuery, eventsQuery,
  settingsQuery, notificationsQuery, newsQuery, facultyQuery, directorateMenuQuery, navMenuQuery,
  executiveCouncilQuery, formerVCsQuery,
} from './queries.js';

export const useSlides       = () => useQuery(slidesQuery());
export const useGallery      = () => useQuery(galleryQuery());
export const useMous         = () => useQuery(mousQuery());
export const useEMagazines   = () => useQuery(emagazinesQuery());
export const useHonoris      = () => useQuery(honorisQuery());
export const useFaculty       = () => useQuery(facultyQuery());
export const useEvents       = () => useQuery(eventsQuery());
export const useExecutiveCouncil = () => useQuery(executiveCouncilQuery());
export const useFormerVCs        = () => useQuery(formerVCsQuery());
export const useDirectorateMenu = (key) => useQuery({ ...directorateMenuQuery(key), enabled: !!key });
export const useNavMenu = () => useQuery(navMenuQuery());
export const useNews          = () => useQuery(newsQuery());
export const useSettings     = () => useQuery(settingsQuery());
export const useNotifications = (category) => useQuery(notificationsQuery(category));

export const useAdministration = (roleKey) =>
  useQuery({ queryKey: ['administration', roleKey], queryFn: () => api.get(`/administration/key/${roleKey}`), enabled: !!roleKey });

// Server-paginated infinite feed for the Notification Centre.
export function useInfiniteNotifications(category, pageSize = 10) {
  return useInfiniteQuery({
    queryKey: ['notifications-infinite', category],
    queryFn: ({ pageParam = 1 }) =>
      api.get('/notifications', { params: { category, page: pageParam, limit: pageSize } }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + (p.items?.length || 0), 0);
      return loaded < (last.total || 0) ? pages.length + 1 : undefined;
    },
  });
}
