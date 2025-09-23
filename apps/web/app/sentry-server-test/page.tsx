export default async function SentryServerTest() {
  // This will throw an error on the server
  throw new Error('Server-side Error Test for Sentry - EN13813');

  // This will never be rendered
  return (
    <div>
      <h1>This page should never be visible</h1>
    </div>
  );
}