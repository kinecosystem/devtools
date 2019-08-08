import axios, { AxiosInstance } from "axios";
import { Keypair, KinNetwork, createWallet } from "@kinecosystem/kin.js-v1";

/* In blockchain lingo account means a Kin blockchain "wallet", here these two terms are used interchangeably */

import { writeFileSync, readFileSync, existsSync as fileExistsSync } from "fs";

import csvParse = require("csv-parse/lib/sync");
import { Options as CsvParseOptions } from "csv-parse";

const axiosRetry = require("axios-retry");

type CsvParse = ((input: Buffer, options?: CsvParseOptions) => any) & typeof csvParse;

// Migration Service base urls
const PRODUCTION_MS = "https://migration-service.kinmarketplace.com";
const BETA_MS = "https://migration-service.kinecosystembeta.com";
const TEST_MS = "https://migration-service.kinecosystemtest.com";

let BLOCKCHAIN_CONFIG = KinNetwork.Testnet;  // Default to testnet
let migrationServerBaseUrl: string;

const colors = { RED: "31", GREEN: "32", YELLOW: "33", BLUE: "34", MAGENTA: "35", CYAN: "36", WHITE: "37" };
const colorize = (color: string, str: string) => `\x1b[${ color }m${ str }\x1b[0m`;
const colorNumber = (str: any) => colorize(colors.YELLOW, str);
const ALREADY_MIGRATED_ERROR = 4002;

const DEFAULTS = {
	timeout: 10000,
	retries: 6
};

const endResults: any = {
	migrationSuccessCount: 0,
	alreadyMigrated: [],
	alreadyBurned: [],
	getAccountFailed: [],
	burned: [],
	burnFailed: [],
	migrationFailed: []
};

export function getAxiosClient(options: { timeout?: number, retries?: number } = {}): AxiosInstance {
	const client = axios.create({ timeout: options.timeout || DEFAULTS.timeout });
	axiosRetry(client, { retries: options.retries || DEFAULTS.retries, retryCondition: () => true, shouldResetTimeout: true });
	return client;
}

const httpClient = getAxiosClient();

export type AccountData = [string, string, string, string];

export function getCsvData(filename: string): AccountData[] {
	if (!filename) {
		throw new Error("filename is required");
	}
	const csv = readFileSync(filename, "utf8");
	const noHeaders = csv.split("\n").slice(3).join("\n");
	return (csvParse as CsvParse)(noHeaders);
}

async function burnWallet(privateKey: string, memo: string) {
	let wallet;
	let keys;
	try {
		keys = Keypair.fromSecret(privateKey);
		console.log("get account", privateKey);
		wallet = await createWallet(BLOCKCHAIN_CONFIG, keys);
	} catch (e) {
		console.log(`Error getting account (${ privateKey }):`, e.message);
		endResults.getAccountFailed.push(privateKey);
		return false;
	}
	if (await wallet.isBurned()) {
		console.log(`wallet ${ keys.publicKey() } (${ privateKey }) already burned`);
		endResults.alreadyBurned.push(keys.publicKey());
		return true;
	}
	if (await wallet.burn(memo)) {
		console.log(`burned wallet ${ keys.publicKey() }`);
		endResults.burned.push(keys.publicKey());
		return true;
	}
	console.error(colorize(colors.RED, `failed burning wallet ${ keys.publicKey() }!`));
	endResults.burnFailed.push(keys.publicKey());
	return false;
}

async function requestWalletMigration(publicKey: string) {
	const url = `${ migrationServerBaseUrl }/migrate?address=${ publicKey }`;
	let res;
	try {
		res = await httpClient.post(url, undefined, { validateStatus: (status: number) => status < 500 }); // allow 4xx errors
		/* if axios/axios-retry starts to act up try to replace the httpClient call with the one below*/
		// res = await axios({
		// 	method: "post",
		// 	headers: { "content-type": "text/html" },
		// 	url,
		// });
		if (res.status < 300 ||
			res.status === 400 && res.data.code === ALREADY_MIGRATED_ERROR) {
			console.log(`wallet ${ publicKey } migrated successfully`);
			endResults.migrationSuccessCount++;
			if (res.data.code === ALREADY_MIGRATED_ERROR) {
				endResults.alreadyMigrated.push(publicKey);
			}
			return;
		}
	} catch (e) {
		console.error(colorize(colors.RED, `error calling the migration service:`), e);
		return;
	}
	endResults.migrationFailed.push(publicKey);
	console.error(colorize(colors.RED, `migration failed for wallet ${ publicKey } with response:`), res.data);
}

