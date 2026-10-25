// The historical timeline runs from TIMELINE_START through TIMELINE_END in
// deck order; slides outside that range keep the footer only.
// A `timeline` date marks where the story is, not when an image was made:
// the credit line already gives the artwork's own date.
export const TIMELINE_START = "pigments-from-the-earth";
export const TIMELINE_END = "good-vibrations-2";

// Slide content is independent of the running order.
export const LIBRARY = {
"the-shape-of-oklch": {
    slide: {
      viz: true,
      rotate: true,
      vizControls: false,
      attribution: {
        text: "Every colour a Display P3 screen can show, plotted in OKLCH · 3D model adapted from oklch.com · Evil Martians · MIT",
        url: "https://oklch.com",
      },
    },
  },

"pigments-from-the-earth": {
    slide: {
      title: "Lesson six: the medium is the revolution",
      titleStyle: "lesson",
      // Ultramarine, which the next slides are about: dark enough for the pale rock.
      titleCSS: { color: "oklch(0.25 0.16 270)" },
      backgrounds: [
        {
          image: "./images/01Lascaux.avif",
          timeline: { year: -18000, label: "More than 20,000 years ago" },
          attribution: {
            text: "Jack Versloot · CC BY 2.0",
            url: "https://commons.wikimedia.org/wiki/File:Lascaux_II.jpg",
          },
        },
        {
          image: "./images/02Lascaux.jpg",
          timeline: { year: -18000, label: "More than 20,000 years ago" },
          attribution: {
            text: "Prof saxx · CC BY-SA 3.0",
            url: "https://commons.wikimedia.org/wiki/File:Lascaux_painting.jpg",
          },
        },
      ],
    },
  },

"pigments-from-the-earth-2": {
    slide: {
      fit: "whole",
      backgrounds: [
        {
          image: "./images/03Mummy.avif",
          // Date from the Commons record (Parlasca: Claudian, ca. 41-54 AD).
          timeline: { year: 41, label: "ca. 41–54 AD" },
          attribution: {
            text: "ArchaiOptix · CC BY-SA 4.0 · Landesmuseum Württemberg, Stuttgart",
            url: "https://commons.wikimedia.org/wiki/File:Mummy_portrait_of_a_young_woman_named_Eirene_from_Egypt_-_Stuttgart_LMW_AS_7.2_(01).jpg",
          },
        },
        {
          image: "./images/04Manuscript.avif",
          timeline: { year: 781, label: "c. 781–783" },
          attribution: {
            text: "Godescalc, _Evangelistary_ (c. 781–783) · Public domain · Bibliothèque nationale de France",
            url: "https://commons.wikimedia.org/wiki/File:Evangeliarium_-_%C3%A9vang%C3%A9liaire_dit_de_Charlemagne_ou_de_Godescalc_-_J%C3%A9sus-Christ_-_BNF_Gallica.jpg",
          },
        },
        {
          image: "./images/05Duchamp.avif",
          timeline: { year: 1911, label: "1911/12" },
          attribution: {
            text: "Marcel Duchamp, _Sad Young Man in a Train_ (1911/12) · © Association Marcel Duchamp / SIAE · Peggy Guggenheim Collection, Venice",
            url: "https://www.guggenheim-venice.it/en/art/works/nude-study-sad-young-man-on-a-train/",
          },
        },
        {
          image: "./images/06Still.avif",
          timeline: { year: 1951, label: "1951–1952" },
          attribution: {
            text: "Clyfford Still, _Untitled_ (1951–1952) · © City & County of Denver · SFMOMA",
            url: "https://www.artchive.com/artwork/untitled-clyfford-still-1951-1952/",
          },
        },
      ],
    },
  },

"the-pigment-economy": {
    slide: {
      fit: "whole",
      titleStyle: "pill",
      backgroundImage: "./images/10Atlas.jpg",
      // The long era of scarce, traded pigment: medieval trade routes until
      // synthetic pigments and dyes flattened the cost of colour (mid-1800s).
      timeline: { year: 1200, end: 1850, label: "c. 1200–1850" },
      attribution: {
        text: "Abraham Cresques, _Catalan Atlas_ (1375) · Public domain · National Library of Israel",
        url: "https://commons.wikimedia.org/wiki/File:Atlas_catalan_de_1375_02_(FL169300245_0982468).jpg",
      },
    },
  },

"ultramarine": {
    slide: {
      fit: "whole",
      backgroundImage: "./images/08Ultramarine.avif",
      // Ultramarine's peak as the costliest, most meaningful blue.
      timeline: { year: 1300, end: 1550, label: "c. 1300–1550" },
      attribution: {
        text: "Sandro Botticelli, _Madonna of the Book_ (c. 1480–81) · Public domain · Museo Poldi Pezzoli, Milan",
        url: "https://commons.wikimedia.org/wiki/File:Sandro_Botticelli_-_The_Virgin_and_Child_(The_Madonna_of_the_Book)_-_Google_Art_Project.jpg",
      },
    },

  },

"ultramarine-2": {
    slide: {
      fit: "whole",
      backgroundImage: "./images/09Wilton.avif",
      timeline: { year: 1300, end: 1550, label: "c. 1300–1550" },
      attribution: {
        text: "Anonymous, _The Wilton Diptych_ (c. 1395) · Public domain · National Gallery, London",
        url: "https://www.nationalgallery.org.uk/paintings/english-or-french-the-wilton-diptych",
      },
    },

  },

"painters-in-css": {
    slide: {
      body: "Art school\nspeedrun",
      subtitle: "An OKLCH meet-cute",
      bodyClass: "font-display section-title",
      // Sky blue on black (any saturated colour passes 3:1 here); a hue no other title uses.
      bodyCSS: { color: "oklch(0.80 0.13 230)" },
    },
  },

"colour-is-relative": {
    slide: {
      title: "Lesson five: colour is relative",
      titleStyle: "lesson",
      fit: "whole",
      // Redrawn as SVG from the Commons file, so the squares stay crisp at any size.
      backgroundImage: "./images/AlbersHomageAfter.svg",
      // Dark brown ink: 4.2:1 on the darkest square, 6.3:1 or more on the others.
      titleCSS: { color: "oklch(0.18 0.03 50)" },
      attribution: {
        text: "After Josef Albers, _Homage to the Square_ (1964) · Graphic by FriedeWie · CC0",
        url: "https://commons.wikimedia.org/wiki/File:Grafik_nach_Josef_Albers1.jpg",
      },
    },
  },

"albers": {
    slide: {
      demo: "albers",
      backgrounds: [{}, {}, {}, {}],
      attribution: { text: "After Josef Albers, _Interaction of Color_ (1963): the exercise rebuilt in CSS" },
    },
  },

"class-dismissed": {
    slide: {
      body: "Class\ndismissed.",
      bodyClass: "font-display section-title",
      // Chartreuse yellow on black (15.7:1), inside sRGB; a hue no other title uses.
      bodyCSS: { color: "oklch(0.90 0.16 100)" },
    },
  },



"titian": {
    slide: {
      title: "Lesson three: dark colours should still be rich",
      titleStyle: "lesson",
      // Full bleed: the crop keeps both figures, the bridge and the town.
      backgroundImage: "./images/GiorgioneTempest.avif",
      backgroundPosition: "50% 55%",
      attribution: {
        text: "Giorgione, _The Tempest_ (c. 1506–08) · Public domain · Gallerie dell’Accademia, Venice",
        url: "https://commons.wikimedia.org/wiki/File:Giorgione_019.jpg",
      },
    },
  },

"titian-2": {
    slide: { demo: "titian-glaze" },
  },

// The paper-cut forest (images/forest-layers.svg), coloured by --layer-1..9 and --sun.
"titian-3": {
    // Steps: the HSL greens, the three ramps (black mix, OKLCH L, shift H), the
    // shift cranked to its maximum, the sun, then the sun scene turning round the hue wheel.
    slide: { demo: "forest-scene", backgrounds: [{}, {}, {}, {}, {}, {}, {}] },
  },

"monet": {
    slide: {
      demo: "grayscale-toggle",
      fit: "whole",
      title: "Lesson two: colours that vibrate",
      titleStyle: "lesson",
      // The title leaves on the first press, so the painting can be discussed.
      backgrounds: [
        { image: "./images/MonetSunrise.avif", title: "Lesson two: colours that vibrate", titleStyle: "lesson", attribution: { text: "Claude Monet, _Impression, Sunrise_ (1872) · Public domain · Musée Marmottan Monet, Paris", url: "https://commons.wikimedia.org/wiki/File:Monet_-_Impression,_Sunrise.jpg" } },
        { image: "./images/MonetSunrise.avif", title: "", attribution: { text: "Claude Monet, _Impression, Sunrise_ (1872) · Public domain · Musée Marmottan Monet, Paris", url: "https://commons.wikimedia.org/wiki/File:Monet_-_Impression,_Sunrise.jpg" } },
      ],
    },
  },

"afterimage": {
    slide: { demo: "afterimage" },
  },

"riley": {
    slide: {
      demo: "riley", backgrounds: [{}, {}],
      attribution: { text: "An original study inspired by Edna Andrade's _Turbo 1-65_ (1965)" },
    },
  },

"chance": {
    slide: {
      title: "Lesson four: give chance a chance",
      titleStyle: "lesson",
      // A mid-lightness red sits halfway between Arp's black and white: about
      // 3.6:1 against the black shapes and 3.9:1 against the white board.
      titleCSS: { color: "oklch(0.55 0.19 29)" },
      // Full bleed: the photo is cropped to the board inside the frame.
      backgroundImage: "./images/ArpConstellation.avif",
      attribution: {
        text: "Jean Arp, _Constellation According to the Laws of Chance_ (c. 1930) · Public domain in Canada · Tate · Photo: Wmpearl, CC0",
        url: "https://commons.wikimedia.org/wiki/File:%27Constellation_According_to_the_Laws_of_Chance%27_by_Jean_Arp_(Hans_Arp),_Tate_Modern.JPG",
      },
    },
  },

"random-hues": {
    // Replaces richter and kelly-code (and the mosaic). A tetradic palette keyed
    // to lightness, HSL and OKLCH side by side; the dice or a click rolls again;
    // drop or paste an image to try another. Each arrow step recolours the next
    // artwork (art: is read by demos/hue-shift.js, not drawn as a background).
    slide: {
      demo: "hue-shift",
      backgrounds: [
        { art: "./images/IconAmericanGothic.avif", attribution: {"text":"Grant Wood, _American Gothic_ (1930) · Public domain · Art Institute of Chicago · recoloured","url":"https://commons.wikimedia.org/wiki/File:Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg"} },
        { art: "./images/WhistlerChelsea.avif", attribution: {"text":"James McNeill Whistler, _Nocturne: Blue and Silver – Chelsea_ (1871) · Public domain · Tate · recoloured","url":"https://commons.wikimedia.org/wiki/File:James_Abbott_McNeill_Whistler_-_Nocturne-_Blue_and_Silver_-_Chelsea_-_Google_Art_Project.jpg"} },
        { art: "./images/IconPearlEarring.avif", attribution: {"text":"Johannes Vermeer, _Girl with a Pearl Earring_ (c. 1665) · Public domain · Mauritshuis, The Hague · recoloured","url":"https://commons.wikimedia.org/wiki/File:1665_Girl_with_a_Pearl_Earring.jpg"} },
        { art: "./images/IconAldrinMoon.avif", attribution: {"text":"Neil Armstrong, _Buzz Aldrin on the Moon_ (1969) · Public domain · NASA · recoloured","url":"https://commons.wikimedia.org/wiki/File:Aldrin_Apollo_11_original.jpg"} },
      ],
    },
  },

"mosaic": {
    // Replaces richter and kelly-code. Random hues side by side in HSL and OKLCH
    // (a click rolls again; drop, paste or load an image to try another).
    slide: {
      demo: "mosaic",
      attribution: { text: "A mosaic after Leonardo da Vinci, _Mona Lisa_ (c. 1503–19) · tiles averaged from a generated image" },
    },
  },

"richter": {
    slide: {
      demo: "richter", backgrounds: [{}, {}],
      attribution: { text: "A generative study after Ellsworth Kelly's _Spectrum Colors Arranged by Chance_" },
    },
  },

"the-medium-is-the-revolution": {
    slide: {
      title: "",
      body: "The medium is\nthe revolution",
      bodyClass: "font-display section-title",
      // Top left, on the dark wood, at 64px (on Silkscreen's grid): pale gold
      // keeps 99 to 100% of letter pixels at 3:1 at 1920 and 1440 wide.
      bodyCSS: { color: "oklch(0.90 0.08 80)", top: "6rem", left: "4rem", right: "auto", transform: "none", textAlign: "left", fontSize: "64px" },
      backgroundImage: "./images/11Nativity.avif",
      timeline: { year: 1400, label: "c. 1400" },
      attribution: {
        text: "Pere Serra, _Nativity_ (c. 1400), detail · Photo: Jordiferrer · CC BY-SA 4.0",
        url: "https://commons.wikimedia.org/wiki/File:Museu_Maricel_(interior)_09_Nativitat_(Pere_Serra)_ca_1400_provinent_de_l%27esgl%C3%A9sia_de_Sant_Pere_de_Cubells.JPG",
      },
    },
  },

"the-medium-is-the-revolution-2": {
    slide: {
      fit: "whole",
      title: "",
      backgroundImage: "./images/12Ermine.avif",
      timeline: { year: 1490, label: "c. 1490" },
      attribution: {
        text: "Leonardo da Vinci, _Lady with an Ermine_ (c. 1490) · Public domain · Czartoryski Museum, Kraków",
        url: "https://commons.wikimedia.org/wiki/File:The_Lady_with_an_Ermine.jpg",
      },
    },
  },

"the-medium-is-the-revolution-3": {
    slide: {
      fit: "whole",
      title: "",
      backgrounds: [
        {
          image: "./images/13LuccaMadonna.avif",
          timeline: { year: 1436, label: "c. 1436" },
          attribution: {
            text: "Jan van Eyck, _Lucca Madonna_ (c. 1436) · Public domain · Städel Museum, Frankfurt",
            url: "https://commons.wikimedia.org/wiki/File:Jan_van_Eyck_-_Lucca_Madonna_-_Google_Art_Project.jpg",
          },
        },
        {
          image: "./images/14Anguissola.avif",
          timeline: { year: 1556 },
          attribution: {
            text: "Sofonisba Anguissola, _Self-Portrait at the Easel_ (1556) · Public domain · Muzeum-Zamek, Łańcut",
            url: "https://commons.wikimedia.org/wiki/File:Self-Portait_at_the_Easel_(Sofonisba_Anguissola)-WUS09909.jpg",
          },
        },
        {
          image: "./images/Babel.jpg",
          timeline: { year: 1563 },
          attribution: {
            text: "Pieter Bruegel the Elder, _The Tower of Babel_ (1563) · Public domain · Kunsthistorisches Museum, Vienna",
            url: "https://commons.wikimedia.org/wiki/File:Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_(Vienna)_-_Google_Art_Project_-_edited.jpg",
          },
        },
        {
          image: "./images/Arcimboldo.jpg",
          timeline: { year: 1590, label: "c. 1590" },
          attribution: {
            text: "Giuseppe Arcimboldo, _Four Seasons in One Head_ (c. 1590) · Public domain · National Gallery of Art, Washington",
            url: "https://commons.wikimedia.org/wiki/File:Giuseppe_Arcimboldo_-_Four_Seasons_in_One_Head_-_Google_Art_ProjectFXD.jpg",
          },
        },
      ],
    },
  },

"the-medium-is-the-revolution-4": {
    slide: {
      fit: "whole",
      backgroundImage: "./images/Botticelli.jpg",
      timeline: { year: 1482, label: "c. 1480–1485" },
      attribution: {
        text: "Sandro Botticelli, _Primavera_ (c. 1480–1485) · Public domain · Uffizi Gallery, Florence",
        url: "https://commons.wikimedia.org/wiki/File:Botticelli-primavera.jpg",
      },
    },
  },

"let-s-get-physical": {
    slide: {
      title: "",
      body: "Let’s get\nphysical",
      bodyClass: "font-display section-title",
      // Lemon: light enough for the dark portrait while staying saturated.
      bodyCSS: { color: "oklch(0.95 0.16 120)" },
      // Story time (Newton's prism experiments), not the 1702 portrait's date.
      timeline: { year: 1665 },
      backgrounds: [
        {
          image: "./images/17OldIsaac.avif",
          attribution: {
            text: "Godfrey Kneller, _Portrait of Sir Isaac Newton_ (1702), detail · Public domain · National Portrait Gallery, London",
            url: "https://commons.wikimedia.org/wiki/File:Sir_Isaac_Newton_by_Sir_Godfrey_Kneller,_Bt.jpg",
          },
        },
        {
          image: "./images/18YoungIsaac.avif",
          attribution: {
            text: "AI-generated artistic reconstruction of Isaac Newton, age 23 · Created with GPT Image 1",
          },
          title: "*artistic reconstruction",
          titleCSS: {
            fontSize: "1rem",
            transform: "translateX(50%)",
          },
        },
      ],
    },
  },

"let-s-get-physical-2": {
    slide: {
      fit: "whole",
      backgrounds: [
        {
          image: "./images/19Isaac.avif",
          attribution: {
            text: "Robert Hannah, _Master Isaac Newton in His Garden at Woolsthorpe, in the Autumn of 1665_ (c. 1850–55) · Public domain · Royal Institution",
            url: "https://commons.wikimedia.org/wiki/File:Robert_Hannah_-Master_Isaac_Newton_in_His_Garden_at_Woolsthorpe,_in_the_Autumn_of_1665.jpg",
          },
        },
        {
          image: "./images/19Isaac.avif",
          attribution: {
            text: "Robert Hannah, _Master Isaac Newton in His Garden at Woolsthorpe, in the Autumn of 1665_ (c. 1850–55) · Public domain · Royal Institution",
            url: "https://commons.wikimedia.org/wiki/File:Robert_Hannah_-Master_Isaac_Newton_in_His_Garden_at_Woolsthorpe,_in_the_Autumn_of_1665.jpg",
          },
          title: "nbd.",
          titleCSS: {
            color: "black",
            height: "fit-content",
            padding: "10px 30px 20px 40px",
            borderRadius: "30px",
            backgroundColor: "white",
            top: "20%",
            left: "40%",
          },
        },
      ],
    },
  },

"let-s-get-physical-3": {
    slide: {
      backgroundImage: "./images/20Paper.avif",
      body: `“I tooke a bodkin & put it betwixt my eye & the bone as neare to the Backside of my eye as I could, pressing my eye with the end of it… there appeared severall white darke & coloured circles…” `,
      bodyClass: "dark-text quote",
      audio: {
        src: "./audio/newton-bodkin.mp3",
        label: "Newton's words, read by an AI voice",
      },
      attribution: {
        text: "Quote: Isaac Newton, Questiones Quaedam Philosophicae (c. 1664) · Background: William Stukeley, _Memoirs of Sir Isaac Newton's life_ (1752) · Public domain · Royal Society",
        url: "https://commons.wikimedia.org/wiki/File:Memoirs_of_Sir_Isaac_Newton%27s_life_-_049.jpg",
      },
    },
  },

"let-s-get-physical-4": {
    slide: {
      fit: "whole",
      title: "",
      backgroundImage: "./images/21Experiment.avif",
      attribution: {
        text: "Sascha Grusche, _Newton's Experimentum Crucis_ (2015) · CC BY-SA 4.0",
        url: "https://commons.wikimedia.org/wiki/File:Newton%27s_Experimentum_Crucis_(Grusche_2015).jpg",
      },
    },
  },

"let-s-get-physical-5": {
    slide: {
      title: "",
      body: "eureka!",
      bodyClass: "font-display section-title",
      // The same lemon as the "Let’s get physical" title.
      // Above the beam: over the rainbow, the lemon is unreadable.
      bodyCSS: { color: "oklch(0.95 0.16 120)", top: "calc(var(--stage-top) + 8%)", transform: "none" },
      backgroundImage: "./images/22Prism.avif",
      backgroundSize: "contain",
      attribution: {
        text: "AI-generated illustration · Created with Nano Banana",
      },
    },
  },

"good-vibrations": {
    slide: {
      fit: "whole",
      body: "Good\nvibrations",
      bodyClass: "font-display section-title",
      // Mint: as light as lemon, a different hue.
      bodyCSS: { color: "oklch(0.90 0.17 150)" },
      backgroundImage: "./images/23Maxwell.avif",
      // Maxwell's working years on colour and light: colour experiments (1855)
      // to his Treatise on Electricity and Magnetism (1873).
      timeline: { year: 1855, end: 1873, label: "1855–1873" },
      attribution: {
        text: "James Clerk Maxwell as a young man · Pre-1923 photograph · Public domain",
        url: "https://commons.wikimedia.org/wiki/File:YoungJamesClerkMaxwell.jpg",
      },
    },
  },

"good-vibrations-2": {
    slide: {
      fit: "whole",
      backgroundImage: "./images/24Maxwell.avif",
      attribution: {
        text: "Jemima Blackburn, _James Clerk Maxwell and his wife Katherine_ (before 1879) · Public domain · Cavendish Laboratory, University of Cambridge",
        url: "https://commons.wikimedia.org/wiki/File:James_Clark_Maxwell_and_his_wife_by_Jemima_Blackburn.jpg",
      },
    },
  },

"good-vibrations-3": {
    slide: {
      demo: "spectrum",
    },
  },

"good-vibrations-4": {
    slide: {
      demo: "wave",
    },
  },

"the-biology-of-colour": {
    slide: {
      fit: "whole",
      body: "The biology\nof colour",
      bodyClass: "font-display section-title",
      // Blood red: dark enough for the pale paper (96% of letter pixels at 3:1).
      bodyCSS: { color: "oklch(0.30 0.12 20)" },
      backgroundImage: "./images/26Vitruvian.jpg",
      timeline: { year: 1492, label: "c. 1492" },
      attribution: {
        text: "Leonardo da Vinci, _The Vitruvian Man_ (c. 1492) · Public domain",
        url: "https://commons.wikimedia.org/wiki/File:0_The_Vitruvian_Man_-_by_Leonardo_da_Vinci.jpg",
      },
    },
  },

"the-biology-of-colour-2": {
    slide: {
      demo: "cone-mosaic",
      backgrounds: [{}, {}],
      attribution: {
        text: "Illustration of cone proportions · L:M range from Hofer et al. (2005), _Journal of Neuroscience_",
      },
    },
  },

"deuteranomaly": {
    slide: {
      demo: "colorblind",
      demoType: "deuteranomaly",
      // Step 2 glides the severity slider to Normal.
      backgrounds: [{}, {}],
    },
  },

"protanomaly": {
    slide: { demo: "colorblind", demoType: "protanomaly" },
  },

"tritanopia": {
    slide: { demo: "colorblind", demoType: "tritanopia" },
  },

"achromatopsia": {
    slide: {
      demo: "colorblind",
      demoType: "achromatopsia",
    },
  },

"the-x-factor": {
    slide: {
      backgroundImage: "./images/28TheDress.avif",
      attribution: {
        text: "AI-generated illustration · Based on the viral photograph by Cecilia Bleasdale (2015) · Created with GPT Image 1",
      },
    },
  },

"cone-sensitivity": {
    slide: {
      demo: "cones",
      demoType: "trichromat",
    },
  },

"the-x-factor-2": {
    slide: {
      demo: "cones",
      backgrounds: [{}, {}],
    },
  },

"language-is-a-magic-spell": {
    slide: {
      demo: "homer",
      backgrounds: [{}, {}, {}],
      attribution: {
        text: "Homer, _Iliad_ and _Odyssey_ (c. 8th century BC)",
      },
    },
  },

"language-is-a-magic-spell-2": {
    slide: {
      demo: "gradient-mesh",
    },
  },

"think-pink": {
    slide: { demo: "pink", backgrounds: [{}, {}, {}, {}] },
  },

"speaking-the-same-language": {
    slide: {
      body: "Speaking the\nsame language",
      bodyClass: "font-display section-title",
      // Near-black ink over the pale tower: 83% of the pixels under the words
      // reach 3:1 (white reached 46%).
      bodyCSS: { color: "oklch(0.18 0.03 40)" },
      backgroundImage: "./images/BruegelTowerOfBabel.avif",
      attribution: {
        text: "Pieter Bruegel the Elder, _The Tower of Babel_ (1563) · Public domain · Kunsthistorisches Museum, Vienna",
        url: "https://commons.wikimedia.org/wiki/File:Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_(Vienna)_-_Google_Art_Project_-_edited.jpg",
      },
    },
  },

"colour-systems": {
    slide: {
      // Munsell only: Newton, Runge and Werner were cut for time on 20 Oct.
      fit: "whole",
      backgrounds: [
        {
          image: "./images/MunsellColorTree.avif",
          attribution: {
            text: "Munsell Color Tree · Photo: Hannes Grobe · CC BY-SA 4.0",
            url: "https://commons.wikimedia.org/wiki/File:Munsell_color-tree_hg.jpg",
          },
        },
      ],
    },
  },

"the-abcs-of-cie-xyz": {
    slide: {
      demo: "colormatching",
      // The arrow sets the dials one at a time, a little off, then tweaks each.
      backgrounds: [{}, {}],
      attribution: { text: "Illustration of colour matching, not a reconstruction of the original apparatus" },
    },
  },

"the-abcs-of-cie-xyz-2": {
    slide: {
      demo: "cie",
      // Arrow steps highlight sRGB, then Display P3, then Rec. 2020.
      backgrounds: [{}, {}, {}, {}],
      titleStyle: "small",
    },
  },

"colours-in-cyberspace": {
    slide: {
      body: "Colours in\ncyberspace",
      bodyClass: "font-display section-title",
      // Electric magenta on black (6.9:1), inside sRGB; a hue no other title uses.
      bodyCSS: { color: "oklch(0.70 0.25 340)" },
    },
  },

"named-css-colours": {
    slide: { demo: "csscolors" },
  },

"srgb": {
    slide: { demo: "rgb", demoType: "black" },
  },

"srgb-2": {
    // Six arrow steps: red, pink, dark red, middle grey, blue, yellow (demos/rgb.js STEPS).
    slide: { demo: "rgb", backgrounds: [{}, {}, {}, {}, {}, {}] },
  },

"srgb-3": {
    slide: { demo: "yellow-blue" },
  },

"the-contrast-ratio-problem": {
    // The hue-saturation-lies-3 sweep again, in OKLCH: the ratio holds near 4.7:1.
    slide: { demo: "hsl-contrast", demoType: "oklch", backgrounds: [{}, {}] },
  },

"saved-by-the-hsl": {
    slide: {
      body: "Saved by\nthe HSL.",
      bodyClass: "font-display section-title",
      // Violet on black (6.8:1), inside sRGB; a hue no other title uses.
      bodyCSS: { color: "oklch(0.68 0.18 300)" },
    },
  },

"hue-saturation-lies": {
    // Arrow steps: top view with the dot round the hues, the dot in to grey,
    // then back to the side view with the dot up and down the lightness axis.
    slide: { demo: "hsl-bicone", backgrounds: [{}, {}, {}, {}] },
  },

"lies": {
    slide: {
      body: "Lies",
      bodyClass: "font-display section-title",
      // Alarm red on black (5.3:1), inside sRGB.
      bodyCSS: { color: "oklch(0.63 0.25 29)" },
    },
  },

"hue-saturation-lies-2": {
    slide: { demo: "hsl-shortfall" },
  },

"hue-saturation-lies-3": {
    // The arrow presses play on the hue sweep.
    slide: { demo: "hsl-contrast", backgrounds: [{}, {}] },
  },

"an-ok-color-space": {
    slide: {
      body: "An ok\ncolourspace",
      bodyClass: "font-display section-title",
      // Top centre, on the red hair, at 64px (on Silkscreen's grid): pale aqua
      // keeps 94 to 95% of letter pixels at 3:1 at 1920 and 1440 wide.
      bodyCSS: { color: "oklch(0.90 0.12 180)", top: "6rem", left: "4rem", right: "4rem", transform: "none", textAlign: "center", fontSize: "64px" },
      backgroundImage: "./images/32Bjorn.avif",
      attribution: {
        text: "AI-generated portrait · Created with Nano Banana · Inspired by Björn Ottosson's profile photo",
        url: "https://bottosson.github.io/about/",
      },
    },
  },

"an-ok-color-space-2": {
    slide: {
      viz: true,
      rotate: false,
      backgrounds: [{}, { vizAxis: "l" }, { vizAxis: "c" }, { vizAxis: "h" }],
      attribution: {
        text: "3D model adapted from oklch.com · Evil Martians · MIT",
        url: "https://oklch.com",
      },
    },
  },

"oklch-slices": {
    // One slice; the hue slider scrubs it. The arrow presses play.
    slide: { demo: "hue-slices", backgrounds: [{}, {}] },
  },

"oklch-syntax": {
    slide: { demo: "oklch-picker", demoType: "syntax" },
  },

"oklch-controls": {
    slide: { demo: "oklch-picker", demoType: "controls", backgrounds: [{}, {}, {}, {}] },
  },

"oklch-edge": {
    slide: { demo: "oklch-picker", demoType: "edge", backgrounds: [{}, {}] },
  },

"colour-harmonies-code": {
    slide: { demo: "harmony-code" },
  },

"kelly-code": {
    slide: { demo: "richter", demoType: "code", backgrounds: [{}, {}, {}, {}] },
  },

"monday": {
    slide: { demo: "monday" },
  },

"an-ok-color-space-3": {
    slide: { demo: "oklch-vs-hsl" },
  },

"the-reddest-red": {
    slide: { demo: "reddest-red" },
  },

"harmony-paintings": {
    slide: {
      fit: "whole",
      title: "Lesson one: colour harmonies",
      titleStyle: "lesson",
      // Dark ink, so the title reads on Whistler's pale blue.
      titleCSS: { color: "oklch(0.25 0.05 255)" },
      backgrounds: [
        {
          image: "./images/WhistlerChelsea.avif",
          attribution: {
            text: "James McNeill Whistler, _Nocturne: Blue and Silver – Chelsea_ (1871) · Public domain · Tate",
            url: "https://commons.wikimedia.org/wiki/File:James_Abbott_McNeill_Whistler_-_Nocturne-_Blue_and_Silver_-_Chelsea_-_Google_Art_Project.jpg",
          },
        },
      ],
    },
  },

  // HSL alone, then both wheels, then HSL leaves and one painting per scheme:
  // complementary, analogous, triadic, split-complementary, tetradic.
  "colour-harmonies-hsl": {
    slide: {
      demo: "harmonies",
      demoType: "hsl",
      backgrounds: [
        {},
        {},
        {
          attribution: {
            text: "Edvard Munch, _The Scream_ (1893) · Public domain · National Museum of Art, Architecture and Design, Oslo",
            url: "https://commons.wikimedia.org/wiki/File:Edvard_Munch,_1893,_The_Scream,_oil,_tempera_and_pastel_on_cardboard,_91_x_73_cm,_National_Gallery_of_Norway.jpg",
          },
        },
        {
          attribution: {
            text: "Vincent van Gogh, _Sunflowers_ (1888) · Public domain · National Gallery, London",
            url: "https://commons.wikimedia.org/wiki/File:Vincent_van_Gogh_-_Sunflowers_(1888,_National_Gallery_London).jpg",
          },
        },
        {
          attribution: {
            text: "Henri Matisse, _Dance II_ (1910) · Public domain · State Hermitage Museum",
            url: "https://commons.wikimedia.org/wiki/File:La_Danse_II,_par_Henri_Matisse.jpg",
          },
        },
        {
          attribution: {
            text: "Vincent van Gogh, _Café Terrace at Night_ (1888) · Public domain · Kröller-Müller Museum",
            url: "https://commons.wikimedia.org/wiki/File:Vincent_Willem_van_Gogh_-_Cafe_Terrace_at_Night_(Yorck).jpg",
          },
        },
        {
          attribution: {
            text: "Henri Matisse, _Woman with a Hat_ (1905) · Public domain · San Francisco Museum of Modern Art",
            url: "https://commons.wikimedia.org/wiki/File:Matisse-Woman-with-a-Hat.jpg",
          },
        },
      ],
    },
  },

  "colour-harmonies": {
    slide: { demo: "harmonies" },
  },

"title": {
    slide: { demo: "title" },
  },

"thank-you": {
    // Step 0: "Thank you" alone. Step 1: the P.S. fades in.
    // One step: the hiring P.S. (second step) stays hidden until it is confirmed.
    slide: { demo: "title", demoType: "thanks" },
  },

"about-me-now": {
    slide: {
      demo: "about-now",
      attribution: { text: "Photo: Josh Sanger · Shopify Summit 2025", url: "https://www.joshsanger.ca/" },
    },
  },

"work-editions": {
    slide: {
      demo: "video",
      demoType: "editions",
      attribution: { text: "Shopify Editions, Winter '26 · shopify.com/editions" },
    },
  },

"work-shop-md": {
    slide: {
      demo: "video",
      demoType: "shopmd",
      attribution: { text: "shop.md" },
    },
  },

"work-homepage": {
    slide: {
      demo: "video",
      demoType: "homepage",
      attribution: { text: "shopify.com homepage" },
    },
  },

"about-me-collage": {
    slide: {
      demo: "about-collage",
      attribution: { text: "Photos: Carolyn McNeillie, c. a lady never tells" },
    },
  },

"gradient-rgb": {
    // Two steps: the sweep parked at the start, then played.
    slide: { demo: "gradient-rgb", backgrounds: [{}, {}] },
  },

"gradient-paths": {
    // The arrow sends the spot along the path, as on gradient-rgb.
    slide: { demo: "gradient-paths", demoType: "hsl", backgrounds: [{}, {}] },
  },

"we-already-talked-about-this": {
    // The hue-saturation-lies-3 sweep again, after the HSL gradient path.
    slide: { demo: "hsl-contrast", demoType: "talked", backgrounds: [{}, {}] },
  },

"gradient-paths-2": {
    slide: { demo: "gradient-paths", demoType: "oklch", backgrounds: [{}, {}] },
  },

"colours-between-colours": {
    slide: { demo: "gradients" },
  },

"swatches": {
    slide: {
      backgrounds: [
        {
          image: "./images/DaguerreBoulevard.avif",
          fit: "whole",
          timeline: { year: 1838 },
          attribution: {
            text: "Louis Daguerre, _Boulevard du Temple, Paris_ (1838), daguerreotype · Public domain",
            url: "https://commons.wikimedia.org/wiki/File:Boulevard_du_Temple_by_Daguerre.jpg",
          },
        },
        {
          image: "./images/Henri.avif",
          fit: "whole",
          timeline: { year: 1907, label: "ca. 1907" },
          attribution: {
            text: "_The Repast of the Lion_, Henri Rousseau (le Douanier), ca. 1907, oil on canvas · Public Domain · The Met Fifth Avenue",
            url: "https://www.metmuseum.org/art/collection/search/438822",
          },
        },
        {
          image: "./images/Chuck.avif",
          fit: "whole",
          timeline: { year: 1968 },
          attribution: {
            text: 'Chuck Close, _Big Self-Portrait_, 1968, acrylic on canvas, 107-1/2" x 83-1/2" (273 cm x 212.1 cm) © Chuck Close',
          },
        },
        {
          image: "./images/JM.jpg",
          fit: "whole",
          timeline: { year: 1981 },
          attribution: {
            text: "© The Estate of Jean-Michel Basquiat. _Untitled_, Jean-Michel Basquiat, 1981, acrylic and oilstick on canvas, 81 x 69 1/4 in. (205.74 x 175.9 cm)",
          },
        },
        {
          image: "./images/Chinyee.avif",
          fit: "whole",
          timeline: { year: 1964 },
          attribution: {
            text: "_A Touch of Red_, Chinyee, 1964, oil on canvas, 40 x 51 in.",
          },
        },
        {
          image: "./images/Swoon.avif",
          attribution: {
            text: "_Cicada_, Swoon, 2019, stop motion animation, 17 min 17 sec · Buffalo AKG Art Museum · Albert H. Tracy Fund, by exchange, 2021",
          },
        },
      ],
    },
  },

"45finale": {
    // The "What could you make from there?" overlay was removed on 25 Oct.
    slide: { viz: true, rotate: true, vizControls: false },
  },
};
