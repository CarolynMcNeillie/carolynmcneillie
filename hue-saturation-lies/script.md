<!-- section: Introduction -->

<!-- slide: hue-saturation-lies -->
## Hue, Saturation, Lies

Raise your hand if you’ve ever been personally victimized by HSL.

<!-- slide: hsl-lightness -->
## HSL Lightness

CSS and I are in a fight. It's got us all pretending that these colours all have the same lightness.

...

I have some notes.

If “lightness” means what we expect it to -- how light these colours actually look -- then if we view this in grayscale with the luminance preserved this array of swatches should turn into roughly the same shade of grey, right?

Luckily I had the foresight to make a button that does exactly that.

...

Look, it's not even close.
It’s not a bug. HSL stands for hue, saturation, and lightness. That last number just doesn’t mean what we expect it to mean.

<!-- slide: a-practical-problem -->
## A practical problem

And this matters when we’re choosing colours for the browser.

Here’s a foreground and background that pass a contrast check.

Now I’m going to change their hue, keeping their HSL saturation and lightness the same.

...

Watch the contrast ratio absolutely bottom out.

...

If you’ve ever changed a colour to match the brand and accidentally broken your text contrast, you are among friends here.

<!-- slide: about-me -->
## About me

I’m Carolyn McNeillie. I’m a senior web developer at Shopify, specialising in the front-of-the front end.

Which means I feed my family by discovering just how much engineering can result from the sentance, “Could we just tweak this a little?”

<!-- slide: my-work -->
## My work

I’m on the Brand Design Studio team at Shopify.

We build cool creative experimental and design-forward things like Shopify Editions, which comes out twice a year: a sort of hybrid changelog and love letter to the internet.

My colleagues are launching the next one as we speak. Literally right now. Launch day is always chaotic, so I promised I’d send up a little secular prayer for them.

...

This one on screen is Winter 2026: the  most recent one I worked on, and a personal favourite.

Partly because before I worked in tech, I went to art school.

<!-- slide: my-education -->
## My Education

I studied painting and drawing at OCAD, here in Toronto.

These are some things I made.

Not the one in the middle. That’s a Dorazio. He did a little better for himself as an artist than I did.

After graduating, to postpone the question of what to do with my life, I did a couple of internships at the Guggenheim in Venice.

That’s me with Duchamp’s _Box in a Valise_.

It’s a tiny portable museum of his own work. There’s a dollhouse-sized urinal in there.

This moment was a special gift for me when my internship was wrapping up. 100 times better than flowers.

Out of the shot is a whole production of art handlers who brought it down.  I have gloves on but I definitely didn't touch it. I got take this picture, and then it was whisked away, and I was so moved that I cried.

I’m telling you this partly to establish my qualifications, and partly to establish the level of art nerd you’re dealing with.

<!-- slide: our-strange-little-friend -->
## Our strange little friend

This is where those two parts of my life meet.

You’re looking at the Display P3 gamut plotted in OKLCH. For now, don’t worry about either of those terms. Just notice the shape.

It’s irregular. Spiky. Kinda esoteric.

I love it.

If it makes you feel tired just looking at it, I understand.

My hope is that by the end of our 45 minutes together, it’ll feel less like an intimidating mathematical object and more like an elegant, useful tool.

And if I really get to have everything I want, I hope you might come to love it too.

<!-- section: The light and the observer -->

<!-- slide: lets-get-physical -->
## Let's get physical

To understand what the heck is going on with HSL's lightness number, and how we can do better, we need to separate what the light is doing from what our eyes do with it.

Let’s start with the light.

---

In 1665, the plague sent Isaac Newton home from Cambridge University.

Not this grey-haired version we think of...

...

but a young, bored Newton, waiting out the plague back at his mom's house.

<!-- slide: prism-experiments -->
## Prism Experiments

In 2020, we baked sourdough. In 1665, Newton messed around with prisms.

