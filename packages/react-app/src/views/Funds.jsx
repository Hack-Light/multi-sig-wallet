/* eslint-disable eqeqeq */
/* eslint-disable radix */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { List, Typography } from "antd";
import React from "react";
import { Address, Balance, TransactionListItem } from "../components";
import ProposeSpend from "../components/ProposeSend";

const { Text } = Typography;

export default function Funds({
  readContracts,
  executeTransactionEvents,
  walletContractName,
  localProvider,
  price,
  mainnetProvider,
  blockExplorer,
}) {
  return (
    <div style={{ padding: 32, maxWidth: "100%", margin: "auto", display: "flex" }}>
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "row", textAlign: "center" }}>
          <span style={{ paddingBottom: 24, verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
            <Text>
              <a style={{ color: "#ddd" }} target="_blank" rel="noopener noreferrer">
                Contract Balance
              </a>
            </Text>
          </span>
        </div>
        <div style={{ width: "95%", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <div style={{ width: "40%", border: "1px solid rgb(50, 50, 50)", borderRadius: 10 }}>
            <div style={{ padding: 5 }}>
              <Balance
                address={readContracts ? readContracts[walletContractName].address : readContracts}
                provider={localProvider}
                dollarMultiplier={price}
                fontSize={36}
              />
            </div>
            <div style={{ padding: 5 }}>
              <Address
                address={readContracts ? readContracts[walletContractName].address : readContracts}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={32}
              />
            </div>
          </div>

          <div style={{ maxWidth: "100%", display: "flex", flexDirection: "row", marginLeft: 20 }}>
            <ProposeSpend mainnetProvider={mainnetProvider} price={price} />
          </div>
        </div>

        <div style={{ paddingTop: 48, width: "95%" }}>
          <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
            <Text>
              <a style={{ color: "#ddd" }} target="_blank" rel="noopener noreferrer">
                executed ether transfers
              </a>
            </Text>
          </span>

          <div style={{ maxHeight: "400px", overflow: "scroll" }}>
            <List
              bordered
              dataSource={executeTransactionEvents.filter(event => event.data == "0x00")}
              renderItem={item => (
                <TransactionListItem
                  item={item}
                  mainnetProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  price={price}
                  readContracts={readContracts}
                  walletContractName={walletContractName}
                />
              )}
            />
          </div>
        </div>

        <div style={{ paddingTop: 32, width: "95%" }}>
          <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: 36, width: "100%" }}>
            <Text>
              <a style={{ color: "#ddd" }} target="_blank" rel="noopener noreferrer">
                other executions
              </a>
            </Text>
          </span>

          <div style={{ maxHeight: "400px", overflow: "scroll" }}>
            <List
              bordered
              dataSource={executeTransactionEvents.filter(event => event.data != "0x00")}
              renderItem={item => {
                return (
                  <>
                    <TransactionListItem
                      item={item}
                      mainnetProvider={mainnetProvider}
                      blockExplorer={blockExplorer}
                      price={price}
                      readContracts={readContracts}
                      walletContractName={walletContractName}
                    />
                  </>
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
