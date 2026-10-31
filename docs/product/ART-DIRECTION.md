# Art direction: how Ash builds atmosphere

Research 2026-10-31, after the PO asked for higher-quality style and atmosphere. Style stays what the PO asked for: "simple shapes, thought in colours".

## What the sources say
| Principle | Source | Status |
|---|---|---|
| Bold colours in distinct layers, each adding depth and distance; flat shapes with strong silhouettes | Jane Ng on Firewatch, [GDC 2015 report](https://www.thumbsticks.com/gdc-2015-the-art-of-firewatch) | Quoted |
| The sky determines the biggest chunk of colour; a colour script tied to key moments kept the look consistent | Same report (the second is the author's account) | Reported |
| Distance makes things lighter, cooler and less detailed; the foreground is warmer and stronger; the sky lightens at the horizon | [Julia Bausenhardt](https://juliabausenhardt.com/fixing-flat-landscape-sketches-understanding-atmospheric-perspective/), a watercolour guide | Stated |
| Reduce elements to their simplest components and leave gaps for the viewer | Harry Nesbitt on Alto's Odyssey, [Pocket Gamer](https://www.pocketgamer.com/altos-odyssey/interview-a-closer-look-at-team-altos-stunning-sequel-altos-odyssey) | Reported |
| About 5-7 tone levels read as graphic poster bands; 12 or more read as nearly smooth | [Riso Dither tool page](https://www.aidesigner.ai/backgrounds/dither), vendor documentation | Weak source, test by eye |
| A vector gradient has no dither of its own, so grain usually comes from a raster texture | [Adobe community thread](https://community.adobe.com/questions-652/how-to-dither-a-gradient-banding-problem-761402) | Forum, test by eye |
| `Rectangle` has vertical gradients, and antialiasing has a cost | [Qt 5.11 docs](https://doc.qt.io/qt-5.11/qml-qtquick-rectangle.html) | Primary |

Warm light with cool shadows and long cast shadows at a low sun are common painting practice, but no source above states them. They are the tech lead's judgement, checked by eye.

## What Ash takes from this
1. **Colour script:** author complete colour moments (night, first light, dawn, morning, midday, golden hour, sunset, dusk) instead of deriving land and family from the sky by formula.
2. **Depth through layers:** distant land is lighter, cooler and closer to the sky colour; near land is warmer and stronger.
3. **One light source:** the sun tints the sky around it and the land and family, and casts one simple shadow.
4. **Restraint:** no decoration that doesn't carry light or depth.

## Limits
Colour numbers and tests can rule out mistakes, but can't prove beauty. The PO's eye decides.
