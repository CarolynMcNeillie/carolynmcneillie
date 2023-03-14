import * as React from "react"
import "../styles/normalize.css"
import "../styles/styles.scss"
import { StaticImage } from 'gatsby-plugin-image'
import { motion } from "framer-motion";
import type { HeadFC, PageProps } from "gatsby"
import Background from "../components/Background/Background"

// Set up Framer Motion
const container = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: 2,
      delayChildren: 2.8,
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <Background />
      <motion.div 
        className="card"
        variants={container}
        initial="hidden"
        animate="visible"
      >
          <motion.div variants={item}>
            <StaticImage
              alt="Carolyn McNeillie, illustration by Patrick Gray" 
              src="https://www.carolynmcneillie.com/static/c6a9e439e2b76f961b824beb0279d377/78646/Carolyn.png"
              className="profileImage" 
            />
          </motion.div>
          <motion.h1 variants={item}>Carolyn McNeillie</motion.h1>
          <motion.p className="h2" variants={item}>
            Toronto / Hamilton / Anywhere <br />
            <a href="mailto:hello@carolynmcneillie.com">
              hello@carolynmcneillie.com
            </a>
          </motion.p>
          <motion.div className="text" variants={item}>
            <p>
              I am a senior front-end developer who has been crafting exceptional web experiences for five years. I hold a degree in fine art from OCAD University and spent 15 years working in art and design. My previous job titles include sign painter, art conservator, muralist, galley attendant, art director, and marketing director. I bring my expertise to bear on everything I build.
            </p>
            <p>
            I love collaborating with designers to bring their vision to life, and pushing the boundaries of what code can do in the browser. I love jamming on animations and micro interactions and I am passionate about solving complex design problems with creativity and empathy. I always ensure performance, maintainability, and accessibility are considered from the first line of code.
            </p>
          </motion.div>
          <motion.ul className="socialList" variants={item}>
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
                href="https://twitter.com/carolynalive"
                target="_blank"
                rel="noreferrer"
              >
                <StaticImage src="../images/twitter.svg" alt="Twitter" />
                <span>Twitter</span>
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
          </motion.ul>
      </motion.div>
    </main>
  ) 
}

export default IndexPage

// HTML Head
export const Head: HeadFC = () => (
  <>
    <html lang="en" />
    <title>Carolyn McNeillie</title>
    <meta name="description" content="I am a senior front-end developer who has been crafting exceptional web experiences for five years. I love CSS." />
    <meta name="image" content="../images/Carolyn.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Carolyn McNeillie" />
    <meta name="twitter:url" content="https://www.carolynmcneillie.com"/>
    <meta name="twitter:description" content="I am a senior front-end developer who has been crafting exceptional web experiences for five years. I love CSS." />
    <meta name="twitter:image" content="../images/Carolyn.png" />
    <meta name="twitter:creator" content="carolynalive" />
  </>
)
