import { Button } from "antd";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { AddressInput, EtherInput } from ".";
import { useLocalStorage } from "../hooks";

export default function ProposeSpend({ mainnetProvider, price }) {
  const history = useHistory();

  const [, setMethodName] = useLocalStorage("createTx", "");
  const [, setCreateTxMethodNameDisabled] = useLocalStorage("createTxMethodNameDisabled");

  const [customTo, setCustomTo] = useState("");

  const [, setTo] = useLocalStorage("to");
  const [, setToDisabled] = useLocalStorage("toDisabled");

  const [customAmount, setCustomAmount] = useState(0);

  const [, setAmount] = useLocalStorage("createTxAmount");
  const [, setCreateTxAmountDisabled] = useLocalStorage("createTxAmountDisabled", false);

  const [, setData] = useLocalStorage("data", "0x");
  const [, setDataDisabled] = useLocalStorage("createTxDataDisabled");

  return (
    <div
      style={{
        border: "1px solid #cccccc",
        borderRadius: 30,
        width: 400,
        margin: "auto",
        padding: 10,
      }}
    >
      <div style={{ margin: 8 }}>Propose a transfer. Specify the target, and amount </div>
      <div style={{ margin: 8 }}>
        <AddressInput
          autoFocus
          ensProvider={mainnetProvider}
          placeholder="Receiver"
          value={customTo}
          onChange={setCustomTo}
        />
      </div>
      <div style={{ margin: 8, display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "100%", paddingRight: 10 }}>
          <EtherInput price={price} mode="USD" value={customAmount} onChange={setCustomAmount} />
        </div>

        <div>
          <Button
            onClick={async () => {
              const calldata = "0x00";
              setData(calldata);
              setDataDisabled(true);

              setMethodName("");
              setCreateTxMethodNameDisabled(true);

              setTo(customTo);
              setCustomTo("");
              setToDisabled(true);

              setAmount(customAmount);
              setCreateTxAmountDisabled(true);
              setCustomAmount();

              setTimeout(() => {
                history.push("/transactions");
              }, 777);
            }}
          >
            Create Transaction
          </Button>
        </div>
      </div>
    </div>
  );
}
