<!-- section: Introduction -->

<!-- slide: title -->
## Hue, Saturation, Lies

Raise your hand if you’ve ever been personally victimized by HSL.

<!-- slide: hue-saturation-lies-2 -->
## The same lightness

CSS and I are in a fight. It's got us all pretending that these colours all have the same lightness.

...

I have some notes.

If “lightness” means what we expect it to -- how light these colours actually look -- then if we view this in grayscale with the luminance preserved this array of swatches should turn into roughly the same shade of grey, right?

Luckily I had the foresight to make a button that does exactly that.

...

Look, it's not even close.
It’s not a bug. HSL stands for hue, saturation, and lightness. That last number just doesn’t mean what we expect it to mean.

<!-- slide: hue-saturation-lies-3 -->
## A practical problem

And this matters when we’re choosing colours for the browser.

Here’s a foreground and background that pass a contrast check.

Now I’m going to change their hue, keeping their HSL saturation and lightness the same.

...

Watch the contrast ratio absolutely bottom out.

...

If you’ve ever changed a colour to match the brand and accidentally broken your text contrast, you are among friends here.

<!-- slide: about-me-now -->
## About me

I’m Carolyn McNeillie. I’m a senior web developer at Shopify, specialising in the front-of-the front end.

Which means I feed my family by discovering just how much engineering can result from the sentance, “Could we just tweak this a little?”

<!-- slide: work-editions -->
## Work: Editions

I’m on the Brand Design Studio team at Shopify.

We build cool creative experimental and design-forward things like Shopify Editions, which comes out twice a year: a sort of hybrid changelog and love letter to the internet.

My colleagues are launching the next one as we speak. Literally right now. Launch day is always chaotic, so I promised I’d send up a little secular prayer for them.

...

This one on screen is Winter 2026: the  most recent one I worked on, and a personal favourite.

Partly because before I worked in tech, I went to art school.

<!-- slide: about-me-collage -->
## Before the browser

I studied painting and drawing at OCAD, here in Toronto.

These are some things I made.

Not the one in the middle. That’s a Dorazio. He did a little better for himself as an artist than I did.

After graduating, to postpone the question of what to do with my life, I did a couple of internships at the Guggenheim in Venice.

That’s me with Duchamp’s _Box in a Valise_.

It’s a tiny portable museum of his own work. There’s a dollhouse-sized urinal in there.

This moment was a special gift for me when my internship was wrapping up. 100 times better than flowers.

Out of the shot is a whole production of art handlers who brought it down.  I have gloves on but I definitely didn't touch it. I got take this picture, and then it was whisked away, and I was so moved that I cried.

I’m telling you this partly to establish my qualifications, and partly to establish the level of art nerd you’re dealing with.

<!-- slide: the-shape-of-oklch -->
## Our strange little friend

This is where those two parts of my life meet.

You’re looking at the Display P3 gamut plotted in OKLCH. For now, don’t worry about either of those terms. Just notice the shape.

It’s irregular. Spiky. Kinda esoteric.

I love it.

If it makes you feel tired just looking at it, I understand.

My hope is that by the end of our 45 minutes together, it’ll feel less like an intimidating mathematical object and more like an elegant, useful tool.

And if I really get to have everything I want, I hope you might come to love it too.

<!-- section: The light and the observer -->

<!-- slide: let-s-get-physical -->
## Let's get physical

To understand what the heck is going on with HSL's lightness number, and how we can do better, we need to separate what the light is doing from what our eyes do with it.

Let’s start with the light.

---

In 1665, the plague sent Isaac Newton home from Cambridge University.

Not this grey-haired version we think of...

...

but a young, bored Newton, waiting out the plague back at his mom's house.

<!-- slide: let-s-get-physical-4 -->
## Where did the colour come from?

In 2020, we baked sourdough. In 1665, Newton messed around with prisms.

Now, making a rainbow wasn’t the big deal. People were already familiar with rainbows cast by cut glass.

The puzzle was: did the colour come from the glass, or from the light passing through it?

<!-- slide: let-s-get-physical-5 -->
## Separate and recombine

Newton’s experiments helped answer that question.

White light goes in.

A prism separates it into a spectrum of colours.

And a second, inverted prism brings those colours back together into white light.

The glass wasn’t adding colours. It was separating what was already there.

---

It doesn’t yet explain why yellow looks so much lighter than blue.

For that, we need the other half of the question:

