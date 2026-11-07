// כתבות: כל נושא מהידע, ההבנה והיישום של ששת הכובעים הופך לכתבה בעמוד A4 אחד.
// הרכיב המשותף <app-creations> (AppOfApp-GH/public/creations.js) מציג אותן, יוצר כתבה חדשה, מוריד להדפסה ומעלה לחדר במוזיאון (TAARUCHA).
// הנתונים: public/creations.json, נגזר מ-src/lib/hats.tsx ומהחדרים ב-tools/creations.mjs.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "app-creations": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { src?: string; heading?: string };
    }
  }
}

export default function Creations() {
  return (
    <main className="page page--creations">
      <app-creations src="/creations.json" heading="מה ששת הכובעים כותבים" />
    </main>
  );
}
