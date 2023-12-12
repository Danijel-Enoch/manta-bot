import { BigNumberish, Typed, AddressLike, parseEther } from "ethers";
import {
	instantiateBotRouter,
	instantiateDexRouter,
} from "../web3/instantiate";
import { BotRouter, WETH, spookyDexRouter } from ".";
import { MyContext } from "../bot";
import { ParseError, TransactionLoading } from "./mangeToken.handler";

async function getAmountOut(
	amountInMax: BigNumberish | Typed,
	tokenIn: AddressLike,
	tokenOut: AddressLike,
	Slippage: number,
	privateKey: string
) {
	const dexRouterContract = await instantiateDexRouter(
		spookyDexRouter,
		process.env.RPC,
		privateKey
	);

	const amounts = await dexRouterContract.getAmountsOut(amountInMax, [
		tokenIn,
		tokenOut,
	]);
	if (Slippage !== 0) {
		const outsIn = amounts[1];
		const expectedOutput = outsIn * BigInt(10 - Slippage * 10);
		const finalExpectedAmount = expectedOutput / BigInt(10);

		return finalExpectedAmount;
	}
}
export async function buyTokenHandler(
	slippagePercent: number,
	amountInMax: BigNumberish | Typed,
	tokenOut: AddressLike,
	privateKey: string,
	amountToBuy: string,
	ctx: MyContext
) {
	const Weth = WETH;
	const amountMinOut = await getAmountOut(
		amountInMax,
		Weth,
		tokenOut,
		slippagePercent / 100,
		privateKey
	);
	// console.log({ amountMinOut });
	const botRouter = await instantiateBotRouter(
		BotRouter,
		process.env.RPC,
		privateKey
	);
	await TransactionLoading(ctx);
	return await botRouter
		.buyToken(tokenOut, amountMinOut, {
			value: parseEther(amountToBuy),
		})
		.then(async (res) => {
			console.log("success", { res });
			await ctx.reply(`${process.env.SCAN_URL}${res.hash}`);
		})
		.catch(async (err) => await ParseError(ctx, err));
	//buy token
}
