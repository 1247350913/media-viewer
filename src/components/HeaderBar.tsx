import * as Shared from '../../shared'

function HeaderBar({ screenName, onBack, onProfileClick, q, onChange }: { screenName: Shared.ScreenName, onBack: () => void, onProfileClick: () => void, q?: string, onChange?: (e: any) => void; }) {
  return (
      <div className="header-bar-wrap">
        <button className="header-button back-button" onClick={onBack} aria-label="Back">←</button>
        {screenName === "Browse" ? (
        <div className="header-middle search-bar-wrap">
          <input
            className="searcher"
            placeholder="Search titles…"
            value={q}
            onChange={onChange}
          />
        </div>
        ) : (
          <div className="header-middle"></div>
        )}
        <button className="header-button profile-button" title="Profile" onClick={onProfileClick}>
          <img src="../../public/default-profile-icon.png" alt="Profile Image" className="profile-icon"/>
        </button>
      </div>
  )
}

export default HeaderBar;