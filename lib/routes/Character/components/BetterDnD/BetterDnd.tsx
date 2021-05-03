import { css, cx } from "@emotion/css";
import { useTheme } from "@material-ui/core/styles";
import React, { useRef, useState } from "react";
import {
  ConnectDragSource,
  DropTargetMonitor,
  useDrag,
  useDrop,
  XYCoord,
} from "react-dnd";

export const BetterDnd: React.FC<{
  index: number;
  /**
   * Unique key to know where blocks can be dropped
   */
  type: string;
  className?: string;
  render(renderProps: {
    drag: ConnectDragSource;
    isDragging: boolean;
    isOver: boolean;
  }): JSX.Element;
  onDrag?(): void;
  onDrop?(): void;
  onMove?(dragIndex: number, hoverIndex: number): void;
}> = (props) => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: props.type },
    begin: () => {
      props.onDrag?.();
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: props.type,
    drop: () => {
      props.onDrop?.();
    },
    hover(item: any, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = props.index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      props.onMove?.(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={cx(
        css({
          opacity: isDragging ? 0.2 : 1,
          boxShadow: isDragging
            ? `0 0 3pt 2pt ${theme.palette.primary.main}`
            : undefined,
          position: "relative",
        }),
        props.className
      )}
      onPointerEnter={() => {
        setHover(true);
      }}
      onPointerLeave={() => {
        setHover(false);
      }}
    >
      {props.render({ drag, isDragging, isOver: hover })}
    </div>
  );
};
