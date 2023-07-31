import axios from "axios";
import { ethers } from "ethers";

export function getCallData(functionName, params) {
  const abi = ethers.utils.defaultAbiCoder;
  const functionNameEncoded = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(functionName)).substring(0, 10);
  const paramsEncoded = abi.encode(params[0], params[1]).substring(2);
  return functionNameEncoded + paramsEncoded;
}

export default async function proposeTransaction(apiBaseUrl, _functionName, _params, _to, _value, neededSigns) {
  const callData = getCallData(_functionName, _params);
  const txId = await axios.get(apiBaseUrl + "txId");
  console.log("------------What !!!---------", txId);
  try {
    await axios.post(apiBaseUrl + "addTransaction", {
      functionName: _functionName,
      params: _params,
      to: _to,
      value: _value,
      txId: txId.data.txId,
      callData,
      neededSigns,
      signatures: [],
    });
  } catch (err) {
    console.log(err);
  }
}