Now, making a rainbow wasn’t the big deal. People were already familiar with rainbows cast by cut glass.

The puzzle was: did the colour come from the glass, or from the light passing through it?

<!-- slide: prism-experiments-2 -->
## Prism experiments

Newton’s experiments helped answer that question.

White light goes in.

A prism separates it into a spectrum of colours.

And a second, inverted prism brings those colours back together into white light.

The glass wasn’t adding colours. It was separating what was already there.

---

It doesn’t yet explain why yellow looks so much lighter than blue.

For that, we need the other half of the question:

The person looking at it.

<!-- slide: visible-light -->
## visible light

This is the electromagnetic spectrum, from radio waves through to gamma rays.

...

And this little sliver is the part we call visible light. Which is very human-centric of us.

These wavelengths are just plain old, run-of-the-mill electromagnetic radiation too.

We call them “visible” because our eyes can detect them.

<!-- slide: the-biology-of-colour -->
## The biology of colour

Our eyes are sensors that respond to light. Our visual system turns those responses into the colours we experience. Colour happens in the head of the creature receiving the light.

And unfortunately for HSL, the creature is us. And we make things weird.

HSL’s lightness number describes the red, green, and blue channels in our screens, which doesn't have much to do with how light the colour will look once it’s been processed through our squishy heads.

So if we want our colour numbers to describe something closer to what we see, we need to understand a little about how we see it.

<!-- slide: the-x-factor -->
## The X Factor

The sensors in our eyes involved in colour vision are called cones.

Most of us have three types: S, M, and L, for short, medium, and long wavelengths.

We often call them blue, green, and red cones.

For the pedantic in the audience, I'll save you the trouble at question period and acknowledge now that what we call the red cone peeks closer to goldenrod.

And more importantly, look at how much these curves overlap.

This one wavelength stimulates both the medium and long cones. The height of each curve tells us how sensitive that cone type is to it.

So these aren’t three little RGB eyedroppers.

Our visual system works with the pattern of responses across them—not three separate buckets of colour.

<!-- slide: colour-vision -->
## Colour vision

But there is a lot of variation in cones from person to person.

Here is a simulation of how things might appear to someone experiencing red-green colour blindness.

But even among people who have what we consider "normal" vision, the distribution of our cones can vary widely. For example it's considered normal to have anywhere from a 1:1 ratio of red and green cones up to 16:1.

The cones in our eyes are as unique from person to person as our height or the shape of our nose, so while we can describe the physical properties of light very objectively, describing human vision is a bit murkier.

<!-- section: Shared languages of colour -->

<!-- slide: speaking-the-same-language -->
## Speaking the same language

But even if there's not one objective single way that humans see colour, we still need some shared system to describe it.

<!-- slide: a-painters-grammar -->
## A painter's grammar

Here's one of my favourite attempts.

This system was developed by painter and art teacher Albert Munsell.

He developed a system of sorting colours by hue, value, and chroma.

His system was one of the first that accounts for the fact that different colours have different ranges, so each of the colours in his tree branch into different shapes.

This is the ancestor of our spiky friend OKLCH.

<!-- slide: a-shared-reference -->
## A shared reference

But between the two world wars, scientists came together to find a way to measure colour perception more systemically.

Here's a simulation of an experiment they used.

On one side, we have a test colour.
On the other we have dials for three primary lights.

The test subject changes the mixture until the two sides match.

The data collected from experiments  like these helped establish the CIE's 1931 standard observer and XYZ colour measurement.

<!-- slide: the-horseshoe -->
## The horseshoe

From XYZ we can derive this chromaticity diagram, the horseshoe, which represents the average range of human colour vision.

This is a slice of the overall colour space that leaves out the darkness/lightness axis.

This is used across all sorts of industries from textile design, to paint colours, to electronic devices. Any other colour space is a subset of this one.

Here's sRGB.

Here's Display P3.

