import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="page page--narrow" style={{ textAlign: "center", paddingTop: 96 }}>
      <p className="eyebrow">404</p>
      <h1 className="title" style={{ marginTop: 12 }}>החדר הזה לא קיים</h1>
      <p className="muted" style={{ marginTop: 12 }}>אולי הקישור ישן. אפשר להתחיל מדף הבית.</p>
      <Link to="/" className="btn btn--primary" style={{ marginTop: 24 }}>לדף הבית</Link>
    </main>
  );
}
