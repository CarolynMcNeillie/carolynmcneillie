<!-- section: Introduction -->

<!-- slide: title -->
## Hue, Saturation, Lies



<!-- slide: about-me-now -->
## About me: now

Hello, I'm Carolyn McNeillie. I'm a senior web developer at Shopify specializing in the front-of-the front end.

<!-- slide: work-homepage -->
## Work: homepage

I've been with Shopify for five years, and I'm on the Brand Design Studio team, which is the team responsible for (in my biased opinion) the most fun and visually creative work at the company.

I contribute heavily
to our website, Shopify.com.

<!-- slide: work-shop-md -->
## Work: shop.md

As well as special projects, for example this site just went up a couple of weeks ago. It helps you to build a customizable skill for your agents to shop the Shopify ecosystem, which is a really great way to be able to discover indie shops and brands and find weird, specific things. I've been enjoying it a lot.

<!-- slide: work-editions -->
## Work: Editions

And we're also the team that builds Shopify Editions. If you're not familiar, Shopify releases the editions twice a year. It's a sort of change log where we collect everything that's been improved or released in the last six months. Everything that devs or merchants need to know.

But it's also a love letter to the internet, and every edition has a completely new and different and ambitious design. It's exhausting and thrilling to work on, and actually, literally right this moment while we speak, my colleagues are releasing the newest edition, which is always a stressful day, so I'm sending up a little secular prayer for them. But this one, Winter 2026, is the most recent one I personally worked on, and also my personal favouite.

<!-- slide: about-me-collage -->
## About me: then

It ties so beautifully into another area of interest of mine, which is art. Before I worked in tech (way before) I went to art school at OCAD here in Toronto. I studied painting and drawing. Here are some of the pieces I made back then. Not this one in the centre: that's a Dorazio.

After I graduated, to try to distract everyone from the fact that I still had no idea what I was going to do with my life, I did a couple of internships at the Guggenheim in Venice, and I had the really great good fortune of working with the chief conservator at the time, Paul Schwartzbaum.

You can see me there in the corner wearing Peggy's glasses. And up at the top there I am with Duchamp's Box in a Valice.

If  you're not familiar, Duchamp made little miniatures of his body of work, you can see the little dollhouse-sized urinal there, and The Bride Stripped Bare by Her Bachelors, Even. Out of frame is a bunch of art handlers, it was a big production, and even though I'm wearing gloves I don't think I got to touch anything - they brought it down, and I got to look at it quickly and snap this picture and then it was whisked away. It's very delicate. This is the first one Duchamp ever made. He made it for Peggy Guggenheim in one of her old suitcases. Later he made an edition of I think 300, but anyway, yes. This day I was so moved, I cried.

<!-- slide: the-shape-of-oklch -->
## The shape of OKLCH

It's that intersection of art history, colour theory, and front-end engineering that brings me here to talk to you today.

A couple of years ago I was working on something and my colleague Eric said, "oh many this would be a good use for that new oklch colour format" and he sent me an Evil Martians blog post and I fell in love with it.

In the years since then I've been obsessed with this and talking about it to anyone who will listen.

And I've noticed that at first glance this shape seems to turn a lot of people off: this complicated spiked hedgehog shape looks esoteric and hard to work with. But once you learn how it works you'll discover it's really a really elegant and succinct representation of the culmination of centuries of humans seeking to understand, measure, and use colour, informed by physics and biology and the combined work of so many beautiful nerds across diciplines. I think of it as half self-portrait of humanity, half rosetta stone of colour technology.

Together, in the next 45 minutes, I'm going to tell you everything you need to know to fall as much in love with this shape as I have.

We're going to trace our path from cave painting to OKLCH. I'm going to show you that colour doesn't exist, that language is a magic spell, and how every new technology has the potential to be a catalyst that restructures our imaginations. (No pressure.)

<!-- section: Pigments -->

<!-- slide: pigments-from-the-earth -->
## Pigments from the earth

So let's start here, with the cave paintings at Lascaux.

For millennia and until relatively recently, colour had to be found in nature. The pigments used to create these images (ochre, charcoal, umber, iron oxides) were pulled from the earth.

<!-- slide: pigments-from-the-earth-2 -->
## Pigments from the earth

The paintings at Lascaux are at least 17,000 years old, but the same pigments used to make these ancient cave paintings were also used to create Egyptian funeral portraits, Medieval illuminated manuscripts, cubist paintings, abstract expressionism, and everything in between.

<!-- slide: the-pigment-economy -->
## The pigment economy

It’s easy to forget now that the value of colour has been essentially flattened, that some colours were once exceedingly rare.

There were gold rushes for colour: rare minerals, juicy little insects, the guts of sea snails. Making colour was alchemy.

