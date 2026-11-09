import { useEffect, useState } from "react";
import { heroUrls } from "./hero/assets";

// Holds the page until the hero's art is in, so the samurai's draw never plays with
// missing frames. A blade line fills with the progress; when it is full the screen is cut
// along it and the halves part to show the hero. Never waits longer than GIVE_UP_MS: a
// slow or failed file only means a frame or two arrives late.
const GIVE_UP_MS = 10000;
const CUT_MS = 900;

interface LoaderProps {
  onDone: () => void;
}

const Loader = ({ onDone }: LoaderProps) => {
  const [urls] = useState(() => heroUrls(window.matchMedia("(max-width: 767px)").matches));
  const [loaded, setLoaded] = useState(0);
  const [cut, setCut] = useState(false);

  useEffect(() => {
    let count = 0;
    let finished = false;
    let alive = true;
    let leave = 0;
    const finish = () => {
      if (finished || !alive) return;
      finished = true;
      setCut(true);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      leave = window.setTimeout(onDone, reduced ? 300 : CUT_MS);
    };
    // A failed file counts as settled: the page works without it
    const settle = () => {
      if (!alive) return;
      count += 1;
      setLoaded(count);
      if (count === urls.length) finish();
    };
    for (const url of urls) {
      const img = new Image();
      img.onload = settle;
      img.onerror = settle;
      img.src = url;
    }
    const giveUp = window.setTimeout(finish, GIVE_UP_MS);
    return () => {
      alive = false;
      window.clearTimeout(giveUp);
      window.clearTimeout(leave);
    };
  }, [urls, onDone]);

  const pct = Math.round((loaded / urls.length) * 100);
  return (
    <div className="loader" data-cut={cut || undefined}>
      <div className="loader-half loader-top" />
      <div className="loader-half loader-bottom" />
      <div className="loader-blade" style={{ scale: `${pct / 100} 1` }} aria-hidden="true" />
      <p className="loader-text" aria-hidden="true">
        Loading the scene · {pct}%
      </p>
      {/* Screen readers hear the start and the end, not every percent */}
      <p className="sr-only" role="status">
        {cut ? "Scene loaded" : "Loading the scene"}
      </p>
    </div>
  );
};

export default Loader;
