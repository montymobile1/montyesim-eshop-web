import { ClickAwayListener, Tooltip } from "@mui/material";
import React, { useState } from "react";

const TooltipComponent = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleToggleTooltip = () => {
    setOpen(!open);
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <Tooltip
        disableFocusListener
        disableHoverListener
        arrow
        open={open}
        title={title}
        slotProps={{
          popper: {
            disablePortal: true,
            sx: { marginTop: "0px !important" },
          },
        }}
      >
        <button
          type="button"
          className="min-w-0 bg-transparent border-0 p-0 text-left cursor-pointer"
          onClick={handleToggleTooltip}
        >
          {children}
        </button>
      </Tooltip>
    </ClickAwayListener>
  );
};

export default TooltipComponent;
