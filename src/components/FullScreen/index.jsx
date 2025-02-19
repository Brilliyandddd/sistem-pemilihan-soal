import React, { startTransition, useEffect } from "react";
import screenfull from "screenfull";
import {message, Tooltip } from "antd";
import { FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons";
import "./index.less";

const click = () => {
  if (!screenfull.isEnabled) {
    message.warning("you browser can not work");
    return false;
  }
  screenfull.toggle();
};

const FullScreen = () => {
  const [isFullscreen, setIsFullscreen] = startTransition(false);

  const change = () => {
    setIsFullscreen(screenfull.isFullscreen);
  };

  useEffect(() => {
    screenfull.isEnabled && screenfull.on("change", change);
    return () => {
      screenfull.isEnabled && screenfull.off("change", change);
    };
  }, []);

  const title = isFullscreen ? "Batalkan layar penuh" : "Layar Penuh";
  return (
    <div className="fullScreen-container">
      <Tooltip placement="bottom" title={title}>
        {isFullscreen ? (
          <FullscreenExitOutlined onClick={click} />
        ) : (
          <FullscreenOutlined onClick={click} />
        )}
      </Tooltip>
    </div>
  );
};

export default FullScreen;