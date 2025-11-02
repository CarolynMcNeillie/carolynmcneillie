import * as React from "react";
import "../styles/normalize.css";
import "../styles/styles.scss";
import type { HeadFC, PageProps } from "gatsby";
import WebGLBackground from "../components/WebGLBackground/WebGLBackground";
import Content from "../components/Content";

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <WebGLBackground />
      {/* <Content /> */}
    </main>
  );
};

export default IndexPage;

// HTML Head
export const Head: HeadFC = () => (
  <>
    <html lang="en" />
    <title>Carolyn McNeillie</title>
    <meta
      name="description"
      content="I am a senior front-end developer who has been crafting exceptional web experiences for eight years. I love CSS."
    />
    <meta name="image" content="../images/Carolyn.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Carolyn McNeillie" />
    <meta name="twitter:url" content="https://www.carolynmcneillie.com" />
    <meta
      name="twitter:description"
      content="I am a senior front-end developer who has been crafting exceptional web experiences for eight years. I love CSS."
    />
    <meta name="twitter:image" content="../images/Carolyn.png" />
    <meta name="twitter:creator" content="carolynalive" />
  </>
);