Here's Rec 2020.

<!-- slide: rgb -->
## RGB

RGB and hexadecimal colour notation are describing colour in essentially the same way, which is by describing the strength of each of three colour channels, red green and blue.

<!-- slide: rgb-2 -->
## RGB

You can see here we get red when we dial just the red channel to the top.

We can lighten the colour by adding green and red to mix together as white light.

Or we can get a darker shade by dimming the channel.

The closer the three channels are in value, the more desaturated the colour you will see.

And you can see yellow, which is generated by mixing yellow and red, is in this model the opposite of blue.

<!-- slide: rgb-gradients -->
## RGB Gradients

So when you understand how this works, you can see why rgb colours do some of the weird things they do.

For example, a yellow to blue gradient might be the most disappointing one in the browser.

<!-- slide: hsl -->
## HSL

Now let's have a look at HSL which approaches things a little differently.

Instead of directly describing RGB channels, HSL notation organizes colours into hue, saturation, and lightness. And this is what that looks like.

The closer you are to the equator, the more saturated your colour is. Lightness and darkness are arranged from top to bottom.

This system is really tidy and hue, saturation and lightness is easier to reason about than RGB channels, but you might already be thinking that this really simple shape is a bit of a red flag. we know that blue and yellow aren't perceptually the same lightness, so to achieve this shape the colour relationships are stretch and warped. I almost never reach for hsl.

<!-- slide: the-srgb-range -->
## The sRGB range

So first of all, HSL is a different model for describing the exact same colour range that RGB and hexadecimal colour notation is. There's no added rage, just the same colours arranged in a different way.

And because the colour relationships are still based on the properties of our screens, and now how colour is actually perceived, it doesn't wind up being as practical as we would hope it would.

<!-- slide: we-already-talked-about-this -->
## We already talked about this

Regardless of the notation, we're still left manually plucking colours with an eyedropper at the end of the day.

<!-- slide: hsl-gradients -->
## HSL Gradients

The one place that I might reach for HSL is gradients.

Instead of interpolating across three channels to create a gradient, HSL interpolates the shortest distance across our lovely little bicone, so instead of passing through grey, between blue and yellow we arc through teal and lime which depending on your application might be much more up your alley.

But there's a lot of room left for CSS to do colour a lot better.

<!-- section: Three decisions, better separated -->

<!-- slide: an-ok-colour-space -->
## An OK colour space

Apparently pandemics are productive times for colour science.

This is Björn Ottosson, and in December 2020 he published a post called _A perceptual colour space for image processing_.

He wanted a useful separation between lightness, chroma, and hue, and better behaviour for operations like colour blending.

He called the result Oklab.

Because it was an OK Lab colour space.

Not Perfectlab.

OKLCH expresses that same system using lightness, chroma, and a hue angle.

<!-- slide: oklch-lightness -->
## OKLCH Lightness

Here's the opening experiment again.

On this side, equal HSL lightness.

On this side, equal OKLCH lightness.
Notice how much steadier the relationship is.

That's what we wanted: changing hue without such a large, unintended change in how light the colours look.

<!-- slide: oklch-syntax -->
## OKLCH Syntax

Let's have a look at the syntax.

Lightness is measured on a scale from 0 - 1
Hue rounds the colour wheel from 0 to 360 degrees. And chroma caps out at 0.4.

We can use css calc functions to do really great things with this notation as we will look at together later.

<!-- slide: reading-the-hedgehog -->
## Reading the hedgehog

Now we can read the shape.

This is the Display P3 gamut plotted in OKLCH, with hue unwrapped across one axis.

<!-- slide: hue-slices -->
## Hue Slices

By looking at hue slices we can really start to understand what this shape represents.

Different hues have different levels at which perceivable chroma maxes out. Our eyes or our brains -- I'm not sure who is at fault here -- but every colour has a cap and that cap is different for different hues.

On top of that, chroma peeks for different colours at different perceived lightness.