The person looking at it.

<!-- slide: good-vibrations-3 -->
## The part we call visible

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

<!-- slide: cone-sensitivity -->
## Not three little RGB eyedroppers

The sensors in our eyes involved in colour vision are called cones.

Most of us have three types: S, M, and L, for short, medium, and long wavelengths.

We often call them blue, green, and red cones.

For the pedantic in the audience, I'll save you the trouble at question period and acknowledge now that what we call the red cone peeks closer to goldenrod.

And more importantly, look at how much these curves overlap.

[Point to a wavelength around 550 nanometres. Trace upwards to the M and L curves.]

This one wavelength stimulates both the medium and long cones. The height of each curve tells us how sensitive that cone type is to it.

So these aren’t three little RGB eyedroppers.

Our visual system works with the pattern of responses across them—not three separate buckets of colour.

<!-- slide: deuteranomaly -->
## Different observers

But there is a lot of variation in cones from person to person.

Here is a simulation of how things might appear to someone experiencing red-green colour blindness.

But even among people who have what we consider "normal" vision, the distribution of our cones can vary widely. For example it's considered normal to have anywhere from a 1:1 ratio of red and green cones up to 16:1.

The cones in our eyes are as unique from person to person as our height or the shape of our nose, so while we can describe the physical properties of light very objectively, describing human vision is a bit murkier.

<!-- section: Shared languages of colour -->

<!-- slide: speaking-the-same-language -->
## Speaking the same language

But even if there's not one objective single way that humans see colour, we still need some shared system to describe it.

<!-- slide: colour-systems -->
## A painter's grammar

Here's one of my favourite attempts.

This system was developed by painter and art teacher Albert Munsell.

He developed a system of sorting colours by hue, value, and chroma.

His system was one of the first that accounts for the fact that different colours have different ranges, so each of the colours in his tree branch into different shapes.

This is the ancestor of our spiky friend OKLCH.

<!-- slide: the-abcs-of-cie-xyz -->
## A shared reference

But between the two world wars, scientists came together to find a way to measure colour perception more systemically.

Here's a simulation of an experiment they used.

On one side, we have a test colour.
On the other we have dials for three primary lights.

The test subject changes the mixture until the two sides match.

The data collected from experiments  like these helped establish the CIE's 1931 standard observer and XYZ colour measurement.

<!-- slide: the-abcs-of-cie-xyz-2 -->
## Coordinates and limits

From XYZ we can derive this chromaticity diagram, the horseshoe, which represents the average range of human colour vision.

This is a slice of the overall colour space that leaves out the darkness/lightness axis.

This is used across all sorts of industries from textile design, to paint colours, to electronic devices. Any other colour space is a subset of this one.

[Show the sRGB outline.]

Here's sRGB.

[Show the Display P3 outline.]

Here's Display P3.

Notice that the available range is different.

For the rest of the talk, keep two questions separate:

**How am I describing a colour?**

And **can the destination reproduce it?**

The coordinates give us an address. The gamut tells us whether that address is inside the available territory.

