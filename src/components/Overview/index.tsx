import React, { useContext, useEffect, useRef } from "react";
import styles from "./index.module.less";
import * as PIXI from "pixi.js";
import { RollContext } from "Roll";
import { ITEM_WIDTH } from "components/keyboards/constants";
import { autorun } from "mobx";
import { OVERVIEW_HEIGHT } from "./constants";

export const Overview = () => {
  const pixiAppRef = useRef<PIXI.Application<HTMLCanvasElement>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const context = useContext(RollContext);
  console.log({ context });

  const rendervisibleRect = () => {
    const app = pixiAppRef.current as PIXI.Application;
    const { keyboardLength, width } = context;
    const allWidth = keyboardLength * ITEM_WIDTH;
    const showPercent =
      allWidth < width ? 1 : (width as number) / (allWidth);

    app.stage.removeChildren(0);
    const visibleRectWidth = showPercent * (width as number + 92);
    let obj = new PIXI.Graphics();
    obj.beginFill(0xff0000);
    obj.drawRect(0, 0, visibleRectWidth, OVERVIEW_HEIGHT);
    app.stage.addChild(obj);
  };

  const renderItems = () => {};

  useEffect(() => {
    const containerDom = containerRef.current as HTMLDivElement;
    pixiAppRef.current = new PIXI.Application<HTMLCanvasElement>({
      resizeTo: containerDom,
      background: "#ffffff",
    });

    (containerRef.current as HTMLDivElement).appendChild(
      pixiAppRef.current.view
    );

    autorun(() => {
      rendervisibleRect();
    });
  }, []);

  return <div className={styles.overview} ref={containerRef}></div>;
};
