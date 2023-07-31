import React from "react";
import { PageHeader } from "antd";

// displays a page header

export default function Header() {
  return (
    <a
      href="https://github.com/austintgriffith/scaffold-eth/tree/meta-multi-sig"
      target="_blank"
      rel="noopener noreferrer"
    >
      <PageHeader title="🏗 scaffold-eth" subTitle="role-based-multi-sig " style={{ cursor: "pointer" }} />
    </a>
  );
}