We gatekept colours by region and class. We fought to control colour the way we now fight to control the flow of oil. Expeditions were funded, trade routes were carved out, and fortunes were made and lost, all in pursuit of specific hues.

<!-- slide: ultramarine -->
## Ultramarine

For example, in the late Medieval to early-Renaissance period in Western Europe, this blue could be, by weight, more precious than gold.

It's called ultramarine, or in Italian, _oltremare_, which literally means from beyond the sea. It was made from pulverized lapis lazuli which was primarily mined from a single valley in Afghanistan and then transported west via Venetian trade routes.

And the audience at this time would have known this. When a rich person commissioned a work like this, often the amount of particular pigments to be used would be spelled out in the contract with the artist, and churchgoers would get the message loud and clear. First, of the high esteem of the Virgin Mary who often was depicted in ultramarine robes, but second, of the political and financial power of the person who had commissioned the work.

The colour meant something because acquiring it cost so much.

<!-- slide: ultramarine-2 -->
## ultramarine

At that time prices and origins of different pigments were so varied and meaningful that how much of which pigment would be used in which way in an image was literally written into artists' contracts.

Commissioning a religious painting with ultramarine was a legible twofold signal to every person who walked into a church and saw it: one, of The Virgin Mary's importance, cloaked in the rarest and most expensive colour; and two, of the patron's wealth and devotion.

The colour meant something because acquiring it cost so much.

<!-- section: Let's get Physical -->

<!-- slide: let-s-get-physical -->
## Let's get physical

For ages, that was the lens though which we understood colour. It's not until we progress to the 17th century, that we really start to look beyond physical pigments to the physics of light.

In 1665, the Great Plague of London hit, and Cambridge University was closed. One of Cambridge’s students was Isaac Newton. Not this grey-haired version we think of, but a young, bored 23-year-old Isaac Newton stuck waiting out the plague at his mother's proverbial basement

<!-- slide: let-s-get-physical-2 -->
## Let's get physical

During our pandemic in 2020, we made sourdough and Dalgona coffee. On the other hand, Isaac Newton, who didn't have the Internet or Zoom calls, spent the next 18 months inventing calculus, planting the seed of a single law of gravitation, and reshaping the science of colour.

<!-- slide: let-s-get-physical-3 -->
## Let's get physical

You can tell he hadn’t yet hit his Saturn return when you consider some of his more questionable experiments.

<!-- slide: let-s-get-physical-4 -->
## Let's get physical

But right now we’re more interested in his prism experiments.

The Coles Notes version of this story that you might be familiar with is that Newton passed light through a prism and eureka, proved that white light contains the rainbow.

But people at this time were already familiar with rainbows being thrown by chandeliers and cut glass. It’s just that there wasn’t a good understanding of why. Most people thought that the colour came from the glass.

<!-- slide: let-s-get-physical-5 -->
## Let's get physical

The real eureka moment hit when Newton passed a rainbow thrown by one prism back through an inverted one. The spectrum was recombined, and white light was returned through the other end. This showed that, from a physics perspective, colours are inherent to light itself. White light is a mixture of colours, and the prism is just sorting them out for us to see.

Newton's prism experiments cracked open a question that would take almost two more centuries to answer: what exactly is light?

<!-- section: Good Vibrations -->

<!-- slide: good-vibrations -->
## Good vibrations

Enter James Clerk Maxwell: your favourite physicist's favourite physicist. He doesn't have Newton's household-name recognition, but his work reshaped physics, and Einstein kept a portrait of him on the wall of his study.

Maxwell was a poet, a wunderkind, and famously reserved: happiest rattling around his family estate in Scotland, running experiments, often with his wife Katherine assisting at his side.

<!-- slide: good-vibrations-2 -->
## Good vibrations

He seems to have been a humble guy. There's documentation of him referring to "another theory of electricity, which I prefer". That's sort of like if Dorothy described the plot of the Wizard of Oz as "a blustery day".

What he was describing was his Unified Theory of Electromagnetism. In fact, he accurately predicted something later confirmed: light is electromagnetic radiation.

<!-- slide: good-vibrations-3 -->
## Good vibrations

Electromagnetic radiation exists as a continuous spectrum that runs from radio waves through microwaves, infrared, visible light, ultraviolet, X-rays, and gamma rays. Visible light is just a sliver of the whole, roughly 400 to 700 nanometres. Measured on a linear scale, visible light makes up essentially 0% of the spectrum.

<!-- slide: good-vibrations-4 -->
## Good vibrations

Within the visible range, the hue produced by a particular wavelength is determined by its frequency, which is how many times the wave oscillates per second.

And a note here: for illustration purposes, this wave we're looking at is slowed down about 1.5 quadrillion times so we can see it, because, you know, light is famously very very fast. To put it into perspective, if we wanted to represent 1 second of real red light, we'd have to sit and watch this animate for 48 million years.

