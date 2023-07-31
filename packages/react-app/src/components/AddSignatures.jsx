/* eslint-disable no-unused-vars */
import { Button, InputNumber, Form } from "antd";

import React, { useState } from "react";

import { useHistory } from "react-router-dom";
import proposeTransaction from "../helpers/proposeTransaction";

const AddSignatures = ({ neededSigns, members, apiBaseUrl, multiSigAdd }) => {
  const [signsNeeded, setSignsNeeded] = useState(neededSigns);

  const [loading, setLoading] = useState(false);

  const history = useHistory();

  async function handleClick() {
    try {
      await proposeTransaction(
        apiBaseUrl,
        "setSignersRequired(uint8)",
        [["uint8"], [signsNeeded]],
        multiSigAdd,
        0,
        neededSigns,
      );

      history.push("/transactions");
    } catch (err) {
      console.log("error while propose tx to add sigantures required : ", err);
    }
  }

  return (
    <div>
      <Form title="Add a Signatures" style={{ width: "350px", display: "flex", flexDirection: "column" }}>
        {" "}
        Update Signatures Required
        <div style={{ marginTop: "15px" }}>
          <InputNumber placeholder={neededSigns} value={signsNeeded} onChange={setSignsNeeded} />

          <Button
            disabled={!(signsNeeded > 0 && signsNeeded <= members.length)}
            loading={loading}
            onClick={() => handleClick()}
          >
            {" "}
            Propose{" "}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddSignatures;
