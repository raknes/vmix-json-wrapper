# XML Parser Comparison for Node.js

This document compares XML parsing libraries for JavaScript/Node.js to justify the choice of `fast-xml-parser` in this project.

## Recommendation

**`fast-xml-parser` is the recommended choice** for vmix-json-wrapper based on performance, features, and ecosystem support.

## Library Comparison

### Download Statistics (Weekly)

| Library | Weekly Downloads | GitHub Stars |
|---------|------------------|--------------|
| fast-xml-parser | 38,261,085 | 2,886 |
| xml2js | 23,615,660 | 4,959 |
| xml-js | 2,721,868 | 1,327 |
| xmldom | 1,448,812 | 422 |

### Performance Benchmarks

**Small documents (~291 bytes):**
| Library | Operations/sec | Notes |
|---------|----------------|-------|
| @rgrove/parse-xml | 253,082 | Fastest for small docs |
| fast-xml-parser | 127,232 | 49% slower on small docs |
| libxmljs2 | 68,709 | Requires native deps |

**Medium/Large documents:**
- `fast-xml-parser` excels with files up to 100MB
- Uses streaming approach to minimize memory usage
- Outperforms xml2js by 10-15x on larger payloads

### Feature Comparison

| Feature | fast-xml-parser | xml2js | xml-js | @rgrove/parse-xml |
|---------|-----------------|--------|--------|-------------------|
| Performance | Excellent | Good | Good | Excellent (small) |
| Bundle Size | 26KB | ~50KB | ~30KB | ~10KB |
| TypeScript | Built-in | @types | @types | Built-in |
| Zero Native Deps | Yes | Yes | Yes | Yes |
| XML Entities | Yes | Partial | Partial | Yes |
| HTML Entities | Yes | No | No | No |
| DOCTYPE Support | Yes | Limited | Limited | Yes |
| Bidirectional | Yes | Yes | Yes | No |
| Customization | High | Very High | Medium | Low |

### Why fast-xml-parser for vmix-json-wrapper

1. **Entity Processing**: vMix XML responses contain HTML entities that need decoding - fast-xml-parser handles this natively
2. **Value Processors**: Custom boolean conversion and type coercion via `tagValueProcessor` and `attributeValueProcessor`
3. **Performance**: Handles vMix state XML efficiently (typically small-to-medium sized)
4. **Zero Dependencies**: Pure JavaScript, no native compilation required
5. **Active Maintenance**: Regular updates and large community

### Alternatives

| Library | When to Consider |
|---------|------------------|
| @rgrove/parse-xml | Maximum speed for tiny payloads (<1KB), minimal API surface |
| txml | Claims 2-3x faster than fast-xml-parser, ultra-minimal |
| xml2js | Extensive customization needed, complex XML structures |
| libxmljs2 | Maximum speed required, native deps acceptable |
| xmldom | DOM-like API needed for traversal/manipulation |

## Sources

- [npm-compare: XML Parsers](https://npm-compare.com/fast-xml-parser,xml-js,xml2js,xmldom)
- [Stack Overflow: Best Node Module for XML Parsing](https://stackoverflow.com/questions/14890655/the-best-node-module-for-xml-parsing)
- [fast-xml-parser on npm](https://www.npmjs.com/package/fast-xml-parser)
- [GitHub: @rgrove/parse-xml](https://github.com/rgrove/parse-xml)
- [Best of JS: fast-xml-parser](https://bestofjs.org/projects/fast-xml-parser)
- [How the Fastest XML Parser is Built](https://tnickel.de/2020/08/30/2020-08-how-the-fastest-xml-parser-is-build/)

---

*Last updated: November 2025*
