import { Landing } from "./landing";

export default function Home(): React.ReactElement {
  return (
    <div className="relative z-10 mx-auto max-w-[720px] px-5 pb-24 pt-12">
      <Landing />
      <footer className="mt-20 border-t border-[var(--border)] pt-5 text-[11px] text-[var(--text-muted)]">
        built by oscar
      </footer>
    </div>
  );
}
