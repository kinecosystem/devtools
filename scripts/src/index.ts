import { Keypair, KinNetwork, createWallet } from "@kinecosystem/kin.js";
import { ExportToCsv, Options as ExportCsvOptions } from "export-to-csv";
import * as jsonwebtoken from "jsonwebtoken";
import axios from "axios";
import csvParse = require("csv-parse/lib/sync");

import { writeFileSync, readFileSync, existsSync as fileExistsSync } from "fs";

import { Options as CsvParseOptions } from "csv-parse";

type CsvParse = ((input: Buffer, options?: CsvParseOptions) => any) & typeof csvParse;

const PRODUCTION = "https://api.kinmarketplace.com";
const BETA = "https://api.kinecosystembeta.com";
const TEST = "http://api.kinecosystemtest.com";
export type JWTClaims<SUB extends string> = {
	iss: string; // issuer - the app_id
	exp: number; // expiration
	iat: number; // issued at
	sub: SUB; // subject
};
export type JWTContent<T, SUB extends string> = {
	header: {
		typ: string;
		alg: string;
		kid: string;
	};
	payload: JWTClaims<SUB> & T;
	signature: string;
};
export type RegisterJWTPayload = {
	user_id: string;
	device_id: string;
};

export type ConfigResponse = {
	blockchain: {
		horizon_url: string;
		network_passphrase: string;
		asset_issuer: string;
		asset_code: string;
	};
};

export type UserData = Array<[string, string]>;

export type ApiError = {
	code: number;
	error: string;
	message: string;
};

type AccountData = Array<{
	user_id: string,
	device_id: string,
	public_address: string,
	private_key: string,
}>;

async function createUsers(base: string, userData: UserData, output_stream: NodeJS.WriteStream) {
	console.log(`Creating ${ userData.length } user accounts`);
	await axios({
		method: "post",
		data: { user_data: userData },
		url: `${ base }/partners/v1/users/bulk`,
		responseType: "stream"
	}).then(response => {
		response.data.pipe(output_stream);
	}, error => {
		error.response.data.pipe(process.stdout);
		throw new Error(error);
	});
}

export function getCsvData(filename: string): string[][] {
	if (!filename) {
		console.error("filename is required");
		throw new Error("filename is required");
	}
	const csv = readFileSync(filename);
	return (csvParse as CsvParse)(csv);
}

export async function writeCsvToFile(fileName: string, data: AccountData) {
	const options: ExportCsvOptions = {
		fieldSeparator: ",",
		quoteStrings: "\"",
		decimalseparator: ".",
		showLabels: true,
		showTitle: true,
		title: "Accounts details",
		useBom: true,
		useKeysAsHeaders: true,
	};

	const csvExporter = new ExportToCsv(options);
	const csvData = csvExporter.generateCsv(data, true);

	try {
		writeFileSync(fileName, csvData);
	} catch (e) {
		console.log("Error writing CSV to file ", fileName, " error ", e);
	}
	console.log("CSV written to file", fileName);
}

async function main() {
	if (process.argv.length < 5) {
		throw new Error("usage: npm run create-wallet -- <beta|prod> <INPUT_FILE> <OUTPUT_FILE>" +
			" \n INPUT_FILE - File of a line separated list of registration JWTs" +
			" \n OUTPUT_FILE - name of the CSV file to be written with the created account data");
	}
	const env = process.argv[2];
	const input_filename = process.argv[3];
	const output_filename = process.argv[4];
	let marketplaceBase: string;

	if (env === "beta") {
		marketplaceBase = BETA;
	} else if (env === "prod") {
		marketplaceBase = PRODUCTION;
	} else if (env === "test") {
		marketplaceBase = TEST;
	} else {
		throw new Error("env must be beta or production");
	}
	if (!fileExistsSync(input_filename)) {
		throw Error(`Input file does NOT exists`);
	}
	if (fileExistsSync(output_filename)) {
		throw Error(`Output file already exists (We don't want to overwrite your existing private keys`);
	}
	console.log(`Environment: ${ env }, input file: ${ input_filename }, output file: ${ output_filename }`);
	const jwtList = getCsvData(input_filename);
	const bulkCreationList: UserData = []; // List sent to the server (list of [jwt, public address])
	const results = jwtList.map(([jwt]) => {
		const decodedJwt = jsonwebtoken.decode(jwt, { complete: true }) as JWTContent<RegisterJWTPayload, "register">;
		const keypair = Keypair.random();
		bulkCreationList.push([jwt, keypair.publicKey()]);
		return {
			user_id: decodedJwt.payload.user_id,
			device_id: decodedJwt.payload.device_id,
			public_address: keypair.publicKey(),
			private_key: keypair.secret(),
		};
	});
	writeCsvToFile(output_filename, results);
	const batchSize = 500;
	const batchDelay = 30 * 1000;  // 30 seconds
	for (let i = 0; i < (bulkCreationList.length - 1); i += batchSize) {
		const chunk = bulkCreationList.slice(i, i + batchSize);
		await createUsers(marketplaceBase, chunk, process.stdout);
		await delay(batchDelay);
	}
}

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

main().then(() => {
}).catch((err: Error) => console.error(`failed: ${ err.message }`));
