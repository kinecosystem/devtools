import { Keypair, KinNetwork, createWallet } from "@kinecosystem/kin.js";
import * as jsonwebtoken from "jsonwebtoken";
import axios from "axios";

const PRODUCTION = "https://api.kinmarketplace.com";
const BETA = "https://api.kinecosystembeta.com";
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
};

export type AuthToken = {
	token: string;
	activated: boolean;
	expiration_date: string;
	app_id: string;
	user_id: string;
	ecosystem_user_id: string;
};

export type ConfigResponse = {
	blockchain: {
	 horizon_url: string;
	 network_passphrase: string;
	 asset_issuer: string;
	 asset_code: string;
	};
};

export type RegisterMarketplaceClientPayload = {
	device_id: string;
	wallet_address: string;
	sign_in_type: "jwt";
	jwt: string
};
export type ApiError = {
	code: number;
	error: string;
	message: string;
};

async function register(base: string, data: RegisterMarketplaceClientPayload) {
	const res = await axios.post<AuthToken>(`${ base }/v1/users`, data);
	return res.data;
}

async function getConfig(base: string) {
	const res = await axios.get<ConfigResponse>(`${ base }/v1/config`);
	return res.data.blockchain;
}

async function main() {
	const keypair = Keypair.random();
	if (process.argv.length < 5) {
		throw new Error("usage: npm run create-wallet -- <beta|production> <device_id> <JWT>");
	}
	const env = process.argv[2];
	const deviceId = process.argv[3];
	const jwt = process.argv[4];
	let marketplace_base: string;

	if (env === "beta") {
		marketplace_base = BETA;
	} else if (env === "production") {
		marketplace_base = PRODUCTION;
	} else {
		throw new Error("env must be beta or production");
	}

	const decoded = jsonwebtoken.decode(jwt, { complete: true }) as JWTContent<RegisterJWTPayload, "register">;
	console.log(`${ decoded.payload.user_id }@${ deviceId }) address: <${keypair.publicKey()}> secret key: <${keypair.secret()}>`);
	try {
		const authToken = await register(marketplace_base, { device_id: deviceId, sign_in_type: "jwt", wallet_address: keypair.publicKey(), jwt });
		console.log(`auth token: <${authToken.token}>`);
	} catch (err) {
		const apiError: ApiError = err.response!.data;
		throw new Error(apiError.message);
	}

	const config = await getConfig(marketplace_base);
	const network = KinNetwork.from(
		config.network_passphrase,
		config.asset_issuer,
		config.horizon_url);

	const wallet = await createWallet(network, keypair);
	await wallet.trustKin();
}

main().then(() => console.log("done!")).catch((err: Error) => console.error(`failed: ${err.message}`));
