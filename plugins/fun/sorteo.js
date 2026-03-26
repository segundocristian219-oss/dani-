import crypto from "crypto";

let handler = async (m, { conn, participants }) => {
  if (!m.isGroup)
    return conn.reply(m.chat, 'Este comando solo funciona en grupos.', m);

  const normalize = (jid = '') =>
    jid.split(':')[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

  const botId = normalize(conn.user.id || conn.user.jid || '');
  const senderId = normalize(m.sender);

  let candidates = participants
    .map(p => normalize(p.id))
    .filter(id => id !== botId && id !== senderId);

  if (!candidates.length)
    return conn.reply(m.chat, 'No hay candidatos válidos para elegir.', m);

  const index = crypto.randomInt(0, candidates.length);
  const chosen = candidates[index];

  const text = `🎯 El elegido es: @${chosen.split('@')[0]}`;

  await conn.sendMessage(
    m.chat,
    { text, mentions: [chosen] },
    { quoted: m }
  );
};

handler.help = ["𝖱𝗎𝗅𝖾𝗍𝖺"];
handler.tags = ["𝖦𝖱𝖴𝖯𝖮𝖲"];
handler.command = ['sorteo'];
handler.group = true;

export default handler;