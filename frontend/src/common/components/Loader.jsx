export default function Loader({ message = 'Checking your session…' }) {
  return <div className="page-loader" role="status"><span className="spinner" /><p>{message}</p></div>;
}
