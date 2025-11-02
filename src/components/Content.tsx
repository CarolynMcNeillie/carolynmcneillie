import * as React from "react";
import { StaticImage } from "gatsby-plugin-image";

const Content = (): JSX.Element => {
  return (
    <div className="card">
      <h1>Carolyn McNeillie</h1>
      <p className="h2">
        Toronto / Hamilton / Anywhere <br />
        <a href="mailto:hello@carolynmcneillie.com">
          hello@carolynmcneillie.com
        </a>
      </p>
      <div className="text">
        <p>
          I am a senior front-end developer with 8 years of experience
          specializing in high-polish front-of the front end code. I work at{" "}
          <a href="https://www.shopify.com" target="_blank" rel="noreferrer">
            Shopify
          </a>
          {` `}where I help build{" "}
          <a
            href="https://www.shopify.com/editions/summer2025"
            target="_blank"
            rel="noreferrer"
          >
            gorgeous
          </a>
          ,{" "}
          <a
            href="https://hydrogen.shopify.dev/"
            target="_blank"
            rel="noreferrer"
          >
            envelope-pushing
          </a>
          , {` `}
          <a
            href="https://www.awwwards.com/sites/shopify-editions-summer-24"
            target="_blank"
            rel="noreferrer"
          >
            awwward-winning
          </a>{" "}
          websites.
        </p>
        <p>
          I hold a degree in fine art from OCAD University and spent 15 years
          working in art and design. My previous job titles include sign
          painter, art conservator, muralist, galley attendant, art director,
          and marketing director. I bring my expertise to bear on everything I
          build.
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
    </div>
  );
};

export default Content;
