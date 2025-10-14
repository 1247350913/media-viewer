import icon from "../assets/default-profile-icon.png";
import * as Shared from "../../shared";

type Props = Shared.ComponentProps["HeaderBar"];

function HeaderBar({ screenName, onBack, onProfileClick, q, onChange, mediaCard, count }: Props) {
  const showSearch = screenName === "Browse";
  const titleBarScreens: Shared.ScreenName[] = ["SeriesList", "Franchise"];
  const showTitleBar = titleBarScreens.includes(screenName);

  return (
    <div className="header-bar--wrap">
      {/* Left: Back */}
      <button className="btn btn--circle btn--bare" onClick={onBack} aria-label="Back">
        ←
      </button>

      {/* Middle */}
      {showSearch ? (
        <div className="header-bar__middle searchbar--wrap">
          <input
            className="search-bar__searcher"
            placeholder="Search titles…"
            value={q ?? ""}
            onChange={onChange}
          />
        </div>
      ) : showTitleBar ? (
        <div className="header-bar__middle header-bar__middle--title-mode">
          <h1 className="header-bar__title">{mediaCard?.title ?? ""}</h1>
          {typeof count === "number" && (
            <span className="header-bar__count">{count.toLocaleString()}</span>
          )}
        </div>
      ) : (
        <div className="header-bar__middle" />
      )}

      {/* Right: Profile */}
      <button className="btn btn--circle btn--bare" title="Profile" onClick={onProfileClick}>
        <img
          className="header-bar__profile-icon"
          src={icon}
          alt="Profile"
        />
      </button>
    </div>
  );
}

export default HeaderBar;