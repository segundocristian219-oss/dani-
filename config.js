import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
'217158512549931', 
'43740366401608',
'137074585948198', 
'154322956472481'
] 

global.mods = []
global.prems = []

global.emoji = '📎'
global.emoji2 = '🏞️'
global.namebot = '𝐃𝐗𝐍𝐍𝐘.𝐁𝐎𝐓'
global.botname = '𝐃𝐗𝐍𝐍𝐘.𝐁𝐎𝐓'
global.banner = 'https://files.catbox.moe/k8k9ha.jpg'
global.packname = '𝐃𝐗𝐍𝐍𝐘.𝐁𝐎𝐓'
global.author = '𝖣𝖾𝗌𝖺𝗋o𝗅𝗅𝖺𝖽𝗈 𝗉𝗈𝗋 𝐇𝐄𝐑𝐍𝐀𝐍𝐃𝐄𝐙'
global.sessions = '𝐏𝐀𝐓𝐎 𝐁𝐎𝐓'

global.APIs = {
sky: 'https://api-sky.ultraplus.click',
may: 'https://mayapi.ooguy.com'
}

global.APIKeys = {
sky: 'Angxlllll',
may: 'may-0595dca2'
}

const file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Se actualizó el 'config.js'"))
import(`file://${file}?update=${Date.now()}`)
})