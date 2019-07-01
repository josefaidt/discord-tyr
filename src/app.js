import Discord from 'discord.js'
const client = new Discord.Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.user
    .setStatus('Hello')
    // .then(console.log)
    .catch(console.error)
})

const permissions = 537258048

console.log(client.guilds)

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong')
  }

  console.log('GUILD', msg.guild)
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

const defaultPermissions = [
  'MANAGE_MESSAGES',
  'SEND_MESSAGES',
  'READ_MESSAGES',
  'MANAGE_WEBHOOKS',
  'ADD_REACTIONS',
  'EMBED_LINKS',
  'ATTACH_FILES',
  'READ_MESSAGE_HISTORY',
  'CHANGE_NICKNAME',
]

const denyPermissions = [
  'ADMINISTRATOR',
  'CREATE_INSTANT_INVITE',
  'KICK_MEMBERS',
  'BAN_MEMBERS',
  'MANAGE_CHANNELS',
  'MANAGE_GUILD',
  'VIEW_AUDIT_LOG',
  'PRIORITY_SPEAKER',
  'VIEW_CHANNEL',
  'SEND_TTS_MESSAGES',
  'MENTION_EVERYONE',
  'USE_EXTERNAL_EMOJIS',
  'MANAGE_NICKNAMES',
  'MANAGE_ROLES',
  'MANAGE_EMOJIS',
]

const createChannel = async (guild, channelName) => {
  await guild.createChannel(channelName, {
    type: 'text',
  })
}

const difference = (collection1, collection2) => {}

client.on('guildMemberUpdate', (oldMember, newMember) => {
  const hasRoleChanged = !oldMember.roles.equals(newMember.roles)
  const user = newMember
  // console.log(user)
  if (hasRoleChanged) {
    const isNewRole = [...oldMember.roles.values()].length < [...newMember.roles.values()].length
    if (isNewRole) {
      const newRole = [
        ...newMember.roles.filter(r => ![...oldMember.roles.values()].includes(r)).values(),
      ][0]
      console.log(newRole.name)
      const channelName = `${user.displayName}-${newRole.name}`
      createChannel(user.guild, channelName)
        .then(console.log(`Successfully created channel ${channelName}`))
        .catch(console.error)
    } else {
      const removedRole = [
        ...oldMember.roles.filter(r => ![...newMember.roles.values()].includes(r)).values(),
      ][0]
      const channelName = `${user.displayName}-${removedRole.name}`
      console.log([...user.guild.channels.values()])
      // check if channel exists
      if ([...user.guild.channels.values()].filter(({ name }) => name === channelName)) {
        const channel = [...user.guild.channels.values()].filter(({ name }) => name === channelName)
        if (channel.length > 1) {
          console.log(`multiple channels, ${channelName} detected!`)
          for (const c in channel) {
            channel[c].delete()
            console.log(`deleted channel ${channel[c].name}`)
          }
        } else {
          channel[0]
            .delete()
            .then(console.log(`Deleted channel ${channel[0].name}`))
            .catch(console.error)
        }
      } else {
        console.log(`NO CHANNEL EXISTS FOR ${channelName}, SKIPPING...`)
      }
    }
  }
})

client.login(process.env.TOKEN)
