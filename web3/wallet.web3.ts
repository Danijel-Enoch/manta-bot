import { ethers, Provider, Wallet } from "ethers";
import { WalletGenerated } from "../types/web3";
import { getGasPrice } from "./utils.web3";

export class CreateWallet {
	chainRPC = process.env.RPC;
	tokenABI = [
		// Standard ERC-20 functions
		"function balanceOf(address account) view returns (uint256)",
		"function transfer(address recipient, uint256 amount) returns (bool)",
		"function decimals() view returns (uint8)",
		"function _decimals() view returns (uint8)",
		"function symbol() view returns (string)",
		"function _symbol() view returns (string)",
		"function approve(address spender, uint256 amount) returns (bool)",
	];
	provider = new ethers.JsonRpcProvider(this.chainRPC);

	async createWallet(): Promise<WalletGenerated> {
		const mnemonic: string = ethers.Wallet.createRandom().mnemonic?.phrase!;
		//convert mnemonic to Privak
		const privateKey = Wallet.fromPhrase(mnemonic).privateKey;
		//convert mnemonic to PubKey
		const publicKey = Wallet.fromPhrase(mnemonic).publicKey;
		return {
			privateKey: privateKey,
			mnemonic: mnemonic,
			publicKey: publicKey,
		};
	}
	async importWallet(mnemonic: string): Promise<WalletGenerated> {
		const privateKey = Wallet.fromPhrase(mnemonic).privateKey;
		//convert mnemonic to PubKey
		const publicKey = Wallet.fromPhrase(mnemonic).publicKey;
		return { privateKey, mnemonic, publicKey };
	}

	async sendERC20TOken(
		amount: string,
		to: string,
		privateKey: string,
		tokenAddress: string
	) {
		const walletInstance = new ethers.Wallet(privateKey, this.provider);
		const tokenContract = new ethers.Contract(
			tokenAddress,
			this.tokenABI,
			walletInstance
		);
		const tx = await tokenContract.transfer(to, ethers.parseEther(amount));
		return await tx.wait();
	}
	async sendEth(amount: string, to: string, privateKey: string) {
		const walletInstance = new ethers.Wallet(privateKey, this.provider);
		const recipientAddress = to;
		const gasPrice = await getGasPrice(process.env.RPC);
		const amountToSend = ethers.parseEther(amount);
		const transaction = {
			to: recipientAddress,
			value: amountToSend,
			gasPrice,
		};
		console.log(amountToSend, recipientAddress);
		const response = await walletInstance.sendTransaction(transaction);
		return response;
	}
	async EthBalance(account: string) {
		const balance = await new ethers.JsonRpcProvider(
			process.env.RPC
		).getBalance(account);

		// Convert the balance to Ether
		const etherBalance = ethers.formatEther(balance);

		return etherBalance;
	}
	async tokenBalanceOf(account: string, tokenAddress: string, rpc: string) {
		const abi = [
			// Standard ERC-20 functions
			"function balanceOf(address account) view returns (uint256)",
			"function transfer(address recipient, uint256 amount) returns (bool)",
			"function decimals() view returns (uint8)",
			"function _decimals() view returns (uint8)",
			"function symbol() view returns (string)",
			"function _symbol() view returns (string)",
			"function approve(address spender, uint256 amount) returns (bool)",
		];
		const tokenContract = new ethers.Contract(
			tokenAddress,
			abi,
			new ethers.JsonRpcProvider(rpc)
		);
		const balance = await tokenContract.balanceOf(account);
		return balance;
	}
	async getSymbol(contractAddress: string, rpc: string) {
		const abi = [
			// Standard ERC-20 functions
			"function balanceOf(address account) view returns (uint256)",
			"function transfer(address recipient, uint256 amount) returns (bool)",
			"function decimals() view returns (uint8)",
			"function _decimals() view returns (uint8)",
			"function symbol() view returns (string)",
			"function _symbol() view returns (string)",
			"function approve(address spender, uint256 amount) returns (bool)",
		];
		const tokenContract = new ethers.Contract(
			contractAddress,
			abi,
			new ethers.JsonRpcProvider(rpc)
		);

		try {
			const symbol = await tokenContract.symbol();
			return symbol;
		} catch (err) {
			try {
				const symbol = await tokenContract._symbol();
				return symbol;
			} catch (error) {
				console.log(error);
			}
		}
	}
	async getDecimals(tokenAddress: string, rpc: string) {
		const abi = [
			// Standard ERC-20 functions
			"function balanceOf(address account) view returns (uint256)",
			"function transfer(address recipient, uint256 amount) returns (bool)",
			"function decimals() view returns (uint8)",
			"function _decimals() view returns (uint8)",
			"function symbol() view returns (string)",
			"function _symbol() view returns (string)",
			"function approve(address spender, uint256 amount) returns (bool)",
		];
		const tokenContract = new ethers.Contract(
			tokenAddress,
			abi,
			new ethers.JsonRpcProvider(rpc)
		);

		try {
			const decimal = await tokenContract.decimals();
			return decimal;
		} catch (error) {
			const decimal = await tokenContract._decimals();
			return decimal;
		}
	}
	async WalletSigner(privateKey: string, provider: any) {
		return new ethers.Wallet(privateKey, provider);
	}

	async approve(privateKey: string, tokenAddress: string, operator: string) {
		const walletInstance = new ethers.Wallet(privateKey, this.provider);
		const max = ethers.MaxUint256;
		const contract = new ethers.Contract(
			tokenAddress,
			this.tokenABI,
			walletInstance
		);
		const tx = await contract.approve(operator, max);
		return await tx.wait();
	}
	async getTransactionReciept(txHash: string, provider: Provider) {
		const txReceipt = await provider.getTransactionReceipt(txHash);
		if (txReceipt && txReceipt.blockNumber) {
			return await txReceipt.getTransaction();
		}
	}
}
