const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@whiskeysockets/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
let setting = require("./key.json");
// const OpenAI = require("openai");
// const openai = new OpenAI({ apiKey: setting.keyopenai });

// Libraries
const { downloadyt } = require("./scripts/downloadmp3")


const alive_msg = "> Developed by THARUUX";

module.exports = sansekai = async (upsert, sock, store, message) => {
  //console.log(message);
  try {
    let budy = (typeof message.text == 'string' ? message.text : '')
    // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
    var prefix = /^[\\/!#.]/gi.test(budy) ? budy.match(/^[\\/!#.]/gi) : "/";
    const isCmd = budy.startsWith(prefix);
    const command = budy.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = budy.trim().split(/ +/).slice(1);
    const pushname = message.pushName || "No Name";
    const botNumber = sock.user.id;
    const itsMe = message.sender == botNumber ? true : false;
    let text = (q = args.join(" "));
    const arg = budy.trim().substring(budy.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);
    const from = message.chat;

    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    // Group
    const groupMetadata = message.isGroup ? await sock.groupMetadata(message.chat).catch((e) => {}) : "";
    const groupName = message.isGroup ? groupMetadata.subject : "";

    // Push Message To Console
    let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;

    if (isCmd && !message.isGroup) {
      console.log(chalk.black(chalk.bgWhite("[ LOGS ]")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${message.sender.replace("@s.whatsapp.net", "")} ]`));
    } else if (isCmd && message.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ LOGS ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${message.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
    }

    if (isCmd) {
      switch (command) {
        case "song": case "ytmp3":
          message.reply(`🔍 *Finding song...*`);
          try{
            downloadyt("https://youtu.be/yWxkK5j1jY8?si=4eWPWKXzxdcNDR-C");
            //message.reply(vid);
          } catch (error){
            message.reply('Error');
          }
          break;
        case "info":
          try {
              sock.sendMessage(from, 
                { image: { url: "https://github.com/THARUUX/THARUUX/blob/main/20240509_131601.png?raw=true" }, caption: "> Developed by THARUUX" },
                { quoted: message, ephemeralExpiration: message.contextInfo.expiration });
          } catch (error) {
              message.reply(error.message);
          }
          break;
        case "ai": case "openai": case "chatgpt": case "ask":
          message.reply("AI commands are under development");
          break;
        case "img": case "ai-img": case "image": case "images": case "dall-e": case "dalle":
          message.reply("AI commands are under development");
          break;
          case "sc": case "script": case "scbot":
           message.reply("Contact THARUUX - wa.me/94789731507 for more information.");
          break
        default: {
          if (isCmd && budy.toLowerCase() != undefined) {
            if (message.chat.endsWith("broadcast")) return;
            if (message.isBaileys) return;
            if (!budy.toLowerCase()) return;
            if (argsLog || (isCmd && !message.isGroup)) {
              // sock.sendReadReceipt(message.chat, message.sender, [message.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            } else if (argsLog || (isCmd && message.isGroup)) {
              // sock.sendReadReceipt(message.chat, message.sender, [message.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            }
          }
        }
      }
    }
  } catch (err) {
    message.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
