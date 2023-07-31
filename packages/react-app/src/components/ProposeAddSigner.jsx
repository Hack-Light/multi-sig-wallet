import { Button } from "antd";
import React, { useState } from "react";
import { useLocalStorage } from "../hooks";
import AddressInput from "./AddressInput";

export default function ProposeAddSigner({ mainnetProvider, walletContractName, readContracts }) {
  const [newSigner, setNewSigner] = useState("");

  const [, setMethodName] = useLocalStorage("createTx", "");
  const [, setCreateTxMethodNameDisabled] = useLocalStorage("createTxMethodNameDisabled");

  const [, setTo] = useLocalStorage("to");
  const [, setToDisabled] = useLocalStorage("toDisabled");

  const [, setAmount] = useLocalStorage("createTxAmount");
  const [, setCreateTxAmountDisabled] = useLocalStorage("createTxAmountDisabled", false);

  const [, setData] = useLocalStorage("data", "0x");
  const [, setDataDisabled] = useLocalStorage("createTxDataDisabled");

  return (
    <div
      style={{
        width: "100%",
        margin: "auto",
        paddingBottom: 10,
      }}
    >
      <div style={{ margin: 8, display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "100%", paddingRight: 10 }}>
          <AddressInput
            autoFocus
            ensProvider={mainnetProvider}
            placeholder="New signer"
            value={newSigner}
            onChange={setNewSigner}
          />
        </div>

        <div>
          <Button
            onClick={async () => {
              const calldata = readContracts[walletContractName].interface.encodeFunctionData("addSigner", [newSigner]);
              setData(calldata);
              setDataDisabled(true);

              setMethodName("addExecutor(address)");
              setCreateTxMethodNameDisabled(true);

              setTo(readContracts[walletContractName].address);
              setToDisabled(true);

              setAmount(0);
              setCreateTxAmountDisabled(true);

              window.location.reload(true);
            }}
          >
            Propose new signer
          </Button>
        </div>
      </div>
    </div>
  );
}
