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
        const ctx = m.msg?.contextInfo || {}
        let quoted = ctx.quotedMessage

        if (quoted?.ephemeralMessage) quoted = quoted.ephemeralMessage.message
        if (quoted?.viewOnceMessage) quoted = quoted.viewOnceMessage.message
        if (quoted?.viewOnceMessageV2) quoted = quoted.viewOnceMessageV2.message
        if (quoted?.viewOnceMessageV2Extension) quoted = quoted.viewOnceMessageV2Extension.message

        const stanzaId = ctx.stanzaId
        const participant = ctx.participant

        if (quoted && stanzaId) {
            await conn.relayMessage(m.chat, {
                forwardMessage: {
                    message: quoted
                }
            }, {
                messageId: stanzaId
            }).catch(async () => {
                await conn.sendMessage(m.chat, {
                    forward: {
                        key: {
                            remoteJid: m.chat,
                            fromMe: false,
                            id: stanzaId,
                            participant
                        },
                        message: quoted
                    },
                    mentions: users
                }, { quoted: fkontak })
            })

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

        if (isMedia) {
            const media = await q.download().catch(() => null)
            if (!media) return await sendText(finalCaption)

            if (mtype === 'imageMessage') {
                return conn.sendMessage(m.chat, {
                    image: media,
                    caption: `${finalCaption}\n\n> 𝐃𝐗𝐍𝐍𝐘 𝐁𝐎𝐓 🧟`,
                    mentions: users
                }, { quoted: fkontak })
            }

            if (mtype === 'videoMessage') {
                return conn.sendMessage(m.chat, {
                    video: media,
                    mimetype: 'video/mp4',
                    caption: `${finalCaption}\n\n> 𝐃𝐗𝐍𝐍𝐘 𝐁𝐎𝐓 🧟`,
                    mentions: users
                }, { quoted: fkontak })
            }

            if (mtype === 'stickerMessage') {
                return conn.sendMessage(m.chat, {
                    sticker: media,
                    mentions: users
                }, { quoted: fkontak })
            }

            if (mtype === 'audioMessage') {
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