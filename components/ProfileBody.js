import ProfileHeader from './ProfileHeader';
import FriendsList from './FriendsList';
import ProfileTabs from './ProfileTabs';

export default function ProfileBody({
  user,
  editable = false,
  checkUsernameAvailable,
  onNameUpdated,
  actionSlot = null,
  friends = [],
  tabsUserId,
}) {
  return (
    <>
      <ProfileHeader
        user={user}
        editable={editable}
        checkUsernameAvailable={checkUsernameAvailable}
        onNameUpdated={onNameUpdated}
      />
      {actionSlot ? <div className="profile-action-slot">{actionSlot}</div> : null}
      <hr className="separating-line" />
      <FriendsList friends={friends} />
      <hr className="separating-line" />
      <ProfileTabs userId={tabsUserId} />
    </>
  );
}
