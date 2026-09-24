// Each slide: { slide, script }
//   slide.viz             — true → shows the 3D P3 gamut visualization
//   slide.rotate          — true → auto-rotates the viz on load
//   slide.demo            — string → mounts a demo module from ./demos/<name>.js
//   slide.backgroundImage — full-bleed cover image (crossfades between slides)
//   slide.illustration    — contained artwork floating in the stage area (fades in after bg)
//   slide.attribution     — { text, url } credit shown bottom-right
//   slide.links           — [{ text, url }] → clickable resource list
//   slide.body            — rendered large and centered in the stage area
//   script.title          — shown in reader view
//   script.body           — shown in reader view

export const SLIDES = [
  // INTRODUCTION
  {
    slide: {
      title: "OKLCH",
      viz: true,
      rotate: true,
      attribution: {
        text: "3D model adapted from oklch.com · Evil Martians · MIT",
        url: "https://oklch.com",
      },
    },
    script: {
      title: "The shape of OKLCH",
      body: `This shape represents a culmination of centuries of humans seeking to understand, measure, and use colour. At first glance it might look complicated and alien, but this is actually just a picture of _you_.

      Together, we're going to trace our path from cave painting to OKLCH. I'm going to show you that colour doesn't exist, that language is a magic spell, and how every new technology has the potential to be a catalyst that restructures our imaginations.`,
    },
  },

  // PIGMENTS
  {
    slide: {
      backgrounds: [
        {
          image: "./images/01Lascaux.avif",
          attribution: {
            text: "Jack Versloot · CC BY 2.0",
            url: "https://commons.wikimedia.org/wiki/File:Lascaux_II.jpg",
          },
        },
        {
          image: "./images/02Lascaux.jpg",
          attribution: {
            text: "Prof saxx · CC BY-SA 3.0",
            url: "https://commons.wikimedia.org/wiki/File:Lascaux_painting.jpg",
          },
        },
      ],
    },
    script: {
      title: "Pigments from the earth",
      body: `So let's start here, with the cave paintings at Lascaux.

      For millennia and until relatively recently, colour had to be found in nature. The pigments used to create these images (ochre, charcoal, umber, iron oxides) were pulled from the earth.`,
    },
  },
  {
    slide: {
      backgrounds: [
        {
          image: "./images/03Mummy.avif",
          attribution: {
            text: "ArchaiOptix · CC BY-SA 4.0 · Landesmuseum Württemberg, Stuttgart",
            url: "https://commons.wikimedia.org/wiki/File:Mummy_portrait_of_a_young_woman_named_Eirene_from_Egypt_-_Stuttgart_LMW_AS_7.2_(02).jpg",
          },
        },
        {
          image: "./images/04Manuscript.avif",
          attribution: {
            text: "Godescalc, Evangelistary (c. 781–783) · Public domain · Bibliothèque nationale de France",
            url: "https://commons.wikimedia.org/wiki/File:Evangeliarium_-_%C3%A9vang%C3%A9liaire_dit_de_Charlemagne_ou_de_Godescalc_-_J%C3%A9sus-Christ_-_BNF_Gallica.jpg",
          },
        },
        {
          image: "./images/05Duchamp.avif",
          attribution: {
            text: "Marcel Duchamp, Sad Young Man in a Train (1911/12) · © Association Marcel Duchamp / SIAE · Peggy Guggenheim Collection, Venice",
            url: "https://www.guggenheim-venice.it/en/art/works/nude-study-sad-young-man-on-a-train/",
          },
        },
        {
          image: "./images/06Still.avif",
          attribution: {
            text: "Clyfford Still, Untitled (1951–1952) · © City & County of Denver · SFMOMA",
            url: "https://www.artchive.com/artwork/untitled-clyfford-still-1951-1952/",
          },
        },
      ],
    },
    script: {
      title: "Pigments from the earth",
      body: `The paintings at Lascaux are at least 17,000 years old, but the same pigments used to make these ancient cave paintings were also used to create Egyptian wall paintings, Medieval illuminated manuscripts, cubist paintings, abstract expressionism, and everything in between.`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/07EarthPigments.avif",
      titleStyle: "pill",
      attribution: {
        text: "Earth Pigments Kit · Maiwa · maiwa.com",
        url: "https://maiwa.com/products/kit-earth-pigments",
      },
    },
    script: {
      title: "Pigments from the earth",
      body: `Over the centuries since Lascaux, we've added to our palette, but we haven't really taken anything away. Earth pigments are a constant across art history, and they are all still used by artists to this day.

In our lifetimes, we can manufacture colour in a lab or paint it with light, but for most of our history, what we might call colour technology revolved around finding and using pigments that could be derived from the world around us.`,
    },
  },
  {
    slide: {
      titleStyle: "pill",
      backgroundImage: "./images/10Atlas.jpg",
      attribution: {
        text: "Abraham Cresques, Catalan Atlas (1375) · Public domain · National Library of Israel",
        url: "https://commons.wikimedia.org/wiki/File:Atlas_catalan_de_1375_02_(FL169300245_0982468).jpg",
      },
    },
    script: {
      title: "The pigment economy",
      body: `It’s easy to forget now that the value of colour has been essentially flattened, that some colours were once exceedingly rare.

There were gold rushes for colour: rare minerals, juicy little insects, the guts of sea snails. Making colour was alchemy.

We gatekept colours by region and class. We fought to control colour the way we now fight to control the flow of oil. Expeditions were funded, trade routes were carved out, and fortunes were made and lost, all in pursuit of specific hues.`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/08Ultramarine.avif",
      attribution: {
        text: "Sandro Botticelli, Madonna of the Book (c. 1480–81) · Public domain · Museo Poldi Pezzoli, Milan",
        url: "https://commons.wikimedia.org/wiki/File:Sandro_Botticelli_-_The_Virgin_and_Child_(The_Madonna_of_the_Book)_-_Google_Art_Project.jpg",
      },
    },

    script: {
      title: "ultramarine",
      body: `As just one example among many, in the late Medieval to early-Renaissance period in Western Europe, this blue was, by weight, more precious than gold.

      It's called ultramarine, or in Italian, _oltremare_, which literally means from beyond the sea. It was made from pulverized lapis lazuli which was primarily mined from a single valley in Afghanistan and then transported west via Venetian trade routes.`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/09Wilton.avif",
      attribution: {
        text: "Anonymous, The Wilton Diptych (c. 1395) · Public domain · National Gallery, London",
        url: "https://www.nationalgallery.org.uk/paintings/english-or-french-the-wilton-diptych",
      },
    },

    script: {
      title: "ultramarine",
      body: `In the Medieval Era and the Renaissance, its most prominent use was to depict the robes of the Virgin Mary in religious paintings. And not just because they _liked_ it, but because at that time prices and origins of different pigments were so varied and meaningful that how much of which pigment would be used in which way in an image was literally written into artists' contracts.

Commissioning a painting with ultramarine was a legible twofold signal to every person who walked into a church and saw it: one, of Mary's importance, cloaked in the rarest and most expensive colour; and two, of the patron's wealth and devotion.

The colour meant something because acquiring it cost so much.`,
    },
  },

  // OIL PAINT TECHNOLOGY
  {
    slide: {
      title: "",
      backgroundImage: "./images/11Nativity.avif",
      attribution: {
        text: "Pere Serra, Nativity (c. 1400) · Photo: Jordiferrer · CC BY-SA 4.0",
        url: "https://commons.wikimedia.org/wiki/File:Museu_Maricel_(interior)_09_Nativitat_(Pere_Serra)_ca_1400_provinent_de_l%27esgl%C3%A9sia_de_Sant_Pere_de_Cubells.JPG",
      },
    },
    script: {
      title: "The medium is the revolution",
      body: `Let's pause on the Renaissance. We often frame it as a revolution of ideas, which of course it was, but it was also a practical revolution of technique.

For much of the Middle Ages, European painters worked mainly in egg tempera: pigment bound in egg yolk; and fresco: pigment applied onto wet plaster. Both of these media required planning and speed. They set quickly and then can't be reworked, so they encourage commitment to the first marks, flatter images, layered cross-hatching, and techniques that are closer to drawing than what we think of as painting. When we look at Medieval paintings, they tend to be flat, almost like cartoons.`,
    },
  },
  {
    slide: {
      title: "",
      backgroundImage: "./images/12Ermine.avif",
      attribution: {
        text: "Leonardo da Vinci, Lady with an Ermine (c. 1490) · Public domain · Czartoryski Museum, Kraków",
        url: "https://commons.wikimedia.org/wiki/File:The_Lady_with_an_Ermine.jpg",
      },
    },
    script: {
      title: "The medium is the revolution",
      body: `But in the 15th century, artists took up oil painting as a dominant medium. The motivation was largely practical, but the results were transformative. Oil paint dries slowly and stays workable longer, so you can blend transitions over multiple sessions instead of locking into the first marks. And the paint doesn’t set and fight back, so artists were able to use more fluid and natural movements. Oil also enabled glazing: building up thin transparent layers over dry paint to shift colours and values without hiding what’s underneath. Sometimes an oil painting can even seem to echo our biology: firm structures rendered beneath softer, semi-transparent flesh tones like skin over muscle and bone.
    `,
    },
  },
  {
    slide: {
      title: "",
      backgrounds: [
        {
          image: "./images/13LuccaMadonna.avif",
          attribution: {
            text: "Jan van Eyck, Lucca Madonna (c. 1436) · Public domain · Städel Museum, Frankfurt",
            url: "https://commons.wikimedia.org/wiki/File:Jan_van_Eyck_-_Lucca_Madonna_-_Google_Art_Project.jpg",
          },
        },
        {
          image: "./images/14Anguissola.avif",
          attribution: {
            text: "Sofonisba Anguissola, Self-Portrait at the Easel (1556) · Public domain · Muzeum-Zamek, Łańcut",
            url: "https://commons.wikimedia.org/wiki/File:Self-Portait_at_the_Easel_(Sofonisba_Anguissola)-WUS09909.jpg",
          },
        },
        {
          image: "./images/15Velata.avif",
          attribution: {
            text: "Raphael, La Velata (c. 1515) · Public domain · Palazzo Pitti, Florence",
            url: "https://commons.wikimedia.org/wiki/File:Raffaello_sanzio,_la_velata,_1515_ca.,_03.jpg",
          },
        },
        {
          image: "./images/16SanPaulo.avif",
          attribution: {
            text: "Caravaggio, Conversion of Saint Paul (1600–01) · Public domain · Santa Maria del Popolo, Rome",
            url: "https://commons.wikimedia.org/wiki/File:Caravaggio,_conversione_di_san_paolo,_1600-01,_04.jpg",
          },
        },
      ],
    },
    script: {
      title: "The medium is the revolution",
      body: `It's not as simple as saying that artists became _better_. They had a different tool. The exact same pigments suspended in a different binder completely changed what kinds of pictures were practical to make. And the ideas that artists worked out in the new media trained their eye and hand and taste, so even images rendered in more traditional “stiffer” media began to take on the qualities developed in oil painting.

Just the capacity to hold colour in a new way changed our imagination. Keep this in mind because it's key to understanding what makes OKLCH so exciting.`,
    },
  },
  {
    slide: {
      title: "",
      backgrounds: [
        {
          image: "./images/17OldIsaac.avif",
          attribution: {
            text: "Godfrey Kneller, Portrait of Sir Isaac Newton (1702) · Public domain · National Portrait Gallery, London",
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
    script: {
      title: "Let's get physical",
      body: `As we progress along to the 17th century, we start to look beyond physical pigments to the physics of light. In 1665, the Great Plague of London hit, and Cambridge University was closed. One of Cambridge’s students was Isaac Newton. Not this grey-haired version we think of, but a young, bored 23-year-old Isaac Newton stuck waiting out the plague at his mother's proverbial basement`,
    },
  },
  {
    slide: {
      backgrounds: [
        {
          image: "./images/19Isaac.avif",
          attribution: {
            text: "Robert Hannah, Master Isaac Newton in His Garden at Woolsthorpe, in the Autumn of 1665 (c. 1850–55) · Public domain · Royal Institution",
            url: "https://commons.wikimedia.org/wiki/File:Robert_Hannah_-Master_Isaac_Newton_in_His_Garden_at_Woolsthorpe,_in_the_Autumn_of_1665.jpg",
          },
        },
        {
          image: "./images/19Isaac.avif",
          attribution: {
            text: "Robert Hannah, Master Isaac Newton in His Garden at Woolsthorpe, in the Autumn of 1665 (c. 1850–55) · Public domain · Royal Institution",
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
    script: {
      title: "Let's get physical",
      body: `During our pandemic in 2020, we made sourdough and Dalgona coffee. On the other hand, Isaac Newton, who didn't have the Internet or Zoom calls, spent the next 18 months inventing calculus, unifying terrestrial and celestial physics into a single law of gravitation, and reshaping the science of colour.`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/20Paper.avif",
      body: `”I tooke a bodkin & put it betwixt my eye & the bone as neare to the Backside of my eye as I could, pressing my eye with the end of it… there appeared severall white darke & coloured circles…” `,
      bodyClass: "font-tangerine dark-text",
      attribution: {
        text: "Quote: Isaac Newton, Questiones Quaedam Philosophicae (c. 1664) · Background: William Stukeley, Memoirs of Sir Isaac Newton's life (1752) · Public domain · Royal Society",
        url: "https://commons.wikimedia.org/wiki/File:Memoirs_of_Sir_Isaac_Newton%27s_life_-_049.jpg",
      },
    },
    script: {
      title: "Let's get physical",
      body: `You can tell he hadn’t yet hit his Saturn return, because one of his experiments was to take a pointy object, slip it between his eye and the bone, and press, just to see what kinds of coloured sensations he could produce without light.`,
    },
  },
  {
    slide: {
      title: "",
      backgroundImage: "./images/21Experiment.avif",
      attribution: {
        text: "Sascha Grusche, Newton's Experimentum Crucis (2015) · CC BY-SA 4.0",
        url: "https://commons.wikimedia.org/wiki/File:Newton%27s_Experimentum_Crucis_(Grusche_2015).jpg",
      },
    },
    script: {
      title: "Let's get physical",
      body: `But right now we’re more interested in his prism experiments.

The Coles Notes version of this story is that Newton passed light through a prism and eureka, proved that white light contains the rainbow.

But people at this time were already familiar with rainbows being thrown by cut glass. It’s just that there wasn’t a good understanding of why.

The popular belief was that white light was pure and clean and perfect and from God. And then the prism was corrupting it somehow. The light itself was pristine. The colour came from the glass.`,
    },
  },
  {
    slide: {
      title: "",
      backgroundImage: "./images/22Prism.avif",
      backgroundSize: "contain",
      attribution: {
        text: "AI-generated illustration · Created with Nano Banana",
      },
    },
    script: {
      title: "Let's get physical",
      body: `The real eureka moment hit when Newton passed a rainbow thrown by one prism back through an inverted one. The spectrum was recombined, and white light was returned through the other end. This showed that the colours are inherent to the light itself, not an impurity added by the glass. White light is a mixture of colours, and the prism is just sorting them out for us to see.

      Newton's prism experiments cracked open a question that would take almost two more centuries to answer: what exactly is light?`,
    },
  },
  // GOOD VIBRATIONS — MAXWELL
  {
    slide: {
      backgroundImage: "./images/23Maxwell.avif",
      attribution: {
        text: "James Clerk Maxwell as a young man · Pre-1923 photograph · Public domain",
        url: "https://commons.wikimedia.org/wiki/File:YoungJamesClerkMaxwell.jpg",
      },
    },
    script: {
      title: "Good vibrations",
      body: `Enter James Clerk Maxwell: your favourite physicist's favourite physicist. He doesn't have Newton's household-name recognition, but his unification of electricity and magnetism reshaped physics, and Einstein kept a portrait of him on the wall of his study.

Maxwell was a poet, a wunderkind, and famously reserved: happiest rattling around his family estate in Scotland, running experiments, often with his wife Katherine assisting at his side.`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/24Maxwell.avif",
      attribution: {
        text: "Jemima Blackburn, James Clerk Maxwell and his wife Katherine (before 1879) · Public domain · Cavendish Laboratory, University of Cambridge",
        url: "https://commons.wikimedia.org/wiki/File:James_Clark_Maxwell_and_his_wife_by_Jemima_Blackburn.jpg",
      },
    },
    script: {
      title: "Good vibrations",
      body: `He described what came to be known as his Unified Theory of Electromagnetism as "another theory of electricity, which I prefer". He was completely underselling it. In fact, he accurately predicted something later confirmed: light is electromagnetic radiation.`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/25Spectrum.avif",
      attribution: {
        text: "AI-generated illustration · Created with GPT Image 1",
      },
    },
    script: {
      title: "Good vibrations",
      body: `Electromagnetic radiation exists as a continuous spectrum that runs from radio waves through microwaves, infrared, visible light, ultraviolet, X-rays, and gamma rays. Visible light is just a sliver of the whole, roughly 400 to 700 nanometres. Measured on a linear scale, visible light makes up essentially 0% of the spectrum.`,
    },
  },
  {
    slide: {
      demo: "wave",
    },
    script: {
      title: "Good vibrations",
      body: `Within the visible range, the hue produced by a particular wavelength is determined by its frequency, which is how many times the wave oscillates per second. The higher the frequency, the shorter the wavelength, and the bluer the colour. The lower the frequency, the longer the wavelength, and the redder the colour.

      How bright or intense a colour appears is determined by the amplitude, or height of the wave. The higher the amplitude, the brighter the colour. The lower the amplitude, the dimmer the colour.`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/26Vitruvian.jpg",
      attribution: {
        text: "Leonardo da Vinci, The Vitruvian Man (c. 1492) · Public domain",
        url: "https://commons.wikimedia.org/wiki/File:0_The_Vitruvian_Man_-_by_Leonardo_da_Vinci.jpg",
      },
    },
    script: {
      title: "The biology of colour",
      body: `What's really important to understand is that there's nothing fundamental about this sliver of the electromagnetic spectrum that is different from the rest. What makes these particular wavelengths into colour has nothing to do with the wavelengths themselves, and everything to do with us.

      For most of us, sight is our strongest sense. Of all of our sensory receptors, about 70% of them are photoreceptors in our eyes. And in turn, roughly half the cerebral cortex is involved in processing that visual information. The experience of colour lives entirely in the space between our ears.`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/27ConeDistribution.avif",
      attribution: {
        text: "Cone distribution in the human fovea · AI-generated with GPT Image 1 · Based on work by Mark Fairchild · CC BY-SA 3.0",
        url: "https://commons.wikimedia.org/wiki/File:ConeMosaics.jpg",
      },
    },
    script: {
      title: "The biology of colour",
      body: `The sensors that pick up colour in particular are called cones. We have three varieties of cones, S, M and L, or as we often call them, blue, green, and red. But the truth is that all three cone types respond to a wide range of wavelengths with broad, overlapping sensitivity curves. What makes colour perception possible isn't three isolated detectors, it's the brain comparing the ratio of responses across all three.

      Colour perception is not even across hues, and it is as individual from person to person as height or nose shape. S (“blue”) cones make up only about 2 to 8 percent of your cones, making us significantly less sensitive to the colour blue.

      The ratio of L to M cones varies wildly, and studies have found ratios ranging from 1:1 all the way to 16:1, all in people who are considered to be within the "normal" range of colour vision.`,
    },
  },
  {
    slide: {
      demo: "colorblind",
      demoType: "deuteranomaly",
    },
    script: {
      title: "Deuteranomaly",
      body: `There are two main classes of red-green colourblindness. The most common form affects about 5% of men. In this type M cone (medium or "green" cone) is present but shifted toward L, reducing sensitivity to green. Reds, oranges, and greens are harder to distinguish but not impossible.

      The severe form, deuteranopia (M cone absent), affects ~1% of men. The slider simulates the full dichromacy end of the spectrum.`,
    },
  },
  {
    slide: { demo: "colorblind", demoType: "protanomaly" },
    script: {
      title: "Protanomaly",
      body: `The second form of red-green colourblindness affects about 1% of men. In this case, L cone is shifted toward M, reducing red sensitivity. Reds appear duller and darker than in deuteranomaly.

The severe form, protanopia (L cone absent), also affects ~1% of men and can make a red traffic light look almost black.

If you're counting, about 8% of men have some form of red-green colourblindness.`,
    },
  },
  {
    slide: { demo: "colorblind", demoType: "tritanopia" },
    script: {
      title: "Tritanopia",
      body: `In tritanopia, the S (short or "blue") cones are absent. Blues and greens become confused, and yellows and pinks look similar. This form is quite rare, affecting about 0.01% of the population. Unlike red-green colourblindness, it affects men and women equally.`,
    },
  },
  {
    slide: {
      demo: "colorblind",
      demoType: "achromatopsia",
    },
    script: {
      title: "Achromatopsia",
      body: `About 0.003% of the population have no functional cone cells at all. This results in the complete absence of colour vision, often accompanied by high light sensitivity and reduced acuity. `,
    },
  },
  {
    slide: {
      backgroundImage: "./images/28TheDress.avif",
      attribution: {
        text: "AI-generated illustration · Based on the viral photograph by Cecilia Bleasdale (2015) · Created with GPT Image 1",
      },
    },
    script: {
      title: "The X Factor",
      body: `We assume we’re all having the same experience when we look at the same color, but there’s reason to think that’s not exactly true. The most visible evidence of this is colour blindness, but variation exists across all of us.`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/29ForthCone.avif",
      attribution: {
        text: "AI-generated illustration · Created with Nano Banana Pro",
      },
    },
    script: {
      title: "The X Factor",
      body: `In fact, about 12% of women carry a genetic variant linked to a fourth cone type, making them potential tetrachromats. But it's surprisingly difficult to confirm if they actually see more colours.

For one thing, our brains are wired for three cones. The extra input may have nowhere to go and just be thrown away.

But even if a tetrachromat really does experience colours the rest of us can’t, describing them is a different challenge. Think about how you would explain yellow to someone who has never seen it. Now imagine a world where you’re the _only_ person who can see yellow. Would you even notice?`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/30Homer.avif",
      attribution: {
        text: "AI-generated illustration · Created with Nano Banana Pro · Inspired by Homer's Odyssey (c. 8th century BC)",
      },
    },
    script: {
      title: "Language is a magic spell",
      body: `The link between language and our experience of colour goes way deeper than you might think.

      Homer's _Odyssey_ contains no word for blue. He describes the sea as "wine-dark." The sky is "bronze." Sheep are "violet."

      The ancient Greeks were not colour blind, but blue as a discrete named category just wasn't part of how they organized their experience of the world.
`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/31Himba.avif",
      backgroundSize: "contain",
      attribution: {
        text: "AI-generated illustration · Created with GPT Image 1 · Based on Tavin (CC BY 4.0) · Data: Roberson, Davidoff et al. 2005",
      },
    },
    script: {
      title: "Language is a magic spell",
      body: `Researchers have documented something remarkable across 98 different languages: colour terms develop in a predictable order. A language first develops words for dark and light. Then a word for red tends to appear. Then other chromatic terms follow, and blue is almost always the last of the primary hues to be named.

      There are languages and cultures today with no distinct word for blue. Researcher Jules Davidoff studied Himba speakers, who use five colour categories. Their word _bouru_ covers what we would separately call blue and green. In sorting experiments, Himba participants were noticeably faster and more accurate than Westerners at distinguishing shades of green that their language names separately, but struggled differentiating blue from green.`,
    },
  },
  {
    slide: { demo: "pink", backgrounds: [{}, {}, {}, {}] },
    script: {
      title: "Think pink",
      body: `To grasp this phenomenon, think about the colour pink. This is pink, and this is red.

Now consider light blue and dark blue. Both are just… blue. Different shades of the same thing.

There is no physical reason for this. Pink and light blue are both simply desaturated versions of their parent colour. The distinction between pink and red is cultural technology, a category our language and culture created. And it is so internalized that it feels completely objective.

There are cultures that draw lines in places we don't, experiencing distinct colour categories where we see only variations on a single colour. Colour distinctions that are as real and obvious to them as red and pink are to us, that we effectively cannot perceive as separate things.`,
    },
  },
  {
    slide: {
      demo: "colormatching",
      title: "Matching experiment",
      titleStyle: "small",
    },
    script: {
      title: "The ABCs of CIE XYZ",
      body: `With all this weirdness and ambiguity, it came to be understood that we needed a more systematic way to talk about colour. And that brings us to CIE XYZ.

In the 1920s the International Commission on Illumination (CIE) ran a deceptively simple experiment.

Observers were shown a split field. On the left side was a test colour, and on the right the observer could dial up and down three carefully chosen primary lights with the goal of matching the sample.

By collecting and averaging the results from many observers, they were able to create a standardized model from which any colour can be described as three numbers: X, Y, Z.`,
    },
  },
  {
    slide: {
      demo: "cie",
      titleStyle: "small",
    },
    script: {
      title: "The ABCs of CIE XYZ",
      body: `Plotting those X, Y, Z values projected onto a 2D plane gives us the Rosetta Stone of colour: the CIE XY chromaticity diagram, AKA the horseshoe. It's used across industries, from paint and textile manufacturing, to digital imaging, to food, pharmaceuticals, and more.

Every colour an average human eye can see lives inside this shape, and colour spaces are plotted against it.

First have a look at _sRGB_, which was for a long time the range supported by our monitors.

Display P3 is the range that Apple devices support.

Greater still, Rec. 2020 is the range that modern TVs support, and that future monitors will support.`,
    },
  },
  {
    slide: { demo: "csscolors" },
    script: {
      title: "Named CSS Colours",
      body: `Early displays supported so few colours that we called them by name, and even though hexadecimal and RGB colour notation have been supported since CSS1, CSS still ships with a legacy of 148 named colours.

      There are more stories behind these names than I have time to get into here, from squabbles with standards agencies, to a pet snake named Emily Spinach.

      The range is lopsided and charmingly idiosyncratic. I like to think of the named colours as modern archaeological artifacts buried in the inspector.`,
    },
  },
  {
    slide: { demo: "rgb", demoType: "black" },
    script: {
      title: "SRGB",
      body: `With the release of CSS1 in 1996, webmasters had a formalized language to describe 16.7 million possible colours to use in the browser. To understand how, first we need to take a little counting detour.

      Hexadecimal colours are made up of three two-digit base-16 numbers representing red, green, and blue channels. The highest two-digit base-16 number is FF, which is 255 in base 10.

      255 is the same maximum value for each channel in rgb(). But why 255?

      Because 8 bits in binary can represent 256 values (0–255), with the highest represented as 11111111. Three 8-bit channels add up to 24 bits, which is why we call this 24-bit colour.

      So multiply 256 colour values across three channels and you get 16.7 million unique combinations, (although in the ’90s, many users' devices couldn't yet support this range.)`,
    },
  },
  {
    slide: { demo: "rgb" },
    script: {
      title: "SRGB",
      body: `By dialling up and down these three values, we can access any of those colours, but getting there isn't exactly intuitive.

      To mix tints of a hue, we can dial up all the colours to introduce white light, or we dial down colours to produce shades. The closer the three channels are in value, the more desaturated the colour becomes.

      Remember that we have many more “red” and “green” receptors than we have “blue”. Because our eyes are not as sensitive as blue, we naturally perceive it as a darker colour. After all, we’re literally measuring less blue light, regardless of how much of this wavelength is actually present.

Now look how our screens produce yellow. We get yellow light by mixing red and green, the two colours our eyes are most sensitive to. Biology and the hardware conspire to make yellow significantly brighter than blue on screen.`,
    },
  },
  {
    slide: { demo: "yellow-blue" },
    script: {
      title: "SRGB",
      body: `This is why you can read yellow text on a blue background with no trouble at all. Different colours are inherently more dark or light. Even if you have some form of red-green colourblindness, the lightness difference is enough to carry the distinction.`,
    },
  },
  {
    slide: { demo: "colorblind", demoType: "deuteranomaly-a11y" },
    script: {
      title: "The contrast ratio problem",
      body: `Speaking of contrast, we've established that about 8% of men have some form of colour blindness. If we want to make sure that our content is legible to everyone, we need to make sure that the contrast between foreground and background is sufficient to carry the distinction even for people with colour vision deficiencies.

Thankfully we have the WCAG standard, which requires a contrast of at least 4.5:1 between foreground and background. We can update our pattern to use reds and greens chosen so the lightness difference alone is large enough for the 8 to stay legible at every point for every viewer.

However, getting there is the hard part. As we've seen, RGB is a very technical way to describe colour that's hardware and physics-oriented. But it's not very intuitive to us humans, or reflective of what happens to the light once it's actually processed by our squishy, mammalian eyes and brains. And we've all spent more time than we'd like fiddling with colour pickers and sliders to try to come up with a colour system that's harmonious and accessible.`,
    },
  },
  {
    slide: { demo: "hsl-bicone" },
    script: {
      title: "Hue, Saturation, Lies",
      body: `So you can see that RGB is a very technical way to describe colour that's hardware and physics-oriented. But it's not very intuitive to us humans. And so we developed a system that better reflects what we want to do with colour.

It’s important to note that HSL doesn’t describe any new colours. It's a new coordinate system for the same 24-bit colours that RGB and hex already describe.

The difference is the grammar. Instead of specifying RGB primaries and mixing colour in your head, HSL lets you describe colour in a way which maps more naturally to how a designer thinks about colour, selecting a hue, and then adjusting its saturation and lightness.

The shape of the HSL model is a tidy double-cone shape. Lightness is mapped on the vertical axis so the cone comes to a point at white and black, and the hues are arranged in angles around the circumference. Saturation is mapped based on the distance from the vertical axis so that the farther you are from the center of the shape, the more saturated the colour.

`,
    },
  },
  {
    slide: { demo: "hsl-shortfall" },
    script: {
      title: "Hue, Saturation, Lies",
      body: `If you’ve been paying attention you might have caught that that tidy predictable geometric shape is a red flag. Here is the problem. We know that yellow and blue don’t meaningfully conform to the same pattern, so why would they fit neatly into the same circle?

These twelve colours are all declared at the same HSL Lightness.
Drag the saturation to zero. If HSL Lightness were truly describing perceptual brightness, they should all converge to the same grey.
They don’t. Yellow at L=50% is dramatically brighter than blue at L=50%. HSL’s Lightness is a mathematical property of the RGB cube, not a measure of what the eye perceives.

This matters. It means you cannot reliably use HSL to create accessible colour pairs, generate a palette with consistent visual weight, or animate a colour change without a brightness flicker.
`,
    },
  },
  {
    slide: { demo: "hsl-contrast" },
    script: {
      title: "Hue, Saturation, Lies",
      body: `One practical consequence is that we can’t rely on HSL to design predictable colour contrasts. Both the background and text here share the same hue and saturation, but a different lightness, and it’s passing contrast ratios.

But as we move though hues, even though the lightness and saturation are exactly the same, the contrast ratio varies widely. HSL _feels_ more intuitive, but as a practical matter we’re still stuck twiddling around in the colour picker.`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/32Bjorn.avif",
      attribution: {
        text: "AI-generated portrait · Created with Nano Banana · Inspired by Björn Ottosson's profile photo",
        url: "https://bottosson.github.io/about/",
      },
    },
    script: {
      title: "An OK Color Space",
      body: `I don’t know what it is about pandemics and colour science, but in December 2020, with much of the world in lockdown, a Swedish engineer named Björn Ottosson published a blog post on his personal website.

It was called "A perceptual color space for image processing".

Open-source and in his free time, Björn had found a way to fix the perceptual uniformity problems that had plagued colour spaces for decades by tuning the math against actual human perception data. He called it OKLab. Why OKLab? Because “because it is an OK Lab color space”

Within two years its polar form, OKLCH, was part of the CSS Color Level 4 and 5 specs.`,
    },
  },
  {
    slide: {
      viz: true,
      rotate: false,
      attribution: {
        text: "3D model adapted from oklch.com · Evil Martians · MIT",
        url: "https://oklch.com",
      },
    },
    script: {
      title: "An OK Color Space",
      body: `Now let's take another look at this mountain range shape.

      Like the HSL model, we see lightness mapped across one axis, and hue on another, but this time straight across intead of wrapped around a circle.

      Where it gets weird, is the chroma dimention, which is roughly equivalent to what HSL calls saturation. This is the axis on which the shape becomes much more ideosyncratic.

      If we switch to looking at this shape in grayscale, we can see why.

      The shape of the OKLCH model is a direct result of tuning the math to match human perception. The human eye dosn't support an equal range of chroma across all hues. We can see that the maximum chroma of green is much higher than the maximum chroma of blue.

      Viewing from the lightness axis, we can also see how OKLCH accounts for the perceived lightness of hues. The peek for this fusha colour, where it supports the wides chromatic range with the same perceived lightness is much further up the lightness axis than the peek for blue.
      `,
    },
  },
  {
    slide: { demo: "oklch-vs-hsl" },
    script: {
      title: "An OK Color Space",
      body: `So if we repeat our lightness comparison we can see how OKLCH's accomodates for the human eye. All twelve hues converge to the same grey at L=50%.`,
    },
  },
  // ── THE REDDEST RED ────────────────────────────────────────────────────────
  {
    slide: { demo: "reddest-red" },
    script: {
      title: "The reddest red",
      body: `OKLCH also has access to a much wider range of colours than rgb. But it's not really inherent to OKLCH itself. Hex, RGB, and HSL are all tightly bound to the sRGB colour space. They literally don't have the language for colours outside that range weather the user can support them or not. OKLCH is more agnostic. It can describe any colour that the human eye can see. And if our displays support the P3 colour space, we can finally see those colours in the browser.

Have a look at his demo. If you have a wide-gamut display, the left half of the screen should be a much more vivid red than the right half. The left is the reddest red that sRGB can produce, and the right is the reddest red that OKLCH can produce.`,
    },
  },

  // ── OKLCH POWERS — HARMONIES ──────────────────────────────────────────────
  {
    slide: { demo: "harmonies" },
    script: {
      title: "Colour harmonies",
      body: `In HSL, equal hue angles don't produce equal visual weight. A triadic palette at 0°, 120°, 240° in HSL gives you red (vivid), green (vivid), and blue (perceptually much darker). They look unbalanced because HSL lightness isn't real.

      OKLCH, equal angles on the hue wheel genuinely produce equally vivid, equally bright colours. This enables us to programitically unlock centuries of wisdom of colour theory and generate harmonious colour sets: complementary, analogous, triadic. Colours that feel balanced together because they sit at specific angles on the colour wheel.`,
    },
  },
  // ── GRADIENTS ─────────────────────────────────────────────────────────────
  {
    slide: { demo: "gradients" },
    script: {
      title: "Colours between colours",
      body: `And lets have a look at how different colour models handle gradients.

      In sRGB, transitioning from one colour to another means splitting the R, G, and B channels numerically. When shifting between blue and yellow for example, there is a middle point where the three channels average out. That's why CSS gradients from blue to yellow pass through a muddy dead zone in the middle.

      When we leverage HSL interpolation, we can see how the different hue arrangement gives us a different gradient, but we run into the same perceptual lightness issue which can cause a11y concerns if we're not careful.

OKLCH's "in between" means walking the shortest path through perceived colour. The midpoint of blue and yellow in OKLCH is a vivid green — the colour your eye actually expects. And perceived lightness is more predictable and even.

Note that these benefits are due to the model, not the colour space. We get all this goodness even if we stay within the sRGB gamut.`,
    },
  },
  {
    slide: {
      backgrounds: [
        {
          image: "./images/Swatches.avif",
          attribution: {
            text: "Color Transparency and Opacity · Celebrating Color",
            url: "https://www.celebratingcolor.com/color-transparency-and-opacity/",
          },
        },
        {
          image: "./images/Henri.avif",
          attribution: {
            text: "The Repast of the Lion, Henri Rousseau (le Douanier), ca. 1907, oil on canvas · Public Domain · The Met Fifth Avenue",
            url: "https://www.metmuseum.org/art/collection/search/438821",
          },
        },
        {
          image: "./images/Chuck.avif",
          attribution: {
            text: 'Chuck Close, Big Self-Portrait, 1968, acrylic on canvas, 107-1/2" x 83-1/2" (273 cm x 212.1 cm) © Chuck Close',
          },
        },
        {
          image: "./images/JM.jpg",
          attribution: {
            text: "© The Estate of Jean-Michel Basquiat. Untitled, Jean-Michel Basquiat, 1981, acrylic and oilstick on canvas, 81 x 69 1/4 in. (205.74 x 175.9 cm)",
          },
        },
        {
          image: "./images/Chinyee.avif",
          attribution: {
            text: "A Touch of Red, Chinyee, 1964, oil on canvas, 40 x 51 in.",
          },
        },
        {
          image: "./images/Swoon.avif",
          attribution: {
            text: "Cicada, Swoon, 2019, stop motion animation, 17 min 17 sec · Buffalo AKG Art Museum · Albert H. Tracy Fund, by exchange, 2021",
          },
        },
      ],
    },
    script: {
      title: "",
      body: `When artists shop for paint, there are all sorts of little tools and tests that paint manufacturers use to show how the paint looks, how it behaves, its consistency, particle size, concentration, transparency, lightfastness, surface texture, body and retention.

      But none of these tests really communicate that you can do any of this.`,
    },
  },
  {
    slide: {
      backgrounds: [
        {
          image: "./images/Arcimboldo.jpg",
          attribution: {
            text: "Four Seasons in One Head, Giuseppe Arcimboldo, ca. 1590, oil on panel, 44.7 × 60.4 cm · National Gallery of Art · Public Domain",
            url: "https://commons.wikimedia.org/wiki/File:Giuseppe_Arcimboldo_-_Four_Seasons_in_One_Head_-_Google_Art_ProjectFXD.jpg",
          },
        },
        {
          image: "./images/Botticelli.jpg",
          attribution: {
            text: "Primavera, Sandro Botticelli, ca. 1480–1485, tempera on panel, 203 × 314 cm · Uffizi Gallery, Florence · Public Domain",
            url: "https://commons.wikimedia.org/wiki/File:Botticelli-primavera.jpg",
          },
        },
        {
          image: "./images/Babel.jpg",
          attribution: {
            text: "The Tower of Babel, Pieter Bruegel the Elder, 1563, oil on panel, 114 × 155 cm · Kunsthistorisches Museum, Vienna · Public Domain",
            url: "https://commons.wikimedia.org/wiki/File:Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_(Vienna)_-_Google_Art_Project_-_edited.jpg",
          },
        },
        {
          image: "./images/Titian.avif",
          attribution: {
            text: "Danaë, Titian, ca. 1545, oil on canvas, 117 × 69 cm · Museo di Capodimonte, Naples · Public Domain",
            url: "https://commons.wikimedia.org/wiki/File:Danae_by_Titian_(Naples).jpg",
          },
        },
      ],
    },
    script: {
      title: "",
      body: `And when we talk about renaissance artists experimenting with the slow drying and light reflecting qualities of oils, that doesn’t by itself explain this.

      The recipe for the Renaissance was technological advancement plus cultural and intellectual upheaval, plus a wealthy class that equated patronage of the arts with their own immortality. And the result was a visual language we still look at with awe.`,
    },
  },
  {
    slide: {
      backgroundImage: "./images/45finale.avif",
      attribution: {
        text: "AI-generated illustration · Created with GPT Image 1",
      },
    },
    script: {
      title: "",
      body: `Today we walked all the way from prehistoric pigments up to the equivalent of OKLCH’s paint swatches. Predictable contrast ratios, access to a wider colour gamut, programmable colour harmonies and smoother gradients are all great. But what are the _artworks_? What is the gap between what we _can_ do, and what we can _do_?

  That part of the story isn’t written yet, and I have a feeling that the devs in this room are especially equipped to write it.
`,
    },
  },
];
