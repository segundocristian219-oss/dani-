let handler = async (m, { conn, participants }) => {
  if (!m.isGroup) 
    return conn.reply(m.chat, 'Este comando solo funciona en grupos.', m);

  let botId = (conn.user.id || conn.user.jid || "")
    .split(':')[0]
    .replace(/[^0-9]/g, '') + '@s.whatsapp.net';

  let candidates = participants
    .filter(p => {
      let pid = p.id.split(':')[0];
      return pid !== botId && p.admin !== 'superadmin';
    })
    .map(p => p.id);

  if (!candidates.length) 
    return conn.reply(m.chat, 'No hay candidatos válidos para elegir.', m);

  let chosen = candidates[Math.floor(Math.random() * candidates.length)];

  let text = `🎯 El elegido es: @${chosen.split('@')[0]}`;

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