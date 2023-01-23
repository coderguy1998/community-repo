import { limirOrderProtocolAdresses } from "@1inch/limit-order-protocol-utils";
import {
  LimitOrderBuilder,
  PrivateKeyProviderConnector,
} from "@1inch/limit-order-protocol-utils";
import Web3 from "web3";
import { convertAmount, LimitOrder, permitToken, TxData } from "./utils";

const web3: Web3 = new Web3(""); //@note Add the infure/alchemy/moralis link over here
const chainId: number = 1;
const contractAddress: string = limirOrderProtocolAdresses[chainId];
const connector: PrivateKeyProviderConnector = new PrivateKeyProviderConnector(
  "",
  web3
);

const limitOrderBuilder = new LimitOrderBuilder(
  contractAddress,
  chainId,
  connector
);

async function createLimitOrder(
  txData: TxData,
  userAddress: string
): Promise<LimitOrder> {
  const makingAmount = convertAmount(
    txData.fromAmount,
    txData.fromToken.decimals.toString()
  );

  const takingAmount = convertAmount(
    txData.toAmount,
    txData.toToken.decimals.toString()
  );
  const permit = await permitToken(
    txData,
    userAddress,
    "privKey", //@note Pass the user's private key here
    web3,
    makingAmount
  );
  const limitOrder = limitOrderBuilder.buildLimitOrder({
    makerAssetAddress: txData.fromToken.address,
    takerAssetAddress: txData.toToken.address,
    makerAddress: userAddress,
    makingAmount: makingAmount.toString(),
    takingAmount: takingAmount.toString(),
    permit: permit,
  });
  const limitOrderTypedData =
    limitOrderBuilder.buildLimitOrderTypedData(limitOrder);

  const limitOrderSignature = await limitOrderBuilder.buildOrderSignature(
    userAddress,
    limitOrderTypedData
  );
  const limitOrderHash =
    limitOrderBuilder.buildLimitOrderHash(limitOrderTypedData);

  const payload = {
    orderHash: limitOrderHash,
    signature: limitOrderSignature,
    data: limitOrder,
  };

  return (
    this.httpClient
      .post(
        `https://limit-orders.1inch.io/v3.0/${chainId}/limit-order`,
        payload,
        {
          // headers: defaultHeaders,
        }
      )
      //.pipe(map((responseBody) => responseBody as LimitOrder))
      .toPromise()
  );
}




