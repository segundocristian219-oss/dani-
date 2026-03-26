import crypto from "crypto";

let handler = async (m, { conn, participants }) => {
  if (!m.isGroup)
    return conn.reply(m.chat, 'Este comando solo funciona en grupos.', m);

  const clean = (jid = '') =>
    jid.split(':')[0].replace(/[^0-9]/g, '');

  const botNum = clean(conn.user.id || conn.user.jid || '');
  const senderNum = clean(m.sender);

  let candidates = participants
    .filter(p => {
      const num = clean(p.id);
      return num !== botNum && num !== senderNum;
    })
    .map(p => p.id);

  if (!candidates.length)
    return conn.reply(m.chat, 'No hay candidatos válidos para elegir.', m);

  const chosen = candidates[crypto.randomInt(0, candidates.length)];

  const text = `🎯 El elegido es: @${chosen.split('@')[0]}`;

  await conn.sendMessage(
    m.chat,
    { text, mentions: [chosen] },
    { quoted: m }
  );
};

handler.help = ["𝖱𝗎𝗅𝖾𝗍𝖺"];
handler.tags = ["𝖦𝖱𝖴𝖯𝖮𝖲"];
handler.command = ['ruleta'];
handler.group = true;

export default handler;