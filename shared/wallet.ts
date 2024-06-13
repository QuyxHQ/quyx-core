import { WalletContractV4, toNano } from 'ton';
import { mnemonicToWalletKey } from 'ton-crypto';
import env from './env';
import Client from './Client';

export default async function () {
    if (!env.MNEMONIC) throw new Error('MNEMONIC not set');

    const mnemonic = env.MNEMONIC;
    const { publicKey, secretKey } = await mnemonicToWalletKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ publicKey, workchain: 0 });

    const client = await Client();

    if (!(await client.isContractDeployed(wallet.address))) {
        throw new Error('Wallet is not deployed');
    }

    const balance = await client.getBalance(wallet.address);
    if (balance < toNano(0.02)) {
        // send something to keep me informed
        // balance is little
        throw new Error('Insufficient balance');
    }

    return { contract: client.open(wallet), secretKey };
}