([w3.org](https://www.w3.org/TR/css-color-4/))

<!-- slide: srgb -->
## Instructions for a screen

RGB and hexadecimal colour notation are describing colour in essentially the same way, which is by describing the strength of each of three colour channels, red green and blue.

<!-- slide: srgb-2 -->
## Finally: why yellow and blue differ

You can see here we get red when we dial just the red channel to the top.

We can lighten the colour by adding green and red to mix together as white light.

Or we can get a darker shade by dimming the channel.

The closer the three channels are in value, the more desaturated the colour you will see.

And you can see yellow, which is generated by mixing yellow and red, is in this model the opposite of blue.

<!-- slide: gradient-rgb -->
## Who chose the middle?

So when you understand how this works, you can see why rgb colours do some of the weird things they do.

For example, a yellow to blue gradient might be the most disappointing one in the browser.

<!-- slide: hue-saturation-lies -->
## Same colours, different coordinates

Now let's have a look at HSL which approaches things a little differently.

Instead of directly describing RGB channels, HSL notation organizes colours into hue, saturation, and lightness. And this is what that looks like.

The closer you are to the equator, the more saturated your colour is. Lightness and darkness are arranged from top to bottom.

This system is really tidy and hue, saturation and lightness is easier to reason about than RGB channels, but you might already be thinking that this really simple shape is a bit of a red flag. we know that blue and yellow aren't perceptually the same lightness, so to achieve this shape the colour relationships are stretch and warped. I almost never reach for hsl.

<!-- slide: the-abcs-of-cie-xyz-3 -->
## The sRGB range

So first of all, HSL is a different model for describing the exact same colour range that RGB and hexadecimal colour notation is. There's no added rage, just the same colours arranged in a different way.

And because the colour relationships are still based on the properties of our screens, and now how colour is actually perceived, it doesn't wind up being as practical as we would hope it would.

<!-- slide: we-already-talked-about-this -->
## We already talked about this

Regardless of the notation, we're still left manually plucking colours with an eyedropper at the end of the day.

<!-- slide: gradient-paths -->
## Gradient paths: HSL

The one place that I might reach for HSL is gradients.

Instead of interpolating across three channels to create a gradient, HSL interpolates the shortest distance across our lovely little bicone, so instead of passing through grey, between blue and yellow we arc through teal and lime which depending on your application might be much more up your alley.

But there's a lot of room left for CSS to do colour a lot better.

<!-- section: Three decisions, better separated -->

<!-- slide: an-ok-color-space -->
## An OK colour space

Apparently pandemics are productive times for colour science.

This is Björn Ottosson, and in December 2020 he published a post called _A perceptual colour space for image processing_.

He wanted a useful separation between lightness, chroma, and hue, and better behaviour for operations like colour blending.

He called the result Oklab.

Because it was an OK Lab colour space.

Not Perfectlab.

OKLCH expresses that same system using lightness, chroma, and a hue angle.

<!-- slide: an-ok-color-space-3 -->
## Repeat the opening test

Here's the opening experiment again.

On this side, equal HSL lightness.

On this side, equal OKLCH lightness.

I've given each hue as much chroma as sRGB allows at this lightness, so nothing needs gamut mapping. We're testing the lightness relationship here—not which row can shout louder.

[Toggle the greyscale comparison.]

Notice how much steadier the relationship is.

That's what we wanted: changing hue without such a large, unintended change in how light the colours look.

Oklab was designed to make these properties behave more independently.

([bottosson.github.io](https://bottosson.github.io/posts/oklab/))

Now let's learn to ask for a colour.

<!-- slide: oklch-syntax -->
## Read—and change—one colour

```css
--base: oklch(0.7 0.15 250);
```

Three numbers.

Lightness. Chroma. Hue.

Lightness runs from zero to one for the usual black-to-white range.

Chroma starts at zero: neutral.

Hue is an angle around a wheel.

Two hundred and fifty degrees puts this colour in blue territory.

([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch))

[Move only H: 250 → 30.]

I like how light this is. I want a different hue.

Change H.

[Lower C: 0.15 → 0.06.]

Now I want it quieter.

Change C.

[Lower L: 0.70 → 0.45.]

Now darker.

Change L.

The important thing isn't memorising these numbers.

It's being able to separate three requests that often get bundled into “Can we tweak this?”

**Too dark? Too colourful? Wrong hue?**

Which one do we actually mean?

<!-- slide: an-ok-color-space-2 -->
## Read the strange shape

Now we can read the shape.

This is the Display P3 gamut plotted in OKLCH, with hue unwrapped across one axis.

[Indicate each axis.]

[Step 2]

Lightness.

[Step 3]

Chroma.

[Step 4]

Hue.

The shape shows the combinations inside that gamut.

And those uneven peaks tell us that the available chroma depends on where we are.

We don't have an identical range at every hue and lightness.

([bottosson.github.io](https://bottosson.github.io/posts/gamutclipping/))

Let's take one slice and see what that means.

<!-- slide: oklch-slices -->
## One hue, two remaining decisions

We've fixed the hue.

On this slice, lightness runs left to right. Chroma runs upwards.

[Trace along the neutral baseline.]

Down here, neutral colours from black to white.

[Point to a middle lightness and trace upwards.]

At this lightness, we can increase chroma until we reach the boundary.

Now change hue.

[Move the hue control.]

The boundary moves.

That is why “maximum chroma” isn't one number.

And why keeping chroma unchanged while making a colour darker can eventually take us outside the gamut.

([bottosson.github.io](https://bottosson.github.io/posts/gamutclipping/))

Remember Munsell's branches?

The unevenness is information.

<!-- slide: oklch-edge -->
## What happens at the edge?

[Increase chroma past the marked boundary.]

We can write coordinates for a colour the destination can't reproduce.

It has to be mapped into the available gamut.

So there's a difference between the colour we request and the colour we get.

([w3.org](https://www.w3.org/TR/css-color-4/))

In practice: watch the boundary while exploring.

If moving a control stops producing the change you expected, you may have reached the limits of the output—not the limits of the notation.

<!-- slide: the-contrast-ratio-problem -->
## Answer the practical problem

Now let's answer the other problem we started with.

Remember the text that became difficult to read when we changed hue?

[Each row holds its saturation or chroma and its two lightnesses constant across twelve hues. HSL: S 78%, L 68% and 33%. OKLCH: C 0.059, L 64% and 36%.]

[Indicate the ratios.]

Watch how little the ratios vary in this OKLCH example.

That's a more consistent starting point—not an accessibility guarantee.

These particular pairs are around three to one. Ordinary text needs at least four-and-a-half to one for WCAG AA; large text has a three-to-one threshold.

So we still check the actual foreground and background.

([w3.org](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))

So the workflow is:

Build the relationship.

Check the result.

Adjust.

**The point isn't to retire the contrast checker. It's to arrive at useful candidates with less guessing.**

<!-- slide: gradient-paths-2 -->
## Choose the journey

[Show the existing path comparison.]

In HSL or OKLCH, we can interpolate through hue angles instead.

We can choose which way around the wheel to travel.

In Oklab, we can take a different kind of route again. ([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-method))

<!-- slide: colours-between-colours -->
## Choose the journey

Same endpoints.

Different interpolation spaces.

[Indicate sRGB, HSL, then OKLCH.]

Here we interpolate RGB channels.

Here we travel through HSL hue angles.

Here we interpolate OKLCH lightness, chroma, and hue.

Different instructions. Different intermediate colours.

([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color-interpolation-method))

Here's where we choose that in CSS:

```css
background: linear-gradient(in oklch, blue, yellow);
```

For a hue-based space, we can also specify the direction around the hue wheel.

But start with this one practical experiment:

**Before adding extra colour stops to fix a gradient, try changing its interpolation space.**

Sometimes the missing ingredient isn't another colour.

It's another route.

<!-- slide: the-reddest-red -->
## More range is a separate benefit

One more distinction.

This sample is sRGB red. This one is Display P3 red.

If the display supports it, P3 can reproduce the more vivid red.

If the projector makes them look identical, the equipment has joined the educational programme.

OKLCH can describe colours outside sRGB, including colours available in P3.

But P3 gives us the extra range. OKLCH gives us another way to describe colours.

([w3.org](https://www.w3.org/TR/css-color-4/))

We can benefit from the controls even when we stay inside sRGB.

Now let's make something with them.

<!-- section: Art school, with CSS -->

<!-- slide: painters-in-css -->
## Art school speedrun

I spent years of my life, and borrowed tens of thousands of dollars, on art school.

Today, you get the highlights for the cost of your FITC ticket.

Painters make decisions about colour relationships by looking.

We're going to borrow some of those questions, then use our new controls to explore them in the browser.

Four lessons.

Then a crit.

I'm afraid the crit is compulsory.

<!-- slide: harmony-paintings -->
## Lesson one: choose the emphasis

[Step 1]

Here's Van Gogh's _The Night Café_.

Look at the reds and greens.

To me, this relationship feels tense. Almost argumentative.

[Step 2]

Now the Whistler.

Mostly blues and silvers. Then those small orange accents.

Imagine covering them.

[Point to the accents; allow looking time.]

The lesson isn't “add orange.”

It's that a small difference can organise a much larger quiet field.

So when we choose a colour relationship, the question isn't only “Do these go together?”

It's **“What should this relationship do?”**

Emphasis? Energy? Quiet? Discomfort?

Let's choose one deliberately.

<!-- slide: colour-harmonies-hsl -->
## Explore the relationship: HSL

[The wheel and swatches in HSL.]

[Step 2]

[OKLCH slides in beside it, with the same base hue and scheme.]

[Step 3]

[HSL exits left and The Scream fades in. The OKLCH wheel takes the sky orange, oklch(0.517 0.154 47), as its base, complementary: oklch(0.517 0.154 227). The whole wheel redraws at that lightness and chroma.]

[Step 4]

[Analogous: Van Gogh, Sunflowers. Base oklch(0.79 0.15 90), the yellow, with hues 30 degrees either side: nearly the whole painting sits between hue 60 and 120.]

[Step 5]

[Triadic: Matisse, Dance II. Base oklch(0.53 0.16 32), the dancers' red; the triad lands near the green hill and the blue sky.]

[Step 6]

[Split-complementary: Van Gogh, Café Terrace at Night. Base oklch(0.68 0.18 267), the sky blue; the splits land near the terrace orange and the awning yellow.]

[Step 7]

[Tetradic: Matisse, Woman with a Hat. Base oklch(0.6 0.107 183), the teal background; the other three land near the violet hat, the pinks and the ochre.]

<!-- slide: afterimage -->
## Your turn

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

Let’s experience one kind of colour opposition.

Look at the centre mark.

You don’t have to participate if you’d rather not.

[Hold the existing afterimage stimulus for its tested duration. Allow quiet looking time.]

Try to keep your eyes there.

[Switch.]

Notice what appears.

We’re not going to use that as a precision test of the hue wheel.

We’re just taking a moment to notice that colour relationships happen in a visual system—not only in a diagram.

<!-- slide: monet -->
## Lesson two: separate colour from lightness

This is Monet's _Impression, Sunrise_.

Look at the sun.

It glows.

Now make a prediction.

When I switch to greyscale, will it still look so brilliant?

[Pause. Toggle greyscale.]

It nearly disappears.

Margaret Livingstone uses this painting to discuss the sun's close luminance relationship with the surrounding sky.

([harvard.edu](https://news.harvard.edu/gazette/story/2015/10/art-that-lights-the-mind/))

[Restore colour.]

Our visual system processes colour and luminance differences differently. That helps explain how a colour can appear striking without a strong luminance edge.

The greyscale version hasn't preserved everything important about the image.

Monet didn't have a lightness slider.

He had to look.

<!-- slide: riley -->
## Choose vibration—or separation

This is my own stripe study, inspired by Op art.

[Step 1]

Here, the colours are close in lightness.

[Step 2]

Now we introduce a larger lightness difference.

[Allow the audience to compare.]

[Step 3]

Here's a starting relationship we can explore:

```css
--stripe-b:
  oklch(from var(--stripe-a) l c calc(h + 180));
```

Keep L and C. Change hue.

Then try separating L instead.

([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors))

The effect changes.

That gives us a creative control—not an instruction to make every colour pair behave this way.

A decorative field might benefit from instability.

Text usually needs a clear distinction.

Please don't make your checkout vibrate.

**Decide whether you want the colours to interact—or the information to separate.**

<!-- slide: titian -->
## Lesson three: decide what a dark should keep

Here's Titian's _Bacchus and Ariadne_.

Look at the depth of colour.

The National Gallery's technical study describes how glazing intensified colour in parts of this painting.

([nationalgallery.org.uk](https://www.nationalgallery.org.uk/research/publications/technical-bulletin/titian-s-bacchus-and-ariadne))

This isn't a lesson in simulating oil paint.

It's a question we can borrow:

**When I make a colour darker, what else do I want to change?**

“Darker” doesn't have to mean “less colourful.”

And it doesn't tell us whether the hue should move.

Let's separate those decisions.

<!-- slide: titian-2 -->
## Compare the choices

Here's our starting colour.

[Indicate the first row.]

First, a mixture towards black in sRGB.

[Indicate the second.]

Now, lower OKLCH lightness while retaining the specified chroma and hue.

```css
--dark:
  oklch(from var(--base) calc(l - 0.15) c h);
```

[Indicate the third.]

And here we make three explicit choices: lower lightness, reduce chroma, and shift hue.

```css
--dark:
  oklch(
    from var(--base)
    calc(l - 0.15)
    calc(c * 0.8)
    calc(h + 10)
  );
```

Relative colour syntax lets us express these decisions separately.

([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors))

Which result do we want?

That depends on the work.

For a button state, an illustration shadow, or a palette ramp, we can now describe the relationship instead of collecting unrelated values.

These numbers aren't a shadow recipe.

They're a way to make our choices visible—and repeatable.

<!-- slide: titian-3 -->
## Apply the ramp

[The forest, in nine colour layers plus the sun. Each layer takes one step of a ramp: --layer-1 is the nearest, darkest frame, --layer-9 the sky.]

[Step 2]

[Mix towards black in sRGB, from a blue base.]

[Step 3]

[Lower OKLCH L.]

[Step 4]

[Lower L, reduce C, shift H.]

[Step 5]

[The hue per step cranks to its maximum, 22.5 degrees: the hue turns 180 degrees from the sky to the nearest trees.]

[Step 6]

[Reveal: the sun rises from behind the hills, the sky's complement at the same OKLCH L and C, hue turned 180 degrees.]

[Step 7]

[The hue turns round the wheel, a full turn every 6 seconds. Sky, ramp and sun move together; the sun stays opposite the sky.]

<!-- slide: chance -->
## Lesson four: give chance a chance

[Jean Arp, _Constellation According to the Laws of Chance_ (c. 1930). In his earlier collages Arp dropped torn paper and glued the pieces where they fell.]

<!-- slide: random-hues -->
## Roll the dice

[One tetradic palette from a random base hue, four hues 90 degrees apart keyed to lightness, applied to the same picture in HSL and OKLCH. Click to roll again.]

[Each arrow press shows the next picture with new hues: American Gothic, the Whistler, Girl with a Pearl Earring, then Aldrin on the Moon. The dice button rolls again.]

<!-- slide: colour-is-relative -->
## Lesson five: colour is relative

[Title only.]

<!-- slide: albers -->
## The final crit

Every art school ends with a crit.

Ours is run by Josef Albers.

He wrote:

“In visual perception a color is almost never seen as it really is.”

([albersfoundation.org](https://www.albersfoundation.org/alberses/teaching/interaction-of-color))

[Step 1]

Do these squares look like the same colour?

Don't answer according to what you think the trick is.

Look.

[Allow several seconds.]

[Step 2]

They're the same.

Same declared colour. Same pixels.

I promise there are no conference-talk crimes in the source code.

Only the neighbours changed.

Now backwards.

[Step 3]

These are different colours.

But in these surroundings, they can look similar.

[Step 4]

Put them on the same ground—

—and there's the difference again.

<!-- section: One thing to try -->

<!-- section: A different way to carry colour -->

<!-- slide: pigments-from-the-earth -->
## Before the number

I want to finish a long way from the browser.

These are the cave paintings at Lascaux.

Colour had to be found in physical materials, prepared, and brought to the surface.

([culture.gouv.fr](https://archeologie.culture.gouv.fr/lascaux/en/raw-materials))

Think about that as a creative constraint.

Not simply “Which colour do I want?”

**“Which colour can I get?”**

<!-- slide: pigments-from-the-earth-2 -->
## Pigments from the earth

These paintings are at least 17,000 years old. Watch the images change: Egyptian portraits, manuscripts, then modern paintings. The same earth pigments keep showing up.

<!-- slide: the-medium-is-the-revolution -->
## The medium changes the process

Paint is pigment carried in a medium.

Change the medium, and you change how it behaves in your hands.

Egg tempera dries quickly and lends itself to fine, deliberate work.

([npg.org.uk](https://www.npg.org.uk/collections/explore/glossary-of-art-terms/tempera))

[Look at the painting.]

The point isn't that painters lacked ambition.

They were making decisions within the working properties of their materials.

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

<!-- slide: the-medium-is-the-revolution-2 -->
## Another way to work

[Show the Leonardo. Let the audience look.]

Oil gave painters different working properties, including opportunities for blending and building transparent layers.

The same pigments in different binders can produce very different effects.

([nationalgallery.org.uk](https://www.nationalgallery.org.uk/behind-the-scenes/making-colour))

Look at the transitions in the face. The modelling of the hand.

This isn't a controlled comparison, or a ladder from bad painting to good painting.

It's a reminder that making a different process available can change which ideas become practical.

That's the parallel I want to borrow.

Today we held lightness steady while exploring hue.

We changed a whole colour family together.

We chose the route through a gradient.

Not just different ways to write down a result.

**Different ways to arrive at one.**

<!-- slide: 45finale -->
## Look again

[Step 1]

Here's our strange little friend again.

Same shape.

But I hope it looks different now.

You can read its coordinates.

You know what its boundaries mean.

And you know why no coordinate can describe everything about the experience of seeing colour.

What excites me isn't only the possibility of a more vivid red.

It's getting an idea a little further before the tool interrupts.

Being able to say:

Keep this relationship.

Change that one.

What happens if I try this?

And then having enough room left to notice something unexpected.

So take one thing you already make.

Choose something to hold steady.

Give something else permission to change.

Then look carefully.

[Step 2]

**What could you make from there?**

<!-- slide: thank-you -->
## Thank you

Thank you.

[Pause. Let the ending land.]

[Hiring P.S., held until confirmed: "And a small postscript: we're hiring. If this is the sort of work you'd like to do, come find me afterwards."]

<!-- section: Staging area -->

<!-- slide: ultramarine -->
## A colour you had to acquire

Natural ultramarine was made from lapis lazuli.

Think about that as a creative constraint. Before that blue could become a decision in a painting, someone had to acquire and prepare the material.

Now think about how casually we type a number.

That's an extraordinary freedom.

But getting more colours isn't the only way a tool can change what we make.

<!-- slide: richter -->
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

<!-- slide: kelly-code -->
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

<!-- slide: class-dismissed -->
## Better tools for judgment

The numbers let us specify and repeat a colour.

They don't tell us everything about how it will look beside its neighbours.

That's why we check the actual composition, not just a palette of isolated squares.

Albers made those changing contextual relationships central to learning colour.

([albersfoundation.org](https://www.albersfoundation.org/alberses/teaching/interaction-of-color))

**Better numbers don't replace judgment. They give judgment better tools.**

<!-- slide: colour-harmonies -->
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

<!-- slide: monday -->
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

<!-- slide: colour-harmonies-code -->
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

<!-- slide: let-s-get-physical-2 -->
## Let's get physical

During our pandemic in 2020, we made sourdough and Dalgona coffee. On the other hand, Isaac Newton, who didn't have the Internet or Zoom calls, spent the next 18 months inventing calculus, planting the seed of a single law of gravitation, and reshaping the science of colour.

<!-- slide: let-s-get-physical-3 -->
## Let's get physical

You can tell he hadn’t yet hit his Saturn return when you consider some of his more questionable experiments.

<!-- slide: good-vibrations -->
## Good vibrations

James Clerk Maxwell's work on electromagnetism showed that visible light is part of a much larger spectrum. Your favourite physicist's favourite physicist, and that's his introduction.

<!-- slide: good-vibrations-2 -->
## Good vibrations

He seems to have been a humble guy. There's documentation of him referring to "another theory of electricity, which I prefer". That's sort of like if Dorothy described the plot of the Wizard of Oz as "a blustery day".

What he was describing was his Unified Theory of Electromagnetism. In fact, he accurately predicted something later confirmed: light is electromagnetic radiation.

<!-- slide: good-vibrations-4 -->
## Good vibrations

Within the visible range, the hue produced by a particular wavelength is determined by its frequency, which is how many times the wave oscillates per second.

The wave here is slowed down so we can see it. Higher frequency means shorter wavelength, toward the blue end of this visible range.

<!-- slide: the-biology-of-colour-2 -->
## The biology of colour

Here's one way our cones might be distributed. You're welcome for not showing a medical diagram. I couldn't find one that didn't give me the heebie-jeebies.

Short, or blue, cones are only a small part of the picture. And the mix of medium and long cones varies between people with normal colour vision. Even before colour blindness, we don't all sample the light in quite the same way.

<!-- slide: the-x-factor -->
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

<!-- slide: the-x-factor-2 -->
## The X Factor

And if, like me, you're a member of the double-x chromosome coven, it gets even more interesting.

In fact, some studies estimate that 12% of people with two X chromosomes carry a genetic variant linked to a fourth cone type, making them potential tetrachromats.

But it's surprisingly difficult to confirm if they actually see more colours. For one thing, our brains are wired for three cones. The extra input may have nowhere to go and simply be thrown away.

But even if a tetrachromat really does experience colours the rest of us can’t see, describing them is a different challenge.

Think about how you would explain yellow to someone who has never seen it. Now imagine a world where you’re the _only_ person you've ever met who can see yellow. How would you explain it? What could someone say to to you to make you realize they're not seeing something that you do?

<!-- slide: think-pink -->
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

<!-- slide: oklch-controls -->
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

<!-- slide: srgb-3 -->
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

<!-- slide: ultramarine-2 -->
## ultramarine

At that time prices and origins of different pigments were so varied and meaningful that how much of which pigment would be used in which way in an image was literally written into artists' contracts.

Commissioning a religious painting with ultramarine was a legible twofold signal to every person who walked into a church and saw it: one, of The Virgin Mary's importance, cloaked in the rarest and most expensive colour; and two, of the patron's wealth and devotion.

The colour meant something because acquiring it cost so much.