The higher the frequency, the shorter the wavelength, and the bluer the colour. This is counter-intuitive for me personally, because I would expect the colours we consider to be "warmer" to be oscillating faster than the colours like blue that we consider "cooler" but in fact it's the opposite.

How bright or intense a colour appears is determined by the amplitude, or height of the wave.

<!-- section: Biology of Colour -->

<!-- slide: the-biology-of-colour -->
## The biology of colour

What's I want to make sure you understand here is that even though we can describe the physical properties of visible light, there's actually nothing fundamental about this sliver of the electromagnetic spectrum that is different from the rest. What makes these particular wavelengths into colour has nothing to do with the wavelengths themselves, and everything to do with us.

Kind of like the tree that falls in the forest when no one is there to hear it. Our eyes have sensors tuned to pick up certain wavelengths, and our brains take that input and generates colour as a representation of the world around us that we can use. The experience of colour lives entirely in the space between our ears.

This is what I mean when I say colour doesn't exist. Without us (and other creatures who experience wavelengths as colour) it doesn't.

<!-- slide: the-x-factor -->
## The X Factor

And the machinery that makes colour sensation is very personal. We often operate as though we’re all having the same experience when we look at the same colour, but there’s reason to think that’s not exactly true. The most visible evidence of this is colour blindness, but variation exists across all of us.

<!-- slide: cone-sensitivity -->
## Cone sensitivity

The sensors in our eyes that pick up colour in particular are called cones. Most of us have three varieties of cones, S, M and L, or as we often call them colloquially, blue, green, and red.

