import { useEffect, useMemo, useState, useRef } from "react";

import * as Shared from "../../shared";
import * as Components from "../components";

const screenName: Shared.ScreenName = "Browse"
type Props = Shared.ScreenProps["Browse"];

function Browse({ contentPath, onOpenCard, onBack, onProfileClick }: Props) {
  // --- Data state ---
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<Shared.MediaCard[]>([]);
  const [q, setQ] = useState("");

  //kind multiselect
  const [kindFilters, setKindFilters] = useState<Shared.MediaKind[]>([]);
  const [showKindsDropdown, setShowKindsDropdown] = useState(false);
  const kindsWrapRef = useRef<HTMLDivElement | null>(null);  //click away to close menu

  const KIND_OPTIONS: Shared.MediaKind[] = ["movie", "show", "documentary"];

  // --- Load level-1 across all kinds ---
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setIsLoading(true);
        const list: Shared.MediaCard[] =
          (await (window as any).api?.listLevel1All(contentPath)) ?? [];
        setIsLoading(false);
        if (!alive) return;
        const sorted = list
          .slice()
          .sort((a, b) =>
            (a.title || "").localeCompare(b.title || "", undefined, {
              sensitivity: "base",
            })
          );
        setCards(sorted);
      } catch (e) {
        console.error("listLevel1All failed:", e);
        if (alive) setCards([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [contentPath]);

  // Click-away & ESC to close dropdown
  useEffect(() => {
    if (!showKindsDropdown) return;

    function onDocClick(e: MouseEvent) {
      if (!kindsWrapRef.current) return;
      if (!kindsWrapRef.current.contains(e.target as Node)) {
        setShowKindsDropdown(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setShowKindsDropdown(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [showKindsDropdown]);

  // Mark the chip active when any kind is selected
  const kindsActive = kindFilters.length > 0;

  // Toggle a single kind in multiselect; do NOT close the menu
  function toggleKind(k: Shared.MediaKind) {
    setKindFilters((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  }

  // Clear Current Filters
  function clearKinds() {
    setKindFilters([]);
  }

  // --- Search + kind filtering (now respects kindFilters) ---
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    // When no kind selected, show all
    const kindFiltered =
      kindFilters.length === 0
        ? cards
        : cards.filter((c) => kindFilters.includes(c.kind));

    if (!s) return kindFiltered;

    return kindFiltered.filter(
      (c) =>
        c.title.toLowerCase().includes(s) ||
        String(c.year ?? "").includes(s)
    );
  }, [cards, q, kindFilters]);

  return (
    <div className="screen--wrap browse--wrap">
      {/* Standard Header */}
      <Components.HeaderBar screenName={screenName} onBack={onBack} onProfileClick={onProfileClick} q={q} onChange={e => setQ(e.target.value)}/>

      {/* Standard Subheader */}
      <div className="subheader-bar--wrap browse-filter-bar--wrap">
        <div className="subheader-bar__btn-wrap" ref={kindsWrapRef}>
          <button
            className={`btn btn--secondary btn--md btn--oval btn--filter${kindsActive ? " is-active" : ""}`}
            aria-expanded={showKindsDropdown}
            aria-haspopup="menu"
            onClick={() => setShowKindsDropdown((v) => !v)}
          >
            Type
          </button>

          {showKindsDropdown && (
            <div className="dropdown-menu" role="menu" aria-label="Type filters">
              {/* Clear Filters action*/}
              <button
                type="button"
                className="dropdown-menu__entry--clear"
                role="menuitem"
                onClick={clearKinds}
              >
                Clear Filters
              </button>

              {/* Multiselect entries with checkboxes */}
              {KIND_OPTIONS.map((k) => {
                const active = kindFilters.includes(k);
                const label =
                  k === "movie" ? "Movies" :
                  k === "show"  ? "Shows"  :
                  k === "documentary"  ? "Documentaries" : k;

                return (
                  <label
                    key={k}
                    className={`dropdown-menu__entry${active ? " is-active" : ""}`}
                    role="menuitemcheckbox"
                    aria-checked={active}
                    // clicking label toggles checkbox, but keep clicks inside
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="dropdown-menu__check"
                      checked={active}
                      onChange={() => toggleKind(k)}
                    />
                    <span className="dropdown-label">{label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <button className="btn btn--secondary btn--md btn--oval btn--filter" disabled>
          Genre
        </button>
        <button className="btn btn--secondary btn--md btn--oval btn--filter" disabled>
          Year
        </button>
        <button className="btn btn--secondary btn--md btn--oval btn--filter" disabled>
          Rating
        </button>
      </div>

      {/* ===== Cards grid ===== */}
      <div className="cards">
        {filtered.map((m, i) => (
          <div className="movie-card is-clickable" key={`${m.title}-${m.year ?? ""}-${i}`} onClick={() => onOpenCard(m)}>
            {/* Poster */}
            <div className="poster">
              {m.posterPath ? (
                <Components.Poster path={m.posterPath} title={m.title} screenName="Browse"/>
              ) : (
                <div className="poster-fallback" aria-hidden />
              )}
            </div>

            {/* Body */}
            <div className="card-body">
              <div className="title-row">
                <div className="title" title={m.title}>
                  {m.title}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="browse__cards--empty">Loading... 🙂</div>
        )}

        {cards.length > 0 && filtered.length === 0 && (
          <div className="browse__cards--empty">No matches.</div>
        )}

        {cards.length === 0 && !isLoading && (
          <div className="browse__cards--empty">No items found.</div>
        )}
      </div>
    </div>
  );
}

export default Browse;