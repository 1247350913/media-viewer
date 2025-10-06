import * as Shared from '../../shared'

function HeaderBar({ screenName, onBack, onProfileClick, q, onChange }: { screenName: Shared.ScreenName, onBack: () => void, onProfileClick: () => void, q?: string, onChange?: (e: any) => void; }) {
  return (
      <div className="header-bar--wrap">
        <button className="btn btn--circle btn--bare" onClick={onBack} aria-label="Back">←</button>
        {screenName === "Browse" ? (
        <div className="header-bar__middle searchbar--wrap">
          <input
            className="search-bar__searcher"
            placeholder="Search titles…"
            value={q}
            onChange={onChange}
          />
        </div>
        ) : (
          <div className="header-bar__middle"></div>
        )}
        <button className="btn btn--circle btn--bare" title="Profile" onClick={onProfileClick}>
          <img className="header-bar__profile-icon" src="../../public/default-profile-icon.png" alt="Profile Image"/>
        </button>
      </div>
  )
}

export default HeaderBar;