(For the pedantic amongst us, I'll save you a little trouble during question period: what we call the red cone actually peeks closer to, like, goldenrod.)

But the truth is that all three cone types respond to a wide range of wavelengths with broad, overlapping sensitivity curves. You'll note in this illustration that the green and red cones especially are both picking up a lot of the same range.

<!-- slide: the-biology-of-colour-2 -->
## The biology of colour

Here's a representation of how our cones might be distributed. Your welcome, by the way, for not showing you a medical diagram here. I couldn't find one that didn't give me the heebie-jeebies.

But the point is that colour perception is not even across hues. Short (“blue”) cones make up only about 2 to 8 percent of your cones. Combine this with that fact that wavelengths in the green and red range will stimulate both the medium and long cones, you can see why we are significantly less sensitive to the colour blue.,

The ratio of red to green cones varies wildly, and studies have found ratios ranging from 1:1 all the way to 16:1, all in people who are considered to be within the "normal" range of colour vision.

Our distribution of colour sensors is as individual from person to person as height or nose shape, even before we take colourblindness into account.

<!-- slide: deuteranomaly -->
## Deuteranomaly

Speaking of colour-blindness, the most common form affects about 5% of people with XY chromosomes. In this type M cone (medium or "green" cone) is shifted toward L, reducing sensitivity to green. Reds, oranges, and greens are harder to distinguish.

Here we're simulating the most severe form of red-green colour blindness, where the medium cone is entirely absent, which is quite rare.

As so many things, red-green colour-blindness exists across a spectrum.

<!-- slide: the-x-factor-2 -->
## The X Factor

And if, like me, you're a member of the double-x chromosome coven, it gets even more interesting.

In fact, some studies estimate that 12% of people with two X chromosomes carry a genetic variant linked to a fourth cone type, making them potential tetrachromats.

But it's surprisingly difficult to confirm if they actually see more colours. For one thing, our brains are wired for three cones. The extra input may have nowhere to go and simply be thrown away.

But even if a tetrachromat really does experience colours the rest of us can’t see, describing them is a different challenge.

Think about how you would explain yellow to someone who has never seen it. Now imagine a world where you’re the _only_ person you've ever met who can see yellow. How would you explain it? What could someone say to to you to make you realize they're not seeing something that you do?

<!-- slide: tritanopia -->
## Tritanopia

In tritanopia, the S (short or "blue") cones are absent. Blues and greens become confused, and yellows and pinks look similar. This form is quite rare, affecting about 0.01% of the population. Unlike red-green colourblindness, it affects men and women equally.

<!-- slide: achromatopsia -->
## Achromatopsia

About 0.003% of the population have no functional cone cells at all. This results in the complete absence of colour vision, often accompanied by high light sensitivity and reduced acuity.

<!-- slide: protanomaly -->
## Protanomaly

The second form of red-green colourblindness affects about 1% of men. In this case, L cone is shifted toward M, reducing red sensitivity. Reds appear duller and darker than in deuteranomaly.

The severe form, protanopia (L cone absent), also affects ~1% of men and can make a red traffic light look almost black.

If you're counting, about 8% of men have some form of red-green colourblindness.

<!-- section: Colour Incantations -->

<!-- slide: language-is-a-magic-spell -->
## Language is a magic spell

The link between language and our experience of colour goes way deeper than you might think.

Homer's _Odyssey_ contains no word for blue. He describes the sea as "wine-dark." The sky is "bronze." Sheep are "violet."

The ancient Greeks were not colour blind, but blue as a discrete named category just wasn't part of how they organized their experience of the world.

<!-- slide: language-is-a-magic-spell-2 -->
## Language is a magic spell

As in Homer's time, there are languages and cultures today with no distinct word for blue.

For example, Himba speakers in Namibia use five colour categories. Their word _burou_ covers what we would separately call blue and green. In sorting experiments, Himba participants were noticeably faster and more accurate than English speakers at distinguishing shades of green that their language names separately, but struggled differentiating blue from green.

<!-- slide: think-pink -->
## Think pink

To grasp this phenomenon, think about the colour pink. This is pink, and this is red.

Now consider light blue and dark blue. Both are just… blue. Different shades of the same thing.

There is no physical reason for this. Pink and light blue are both simply desaturated versions of their parent colour. The distinction between pink and red is something our language and culture created. And it is so internalized that it feels completely objective. This is what I mean when I say language is a magic spell.

There are languages that draw lines in places we don't, experiencing distinct colour categories where we see only variations on a single colour. Colour distinctions that are as real and obvious to them as red and pink are to us, that we effectively don't perceive as separate things.

<!-- section: Measuring Colour -->

<!-- slide: colour-systems -->
## Colour systems

So you can see the need to organize colour in a way that can create some kind of shared language, and many artists and scientists have tried. Here you can see Newton's early attempts. He bent the spectrum into a circle,  divided it into seven parts to try to match the intervals of a musical scale.

[Step 2] Here's an 1810 attempt by a German painter named Philipp Otto Runge decided a circle wasn't enough, who designed a model shaped as a sphere: pure colours around the equator, white at one pole and black at the other. It's one of the very first colour solids, and the great-great-grandparent of the 3D shapes we'll be looking at later.

[Step 3] And here's a precursor to the Pantone colour system, _Werner's Nomenclature of Colours_, with each swatch paired with occurrences in nature.

[Step 4] And then there's Albert Munsell, an American painter and art teacher who wanted his students to describe colour as precisely as they described size or weight.

He developed a system using  three numbers: hue, value and chroma. And when he laid out the colours he could actually make, the branches came out uneven, because some colours simply reach further than others.

<!-- slide: the-abcs-of-cie-xyz -->
## The ABCs of CIE XYZ

And that brings us to CIE XYZ.

In the 1920s, W. David Wright and  John Guild ran a deceptively simple experiment.

Observers were shown a split field. On the left side was a test colour, and on the right the observer could dial up and down three carefully chosen primary lights with the goal of matching the sample.

By collecting and averaging the results from many observers, they were able to create a standardized model from which any colour can be described as three numbers: X, Y, Z.

<!-- slide: the-abcs-of-cie-xyz-2 -->
## The ABCs of CIE XYZ

Plotting those X, Y, Z values projected onto a 2D plane gives us the CIE XY chromaticity diagram, AKA the horseshoe. It's used across industries, from paint and textile manufacturing, to digital imaging, to food, pharmaceuticals, and more.

Every colour an average human eye can see lives inside this shape, and colour spaces are plotted against it.

First have a look at _sRGB_, which was for a long time the range supported by our monitors.

Display P3 is the range that Apple devices support.

Greater still, Rec. 2020 is the range that modern TVs support, and that future monitors will support.

<!-- section: Web Colours 1.0 -->

<!-- slide: colours-in-cyberspace -->
## Colours in cyberspace

And now, we finally get to talk about the colours on our computer screens.

<!-- slide: named-css-colours -->
## Named CSS Colours

Early displays supported so few colours that we called them by name. We started with 16, and they grew from there, and even though hexadecimal and RGB colour notation have been supported since CSS1, modern CSS still ships today with a legacy of 148 named colours.

There are more stories behind these names than I have time to get into here, from squabbles with standards agencies, to a pet snake named Emily Spinach.

The range is lopsided and charmingly idiosyncratic. I like to think of the named colours as modern archaeological artifacts buried in the inspector.

<!-- slide: srgb -->
## SRGB

With the release of CSS1 in 1996, webmasters had a formalized language to describe 16.7 million possible colours to use in the browser. To understand how, first we need to take a little counting detour.

Hexadecimal colours are made up of three two-digit base-16 numbers representing red, green, and blue channels. The highest two-digit base-16 number is FF, which is 255 in base 10. 255 is the same maximum value for each channel in rgb(). So you can see that while rgb and hexadecimal colour notation might feel very different, they are essentially the same thing.

So multiply 256 colour values across three channels and you get 16.7 million unique combinations. In the 90s this was more colours than many monitors could actually support, but we could name them.

<!-- slide: srgb-2 -->
## SRGB

By dialling up and down these three values, we can access any of those colours, but getting there isn't exactly intuitive.

To mix tints of a hue, we can dial up all the colours to introduce white light, or we dial down colours to produce shades. The closer the three channels are in value, the more desaturated the colour becomes.

Remember that we have many more “red” and “green” receptors than we have “blue”. Because our eyes are not as sensitive as blue, we naturally perceive it as a darker colour. After all, we’re literally measuring less blue light, regardless of how much of this wavelength is actually present.

Now look how our screens produce yellow. We get yellow light by mixing red and green, the two colours our eyes are most sensitive to. And then our screens light two subpixels to produce the colour, compared with one blue subpixel.

Biology and the hardware conspire to make yellow significantly brighter than blue on screen.

<!-- slide: srgb-3 -->
## SRGB

This is why you can read yellow text on a blue background with no trouble at all. Because we're weird squishy animals, different colours are inherently more dark or light.

<!-- slide: gradient-rgb -->
## RGB gradients

And when you know how rgb works, you also start to understand why some gradients just look - yucky. Look how when we transition between yellow and blue we literally hit gray right in the middle.

So you can see that RGB is a very technical way to describe colour that's hardware and physics-oriented. But it's not very intuitive to us humans. You could liken it to describing the physical properties of light waves.

It's measurable and objective in one sense, but absolutely not reflective of our lived experience on the other, forcing designers to fiddle incessantly with the colour picker and contrast checkers.

<!-- section: Hue, Saturation, Lies -->

<!-- slide: saved-by-the-hsl -->
## Saved by the HSL

And so we developed a colour system based on the more human concepts of hue, saturation, and lightness, or HSL. Browser support started to materialize in the early 2000s, and it started to get pretty solid when CSS Color Level 3 became a W3C Recommendation in 2011.

<!-- slide: the-contrast-ratio-problem -->
## The contrast ratio problem

Speaking of contrast, we've established that about 8% of men have some form of colour blindness. If we want to make sure that our content is legible to everyone, we need to make sure that the contrast between foreground and background is sufficient to carry the distinction even for people with colour vision deficiencies.

Thankfully we have the WCAG standard, which requires a contrast of at least 4.5:1 between foreground and background. We can update our pattern to use reds and greens chosen so the lightness difference alone is large enough for the 8 to stay legible at every point for every viewer.

However, getting there is the hard part. As we've seen, RGB is a very technical way to describe colour that's hardware and physics-oriented. But it's not very intuitive to us humans, or reflective of what happens to the light once it's actually processed by our squishy, mammalian eyes and brains. And we've all spent more time than we'd like fiddling with colour pickers and sliders to try to come up with a colour system that's harmonious and accessible.

[REVIEW (a11y): 4.5:1 is AA for normal text; large text is 3:1. If asked about APCA / WCAG 3: still a draft, not a standard.]

[REVIEW (Oct 19, accessibility): the dot-plate shows shape carrying meaning without colour (WCAG 1.4.1, Use of Color); 4.5:1 is the text-contrast rule (1.4.3). Keep the two claims apart.]

<!-- slide: hue-saturation-lies -->
## Hue, Saturation, Lies

It’s important to note that HSL doesn’t describe any new colours. It's a new coordinate system for the same 24-bit colours that RGB and hex already describe.

The difference is the grammar. Instead of specifying RGB primaries and mixing colour in your head, HSL lets you describe colour in a way which maps more naturally to how a designer thinks about colour. It's mapped out in this beautiful and tidy bi-cone shape. selecting a hue, and then adjusting its saturation and lightness.

The shape of the HSL model is a tidy double-cone shape. Lightness is mapped on the vertical axis so the cone comes to a point at white and black, and the hues are arranged in angles around the circumference. Saturation is mapped based on the distance from the vertical axis so that the farther you are from the center of the shape, the more saturated the colour.

<!-- slide: gradient-paths -->
## Gradient paths: HSL

However, our gradients do get a lot cuter. Even though we have exactly the same 16 million-ish colours and before to work with, instead of interpolating across three channels to to create a gradient, HSL interpolates the shortest distance across our lovely little bicone.

Ok, case closed. We fixed it. Talk over. We can all go home.

<!-- slide: lies -->
## Lies

[DRAFT NOTE: new title slide (Oct 19). Narration yours.]

<!-- slide: hue-saturation-lies-2 -->
## Hue, Saturation, Lies

If you’ve been paying attention you might have caught that that tidy predictable geometric shape is a red flag.  We know that yellow and blue don’t meaningfully conform to the same pattern, so why would they fit neatly into the same circle?

These twelve colours are all declared at the same HSL Lightness.

If HSL Lightness were truly describing perceptual brightness, at zero saturation, they should all converge to the same grey.

They don’t. Yellow is dramatically brighter than blue. HSL’s Lightness is a mathematical property of the RGB cube, not a measure of what the eye perceives.

<!-- slide: hue-saturation-lies-3 -->
## Hue, Saturation, Lies

One practical consequence is that we can’t rely on HSL to design predictable colour contrasts. Both the background and text here share the same hue and saturation, but a different lightness, and it’s passing contrast ratios.

But as we move though hues, even though the lightness and saturation are exactly the same, the contrast ratio varies widely.

HSL _feels_ more intuitive, but as a practical matter we’re still stuck twiddling around in the colour picker.

<!-- section: An OK Colour space -->

<!-- slide: an-ok-color-space -->
## An OK Color Space

I don’t know what it is about pandemics and colour science, but in December 2020, with much of the world in lockdown, a Swedish engineer named Björn Ottosson published a blog post on his personal website.

It was called "A perceptual color space for image processing".

Open-source and in his free time, Björn had found a way to fix the perceptual uniformity problems that had plagued colour spaces for decades by tuning the math against actual human perception data. He called it OKLab. Why OKLab? Because “because it is an OK Lab color space”

Within two years its polar form, OKLCH, was part of the CSS Color Level 4 spec.

<!-- slide: an-ok-color-space-3 -->
## An OK Color Space

First let's look at what OKLCH can do. If we repeat our lightness comparison we can see how OKLCH's accomodates for the human eye.

<!-- slide: an-ok-color-space-2 -->
## An OK Color Space

Now let's take another look at this mountain range shape.

Like the HSL model, we see lightness mapped across one axis, and hue on another, but this time straight across intead of wrapped around a circle.

Where it gets weird, is the chroma dimention, which is roughly equivalent to what HSL calls saturation. This is the axis on which the shape becomes much more ideosyncratic.

If we switch to looking at this shape in grayscale, we can see why.

The shape of the OKLCH model is a direct result of tuning the math to match human perception. The human eye dosn't support an equal range of chroma across all hues. We can see that the maximum chroma of green is much higher than the maximum chroma of blue.

Viewing from the lightness axis, we can also see how OKLCH accounts for the perceived lightness of hues. The peek for this fusha colour, where it supports the wides chromatic range with the same perceived lightness is much further up the lightness axis than the peek for blue.

[REVIEW (physicist, colour scientist): the shape is perception applied to a screen's gamut (viz.js samples the Display P3 cube), not the eye alone. Your own line from script-v2-arc.md: "its lumps come from perception and its boundary comes from the screen." Showing sRGB vs P3 vs Rec.2020 hedgehogs (same eyes, different shapes) makes the point. Typos here: accomodates, intead, ideosyncratic, dosn't, wides, peek.]

[REVIEW (Oct 19, storytelling, speaking coach): the shape is back, so land "half self-portrait of humanity, half Rosetta stone" here (a FITC promise, said once in minute five). Read aloud twice: "dimention", "intead", "ideosyncratic", "dosn't", "peek".]

<!-- slide: oklch-slices -->
## Slices

[DRAFT NOTE: new demo (Oct 19). Narration yours.]

<!-- section: OKLCH powers — Harmonies -->

<!-- slide: the-reddest-red -->
## The reddest red

OKLCH also has access to a much wider range of colours than rgb. But it's not really inherent to OKLCH itself. Hex, RGB, and HSL are all tightly bound to the sRGB colour space. Think of it like cultures that don't have a word for the colour blue. They literally don't have the language for colours outside that range weather the user can support them or not. OKLCH is more agnostic. It can describe any colour that the human eye can see. And if our displays support the P3 colour space, we can finally see those colours in the browser.

Have a look at his demo. If you have a wide-gamut display, the left half of the screen should be a much more vivid red than the right half. The left is the reddest red that sRGB can produce, and the right is the reddest red that OKLCH can produce.

<!-- slide: gradient-paths-2 -->
## Gradient paths: OKLCH



<!-- slide: colours-between-colours -->
## Colours between colours

And lets have a look at how different colour models handle gradients.

In sRGB, transitioning from one colour to another means splitting the R, G, and B channels numerically. When shifting between blue and yellow for example, there is a middle point where the three channels average out. That's why CSS gradients from blue to yellow pass through a muddy dead zone in the middle.

When we leverage HSL interpolation, we can see how the different hue arrangement gives us a different gradient, but we run into the same perceptual lightness issue which can cause a11y concerns if we're not careful.

OKLCH's "in between" means walking the shortest path through perceived colour. The midpoint of blue and yellow in OKLCH is a vivid green — the colour your eye actually expects. And perceived lightness is more predictable and even.

Note that these benefits are due to the model, not the colour space. We get all this goodness even if we stay within the sRGB gamut.

[REVIEW (Oct 19, colour scientist, checked): the OKLCH midpoint of blue and yellow has hue about 187 degrees, which is teal, not "a vivid green".]

<!-- section: Painters in CSS -->

<!-- slide: painters-in-css -->
## Art school speedrun

So now we have a new tool. What can we actually do with it?

I spent years of my life, and borrowed tens of thousands of dollars, on art school. Today I'm going to give you the highlights in about ten minutes, for just the cost of your FITC ticket.

Painters have been working with hue, lightness and chroma by eye for centuries, and OKLCH is the first colour model in the browser that turns the same three dials, so a surprising amount of what art school teaches finally translates into CSS.

<!-- slide: colour-harmonies -->
## Colour harmonies

One great thing about OKLCH is that the hues are balanced so that the opposite sides of the hue wheel are properly opposite.

This enables us to programatically unlock  harmonious colour sets. Let me show you.

<!-- slide: afterimage -->
## Complements, in your eyes

(Audience participation: select an opposing colour pair, then show how the after-image properly swaps the colour places.)

<!-- slide: harmony-paintings -->
## Lesson one: colour harmonies

Leveraging complimentary pairs to make your paintings feel rich is one of the first tricks you learn in art school. This is Van Gogh's _The Night Café_, from 1888. He wrote to his brother Theo that he'd "tried to express the terrible human passions with the red and the green." In another letter, he counted six or seven different reds in it, and the same number of greens.

Or how about this Whistler painting? It's much more subtle, painted in mostly blues and silvers, but how boring would this painting be without those two little dots of complimentary orange?

<!-- slide: titian -->
## Lesson two: don't darken with black

And here's a lesson from the Renaissance: don't darken a colour by mixing in black.

Black doesn't really make a colour darker. It makes it dirtier. Venetian painters like Titian built their shadows up in thin, translucent layers called glazes, so a dark could stay rich instead of going grey.

<!-- slide: titian-2 -->
## Titian: glazes



<!-- slide: monet -->
## Lesson three: colours that vibrate

Lesson three: colours that vibrate. This is Monet's _Impression, Sunrise_, from 1872. Two years later, a critic used its title to make fun of the whole exhibition, and the name stuck: Impressionism.

Look at the sun. It's the brightest thing in the picture, right? It glows. It might even seem to shimmer a little.

[Press grayscale] It isn't brighter at all. The neuroscientist Margaret Livingstone pointed out that the sun is almost exactly as light as the sky around it.

Part of our visual system reads colour, and part of it reads only lightness. Something about the way our brains process colour when hue is opposite but lightness is constant is to kinda buzz out a little, which you can leverage to good effect.

<!-- slide: riley -->
## Riley: stripes that swim

Op art took that same trick and made a whole movement out of it, and Bridget Riley is its star. (She's very much alive and very much in copyright, so this is my own stripe study, not her work.) Look how the effect diminishes when the stripes contrast in value as well as hue.

<!-- slide: richter -->
## Lesson four: happy accidents

Art school also teaches you to let go a little. Here's a little mock-up based on Ellsworth Kelly's 1950s project _Spectrum Colors Arranged by Chance_, using numbered slips of paper to decide where each of eighteen colours landed on a grid.

Here's what randomness looks like in RGB. It's a lot like noise.

But in OKLCH, with the lightness held constant suddenly randomness looks a lot more like taste.

<!-- slide: albers -->
## The final crit

Every art school ends with a crit, and ours is run by Josef Albers. He taught colour at the Bauhaus, then at Black Mountain College and Yale, and in 1963 he published _Interaction of Color_. The whole book starts from one sentence: "In visual perception a color is almost never seen as it really is."

[Step 1] Two squares. Do they look like the same colour? The one on the brown looks lighter and a little cooler. The one on the blue looks darker and a little pinker.

[Step 2] They're the same colour. Same `oklch()` value, same pixels. (I promise I haven't done any conference-talk crimes in the source code.) Only the neighbours changed. This is exactly what Chevreul saw in his tapestries.

[Step 3] Albers also ran the trick backwards. These two really are different colours, and on these grounds they look almost the same.

[Step 4] Put them on the same ground, and the difference comes right back.

<!-- slide: class-dismissed -->
## Class dismissed

What Josef Albers teaches us is, at the end of the day, you really just have to look.

OKLCH is the first colour model on the web that's built around our eyes, and it can do a lot,  but at the end of the day there's no replacement for your own judgement.

<!-- section: Oil paint technology -->

<!-- slide: the-medium-is-the-revolution -->
## The medium is the revolution

And before I leave you I want to say a little more about painting, because I think there are some really instructive parallels to pull from art history.

We often frame the Renaissance as a revolution of ideas, which of course it was, but it was also a practical revolution of technique.

For much of the Middle Ages, European painters worked mainly in egg tempera and fresco. Both of these media required planning and speed. They set quickly and then can't be reworked, so they encourage commitment to the first marks, flatter images, layered cross-hatching, and techniques that are closer to drawing than what we think of as painting.

When we look at Medieval paintings, they tend to be flat, almost like cartoons.

<!-- slide: the-medium-is-the-revolution-2 -->
## The medium is the revolution

But in the 15th century, artists took up oil painting as a dominant medium. The motivation was largely practical, but the results were transformative. Oil paint dries slowly and stays workable longer, so you can blend transitions over multiple sessions instead of locking into the first marks. And the paint doesn’t set and fight back, so artists were able to use more fluid and natural movements.

Oil also enabled glazing: building up thin transparent layers over dry paint to shift colours and values without hiding what’s underneath. Sometimes an oil painting can even seem to echo our biology: firm structures rendered beneath softer, semi-transparent flesh tones like skin over muscle and bone.

<!-- slide: the-medium-is-the-revolution-3 -->
## The medium is the revolution

It's not as simple as saying that artists became _better_. They had a different tool.

Over the centuries since the cave paintings at Lascaux, we continued to add to our palette, but we haven't really taken anything away. Earth pigments are a constant across art history, and they are all still used by artists to this day.

But the exact same pigments suspended in a different binder completely changed what kinds of pictures were practical to make.

<!-- slide: the-medium-is-the-revolution-4 -->
## The medium is the revolution

And the ideas that artists worked out in the new media trained their eye and hand and taste, so even images rendered in more traditional “stiffer” media began to take on the qualities developed in oil painting, like in this example, Botticelli's Primavera which is painted in egg tempera.

Just the capacity to hold colour in a new way served as a catalyst that restructured how we imagined what we could create.

<!-- slide: swatches -->
## The camera

And that's not the only time that technology was a catalyst to reinvent painting.

[Step 1] In 1839, Louis Daguerre announced the daguerreotype to the world. This is his _Boulevard du Temple_, from 1838. It's a busy Paris street, but the exposure took so long that everything moving simply vanished. The only people who stood still long enough to be recorded are down in the corner, a man and, it seems, someone shining his boots. It's one of the earliest photographs with a person in it.

For centuries, one of painting's main jobs had been recording what things looked like: who was king, what the harbour looked like, what your fiancée looked like before you agreed to marry her. Suddenly a machine could do that faster, cheaper and more accurately than any painter alive. Charles Baudelaire, reviewing the Salon of 1859, called photography art's "most mortal enemy".

But painting didn't die. It got weird. (Affectionately.) Once a machine could do the rendering, painters were free to ask what else a painting could be for. Monet and the Impressionists stopped painting things and started painting light. The Cubists painted one thing from several sides at once. And it kept going.

[Step 2] Henri Rousseau painted jungles he never saw. He never left France. His tropics came from the botanical garden in Paris, magazine pictures and his own imagination.

[Step 3] Chuck Close turned around and painted the camera itself: a photograph of his own face, nearly nine feet tall, so you can see exactly what a lens does to a person.

[Step 4] Jean-Michel Basquiat threw out the rules of rendering entirely, and painted like he was writing on a wall.

[Step 5] Chinyee left the picture behind altogether, and painted colour and gesture for their own sake.

[Step 6] And artists like Swoon keep pulling new tools into the conversation. This is her stop-motion animation, _Cicada_, from 2019.

We can't know for sure. But I don't think we'd have Impressionism, or Cubism, or Abstract Expressionism, or so many of my favourite movements and works, if painters hadn't been untethered from rendering by a machine that could do it better and faster.

<!-- slide: 45finale -->
##

Like oil paint, OKLCH unlocks a new way of carrying colour for the browser. Like when the camera was invented, with the rise of AI, we as designers and developers find ourselves, along with so many others, unlatched from the necessities around which we built our craft.

Today I wanted to share with you the connections I see between two diciplines that make me really exicited about what OKLCH unlocks. But the really exciting thing, the thing the history books will write about, is what you do now after you leave.

With new tools, with new unencumbrances, what will you make that's delightful and brand new that you wouldn't have even conceived of a year ago. How will you explore the gap that exists between what we _can_ do, and what we can _do_

<!-- section: Thank you -->

<!-- slide: thank-you -->
## Thank you


