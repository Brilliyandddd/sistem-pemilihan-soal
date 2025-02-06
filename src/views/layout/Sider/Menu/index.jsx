import React, { Component } from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars-2";
import { connect } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { addTag } from "@/store/actions";
import { getMenuItemInMenuListByProperty } from "@/utils";
import menuList from "@/config/menuConfig";
import { HomeOutlined, UserOutlined } from '@ant-design/icons'; // Correct icon import
import "./index.less";

const SubMenu = Menu.SubMenu;

// Function to reorder items
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

class MenuComponent extends Component {
  state = {
    menuTreeNode: [],
    openKey: [],
  };

  // Filter menu items based on user roles
  filterMenuItem = (item) => {
    const { roles } = item;
    const { role } = this.props;
    if (role === "admin" || !roles || roles.includes(role)) {
      return true;
    } else if (item.children) {
      return !!item.children.find((child) => roles.includes(child.role));
    }
    return false;
  };

  // Generate the menu nodes
  getMenuNodes = (menuList) => {
    const path = this.props.location.pathname;
    return menuList.reduce((pre, item) => {
      if (this.filterMenuItem(item)) {
        if (!item.children) {
          pre.push(
            <Menu.Item key={item.path}>
              <Link to={item.path}>
                {item.icon && React.createElement(item.icon)} {/* Dynamically render the icon */}
                <span>{item.title}</span>
              </Link>
            </Menu.Item>
          );
        } else {
          const cItem = item.children.find(
            (cItem) => path.indexOf(cItem.path) === 0
          );
          if (cItem) {
            this.setState((state) => ({
              openKey: [...state.openKey, item.path],
            }));
          }
          pre.push(
            <SubMenu
              key={item.path}
              title={
                <span>
                  {item.icon && React.createElement(item.icon)} {/* Dynamically render the icon */}
                  <span>{item.title}</span>
                </span>
              }
            >
              {this.getMenuNodes(item.children)}
            </SubMenu>
          );
        }
      }
      return pre;
    }, []);
  };

  // Handle the drag-and-drop event
  onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const reorderedMenu = reorder(
      this.state.menuTreeNode,
      result.source.index,
      result.destination.index
    );
    this.setState({
      menuTreeNode: reorderedMenu,
    });
  };

  // Handle menu selection
  handleMenuSelect = ({ key }) => {
    let menuItem = getMenuItemInMenuListByProperty(menuList, "path", key);
    this.props.addTag(menuItem);
  };

  componentDidMount() {
    const menuTreeNode = this.getMenuNodes(menuList);
    this.setState({ menuTreeNode });
  }

  render() {
    const path = this.props.location.pathname;
    const { menuTreeNode, openKey } = this.state;

    return (
      <div className="sidebar-menu-container">
        <Scrollbars autoHide autoHideTimeout={1000} autoHideDuration={200}>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable" direction="vertical">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <Menu
                    mode="inline"
                    theme="dark"
                    onSelect={this.handleMenuSelect}
                    selectedKeys={[path]}
                    defaultOpenKeys={openKey}
                  >
                    {menuTreeNode.map((item, index) => (
                      <Draggable
                        key={item.key}
                        draggableId={item.key}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {item}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </Menu>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Scrollbars>
      </div>
    );
  }
}

export default connect((state) => state.user, { addTag })(MenuComponent);