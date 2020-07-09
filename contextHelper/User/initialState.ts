const initialUsersState = {
  loading: false,
  currentUser: null,
  users: null
};
const initialChannelsState = {
  loading: false,
  currentChannel: null,
  channels: null
};
const initialContentsState = {
  loading: false,
  currentContent: null,
  allPublicContent: null,
  contentsOfChannel: [] || null,
  lastVisiblePublicContent: null,
  lastVisibleChannelContent: null,
};

export { initialUsersState, initialChannelsState, initialContentsState };