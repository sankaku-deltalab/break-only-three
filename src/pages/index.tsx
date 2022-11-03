import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useWindowSize } from "@react-hook/window-size";

import styles from "../styles/Home.module.css";

const StageForNextjs = dynamic(
  () => import("../features/reactpixi/stage-for-nextjs"),
  { ssr: false }
);

const IndexPage: NextPage = () => {
  const [width, height] = useWindowSize();
  return (
    <div className={styles.container}>
      <Head>
        <title>Redux Toolkit</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StageForNextjs canvasSize={{ x: width, y: height }} />
    </div>
  );
};

export default IndexPage;
