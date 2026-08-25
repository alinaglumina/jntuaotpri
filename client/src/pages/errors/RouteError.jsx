import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import RootLayout from '../../components/layout/RootLayout.jsx';
import NotFound from './NotFound.jsx';
import Forbidden from './Forbidden.jsx';
import ServerError from './ServerError.jsx';

// Root errorElement. Any thrown Response/Error in the tree lands here and is
// mapped to the correct error page. Wrapped in RootLayout so the site chrome
// (header/nav/footer) stays visible around the error.
export default function RouteError() {
  const error = useRouteError();
  let content;
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) content = <NotFound />;
    else if (error.status === 403) content = <Forbidden />;
    else content = <ServerError status={error.status} message={error.statusText || error.data} />;
  } else {
    content = <ServerError message={error?.message} />;
  }
  return content;
}

// A bare (layout-less) variant for the admin subtree.
export function AdminRouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 403) return <Forbidden />;
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  return <ServerError message={error?.message} />;
}
