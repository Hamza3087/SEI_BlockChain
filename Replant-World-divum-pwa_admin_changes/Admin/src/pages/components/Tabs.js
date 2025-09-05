import React, { useState } from "react";
import classnames from "classnames";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";

const TabsPage = ({ ...props }) => {
  const [activeAltTab, setActiveAltTab] = useState("9");

  const toggleAltTab = (alttab) => {
    if (activeAltTab !== alttab) setActiveAltTab(alttab);
  };

  return (
    <React.Fragment>
      <Nav tabs className="nav-tabs-s2">
        <NavItem>
          <NavLink
            tag="a"
            href="#tab"
            className={classnames({ active: activeAltTab === "1" })}
            onClick={(ev) => {
              ev.preventDefault();
              toggleAltTab("1");
            }}
          >
            Tree Management
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            tag="a"
            href="#tab"
            className={classnames({ active: activeAltTab === "2" })}
            onClick={(ev) => {
              ev.preventDefault();
              toggleAltTab("2");
            }}
          >
            People and Organization
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeAltTab}>
        <TabPane tabId="1">
          <p> Some text for tab 1 </p>
        </TabPane>
        <TabPane tabId="2">
          <p> Some text for tab 2 </p>
        </TabPane>
        <TabPane tabId="3">
          <p> Some text for tab 3 </p>
        </TabPane>
        <TabPane tabId="4">
          <p> Some text for tab 4 </p>
        </TabPane>
      </TabContent>
    </React.Fragment>
  );
};
export default TabsPage;
