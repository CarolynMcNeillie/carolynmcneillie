import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `CarolynMcNeillie`,
    description:
    "Carolyn McNeillie is a Senior Font-End Developer.",
    image: "images/Carolyn.png",
    twitterUsername: "@carolynalive",
    siteUrl: "https://carolynmcneillie.com",
  },
  graphqlTypegen: true,
  plugins: [
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [`montserrat:400,700`, `cardo`],
        display: "swap",
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "Carolyn McNeillie",
        short_name: "Carolyn",
        start_url: "/",
        icon: "src/images/icon.png",
        crossOrigin: `use-credentials`,
      },
    },
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "UA-113885017-1",
      },
    },
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-plugin-sass",
    "gatsby-plugin-sitemap"
  ]
};

export default config;
