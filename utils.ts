import {
  Eip2612PermitUtils,
  PermitParams,
  PrivateKeyProviderConnector,
} from "@1inch/permit-signed-approvals-utils";
import BigNumber from "bignumber.js";
import Web3 from "web3";

export interface TxData {
  fromAmount: string;
  fromToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  toAmount: string;
  toToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
}

export interface LimitOrder {
  orderHash: string;
  signature: string;
  data: LimitOrderData;
  createDateTime?: string;
  remainingMakerAmount?: string;
  makerBalance?: string;
  makerAllowance?: string;
  makerRate?: string;
  takerRate?: string;
  isMakerContract?: boolean;
  orderInvalidReason?: null | string;
}

export interface LimitOrderData {
  makerAsset: string;
  takerAsset: string;
  maker: string;
  allowedSender?: string;
  receiver?: string;
  makingAmount: string;
  takingAmount: string;
  salt: string;
  offsets?: string;
  interactions?: string;
}

export function convertAmount(amount: string, decimals: string): string {
  return new BigNumber(amount)
    .multipliedBy(new BigNumber(10).exponentiatedBy(decimals))
    .toString();
}

export async function permitToken(
  txData: TxData,
  userAddress: string,
  privKey: string,
  web3: Web3,
  amount: string
): Promise<string> {
  const connector = new PrivateKeyProviderConnector(privKey, web3);
  const eip2612PermitUtils = new Eip2612PermitUtils(connector);
  const nonce = await eip2612PermitUtils.getTokenNonce(
    txData.fromToken.address.toLowerCase(),
    userAddress
  );
  const tokenVersion = await eip2612PermitUtils.getTokenVersion(
    txData.fromToken.address
  );

  const permitParams: PermitParams = {
    owner: userAddress,
    spender: "0x1111111254eeb25477b68fb85ed929f73a960582",
    value: amount,
    nonce: nonce,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
  };

  // @note Dummy
  const tokenName = {
    name: "",
  };
  //@note You can either pass the name directly or you can fetch it using moralis or using contract call to the contract
  // const tokenName = await this.http
  //   .get<any>(
  //     `https://deep-index.moralis.io/api/v2/erc20/metadata?chain=eth&addresses%5B0%5D=${txData.fromToken.address}`,
  //     {
  //       headers: {
  //         "X-API-KEY": environment.moralisApiKey,
  //       },
  //     }
  //   )
  //   .toPromise();

  const callData = await eip2612PermitUtils.buildPermitCallData(
    permitParams,
    1,
    tokenName[0].name,
    txData.fromToken.address,
    tokenVersion
  );

  return callData;
}
