# Custom icons

Custom icons mean icons designed and provided by Replant World itself.

## Development notes

If an icon has a direct counterpart in Material Symbols, give it the same name it has in Material Symbols.

How to convert from original (big and heavy) pngs:

- add 10% padding using, for example, GIMP. I.e. if icon is 1000x1000, then it should have 100px on each side, resulting in new 1200x1200 image,
- resize to 600x600 OxyPNG using https://squoosh.app/,
- convert to SVG using https://svgtrace.com/png-to-svg,
- create React component from the svg.
