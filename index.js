//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const {
	makeWASocket,
	fetchLatestBaileysVersion,
	DisconnectReason,
	useMultiFileAuthState,
	makeCacheableSignalKeyStore,
	makeInMemoryStore,
	Browsers,
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const Pino = require("pino");
const chalk = require("chalk");
const momenttz = require("moment-timezone");
momenttz.tz.setDefault("Asia/Jakarta").locale("id");
const { Messages } = require("./lib/messages.js");
const me = "https://www.tharuux.github.io";
const figlet = require("figlet");
const crypto = require("crypto");

const qrcode = require('qrcode');
const path = require('path');
const moment = require('moment');
const { startServer, sendQRUpdate, sendConnectionUpdate } = require("./server");

const qrFolderPath = path.join(__dirname, 'QR');
if (!fs.existsSync(qrFolderPath)) {
    fs.mkdirSync(qrFolderPath);
}

let latestQRFile = null;

// Baileys
const Logger = {
	level: "error",
};
const logger = Pino({
	...Logger,
});
const Store = (log = logger) => {
	const store = makeInMemoryStore({ logger: log });
	return store;
};
const store = Store(logger);
store?.readFromFile("./session.json");

setInterval(() => {
	store?.writeToFile("./session.json");
}, 10_000);

const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text);
};

// Save ne QR
const generateQRCode = (qr) => {
    if (!qr) return;

    console.log("New QR Code Generated");

    const timestamp = moment().format("YYYYMMDD_HHmmss");
    latestQRFile = `QR_${timestamp}.png`; // Save latest filename
    const qrPath = path.join(qrFolderPath, latestQRFile);

    qrcode.toFile(qrPath, qr, {
        color: { dark: '#000', light: '#FFF' } // Black QR code, White background
    }, (err) => {
        if (err) {
            console.error("Failed to save QR code:", err);
        } else {
            console.log(`QR Code saved as ${qrPath}`);
            deleteOldQRFiles(); // Remove old QR files
            sendQRUpdate(latestQRFile);
        }
    });
};

// Delete recent QR
const deleteOldQRFiles = () => {
    fs.readdir(qrFolderPath, (err, files) => {
        if (err) {
            console.error("Error reading QR folder:", err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(qrFolderPath, file);
            if (file !== latestQRFile) { // Keep the latest file
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Failed to delete old QR code:", err);
                    else console.log(`Deleted old QR file: ${filePath}`);
                });
            }
        });
    });
};


async function connectToWhatsApp(use_pairing_code = false) {
	const { state, saveCreds } = await useMultiFileAuthState("tharuux");

	const { version } = await fetchLatestBaileysVersion();
	const sock = makeWASocket({
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		version: version,
		logger: logger,
		printQRInTerminal: true,
    	markOnlineOnConnect: true,
		generateHighQualityLinkPreview: true,
		browser: Browsers.macOS('Chrome'),
    	getMessage
	});

	store?.bind(sock.ev);

	sock.ev.process(async (ev) => {
		if (ev["creds.update"]) {
			await saveCreds();
		}
		if (ev["connection.update"]) {
			console.log("Connection update:", ev["connection.update"].connection);
			const update = ev["connection.update"];
			const { connection, lastDisconnect, qr } = update;

			if (qr) {
                generateQRCode(qr);
            }

			if (connection === "close") {
				const shouldReconnect =
					lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
				console.log(
					"connection closed due to ",
					lastDisconnect.error,
					", reconnecting ",
					shouldReconnect
				);
				sendConnectionUpdate(false); // Notify frontend
				// reconnect if not logged out
				if (shouldReconnect) {
					connectToWhatsApp();
				}
			} else if (connection === "open") {
				const botNumber = sock.user.id
				sock.sendMessage(botNumber, { text: `*Connected With WhatsLocal*\n\n> Developed by THARUUX\n${me}` });
				sendConnectionUpdate(true); // Notify frontend
			}
		}

		const upsert = ev["messages.upsert"];
		if (upsert) {
			if (upsert.type !== "notify") {
				return;
			}
			const message = Messages(upsert, sock);
			if (!message || message.sender === "status@broadcast") {
				return;
			}
			// msgHandler(upsert, sock, store, message);
			require("./tharuux.js")(upsert, sock, store, message);
		}

	});

	/**
	 *
	 * @param {import("@whiskeysockets/baileys").WAMessageKey} key
	 * @returns {import("@whiskeysockets/baileys").WAMessageContent | undefined}
	 */
	async function getMessage(key) {
		if (store) {
			const msg = await store.loadMessage(key.remoteJid, key.id);
			return msg?.message || undefined;
		}
		// only if store is present
		return proto.Message.fromObject({});
	}
	return sock;
}

connectToWhatsApp()
// Baileys
startServer();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});