async function processWallets(wallets: AccountData[], memo: string) {
	const chunkTimeLabel = colorize(colors.CYAN, "Chunk processing time");
	console.group(`* Starting migration batch of ${ wallets.length } wallets`);
	console.time(chunkTimeLabel);
	await Promise.all(wallets.map(async ([userId, deviceId, publicKey, privateKey]: AccountData) => {
			if (await burnWallet(privateKey, memo)) {
				await requestWalletMigration(publicKey);
				return;
			}
			console.error(
				colorize(colors.RED, `skipping migration for user ${ userId } device ${ deviceId }, wallet: public key ${ publicKey }, private key ${ privateKey }`));
		})
	);
	console.timeEnd(chunkTimeLabel);
	console.groupEnd();
	return;
}

async function main() {
	if (process.argv.length < 5) {
		throw new Error(colorize(colors.MAGENTA, "\nUsage:\n") +
			colorize(colors.WHITE," npm run migrate-accounts -- <beta|prod> <INPUT_FILE> <APP_ID>") +
			colorize(colors.MAGENTA," \n INPUT_FILE - Name of the CSV file generated by the create-accounts script"));
	}
	const env = process.argv[2];
	const input_filename = process.argv[3];
	const app_id = process.argv[4];

	const MEMO = `1-${ app_id }`;

	if (env === "prod") {
		migrationServerBaseUrl = PRODUCTION_MS;
		BLOCKCHAIN_CONFIG = KinNetwork.Production;
	} else if (env === "beta") {
		migrationServerBaseUrl = BETA_MS;
	} else if (env === "test") {
		migrationServerBaseUrl = TEST_MS;
	} else {
		throw new Error("env must be beta or prod");
	}

	if (!fileExistsSync(input_filename)) {
		throw new Error(`Input file does NOT exists`);
	}
	console.log(`Environment: ${ env }, input file: ${ input_filename }, Blockchain: ${ BLOCKCHAIN_CONFIG.server.serverURL._parts.hostname }`);
	const walletList = getCsvData(input_filename);
	const batchSize = 100;
	const batchDelay = 1 * 1000;  // 1 seconds (ledger closing time)
	console.log("Total wallets to migrate:", colorNumber(walletList.length));
	const timeLabel = colorize(colors.MAGENTA, "Total run time");
	console.time(timeLabel);
	for (let i = 0; i < walletList.length; i += batchSize) {
		const chunk = walletList.slice(i, i + batchSize);
		await processWallets(chunk, MEMO);
		if (!(i + batchSize >= walletList.length)) {
			await delay(batchDelay);
		}
	}
	console.timeEnd(timeLabel);
	const stats = {
		migrationSuccessCount: endResults.migrationSuccessCount,
		alreadyMigrated: endResults.alreadyMigrated.length,
		alreadyBurned: endResults.alreadyBurned.length,
		getAccountFailed: endResults.getAccountFailed.length,
		burned: endResults.burned.length,
		burnFailed: endResults.burnFailed.length,
		migrationFailed: endResults.migrationFailed.length,
	};
	if (stats.getAccountFailed || stats.burnFailed || stats.migrationFailed) {
		delete endResults.burned;
		delete endResults.alreadyMigrated;
		delete endResults.alreadyBurned;
		delete endResults.migrationSuccessCount;
		console.log(colorize(colors.RED, "Failed wallets:"));
		console.table(endResults);
	}
	console.log(colorize(colors.MAGENTA, "Statistics:"));
	console.table(stats);
}

async function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

main().then(() => {
}).catch((err: Error) => console.error(colorize(colors.RED, `failed: ${ err.message }`)));
