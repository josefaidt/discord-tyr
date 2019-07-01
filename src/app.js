import Discord from 'discord.js'
import lg from '@josefaidt/lg'
import Permissions from './permissions.js'
const client = new Discord.Client()

client.on('ready', () => {
  lg(`Logged in as ${client.user.tag}!`)
  client.user
    .setStatus('Hello')
    // .then(lg)
    .catch(console.error)
})

// todo:
//    cleanup role after removing
//    set role position to top
//    add admin role
//    IF channel *DOES* exist, do not recreate, but reset permissions
// future:
//    create page to "start" and "stop" demo
//      this will delete and remove the role/channel
//    persist channel data list
//      on startup, check to see if any existing channels should be removed
//      or maybe just a cleanup command
//      or not

const createCategory = async ({ guild, categoryName }) => {
  await guild.createChannel(categoryName, {
    type: 'category',
    permissionOverwrites: [
      {
        id: guild.ownerID,
        allow: ['ADMINISTRATOR'],
      },
      {
        id: client.user.id,
        allow: ['MANAGE_ROLES', 'MANAGE_MESSAGES', 'MANAGE_CHANNELS'],
      },
    ],
  })
}

const createChannel = async ({ guild, user, channelName }) => {
  await guild.createChannel(channelName, {
    type: 'text',
  })
}

const setUserPermissions = ({ user, channel }) => {
  const roles = [
    {
      user: channel.guild.members.get(client.user.id),
      permissions: Permissions.client,
    },
    {
      user,
      permissions: Permissions.user,
    },
    {
      user: channel.guild.defaultRole,
      permissions: Permissions.everyone,
    },
  ]
  roles.forEach(async r => {
    lg(`Setting permissions for ${r.user.displayName || r.user.name || r.user.username}`)
    await channel
      .overwritePermissions(r.user, r.permissions)
      .then(
        lg(
          `Done! Set permissions on ${channel.name} for ${r.user.displayName ||
            r.user.name ||
            r.user.username}`
        )
      )
      .catch(console.error)
  })
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
      createChannel({
        guild: user.guild,
        user,
        channelName,
      })
        .then(lg(`Successfully created channel ${channelName}`))
        .then(() => {
          const [c] = [...user.guild.channels.values()].filter(({ name }) => name === channelName)
          setUserPermissions({
            user,
            channel: c,
          })
          // lg('Set permissions successfully!')
        })
        .catch(console.error)
    } else {
      const removedRole = [
        ...oldMember.roles.filter(r => ![...newMember.roles.values()].includes(r)).values(),
      ][0]
      const channelName = `${user.displayName}-${removedRole.name}`
      // check if channel exists
      if ([...user.guild.channels.values()].filter(({ name }) => name === channelName).length > 0) {
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

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong')
  }
  if (msg.content.slice(0, 1) === process.env.CMD_PREFIX) {
    const content = msg.content.slice(1, msg.content.length)
    switch (content.split(' ')[0]) {
      case 'test':
        msg.reply('you have my attention')
        break
      case 'start':
        msg.reply('Starting your private room')
        console.log(msg.member.guild.members.get(msg.author.id).roles.find('name', ''))
        break
      default:
        msg.reply('Please enter a valid command')
    }
  }
})

client.login(process.env.TOKEN)
