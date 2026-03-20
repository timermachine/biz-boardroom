const CUSTOM_MEMBERS_KEY = 'rewardz-board-custom-members-v2';
const MEMBER_OVERRIDES_KEY = 'rewardz-board-member-overrides-v2';

export function loadCustomMembers() {
  try {
    return JSON.parse(window.localStorage.getItem(CUSTOM_MEMBERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCustomMembers(members) {
  window.localStorage.setItem(CUSTOM_MEMBERS_KEY, JSON.stringify(members));
}

export function loadMemberOverrides() {
  try {
    return JSON.parse(window.localStorage.getItem(MEMBER_OVERRIDES_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveMemberOverrides(overrides) {
  window.localStorage.setItem(MEMBER_OVERRIDES_KEY, JSON.stringify(overrides));
}
