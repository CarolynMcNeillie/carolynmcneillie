import * as React from "react";
import "../styles/normalize.css";
import "../styles/styles.scss";
import type { HeadFC, PageProps } from "gatsby";
import WebGLBackground from "../components/WebGLBackground/WebGLBackground";

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <WebGLBackground />
      {/* <div className="card">
        <div>
          <StaticImage
            alt="Carolyn McNeillie, illustration by Patrick Gray"
            src="../images/Carolyn.png"
            className="profileImage"
          />
        </div>
        <h1>Carolyn McNeillie</h1>
        <p className="h2">
          Toronto / Hamilton / Anywhere <br />
          <a href="mailto:hello@carolynmcneillie.com">
            hello@carolynmcneillie.com
          </a>
        </p>
        <div className="text">
          <p>
            I am a senior front-end developer who has been crafting exceptional
            web experiences for eight years. I hold a degree in fine art from
            OCAD University and spent 15 years working in art and design. My
            previous job titles include sign painter, art conservator, muralist,
            galley attendant, art director, and marketing director. I bring my
            expertise to bear on everything I build.
          </p>
          <p>
            I love collaborating with designers to bring their vision to life,
            and pushing the boundaries of what code can do in the browser. I
            love jamming on animations and micro interactions and I am
            passionate about solving complex design problems with creativity and
            empathy. I always ensure performance, maintainability, and
            accessibility are considered from the first line of code.
          </p>
        </div>
        <ul className="socialList">
          <li className="socialListItem">
            <a
              href="https://codepen.io/carolynmcneillie"
              target="_blank"
              rel="noreferrer"
            >
              <StaticImage src="../images/codepen.svg" alt="Code pen" />
              <span>Codepen</span>
            </a>
          </li>
          <li className="socialListItem">
            <a
              href="https://github.com/CarolynMcNeillie"
              target="_blank"
              rel="noreferrer"
            >
              <StaticImage src="../images/github.svg" alt="Github" />
              <span>GitHub</span>
            </a>
          </li>
          <li className="socialListItem">
            <a
              href="https://medium.com/@carolynmcneillie"
              target="_blank"
              rel="noreferrer"
            >
              <StaticImage src="../images/medium.svg" alt="Medium" />
              <span>Medium</span>
            </a>
          </li>
          <li className="socialListItem">
            <a
              href="https://www.linkedin.com/in/carolyn-mcneillie/"
              target="_blank"
              rel="noreferrer"
            >
              <StaticImage src="../images/linkedin.svg" alt="LinkedIn" />
              <span>LinkedIn</span>
            </a>
          </li>
        </ul>
      </div> */}
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
