import Discord from 'discord.js';
import { BOT_TOKEN,  BOT_CHANNEL_ID} from '$env/static/private';

export default class DiscordBot {
	private client;

	public constructor() {
		this.client = new Discord.Client({
			intents: [
				Discord.GatewayIntentBits.Guilds,
				Discord.GatewayIntentBits.GuildMessages,
				Discord.GatewayIntentBits.MessageContent
			]
		})
	}

	public async login() {
		await this.client.login(BOT_TOKEN)
	}

	public async sendMessage(message: string) {
		const channel = await this.client.channels.fetch(BOT_CHANNEL_ID)
		channel.send(message)
	}
}