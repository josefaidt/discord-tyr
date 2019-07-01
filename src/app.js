import Discord from 'discord.js'
import lg from '@josefaidt/lg'
const client = new Discord.Client()

client.on('ready', () => {
  lg(`Logged in as ${client.user.tag}!`)
  client.user
    .setStatus('Hello')
    // .then(lg)
    .catch(console.error)
})

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong')
  }

  lg('GUILD', msg.guild)
})

// todo:
//    create a role private to the new channel
//    have role template permissions
//    cleanup role after removing
// future:
//    create page to "start" and "stop" demo
//      this will delete and remove the role/channel
//    persist channel data list
//      on startup, check to see if any existing channels should be removed
//      or maybe just a cleanup command
//      or not

const defaultUserPermissions = {
  MANAGE_MESSAGES: true,
  SEND_MESSAGES: true,
  READ_MESSAGES: true,
  MANAGE_WEBHOOKS: true,
  ADD_REACTIONS: true,
  EMBED_LINKS: true,
  ATTACH_FILES: true,
  READ_MESSAGE_HISTORY: true,
  CHANGE_NICKNAME: true,
}

const denyUserPermissions = {
  ADMINISTRATOR: false,
  CREATE_INSTANT_INVITE: false,
  KICK_MEMBERS: false,
  BAN_MEMBERS: false,
  MANAGE_CHANNELS: false,
  MANAGE_GUILD: false,
  VIEW_AUDIT_LOG: false,
  PRIORITY_SPEAKER: false,
  VIEW_CHANNEL: false,
  SEND_TTS_MESSAGES: false,
  MENTION_EVERYONE: false,
  USE_EXTERNAL_EMOJIS: false,
  MANAGE_NICKNAMES: false,
  MANAGE_ROLES: false,
  MANAGE_EMOJIS: false,
}

const createChannel = async (guild, channelName) => {
  await guild.createChannel(channelName, {
    type: 'text',
  })
}

const setUserPermissions = (user, channel) => {
  // Overwrite permissions for a message author
  channel
    .overwritePermissions(user, {
      ...defaultUserPermissions,
      ...denyUserPermissions,
    })
    .then(updated => console.log(updated.permissionOverwrites.get(user.id)))
    .catch(console.error)
}

client.on('guildMemberUpdate', (oldMember, newMember) => {
  const hasRoleChanged = !oldMember.roles.equals(newMember.roles)
  const user = newMember
  // lg(user)
  if (hasRoleChanged) {
    const isNewRole = [...oldMember.roles.values()].length < [...newMember.roles.values()].length
    if (isNewRole) {
      const newRole = [
        ...newMember.roles.filter(r => ![...oldMember.roles.values()].includes(r)).values(),
      ][0]
      lg(newRole.name)
      const channelName = `${user.displayName}-${newRole.name}`
      createChannel(user.guild, channelName)
        .then(lg(`Successfully created channel ${channelName}`))
        .then(() => {
          const [c] = [...user.guild.channels.values()].filter(({ name }) => name === channelName)
          setUserPermissions(user, c)
        })
        .catch(console.error)
    } else {
      const removedRole = [
        ...oldMember.roles.filter(r => ![...newMember.roles.values()].includes(r)).values(),
      ][0]
      const channelName = `${user.displayName}-${removedRole.name}`
      // check if channel exists
      if ([...user.guild.channels.values()].filter(({ name }) => name === channelName)) {
        const channels = [...user.guild.channels.values()].filter(
          ({ name }) => name === channelName
        )
        if (channels.length > 1) {
          lg(`multiple channels, ${channelName} detected!`)
          for (const c in channels) {
            channels[c]
              .delete()
              .then(lg(`Deleted channel ${channels[c].name} - ${channels[c].id}`))
              .catch(console.error)
          }
        } else {
          channels[0]
            .delete()
            .then(lg(`Deleted channel ${channels[0].name}`))
            .catch(console.error)
        }
      } else {
        lg(`NO CHANNEL EXISTS FOR ${channelName}, SKIPPING...`)
      }
    }
  }
})

client.login(process.env.TOKEN)
