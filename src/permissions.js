const noPermissions = {
  ADD_REACTIONS: false,
  ADMINISTRATOR: false,
  ATTACH_FILES: false,
  BAN_MEMBERS: false,
  CHANGE_NICKNAME: false,
  CREATE_INSTANT_INVITE: false,
  EMBED_LINKS: false,
  KICK_MEMBERS: false,
  MANAGE_CHANNELS: false,
  MANAGE_EMOJIS: false,
  MANAGE_GUILD: false,
  MANAGE_MESSAGES: false,
  MANAGE_NICKNAMES: false,
  MANAGE_ROLES: false,
  MANAGE_WEBHOOKS: false,
  MENTION_EVERYONE: false,
  PRIORITY_SPEAKER: false,
  READ_MESSAGES: false,
  READ_MESSAGE_HISTORY: false,
  SEND_MESSAGES: false,
  SEND_TTS_MESSAGES: false,
  USE_EXTERNAL_EMOJIS: false,
  VIEW_AUDIT_LOG: false,
  VIEW_CHANNEL: false,
}

const Permissions = {
  everyone: {
    ...noPermissions,
  },
  user: {
    ...noPermissions,
    MANAGE_MESSAGES: true,
    SEND_MESSAGES: true,
    READ_MESSAGES: true,
    MANAGE_WEBHOOKS: true,
    ADD_REACTIONS: true,
    EMBED_LINKS: true,
    ATTACH_FILES: true,
    READ_MESSAGE_HISTORY: true,
    CHANGE_NICKNAME: true,
  },
  client: {
    READ_MESSAGES: true,
    MANAGE_ROLES: true,
    MANAGE_CHANNELS: true,
  },
}

export default Permissions
