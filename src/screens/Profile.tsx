import * as Shared from "../../shared";
import * as Components from "../components";

type Props = Shared.ScreenProps["Profile"];


function Profile({ onBack }: Props) {
  return (
    <div className="screen--wrap profile--wrap">

      {/* Header Bar */}
      <Components.HeaderBar screenName="Profile" onBack={onBack} onProfileClick={()=> {}}/>

      {/* Main Section */}
      <div className="profile-main">
        <div className="profile-card">
          <img
            src="/default-profile-icon.png"
            alt="Profile"
            className="profile-avatar-large"
          />
          <h3 className="profile-name">John Doe</h3>
          <p className="profile-role">Vault Viewer User</p>
          <p className="profile-email">johndoe@email.com</p>
        </div>

        <div className="profile-actions">
          <button className="profile-action-btn">Edit Info</button>
          <button className="profile-action-btn">Settings</button>
          <button className="profile-action-btn danger">Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;