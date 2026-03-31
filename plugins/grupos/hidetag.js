import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

let thumbCache = null
let thumbPromise = null

async function getThumb() {
    if (thumbCache) return thumbCache
    if (!thumbPromise) {
        thumbPromise = fetch('https://files.catbox.moe/lqnorc.jpg')
            .then(res => res.arrayBuffer())
            .then(buf => {
                thumbCache = Buffer.from(buf)
                return thumbCache
            })
            .catch(() => {
                thumbPromise = null
                return null
            })
    }
    return thumbPromise
}

const handler = async (m, { conn, participants }) => {
    if (!m.isGroup || m.key.fromMe) return

    const content = (m.text || m.msg?.caption || '').trim()
    if (!/^.?n(\s|$)/i.test(content)) return

    await conn.sendMessage(m.chat, { react: { text: '🥷', key: m.key } })

    const userText = content.replace(/^.?n\s*/i, '')
    const finalText = userText || ''
    const users = participants.map(u => conn.decodeJid(u.id))

    const thumb = await getThumb()

    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            locationMessage: {
                name: `𝖧𝗈𝗅𝖺, 𝖲𝗈𝗒 𝐃𝐗𝐍𝐍𝐘 𝐁𝐎𝐓 🧟`,
                jpegThumbnail: thumb
            }
        },
        participant: "0@s.whatsapp.net"
    }

    try {
        const quoted = m.quoted
        const context = m.msg?.contextInfo

        if (quoted && context?.stanzaId) {
            await conn.sendMessage(m.chat, {
                forward: {
                    key: {
                        remoteJid: m.chat,
                        fromMe: false,
                        id: context.stanzaId,
                        participant: context.participant
                    },
                    message: quoted.message
                },
                mentions: users
            }, { quoted: fkontak })

            if (finalText) {
                await conn.sendMessage(m.chat, {
                    text: `${finalText}\n\n> 𝐃𝐗𝐍𝐍𝐘 𝐁𝐎𝐓 🧟`,
                    mentions: users
                }, { quoted: fkontak })
            }

            return
        }

        const q = m.quoted || m
        const mtype = q.mtype || m.mtype || ''
        const isMedia = ['imageMessage','videoMessage','audioMessage','stickerMessage'].includes(mtype)

        const originalCaption = (q.msg?.caption || q.text || '').trim()
        const finalCaption = finalText || originalCaption || '🥷 Notificación'

        const sendText = (text) => conn.sendMessage(m.chat, {
            text: `${text}\n\n> 𝐃𝐗𝐍𝐍𝐘 𝐁𝐎𝐓 🧟`,
            mentions: users
        }, { quoted: fkontak })

        const sendMedia = async (type, media) => {
            if (type === 'imageMessage') {
                return conn.sendMessage(m.chat, {
                    image: media,
                    caption: `${finalCaption}\n\n> 𝐃𝐗𝐍𝐍𝐘 𝐁𝐎𝐓 🧟`,
                    mentions: users
                }, { quoted: fkontak })
            }

            if (type === 'videoMessage') {
                return conn.sendMessage(m.chat, {
                    video: media,
                    mimetype: 'video/mp4',
                    caption: `${finalCaption}\n\n> 𝐃𝐗𝐍𝐍𝐘 𝐁𝐎𝐓 🧟`,
                    mentions: users
                }, { quoted: fkontak })
            }

            if (type === 'stickerMessage') {
                return conn.sendMessage(m.chat, {
                    sticker: media,
                    mentions: users
                }, { quoted: fkontak })
            }

            if (type === 'audioMessage') {
                try {
                    await conn.sendMessage(m.chat, {
                        audio: media,
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: false,
                        mentions: users
                    }, { quoted: fkontak })

                    if (finalText) await sendText(finalText)
                } catch {
                    await sendText(finalCaption)
                }
            }
        }

        if (isMedia) {
            const media = await q.download().catch(() => null)
            if (media) {
                await sendMedia(mtype, media)
            } else {
                await sendText(finalCaption)
            }
        } else if (m.quoted) {
            const msg = conn.cMod(
                m.chat,
                generateWAMessageFromContent(
                    m.chat,
                    { [mtype || 'extendedTextMessage']: q.message?.[mtype] || { text: finalCaption } },
                    { quoted: fkontak, userJid: conn.user.id }
                ),
                `${finalCaption}\n\n> 𝐃𝐗𝐍𝐍𝐘 𝐁𝐎𝐓 🧟`,
                conn.user.jid,
                { mentions: users }
            )
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
        } else {
            await sendText(finalCaption)
        }

    } catch {
        await conn.sendMessage(m.chat, {
            text: `🥷 Notificación\n\n> 𝐃𝐗𝐍𝐍𝐘 𝐁𝐎𝐓 🧟`,
            mentions: users
        }, { quoted: fkontak })
    }
}

handler.customPrefix = /^(\.n|n)(\s|$)/i
handler.command = new RegExp()
handler.group = true
handler.admin = true

export default handler