<!-- slide: what-happens-at-the-edge -->
## What happens at the edge?

[Increase chroma past the marked boundary.]

We can write coordinates for a colour the destination can't reproduce.

It has to be mapped into the available gamut.

So there's a difference between the colour we request and the colour we get.

([w3.org](https://www.w3.org/TR/css-color-4/))

In practice: watch the boundary while exploring.

If moving a control stops producing the change you expected, you may have reached the limits of the output—not the limits of the notation.

<!-- slide: answer-the-practical-problem -->
## Answer the practical problem

Now let's look at this experiment again using oklch.

Now we have two blues with roughly the same contrast ratio as our hsl example. But watch what happens when we keep lightness and chroma steady, but loop through the hue wheel.

You will notice that the contrast ratio is still changing a little. Remember, it's not _perfect_LCH. We still need to run our work through a contrast checker to ensure we're serving all our audience. But damn if OKLCH doesn't get you a heck of a lot closer.

<!-- slide: oklch-gradients -->
## OKLCH gradients

The shape of OKLCH gives us gradients that step smoothly though all three axises.

<!-- slide: gradient-comparisons -->
## Gradient comparisons

It's fun to compare just how different gradients look in the different colour models.

In all these examples we're starting and ending withe the exact same rgb colour, but the effect is very varied.

<!-- slide: more-range-is-a-separate-benefit -->
## More range is a separate benefit

So ok, I mentioned that most of our css colour notation -- rgb, hexidecimal, and hcl -- are bounded to the sRGB colour space. So no matter what your monitor can do, they limit you to that particular range.

OKLCH is more agnostic. It can describe any colour that the eye can see, and then your monitor will display colours based on what it can handle.

In practical terms, that is likely to be display P3, but as our monitors become more robust so will our palettes.

Here you can see "the most red" you can get in RGB and the most red you can get in display P3.

<!-- section: Art school, with CSS -->

<!-- slide: art-school-speedrun -->
## Art school speedrun

Ok, so we have this new colour system,  but how can we actually apply it?

Well, artists have been thinking about colour in terms of lightness, chroma and hue for centuries, and we can borrow from their wisdom and apply it to the screen.

I spent years of my life, and borrowed tens of thousands of dollars, on art school.

Today, you get the highlights for the cost of your FITC ticket.

<!-- slide: lesson-one -->
## Lesson One



<!-- slide: your-turn -->
## Your turn



<!-- slide: programatic-colour-harmonies -->
## Programatic Colour Harmonies

So remember how we saw that, if you're thinking in terms of the red green and blue channels, yellow is the opposite of blue.

This is how the HSL colour wheel is tuned.  But I'm sure you know that this is not how our eyes are tuned. To us, the opposite of blue is orange.

In OKLCH the hues are tuned to our perception too, which unlocks so many cool things we can do with just a little CSS.

<!-- slide: lesson-two -->
## Lesson two

What do you notice here about the sun?

<!-- slide: choose-vibration-or-separation -->
## Choose vibration—or separation

You can see this leveraged in op art.
Look how much less trippy this becomes when the strips contrast in lightness as well as hue.

<!-- slide: lesson-three -->
## Lesson three



<!-- slide: compare-the-choices -->
## Compare the choices

It's a cliche for painting instructors to tell you to never ever use black.

<!-- slide: apply-the-ramp -->
## Apply the ramp



<!-- slide: lesson-four -->
## Lesson four



<!-- slide: chuck-close-lucas -->
## Chuck Close, Lucas



<!-- slide: roll-the-dice -->
## Roll the dice



<!-- slide: lesson-five -->
## Lesson five

[Title only.]

<!-- slide: lesson-five-2 -->
## Lesson five

Josef Albers who wrote, “In visual perception a color is almost never seen as it really is.”

<!-- section: A different way to carry colour -->

<!-- slide: lesson-six -->
## Lesson six

For millennia and until relatively recently, colour had to be found in nature.

The pigments used to create cave paintings at Lascaux (ochre, charcoal, umber, iron oxides) were pulled from the earth.

These were painted at least 17,000 years ago...

<!-- slide: pigments-from-the-earth -->
## Lesson six

And the same pigments were used to paint Egyptian funeral portraits...

Medieval illuminated manuscripts...

Cubist studies...

Abstract expressionism and everything in between.

<!-- slide: the-medium-changes-the-process -->
## The medium changes the process

For much of the Middle Ages, European painters worked mainly in egg tempera: pigment bound in egg yolk; and fresco: pigment applied onto wet plaster. Both of these media required planning and speed. They set quickly and then can't be reworked, so they encourage commitment to the first marks, flatter images, layered cross-hatching, and techniques that are closer to drawing than what we think of as painting. When we look at Medieval paintings, they tend to be flat, almost like cartoons.

<!-- slide: the-medium-is-the-revolution -->
## The medium is the revolution

It's not as simple as saying that artists became _better_. They had a different tool.

Oil paint dries slowly and stays workable longer, so you can blend transitions over multiple sessions instead of locking into the first marks.

And the paint doesn’t set and fight back, so artists were able to use more fluid and natural movements.

Oil also enabled glazing: building up thin transparent layers over dry paint to shift colours and values without hiding what’s underneath.

<!-- slide: another-way-to-work -->
## Another way to work

But in the 15th century, artists took up oil painting as a dominant medium. The motivation was largely practical, but the results were transformative.

<!-- slide: the-medium-is-the-revolution-2 -->
## The medium is the revolution

And the ideas that artists worked out in the new media trained their eye and hand and taste, so even images rendered in more traditional “stiffer” media began to take on the qualities developed in oil painting, like in this example, Botticelli's Primavera which is painted in egg tempera.

Just the capacity to hold colour in a new way served as a catalyst that restructured how we imagined what we could create.

<!-- slide: look-again -->
## Look again

So let's look at this shape one more time. I hope it looks different now.

Like oil paint, OKLCH unlocks a new way of carrying colour for the browser. Like when the camera was invented, with the rise of AI, we as designers and developers find ourselves, along with so many others, unlatched from the necessities around which we built our craft.

Today I wanted to share with you the connections I see between two diciplines that make me really exicited about what OKLCH unlocks. But the really exciting thing, the thing the history books will write about, is what you do now after you leave.

With new tools, with new unencumbrances, what will you make that's delightful and brand new that you wouldn't have even conceived of a year ago. How will you explore the gap that exists between what we can do, and what we can do

<!-- slide: thank-you -->
## Thank you

Thank you.

<!-- section: Staging area -->

<!-- slide: the-camera -->
## The camera

And that's not the only time that technology was a catalyst to reinvent painting.

For centuries, one of painting's main jobs had been recording what things looked like: who was king, what the harbour looked like, what your fiancée looked like before you agreed to marry her.

With the advent of photography, suddenly a machine could do that faster, cheaper and more accurately than any painter alive. (Sound familiar?)

Charles Baudelaire, reviewing the Salon of 1859, called photography art's "most mortal enemy".

But painting didn't die. It got weird.
Once a machine could do the rendering, painters were free to ask what else a painting could be for.

We can't know for sure. But I don't think we'd have Impressionism, or Cubism, or Abstract Expressionism, or so many of my favourite movements and works, if painters hadn't been untethered from rendering by a machine that could do it better and faster.

<!-- slide: cones -->
## Cones

The sensors in our eyes involved in colour vision are called cones.

Most of us have three types: S, M, and L, for short, medium, and long wavelengths.

We often call them blue, green, and red cones.

For the pedantic in the audience, I'll save you the trouble at question period and acknowledge now that what we call the red cone peeks closer to goldenrod.

And more importantly, look at how much these curves overlap.

This one wavelength stimulates both the medium and long cones. The height of each curve tells us how sensitive that cone type is to it.

So these aren’t three little RGB eyedroppers.

Our visual system works with the pattern of responses across them—not three separate buckets of colour.

<!-- slide: a-colour-you-had-to-acquire -->
## A colour you had to acquire

Natural ultramarine was made from lapis lazuli.

Think about that as a creative constraint. Before that blue could become a decision in a painting, someone had to acquire and prepare the material.

Now think about how casually we type a number.

That's an extraordinary freedom.

But getting more colours isn't the only way a tool can change what we make.

<!-- slide: lesson-four-give-chance-fewer-decisions -->
## Lesson four: give chance fewer decisions

Art school also teaches you to let go a little.

Kelly's _Spectrum Colors Arranged by Chance_ used coloured papers and systems for distributing eighteen colours.

Chance operated inside constraints.

([moma.org](https://www.moma.org/audio/2690))

This is my own browser study.

[Step 1]

Here's random RGB.

[Shuffle once.]

[Step 2]

Now keep lightness and chroma fixed. Randomise hue.

[Allow the comparison to land.]

The colours have something in common.

Not because the computer acquired taste.

Because we gave it fewer decisions.

**We haven't removed randomness. We've decided what it's allowed to change.**

<!-- slide: change-the-whole-family -->
## Change the whole family

```css
background: oklch(0.7 0.1 var(--random-h));
```

The demo supplies a different hue to each square.

The other two values are shared.

[Step 1]

Here's the family.

[Step 2]

Lower the shared lightness.

Darker.

[Step 3]

Reduce the shared chroma.

Quieter.

[Step 4]

Restore the values and shuffle again.

A different arrangement. Related behaviour.

That's useful for generative artwork, decorative elements, or exploring a family of candidate colours.

For production, we can select and test the results rather than leaving everything random.

The lesson is bigger than a palette:

**Design the territory before you roll the dice.**

<!-- slide: saved-by-the-hsl -->
## Saved by the HSL

HSL gives us friendlier controls for the same sRGB range.

Hue. Saturation. Lightness.

Instead of mixing channels in our heads, we can choose a hue and adjust two other properties.

That is genuinely useful.

But friendlier controls aren't necessarily perceptually predictable controls.

([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/hsl))

<!-- slide: better-tools-for-judgment -->
## Better tools for judgment

The numbers let us specify and repeat a colour.

They don't tell us everything about how it will look beside its neighbours.

That's why we check the actual composition, not just a palette of isolated squares.

Albers made those changing contextual relationships central to learning colour.

([albersfoundation.org](https://www.albersfoundation.org/alberses/teaching/interaction-of-color))

**Better numbers don't replace judgment. They give judgment better tools.**

<!-- slide: explore-the-relationship -->
## Explore the relationship

[Use the existing hue-wheel controls.]

Start with a base colour.

Choose a nearby hue for a related accent.

Or move further around for a stronger difference.

These angle relationships give us starting points.

Not guarantees of beauty.

And hue isn't the only way to make something stand out.

[Reduce the chroma of one swatch while leaving the other unchanged, if supported.]

We can also make the surroundings quieter.

That is a useful browser decision: an accent doesn't always need more intensity. Sometimes everything around it needs less.

<!-- slide: one-colour-one-relationship-one-component -->
## One colour. One relationship. One component.

Here's one thing to try when you get back to work.

Take one component.

Not the entire design system. One button is enough.

```css
.button {
  --base: oklch(0.55 0.1 250);

  background: var(--base);
}

.button:hover {
  background:
    oklch(from var(--base) calc(l - 0.06) c h);
}
```

The hover colour isn't an unrelated value.

It's a relationship: start from this colour and make it darker.

([w3.org](https://www.w3.org/TR/css-color-5/))

Now change the base hue.

The related state follows.

Check the text contrast in both states. Inspect the actual component. Watch the gamut.

Then compare that workflow with the one you're using now.

The question isn't “Can I replace all my hex values?”

It's **“Which decisions could I stop making from scratch?”**

<!-- slide: write-the-relationship -->
## Write the relationship

```css
--opposite:
  oklch(from var(--base) l c calc(h + 180));
```

This is relative colour syntax.

Start from an existing colour.

Keep its lightness and chroma.

Move its hue half a turn.

([w3.org](https://www.w3.org/TR/css-color-5/))

The relationship is now in the CSS.

Change the base, and the derived colour follows.

Traditional painters' complementary pairs don't line up exactly with this wheel. This is an opposite in these coordinates, not a universal artistic rule.

Then compose.

A small orange detail and half an orange screen are different decisions.

**Choose the relationship. Then choose how much of it you want.**

<!-- slide: lies -->
## Lies

No notes

<!-- slide: work-homepage -->
## Work: homepage

I've been with Shopify for five years, and I'm on the Brand Design Studio team (aka BrDS), which is the team responsible for (in my biased opinion) the most fun and visually creative work at the company.

<!-- slide: work-shop-md -->
## Work: shop.md

As well as special projects, for example this site just went up a couple of weeks ago. It helps you to build a customizable skill for your agents to shop the Shopify ecosystem.

<!-- slide: lets-get-physical-2 -->
## Let's get physical

During our pandemic in 2020, we made sourdough and Dalgona coffee. On the other hand, Isaac Newton, who didn't have the Internet or Zoom calls, spent the next 18 months inventing calculus, planting the seed of a single law of gravitation, and reshaping the science of colour.

<!-- slide: lets-get-physical-3 -->
## Let's get physical

You can tell he hadn’t yet hit his Saturn return when you consider some of his more questionable experiments.

<!-- slide: good-vibrations -->
## Good vibrations

James Clerk Maxwell's work on electromagnetism showed that visible light is part of a much larger spectrum. Your favourite physicist's favourite physicist, and that's his introduction.

<!-- slide: good-vibrations-2 -->
## Good vibrations

He seems to have been a humble guy. There's documentation of him referring to "another theory of electricity, which I prefer". That's sort of like if Dorothy described the plot of the Wizard of Oz as "a blustery day".

What he was describing was his Unified Theory of Electromagnetism. In fact, he accurately predicted something later confirmed: light is electromagnetic radiation.

<!-- slide: good-vibrations-3 -->
## Good vibrations

Within the visible range, the hue produced by a particular wavelength is determined by its frequency, which is how many times the wave oscillates per second.

The wave here is slowed down so we can see it. Higher frequency means shorter wavelength, toward the blue end of this visible range.

<!-- slide: the-biology-of-colour-2 -->
## The biology of colour

Here's one way our cones might be distributed. You're welcome for not showing a medical diagram. I couldn't find one that didn't give me the heebie-jeebies.

Short, or blue, cones are only a small part of the picture. And the mix of medium and long cones varies between people with normal colour vision. Even before colour blindness, we don't all sample the light in quite the same way.

<!-- slide: whose-experience -->
## Whose experience?

And whose experience are we talking about?

We behave as though “looks green” is a shared specification.

It isn’t quite that simple.

<!-- slide: protanomaly -->
## Protanomaly

The second form of red-green colourblindness affects about 1% of men. In this case, L cone is shifted toward M, reducing red sensitivity. Reds appear duller and darker than in deuteranomaly.

The severe form, protanopia (L cone absent), also affects ~1% of men and can make a red traffic light look almost black.

If you're counting, about 8% of men have some form of red-green colourblindness.

<!-- slide: tritanopia -->
## Tritanopia

In tritanopia, the S (short or "blue") cones are absent. Blues and greens become confused, and yellows and pinks look similar. This form is quite rare, affecting about 0.01% of the population. Unlike red-green colourblindness, it affects men and women equally.

<!-- slide: achromatopsia -->
## Achromatopsia

About 0.003% of the population have no functional cone cells at all. This results in the complete absence of colour vision, often accompanied by high light sensitivity and reduced acuity.

<!-- slide: names-give-us-handles -->
## Names give us handles

[Step 1]

Start with the words we already use.

[Step 2]

Pink. Red.

[Step 3]

Light blue. Dark blue.

[Step 4]

In English, pink gets its own basic name. Those two blues usually share one.

The distinction between those pairs isn't organised the same way in our language.

A name gives us a convenient handle. And different descriptions make different distinctions convenient.

That matters when we're trying to make something.

“Make this softer” could mean lighter. Less colourful. Less contrast against its surroundings.

Those are different decisions.

A useful colour system gives us a way to say which decision we mean.

**The difference is the grammar.**

<!-- slide: language-is-a-magic-spell -->
## Language is a magic spell

The link between language and our experience of colour goes deeper than colour names on a paint chart.

Homer's _Odyssey_ contains no word for blue. He describes the sea as "wine-dark." The sky is "bronze." Sheep are "violet."

The ancient Greeks were not colour blind, but blue as a discrete named category wasn't part of how they organized their experience of the world.

Himba speakers in Namibia use a word that covers what we call blue and green, while distinguishing greens we group together. So colour has at least three parts: what the light is doing, what our visual system does with it, and how we organize the experience. A useful colour system has to decide which of those things it is describing.

<!-- slide: colours-in-cyberspace -->
## Colours in cyberspace

Now colour is an instruction for a screen. We need to tell it how much light to emit in each channel.

<!-- slide: what-do-we-want-to-keep -->
## What do we want to keep?

[Use the existing slices or controls. Make each change separately.]

Let’s start with this colour.

Suppose I like its lightness and intensity, but want another hue.

What do I change?

[Let the room answer.]

H.

[Change only hue.]

Now I like the hue, but want it quieter.

C.

[Reduce chroma.]

Now I want it darker, without deliberately changing the other two.

L.

[Reduce lightness.]

That’s the whole interface.

Not because those decisions are perfectly independent in every situation.

Because we can separate them much more usefully.

Instead of “make it nicer,” I can ask a smaller question.

Too dark?

Too colourful?

Wrong hue?

Which one do I actually mean?

<!-- slide: srgb -->
## SRGB

This is why you can read yellow text on a blue background with no trouble at all. Because we're weird squishy animals, different colours are inherently more dark or light.

<!-- slide: named-css-colours -->
## Named CSS Colours

And because systems accumulate history rather than replacing it cleanly, we still have these named colours. There are more stories behind these names than I have time for, from squabbles with standards agencies to a pet snake named Emily Spinach. They're lopsided, charming little archaeological artifacts in the inspector.

<!-- slide: language-is-a-magic-spell-2 -->
## Language is a magic spell

As in Homer's time, there are languages and cultures today with no distinct word for blue.

For example, Himba speakers in Namibia use five colour categories. Their word _burou_ covers what we would separately call blue and green. In sorting experiments, Himba participants were noticeably faster and more accurate than English speakers at distinguishing shades of green that their language names separately, but struggled differentiating blue from green.

<!-- slide: the-pigment-economy -->
## The pigment economy

Some colours were once exceedingly rare. Rare minerals, insects, the guts of sea snails: colour had a supply chain. Access to a particular hue could tell you about region, class and money.

<!-- slide: ultramarine -->
## ultramarine

At that time prices and origins of different pigments were so varied and meaningful that how much of which pigment would be used in which way in an image was literally written into artists' contracts.

Commissioning a religious painting with ultramarine was a legible twofold signal to every person who walked into a church and saw it: one, of The Virgin Mary's importance, cloaked in the rarest and most expensive colour; and two, of the patron's wealth and devotion.

The colour meant something because acquiring it cost so much.
