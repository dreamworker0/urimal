#!/usr/bin/env node
import {
  detectFormat,
  detectZipFormat,
  require_lib
} from "./chunk-A65263O4.js";
import {
  HEADING_RATIO_H1,
  HEADING_RATIO_H2,
  HEADING_RATIO_H3,
  KordocError,
  MAX_COLS,
  MAX_ROWS,
  blocksToMarkdown,
  buildTable,
  classifyError,
  convertTableToText,
  flattenLayoutTables,
  isPathTraversal,
  precheckZipSize,
  sanitizeHref,
  stripDtd,
  toArrayBuffer
} from "./chunk-2ZBLI3QU.js";
import {
  parsePageRange
} from "./chunk-MOL7MDBG.js";
import {
  __commonJS,
  __toESM
} from "./chunk-SEGVTWSK.js";

// node_modules/@xmldom/xmldom/lib/conventions.js
var require_conventions = __commonJS({
  "node_modules/@xmldom/xmldom/lib/conventions.js"(exports) {
    "use strict";
    function find(list, predicate, ac) {
      if (ac === void 0) {
        ac = Array.prototype;
      }
      if (list && typeof ac.find === "function") {
        return ac.find.call(list, predicate);
      }
      for (var i = 0; i < list.length; i++) {
        if (hasOwn(list, i)) {
          var item = list[i];
          if (predicate.call(void 0, item, i, list)) {
            return item;
          }
        }
      }
    }
    function freeze(object, oc) {
      if (oc === void 0) {
        oc = Object;
      }
      if (oc && typeof oc.getOwnPropertyDescriptors === "function") {
        object = oc.create(null, oc.getOwnPropertyDescriptors(object));
      }
      return oc && typeof oc.freeze === "function" ? oc.freeze(object) : object;
    }
    function hasOwn(object, key) {
      return Object.prototype.hasOwnProperty.call(object, key);
    }
    function assign(target, source) {
      if (target === null || typeof target !== "object") {
        throw new TypeError("target is not an object");
      }
      for (var key in source) {
        if (hasOwn(source, key)) {
          target[key] = source[key];
        }
      }
      return target;
    }
    var HTML_BOOLEAN_ATTRIBUTES = freeze({
      allowfullscreen: true,
      async: true,
      autofocus: true,
      autoplay: true,
      checked: true,
      controls: true,
      default: true,
      defer: true,
      disabled: true,
      formnovalidate: true,
      hidden: true,
      ismap: true,
      itemscope: true,
      loop: true,
      multiple: true,
      muted: true,
      nomodule: true,
      novalidate: true,
      open: true,
      playsinline: true,
      readonly: true,
      required: true,
      reversed: true,
      selected: true
    });
    function isHTMLBooleanAttribute(name) {
      return hasOwn(HTML_BOOLEAN_ATTRIBUTES, name.toLowerCase());
    }
    var HTML_VOID_ELEMENTS = freeze({
      area: true,
      base: true,
      br: true,
      col: true,
      embed: true,
      hr: true,
      img: true,
      input: true,
      link: true,
      meta: true,
      param: true,
      source: true,
      track: true,
      wbr: true
    });
    function isHTMLVoidElement(tagName) {
      return hasOwn(HTML_VOID_ELEMENTS, tagName.toLowerCase());
    }
    var HTML_RAW_TEXT_ELEMENTS = freeze({
      script: false,
      style: false,
      textarea: true,
      title: true
    });
    function isHTMLRawTextElement(tagName) {
      var key = tagName.toLowerCase();
      return hasOwn(HTML_RAW_TEXT_ELEMENTS, key) && !HTML_RAW_TEXT_ELEMENTS[key];
    }
    function isHTMLEscapableRawTextElement(tagName) {
      var key = tagName.toLowerCase();
      return hasOwn(HTML_RAW_TEXT_ELEMENTS, key) && HTML_RAW_TEXT_ELEMENTS[key];
    }
    function isHTMLMimeType(mimeType) {
      return mimeType === MIME_TYPE.HTML;
    }
    function hasDefaultHTMLNamespace(mimeType) {
      return isHTMLMimeType(mimeType) || mimeType === MIME_TYPE.XML_XHTML_APPLICATION;
    }
    var MIME_TYPE = freeze({
      /**
       * `text/html`, the only mime type that triggers treating an XML document as HTML.
       *
       * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
       * @see https://en.wikipedia.org/wiki/HTML Wikipedia
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
       * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
       *      WHATWG HTML Spec
       */
      HTML: "text/html",
      /**
       * `application/xml`, the standard mime type for XML documents.
       *
       * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType
       *      registration
       * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
       * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
       */
      XML_APPLICATION: "application/xml",
      /**
       * `text/xml`, an alias for `application/xml`.
       *
       * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
       * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
       * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
       */
      XML_TEXT: "text/xml",
      /**
       * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
       * but is parsed as an XML document.
       *
       * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType
       *      registration
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
       * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
       */
      XML_XHTML_APPLICATION: "application/xhtml+xml",
      /**
       * `image/svg+xml`,
       *
       * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
       * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
       * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
       */
      XML_SVG_IMAGE: "image/svg+xml"
    });
    var _MIME_TYPES = Object.keys(MIME_TYPE).map(function(key) {
      return MIME_TYPE[key];
    });
    function isValidMimeType(mimeType) {
      return _MIME_TYPES.indexOf(mimeType) > -1;
    }
    var NAMESPACE = freeze({
      /**
       * The XHTML namespace.
       *
       * @see http://www.w3.org/1999/xhtml
       */
      HTML: "http://www.w3.org/1999/xhtml",
      /**
       * The SVG namespace.
       *
       * @see http://www.w3.org/2000/svg
       */
      SVG: "http://www.w3.org/2000/svg",
      /**
       * The `xml:` namespace.
       *
       * @see http://www.w3.org/XML/1998/namespace
       */
      XML: "http://www.w3.org/XML/1998/namespace",
      /**
       * The `xmlns:` namespace.
       *
       * @see https://www.w3.org/2000/xmlns/
       */
      XMLNS: "http://www.w3.org/2000/xmlns/"
    });
    exports.assign = assign;
    exports.find = find;
    exports.freeze = freeze;
    exports.HTML_BOOLEAN_ATTRIBUTES = HTML_BOOLEAN_ATTRIBUTES;
    exports.HTML_RAW_TEXT_ELEMENTS = HTML_RAW_TEXT_ELEMENTS;
    exports.HTML_VOID_ELEMENTS = HTML_VOID_ELEMENTS;
    exports.hasDefaultHTMLNamespace = hasDefaultHTMLNamespace;
    exports.hasOwn = hasOwn;
    exports.isHTMLBooleanAttribute = isHTMLBooleanAttribute;
    exports.isHTMLRawTextElement = isHTMLRawTextElement;
    exports.isHTMLEscapableRawTextElement = isHTMLEscapableRawTextElement;
    exports.isHTMLMimeType = isHTMLMimeType;
    exports.isHTMLVoidElement = isHTMLVoidElement;
    exports.isValidMimeType = isValidMimeType;
    exports.MIME_TYPE = MIME_TYPE;
    exports.NAMESPACE = NAMESPACE;
  }
});

// node_modules/@xmldom/xmldom/lib/errors.js
var require_errors = __commonJS({
  "node_modules/@xmldom/xmldom/lib/errors.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    function extendError(constructor, writableName) {
      constructor.prototype = Object.create(Error.prototype, {
        constructor: { value: constructor },
        name: { value: constructor.name, enumerable: true, writable: writableName }
      });
    }
    var DOMExceptionName = conventions.freeze({
      /**
       * the default value as defined by the spec
       */
      Error: "Error",
      /**
       * @deprecated
       * Use RangeError instead.
       */
      IndexSizeError: "IndexSizeError",
      /**
       * @deprecated
       * Just to match the related static code, not part of the spec.
       */
      DomstringSizeError: "DomstringSizeError",
      HierarchyRequestError: "HierarchyRequestError",
      WrongDocumentError: "WrongDocumentError",
      InvalidCharacterError: "InvalidCharacterError",
      /**
       * @deprecated
       * Just to match the related static code, not part of the spec.
       */
      NoDataAllowedError: "NoDataAllowedError",
      NoModificationAllowedError: "NoModificationAllowedError",
      NotFoundError: "NotFoundError",
      NotSupportedError: "NotSupportedError",
      InUseAttributeError: "InUseAttributeError",
      InvalidStateError: "InvalidStateError",
      SyntaxError: "SyntaxError",
      InvalidModificationError: "InvalidModificationError",
      NamespaceError: "NamespaceError",
      /**
       * @deprecated
       * Use TypeError for invalid arguments,
       * "NotSupportedError" DOMException for unsupported operations,
       * and "NotAllowedError" DOMException for denied requests instead.
       */
      InvalidAccessError: "InvalidAccessError",
      /**
       * @deprecated
       * Just to match the related static code, not part of the spec.
       */
      ValidationError: "ValidationError",
      /**
       * @deprecated
       * Use TypeError instead.
       */
      TypeMismatchError: "TypeMismatchError",
      SecurityError: "SecurityError",
      NetworkError: "NetworkError",
      AbortError: "AbortError",
      /**
       * @deprecated
       * Just to match the related static code, not part of the spec.
       */
      URLMismatchError: "URLMismatchError",
      QuotaExceededError: "QuotaExceededError",
      TimeoutError: "TimeoutError",
      InvalidNodeTypeError: "InvalidNodeTypeError",
      DataCloneError: "DataCloneError",
      EncodingError: "EncodingError",
      NotReadableError: "NotReadableError",
      UnknownError: "UnknownError",
      ConstraintError: "ConstraintError",
      DataError: "DataError",
      TransactionInactiveError: "TransactionInactiveError",
      ReadOnlyError: "ReadOnlyError",
      VersionError: "VersionError",
      OperationError: "OperationError",
      NotAllowedError: "NotAllowedError",
      OptOutError: "OptOutError"
    });
    var DOMExceptionNames = Object.keys(DOMExceptionName);
    function isValidDomExceptionCode(value) {
      return typeof value === "number" && value >= 1 && value <= 25;
    }
    function endsWithError(value) {
      return typeof value === "string" && value.substring(value.length - DOMExceptionName.Error.length) === DOMExceptionName.Error;
    }
    function DOMException(messageOrCode, nameOrMessage) {
      if (isValidDomExceptionCode(messageOrCode)) {
        this.name = DOMExceptionNames[messageOrCode];
        this.message = nameOrMessage || "";
      } else {
        this.message = messageOrCode;
        this.name = endsWithError(nameOrMessage) ? nameOrMessage : DOMExceptionName.Error;
      }
      if (Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
    }
    extendError(DOMException, true);
    Object.defineProperties(DOMException.prototype, {
      code: {
        enumerable: true,
        get: function() {
          var code = DOMExceptionNames.indexOf(this.name);
          if (isValidDomExceptionCode(code)) return code;
          return 0;
        }
      }
    });
    var ExceptionCode = {
      INDEX_SIZE_ERR: 1,
      DOMSTRING_SIZE_ERR: 2,
      HIERARCHY_REQUEST_ERR: 3,
      WRONG_DOCUMENT_ERR: 4,
      INVALID_CHARACTER_ERR: 5,
      NO_DATA_ALLOWED_ERR: 6,
      NO_MODIFICATION_ALLOWED_ERR: 7,
      NOT_FOUND_ERR: 8,
      NOT_SUPPORTED_ERR: 9,
      INUSE_ATTRIBUTE_ERR: 10,
      INVALID_STATE_ERR: 11,
      SYNTAX_ERR: 12,
      INVALID_MODIFICATION_ERR: 13,
      NAMESPACE_ERR: 14,
      INVALID_ACCESS_ERR: 15,
      VALIDATION_ERR: 16,
      TYPE_MISMATCH_ERR: 17,
      SECURITY_ERR: 18,
      NETWORK_ERR: 19,
      ABORT_ERR: 20,
      URL_MISMATCH_ERR: 21,
      QUOTA_EXCEEDED_ERR: 22,
      TIMEOUT_ERR: 23,
      INVALID_NODE_TYPE_ERR: 24,
      DATA_CLONE_ERR: 25
    };
    var entries = Object.entries(ExceptionCode);
    for (i = 0; i < entries.length; i++) {
      key = entries[i][0];
      DOMException[key] = entries[i][1];
    }
    var key;
    var i;
    function ParseError(message, locator) {
      this.message = message;
      this.locator = locator;
      if (Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
    }
    extendError(ParseError);
    exports.DOMException = DOMException;
    exports.DOMExceptionName = DOMExceptionName;
    exports.ExceptionCode = ExceptionCode;
    exports.ParseError = ParseError;
  }
});

// node_modules/@xmldom/xmldom/lib/grammar.js
var require_grammar = __commonJS({
  "node_modules/@xmldom/xmldom/lib/grammar.js"(exports) {
    "use strict";
    function detectUnicodeSupport(RegExpImpl) {
      try {
        if (typeof RegExpImpl !== "function") {
          RegExpImpl = RegExp;
        }
        var match = new RegExpImpl("\u{1D306}", "u").exec("\u{1D306}");
        return !!match && match[0].length === 2;
      } catch (error) {
      }
      return false;
    }
    var UNICODE_SUPPORT = detectUnicodeSupport();
    function chars(regexp) {
      if (regexp.source[0] !== "[") {
        throw new Error(regexp + " can not be used with chars");
      }
      return regexp.source.slice(1, regexp.source.lastIndexOf("]"));
    }
    function chars_without(regexp, search) {
      if (regexp.source[0] !== "[") {
        throw new Error("/" + regexp.source + "/ can not be used with chars_without");
      }
      if (!search || typeof search !== "string") {
        throw new Error(JSON.stringify(search) + " is not a valid search");
      }
      if (regexp.source.indexOf(search) === -1) {
        throw new Error('"' + search + '" is not is /' + regexp.source + "/");
      }
      if (search === "-" && regexp.source.indexOf(search) !== 1) {
        throw new Error('"' + search + '" is not at the first postion of /' + regexp.source + "/");
      }
      return new RegExp(regexp.source.replace(search, ""), UNICODE_SUPPORT ? "u" : "");
    }
    function reg(args) {
      var self = this;
      return new RegExp(
        Array.prototype.slice.call(arguments).map(function(part) {
          var isStr = typeof part === "string";
          if (isStr && self === void 0 && part === "|") {
            throw new Error("use regg instead of reg to wrap expressions with `|`!");
          }
          return isStr ? part : part.source;
        }).join(""),
        UNICODE_SUPPORT ? "mu" : "m"
      );
    }
    function regg(args) {
      if (arguments.length === 0) {
        throw new Error("no parameters provided");
      }
      return reg.apply(regg, ["(?:"].concat(Array.prototype.slice.call(arguments), [")"]));
    }
    var UNICODE_REPLACEMENT_CHARACTER = "\uFFFD";
    var Char = /[-\x09\x0A\x0D\x20-\x2C\x2E-\uD7FF\uE000-\uFFFD]/;
    if (UNICODE_SUPPORT) {
      Char = reg("[", chars(Char), "\\u{10000}-\\u{10FFFF}", "]");
    }
    var _SChar = /[\x20\x09\x0D\x0A]/;
    var SChar_s = chars(_SChar);
    var S = reg(_SChar, "+");
    var S_OPT = reg(_SChar, "*");
    var NameStartChar = /[:_a-zA-Z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    if (UNICODE_SUPPORT) {
      NameStartChar = reg("[", chars(NameStartChar), "\\u{10000}-\\u{10FFFF}", "]");
    }
    var NameStartChar_s = chars(NameStartChar);
    var NameChar = reg("[", NameStartChar_s, chars(/[-.0-9\xB7]/), chars(/[\u0300-\u036F\u203F-\u2040]/), "]");
    var Name = reg(NameStartChar, NameChar, "*");
    var Nmtoken = reg(NameChar, "+");
    var EntityRef = reg("&", Name, ";");
    var CharRef = regg(/&#[0-9]+;|&#x[0-9a-fA-F]+;/);
    var Reference = regg(EntityRef, "|", CharRef);
    var PEReference = reg("%", Name, ";");
    var EntityValue = regg(
      reg('"', regg(/[^%&"]/, "|", PEReference, "|", Reference), "*", '"'),
      "|",
      reg("'", regg(/[^%&']/, "|", PEReference, "|", Reference), "*", "'")
    );
    var AttValue = regg('"', regg(/[^<&"]/, "|", Reference), "*", '"', "|", "'", regg(/[^<&']/, "|", Reference), "*", "'");
    var NCNameStartChar = chars_without(NameStartChar, ":");
    var NCNameChar = chars_without(NameChar, ":");
    var NCName = reg(NCNameStartChar, NCNameChar, "*");
    var QName = reg(NCName, regg(":", NCName), "?");
    var QName_exact = reg("^", QName, "$");
    var QName_group = reg("(", QName, ")");
    var SystemLiteral = regg(/"[^"]*"|'[^']*'/);
    var PI = reg(/^<\?/, "(", Name, ")", regg(S, "(", Char, "*?)"), "?", /\?>/);
    var PubidChar = /[\x20\x0D\x0Aa-zA-Z0-9-'()+,./:=?;!*#@$_%]/;
    var PubidLiteral = regg('"', PubidChar, '*"', "|", "'", chars_without(PubidChar, "'"), "*'");
    var COMMENT_START = "<!--";
    var COMMENT_END = "-->";
    var Comment = reg(COMMENT_START, regg(chars_without(Char, "-"), "|", reg("-", chars_without(Char, "-"))), "*", COMMENT_END);
    var PCDATA = "#PCDATA";
    var Mixed = regg(
      reg(/\(/, S_OPT, PCDATA, regg(S_OPT, /\|/, S_OPT, QName), "*", S_OPT, /\)\*/),
      "|",
      reg(/\(/, S_OPT, PCDATA, S_OPT, /\)/)
    );
    var _children_quantity = /[?*+]?/;
    var children = reg(
      /\([^>]+\)/,
      _children_quantity
      /*regg(choice, '|', seq), _children_quantity*/
    );
    var contentspec = regg("EMPTY", "|", "ANY", "|", Mixed, "|", children);
    var ELEMENTDECL_START = "<!ELEMENT";
    var elementdecl = reg(ELEMENTDECL_START, S, regg(QName, "|", PEReference), S, regg(contentspec, "|", PEReference), S_OPT, ">");
    var NotationType = reg("NOTATION", S, /\(/, S_OPT, Name, regg(S_OPT, /\|/, S_OPT, Name), "*", S_OPT, /\)/);
    var Enumeration = reg(/\(/, S_OPT, Nmtoken, regg(S_OPT, /\|/, S_OPT, Nmtoken), "*", S_OPT, /\)/);
    var EnumeratedType = regg(NotationType, "|", Enumeration);
    var AttType = regg(/CDATA|ID|IDREF|IDREFS|ENTITY|ENTITIES|NMTOKEN|NMTOKENS/, "|", EnumeratedType);
    var DefaultDecl = regg(/#REQUIRED|#IMPLIED/, "|", regg(regg("#FIXED", S), "?", AttValue));
    var AttDef = regg(S, Name, S, AttType, S, DefaultDecl);
    var ATTLIST_DECL_START = "<!ATTLIST";
    var AttlistDecl = reg(ATTLIST_DECL_START, S, Name, AttDef, "*", S_OPT, ">");
    var ABOUT_LEGACY_COMPAT = "about:legacy-compat";
    var ABOUT_LEGACY_COMPAT_SystemLiteral = regg('"' + ABOUT_LEGACY_COMPAT + '"', "|", "'" + ABOUT_LEGACY_COMPAT + "'");
    var SYSTEM = "SYSTEM";
    var PUBLIC = "PUBLIC";
    var ExternalID = regg(regg(SYSTEM, S, SystemLiteral), "|", regg(PUBLIC, S, PubidLiteral, S, SystemLiteral));
    var ExternalID_match = reg(
      "^",
      regg(
        regg(SYSTEM, S, "(?<SystemLiteralOnly>", SystemLiteral, ")"),
        "|",
        regg(PUBLIC, S, "(?<PubidLiteral>", PubidLiteral, ")", S, "(?<SystemLiteral>", SystemLiteral, ")")
      )
    );
    var NDataDecl = regg(S, "NDATA", S, Name);
    var EntityDef = regg(EntityValue, "|", regg(ExternalID, NDataDecl, "?"));
    var ENTITY_DECL_START = "<!ENTITY";
    var GEDecl = reg(ENTITY_DECL_START, S, Name, S, EntityDef, S_OPT, ">");
    var PEDef = regg(EntityValue, "|", ExternalID);
    var PEDecl = reg(ENTITY_DECL_START, S, "%", S, Name, S, PEDef, S_OPT, ">");
    var EntityDecl = regg(GEDecl, "|", PEDecl);
    var PublicID = reg(PUBLIC, S, PubidLiteral);
    var NotationDecl = reg("<!NOTATION", S, Name, S, regg(ExternalID, "|", PublicID), S_OPT, ">");
    var Eq = reg(S_OPT, "=", S_OPT);
    var VersionNum = /1[.]\d+/;
    var VersionInfo = reg(S, "version", Eq, regg("'", VersionNum, "'", "|", '"', VersionNum, '"'));
    var EncName = /[A-Za-z][-A-Za-z0-9._]*/;
    var EncodingDecl = regg(S, "encoding", Eq, regg('"', EncName, '"', "|", "'", EncName, "'"));
    var SDDecl = regg(S, "standalone", Eq, regg("'", regg("yes", "|", "no"), "'", "|", '"', regg("yes", "|", "no"), '"'));
    var XMLDecl = reg(/^<\?xml/, VersionInfo, EncodingDecl, "?", SDDecl, "?", S_OPT, /\?>/);
    var DOCTYPE_DECL_START = "<!DOCTYPE";
    var CDATA_START = "<![CDATA[";
    var CDATA_END = "]]>";
    var CDStart = /<!\[CDATA\[/;
    var CDEnd = /\]\]>/;
    var CData = reg(Char, "*?", CDEnd);
    var CDSect = reg(CDStart, CData);
    exports.chars = chars;
    exports.chars_without = chars_without;
    exports.detectUnicodeSupport = detectUnicodeSupport;
    exports.reg = reg;
    exports.regg = regg;
    exports.ABOUT_LEGACY_COMPAT = ABOUT_LEGACY_COMPAT;
    exports.ABOUT_LEGACY_COMPAT_SystemLiteral = ABOUT_LEGACY_COMPAT_SystemLiteral;
    exports.AttlistDecl = AttlistDecl;
    exports.CDATA_START = CDATA_START;
    exports.CDATA_END = CDATA_END;
    exports.CDSect = CDSect;
    exports.Char = Char;
    exports.Comment = Comment;
    exports.COMMENT_START = COMMENT_START;
    exports.COMMENT_END = COMMENT_END;
    exports.DOCTYPE_DECL_START = DOCTYPE_DECL_START;
    exports.elementdecl = elementdecl;
    exports.EntityDecl = EntityDecl;
    exports.EntityValue = EntityValue;
    exports.ExternalID = ExternalID;
    exports.ExternalID_match = ExternalID_match;
    exports.Name = Name;
    exports.NotationDecl = NotationDecl;
    exports.Reference = Reference;
    exports.PEReference = PEReference;
    exports.PI = PI;
    exports.PUBLIC = PUBLIC;
    exports.PubidLiteral = PubidLiteral;
    exports.QName = QName;
    exports.QName_exact = QName_exact;
    exports.QName_group = QName_group;
    exports.S = S;
    exports.SChar_s = SChar_s;
    exports.S_OPT = S_OPT;
    exports.SYSTEM = SYSTEM;
    exports.SystemLiteral = SystemLiteral;
    exports.UNICODE_REPLACEMENT_CHARACTER = UNICODE_REPLACEMENT_CHARACTER;
    exports.UNICODE_SUPPORT = UNICODE_SUPPORT;
    exports.XMLDecl = XMLDecl;
  }
});

// node_modules/@xmldom/xmldom/lib/dom.js
var require_dom = __commonJS({
  "node_modules/@xmldom/xmldom/lib/dom.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    var find = conventions.find;
    var hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
    var hasOwn = conventions.hasOwn;
    var isHTMLMimeType = conventions.isHTMLMimeType;
    var isHTMLRawTextElement = conventions.isHTMLRawTextElement;
    var isHTMLVoidElement = conventions.isHTMLVoidElement;
    var MIME_TYPE = conventions.MIME_TYPE;
    var NAMESPACE = conventions.NAMESPACE;
    var PDC = /* @__PURE__ */ Symbol();
    var errors = require_errors();
    var DOMException = errors.DOMException;
    var DOMExceptionName = errors.DOMExceptionName;
    var g = require_grammar();
    function checkSymbol(symbol) {
      if (symbol !== PDC) {
        throw new TypeError("Illegal constructor");
      }
    }
    function notEmptyString(input) {
      return input !== "";
    }
    function splitOnASCIIWhitespace(input) {
      return input ? input.split(/[\t\n\f\r ]+/).filter(notEmptyString) : [];
    }
    function orderedSetReducer(current, element) {
      if (!hasOwn(current, element)) {
        current[element] = true;
      }
      return current;
    }
    function toOrderedSet(input) {
      if (!input) return [];
      var list = splitOnASCIIWhitespace(input);
      return Object.keys(list.reduce(orderedSetReducer, {}));
    }
    function arrayIncludes(list) {
      return function(element) {
        return list && list.indexOf(element) !== -1;
      };
    }
    function validateQualifiedName(qualifiedName) {
      if (!g.QName_exact.test(qualifiedName)) {
        throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'invalid character in qualified name "' + qualifiedName + '"');
      }
    }
    function validateAndExtract(namespace, qualifiedName) {
      validateQualifiedName(qualifiedName);
      namespace = namespace || null;
      var prefix = null;
      var localName3 = qualifiedName;
      if (qualifiedName.indexOf(":") >= 0) {
        var splitResult = qualifiedName.split(":");
        prefix = splitResult[0];
        localName3 = splitResult[1];
      }
      if (prefix !== null && namespace === null) {
        throw new DOMException(DOMException.NAMESPACE_ERR, "prefix is non-null and namespace is null");
      }
      if (prefix === "xml" && namespace !== conventions.NAMESPACE.XML) {
        throw new DOMException(DOMException.NAMESPACE_ERR, 'prefix is "xml" and namespace is not the XML namespace');
      }
      if ((prefix === "xmlns" || qualifiedName === "xmlns") && namespace !== conventions.NAMESPACE.XMLNS) {
        throw new DOMException(
          DOMException.NAMESPACE_ERR,
          'either qualifiedName or prefix is "xmlns" and namespace is not the XMLNS namespace'
        );
      }
      if (namespace === conventions.NAMESPACE.XMLNS && prefix !== "xmlns" && qualifiedName !== "xmlns") {
        throw new DOMException(
          DOMException.NAMESPACE_ERR,
          'namespace is the XMLNS namespace and neither qualifiedName nor prefix is "xmlns"'
        );
      }
      return [namespace, prefix, localName3];
    }
    function copy(src, dest) {
      for (var p in src) {
        if (hasOwn(src, p)) {
          dest[p] = src[p];
        }
      }
    }
    function _extends(Class, Super) {
      var pt = Class.prototype;
      if (!(pt instanceof Super)) {
        let t = function() {
        };
        t.prototype = Super.prototype;
        t = new t();
        copy(pt, t);
        Class.prototype = pt = t;
      }
      if (pt.constructor != Class) {
        if (typeof Class != "function") {
          console.error("unknown Class:" + Class);
        }
        pt.constructor = Class;
      }
    }
    var NodeType = {};
    var ELEMENT_NODE = NodeType.ELEMENT_NODE = 1;
    var ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2;
    var TEXT_NODE = NodeType.TEXT_NODE = 3;
    var CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4;
    var ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5;
    var ENTITY_NODE = NodeType.ENTITY_NODE = 6;
    var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
    var COMMENT_NODE = NodeType.COMMENT_NODE = 8;
    var DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9;
    var DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10;
    var DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11;
    var NOTATION_NODE = NodeType.NOTATION_NODE = 12;
    var DocumentPosition = conventions.freeze({
      DOCUMENT_POSITION_DISCONNECTED: 1,
      DOCUMENT_POSITION_PRECEDING: 2,
      DOCUMENT_POSITION_FOLLOWING: 4,
      DOCUMENT_POSITION_CONTAINS: 8,
      DOCUMENT_POSITION_CONTAINED_BY: 16,
      DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32
    });
    function commonAncestor(a, b) {
      if (b.length < a.length) return commonAncestor(b, a);
      var c = null;
      for (var n in a) {
        if (a[n] !== b[n]) return c;
        c = a[n];
      }
      return c;
    }
    function docGUID(doc) {
      if (!doc.guid) doc.guid = Math.random();
      return doc.guid;
    }
    function NodeList() {
    }
    NodeList.prototype = {
      /**
       * The number of nodes in the list. The range of valid child node indices is 0 to length-1
       * inclusive.
       *
       * @type {number}
       */
      length: 0,
      /**
       * Returns the item at `index`. If index is greater than or equal to the number of nodes in
       * the list, this returns null.
       *
       * @param index
       * Unsigned long Index into the collection.
       * @returns {Node | null}
       * The node at position `index` in the NodeList,
       * or null if that is not a valid index.
       */
      item: function(index) {
        return index >= 0 && index < this.length ? this[index] : null;
      },
      /**
       * Returns a string representation of the NodeList.
       *
       * @param {unknown} nodeFilter
       * __A filter function? Not implemented according to the spec?__.
       * @returns {string}
       * A string representation of the NodeList.
       */
      toString: function(nodeFilter) {
        for (var buf = [], i = 0; i < this.length; i++) {
          serializeToString(this[i], buf, nodeFilter);
        }
        return buf.join("");
      },
      /**
       * Filters the NodeList based on a predicate.
       *
       * @param {function(Node): boolean} predicate
       * - A predicate function to filter the NodeList.
       * @returns {Node[]}
       * An array of nodes that satisfy the predicate.
       * @private
       */
      filter: function(predicate) {
        return Array.prototype.filter.call(this, predicate);
      },
      /**
       * Returns the first index at which a given node can be found in the NodeList, or -1 if it is
       * not present.
       *
       * @param {Node} item
       * - The Node item to locate in the NodeList.
       * @returns {number}
       * The first index of the node in the NodeList; -1 if not found.
       * @private
       */
      indexOf: function(item) {
        return Array.prototype.indexOf.call(this, item);
      }
    };
    NodeList.prototype[Symbol.iterator] = function() {
      var me = this;
      var index = 0;
      return {
        next: function() {
          if (index < me.length) {
            return {
              value: me[index++],
              done: false
            };
          } else {
            return {
              done: true
            };
          }
        },
        return: function() {
          return {
            done: true
          };
        }
      };
    };
    function LiveNodeList(node, refresh) {
      this._node = node;
      this._refresh = refresh;
      _updateLiveList(this);
    }
    function _updateLiveList(list) {
      var inc = list._node._inc || list._node.ownerDocument._inc;
      if (list._inc !== inc) {
        var ls = list._refresh(list._node);
        __set__(list, "length", ls.length);
        if (!list.$$length || ls.length < list.$$length) {
          for (var i = ls.length; i in list; i++) {
            if (hasOwn(list, i)) {
              delete list[i];
            }
          }
        }
        copy(ls, list);
        list._inc = inc;
      }
    }
    LiveNodeList.prototype.item = function(i) {
      _updateLiveList(this);
      return this[i] || null;
    };
    _extends(LiveNodeList, NodeList);
    function NamedNodeMap() {
    }
    function _findNodeIndex(list, node) {
      var i = 0;
      while (i < list.length) {
        if (list[i] === node) {
          return i;
        }
        i++;
      }
    }
    function _addNamedNode(el, list, newAttr, oldAttr) {
      if (oldAttr) {
        list[_findNodeIndex(list, oldAttr)] = newAttr;
      } else {
        list[list.length] = newAttr;
        list.length++;
      }
      if (el) {
        newAttr.ownerElement = el;
        var doc = el.ownerDocument;
        if (doc) {
          oldAttr && _onRemoveAttribute(doc, el, oldAttr);
          _onAddAttribute(doc, el, newAttr);
        }
      }
    }
    function _removeNamedNode(el, list, attr) {
      var i = _findNodeIndex(list, attr);
      if (i >= 0) {
        var lastIndex = list.length - 1;
        while (i <= lastIndex) {
          list[i] = list[++i];
        }
        list.length = lastIndex;
        if (el) {
          var doc = el.ownerDocument;
          if (doc) {
            _onRemoveAttribute(doc, el, attr);
          }
          attr.ownerElement = null;
        }
      }
    }
    NamedNodeMap.prototype = {
      length: 0,
      item: NodeList.prototype.item,
      /**
       * Get an attribute by name. Note: Name is in lower case in case of HTML namespace and
       * document.
       *
       * @param {string} localName
       * The local name of the attribute.
       * @returns {Attr | null}
       * The attribute with the given local name, or null if no such attribute exists.
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-get-by-name
       */
      getNamedItem: function(localName3) {
        if (this._ownerElement && this._ownerElement._isInHTMLDocumentAndNamespace()) {
          localName3 = localName3.toLowerCase();
        }
        var i = 0;
        while (i < this.length) {
          var attr = this[i];
          if (attr.nodeName === localName3) {
            return attr;
          }
          i++;
        }
        return null;
      },
      /**
       * Set an attribute.
       *
       * @param {Attr} attr
       * The attribute to set.
       * @returns {Attr | null}
       * The old attribute with the same local name and namespace URI as the new one, or null if no
       * such attribute exists.
       * @throws {DOMException}
       * With code:
       * - {@link INUSE_ATTRIBUTE_ERR} - If the attribute is already an attribute of another
       * element.
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-set
       */
      setNamedItem: function(attr) {
        var el = attr.ownerElement;
        if (el && el !== this._ownerElement) {
          throw new DOMException(DOMException.INUSE_ATTRIBUTE_ERR);
        }
        var oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName);
        if (oldAttr === attr) {
          return attr;
        }
        _addNamedNode(this._ownerElement, this, attr, oldAttr);
        return oldAttr;
      },
      /**
       * Set an attribute, replacing an existing attribute with the same local name and namespace
       * URI if one exists.
       *
       * @param {Attr} attr
       * The attribute to set.
       * @returns {Attr | null}
       * The old attribute with the same local name and namespace URI as the new one, or null if no
       * such attribute exists.
       * @throws {DOMException}
       * Throws a DOMException with the name "InUseAttributeError" if the attribute is already an
       * attribute of another element.
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-set
       */
      setNamedItemNS: function(attr) {
        return this.setNamedItem(attr);
      },
      /**
       * Removes an attribute specified by the local name.
       *
       * @param {string} localName
       * The local name of the attribute to be removed.
       * @returns {Attr}
       * The attribute node that was removed.
       * @throws {DOMException}
       * With code:
       * - {@link DOMException.NOT_FOUND_ERR} if no attribute with the given name is found.
       * @see https://dom.spec.whatwg.org/#dom-namednodemap-removenameditem
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-remove-by-name
       */
      removeNamedItem: function(localName3) {
        var attr = this.getNamedItem(localName3);
        if (!attr) {
          throw new DOMException(DOMException.NOT_FOUND_ERR, localName3);
        }
        _removeNamedNode(this._ownerElement, this, attr);
        return attr;
      },
      /**
       * Removes an attribute specified by the namespace and local name.
       *
       * @param {string | null} namespaceURI
       * The namespace URI of the attribute to be removed.
       * @param {string} localName
       * The local name of the attribute to be removed.
       * @returns {Attr}
       * The attribute node that was removed.
       * @throws {DOMException}
       * With code:
       * - {@link DOMException.NOT_FOUND_ERR} if no attribute with the given namespace URI and local
       * name is found.
       * @see https://dom.spec.whatwg.org/#dom-namednodemap-removenameditemns
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-remove-by-namespace
       */
      removeNamedItemNS: function(namespaceURI, localName3) {
        var attr = this.getNamedItemNS(namespaceURI, localName3);
        if (!attr) {
          throw new DOMException(DOMException.NOT_FOUND_ERR, namespaceURI ? namespaceURI + " : " + localName3 : localName3);
        }
        _removeNamedNode(this._ownerElement, this, attr);
        return attr;
      },
      /**
       * Get an attribute by namespace and local name.
       *
       * @param {string | null} namespaceURI
       * The namespace URI of the attribute.
       * @param {string} localName
       * The local name of the attribute.
       * @returns {Attr | null}
       * The attribute with the given namespace URI and local name, or null if no such attribute
       * exists.
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-get-by-namespace
       */
      getNamedItemNS: function(namespaceURI, localName3) {
        if (!namespaceURI) {
          namespaceURI = null;
        }
        var i = 0;
        while (i < this.length) {
          var node = this[i];
          if (node.localName === localName3 && node.namespaceURI === namespaceURI) {
            return node;
          }
          i++;
        }
        return null;
      }
    };
    NamedNodeMap.prototype[Symbol.iterator] = function() {
      var me = this;
      var index = 0;
      return {
        next: function() {
          if (index < me.length) {
            return {
              value: me[index++],
              done: false
            };
          } else {
            return {
              done: true
            };
          }
        },
        return: function() {
          return {
            done: true
          };
        }
      };
    };
    function DOMImplementation() {
    }
    DOMImplementation.prototype = {
      /**
       * Test if the DOM implementation implements a specific feature and version, as specified in
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/core.html#DOMFeatures DOM Features}.
       *
       * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given
       * feature is supported. The different implementations fairly diverged in what kind of
       * features were reported. The latest version of the spec settled to force this method to
       * always return true, where the functionality was accurate and in use.
       *
       * @deprecated
       * It is deprecated and modern browsers return true in all cases.
       * @function DOMImplementation#hasFeature
       * @param {string} feature
       * The name of the feature to test.
       * @param {string} [version]
       * This is the version number of the feature to test.
       * @returns {boolean}
       * Always returns true.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
       * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1 Core
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-5CED94D7 DOM Level 3 Core
       */
      hasFeature: function(feature, version) {
        return true;
      },
      /**
       * Creates a DOM Document object of the specified type with its document element. Note that
       * based on the {@link DocumentType}
       * given to create the document, the implementation may instantiate specialized
       * {@link Document} objects that support additional features than the "Core", such as "HTML"
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#DOM2HTML DOM Level 2 HTML}.
       * On the other hand, setting the {@link DocumentType} after the document was created makes
       * this very unlikely to happen. Alternatively, specialized {@link Document} creation methods,
       * such as createHTMLDocument
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#DOM2HTML DOM Level 2 HTML},
       * can be used to obtain specific types of {@link Document} objects.
       *
       * __It behaves slightly different from the description in the living standard__:
       * - There is no interface/class `XMLDocument`, it returns a `Document`
       * instance (with it's `type` set to `'xml'`).
       * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
       *
       * @function DOMImplementation.createDocument
       * @param {string | null} namespaceURI
       * The
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-namespaceURI namespace URI}
       * of the document element to create or null.
       * @param {string | null} qualifiedName
       * The
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-qualifiedname qualified name}
       * of the document element to be created or null.
       * @param {DocumentType | null} [doctype=null]
       * The type of document to be created or null. When doctype is not null, its
       * {@link Node#ownerDocument} attribute is set to the document being created. Default is
       * `null`
       * @returns {Document}
       * A new {@link Document} object with its document element. If the NamespaceURI,
       * qualifiedName, and doctype are null, the returned {@link Document} is empty with no
       * document element.
       * @throws {DOMException}
       * With code:
       *
       * - `INVALID_CHARACTER_ERR`: Raised if the specified qualified name is not an XML name
       * according to {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#XML XML 1.0}.
       * - `NAMESPACE_ERR`: Raised if the qualifiedName is malformed, if the qualifiedName has a
       * prefix and the namespaceURI is null, or if the qualifiedName is null and the namespaceURI
       * is different from null, or if the qualifiedName has a prefix that is "xml" and the
       * namespaceURI is different from "{@link http://www.w3.org/XML/1998/namespace}"
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#Namespaces XML Namespaces},
       * or if the DOM implementation does not support the "XML" feature but a non-null namespace
       * URI was provided, since namespaces were defined by XML.
       * - `WRONG_DOCUMENT_ERR`: Raised if doctype has already been used with a different document
       * or was created from a different implementation.
       * - `NOT_SUPPORTED_ERR`: May be raised if the implementation does not support the feature
       * "XML" and the language exposed through the Document does not support XML Namespaces (such
       * as {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#HTML40 HTML 4.01}).
       * @since DOM Level 2.
       * @see {@link #createHTMLDocument}
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument DOM Living Standard
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Level-2-Core-DOM-createDocument DOM
       *      Level 3 Core
       * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM
       *      Level 2 Core (initial)
       */
      createDocument: function(namespaceURI, qualifiedName, doctype) {
        var contentType = MIME_TYPE.XML_APPLICATION;
        if (namespaceURI === NAMESPACE.HTML) {
          contentType = MIME_TYPE.XML_XHTML_APPLICATION;
        } else if (namespaceURI === NAMESPACE.SVG) {
          contentType = MIME_TYPE.XML_SVG_IMAGE;
        }
        var doc = new Document(PDC, { contentType });
        doc.implementation = this;
        doc.childNodes = new NodeList();
        doc.doctype = doctype || null;
        if (doctype) {
          doc.appendChild(doctype);
        }
        if (qualifiedName) {
          var root = doc.createElementNS(namespaceURI, qualifiedName);
          doc.appendChild(root);
        }
        return doc;
      },
      /**
       * Creates an empty DocumentType node. Entity declarations and notations are not made
       * available. Entity reference expansions and default attribute additions do not occur.
       *
       * **This behavior is slightly different from the one in the specs**:
       * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
       * - `publicId` and `systemId` contain the raw data including any possible quotes,
       *   so they can always be serialized back to the original value
       * - `internalSubset` contains the raw string between `[` and `]` if present,
       *   but is not parsed or validated in any form.
       *
       * @function DOMImplementation#createDocumentType
       * @param {string} qualifiedName
       * The {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-qualifiedname qualified
       * name} of the document type to be created.
       * @param {string} [publicId]
       * The external subset public identifier.
       * @param {string} [systemId]
       * The external subset system identifier.
       * @param {string} [internalSubset]
       * the internal subset or an empty string if it is not present
       * @returns {DocumentType}
       * A new {@link DocumentType} node with {@link Node#ownerDocument} set to null.
       * @throws {DOMException}
       * With code:
       *
       * - `INVALID_CHARACTER_ERR`: Raised if the specified qualified name is not an XML name
       * according to {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#XML XML 1.0}.
       * - `NAMESPACE_ERR`: Raised if the qualifiedName is malformed.
       * - `NOT_SUPPORTED_ERR`: May be raised if the implementation does not support the feature
       * "XML" and the language exposed through the Document does not support XML Namespaces (such
       * as {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#HTML40 HTML 4.01}).
       * @since DOM Level 2.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType
       *      MDN
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living
       *      Standard
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Level-3-Core-DOM-createDocType DOM
       *      Level 3 Core
       * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM
       *      Level 2 Core
       * @see https://github.com/xmldom/xmldom/blob/master/CHANGELOG.md#050
       * @see https://www.w3.org/TR/DOM-Level-2-Core/#core-ID-Core-DocType-internalSubset
       * @prettierignore
       */
      createDocumentType: function(qualifiedName, publicId, systemId, internalSubset) {
        validateQualifiedName(qualifiedName);
        var node = new DocumentType(PDC);
        node.name = qualifiedName;
        node.nodeName = qualifiedName;
        node.publicId = publicId || "";
        node.systemId = systemId || "";
        node.internalSubset = internalSubset || "";
        node.childNodes = new NodeList();
        return node;
      },
      /**
       * Returns an HTML document, that might already have a basic DOM structure.
       *
       * __It behaves slightly different from the description in the living standard__:
       * - If the first argument is `false` no initial nodes are added (steps 3-7 in the specs are
       * omitted)
       * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
       *
       * @param {string | false} [title]
       * A string containing the title to give the new HTML document.
       * @returns {Document}
       * The HTML document.
       * @since WHATWG Living Standard.
       * @see {@link #createDocument}
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-createhtmldocument
       * @see https://dom.spec.whatwg.org/#html-document
       */
      createHTMLDocument: function(title) {
        var doc = new Document(PDC, { contentType: MIME_TYPE.HTML });
        doc.implementation = this;
        doc.childNodes = new NodeList();
        if (title !== false) {
          doc.doctype = this.createDocumentType("html");
          doc.doctype.ownerDocument = doc;
          doc.appendChild(doc.doctype);
          var htmlNode = doc.createElement("html");
          doc.appendChild(htmlNode);
          var headNode = doc.createElement("head");
          htmlNode.appendChild(headNode);
          if (typeof title === "string") {
            var titleNode = doc.createElement("title");
            titleNode.appendChild(doc.createTextNode(title));
            headNode.appendChild(titleNode);
          }
          htmlNode.appendChild(doc.createElement("body"));
        }
        return doc;
      }
    };
    function Node(symbol) {
      checkSymbol(symbol);
    }
    Node.prototype = {
      /**
       * The first child of this node.
       *
       * @type {Node | null}
       */
      firstChild: null,
      /**
       * The last child of this node.
       *
       * @type {Node | null}
       */
      lastChild: null,
      /**
       * The previous sibling of this node.
       *
       * @type {Node | null}
       */
      previousSibling: null,
      /**
       * The next sibling of this node.
       *
       * @type {Node | null}
       */
      nextSibling: null,
      /**
       * The parent node of this node.
       *
       * @type {Node | null}
       */
      parentNode: null,
      /**
       * The parent element of this node.
       *
       * @type {Element | null}
       */
      get parentElement() {
        return this.parentNode && this.parentNode.nodeType === this.ELEMENT_NODE ? this.parentNode : null;
      },
      /**
       * The child nodes of this node.
       *
       * @type {NodeList}
       */
      childNodes: null,
      /**
       * The document object associated with this node.
       *
       * @type {Document | null}
       */
      ownerDocument: null,
      /**
       * The value of this node.
       *
       * @type {string | null}
       */
      nodeValue: null,
      /**
       * The namespace URI of this node.
       *
       * @type {string | null}
       */
      namespaceURI: null,
      /**
       * The prefix of the namespace for this node.
       *
       * @type {string | null}
       */
      prefix: null,
      /**
       * The local part of the qualified name of this node.
       *
       * @type {string | null}
       */
      localName: null,
      /**
       * The baseURI is currently always `about:blank`,
       * since that's what happens when you create a document from scratch.
       *
       * @type {'about:blank'}
       */
      baseURI: "about:blank",
      /**
       * Is true if this node is part of a document.
       *
       * @type {boolean}
       */
      get isConnected() {
        var rootNode = this.getRootNode();
        return rootNode && rootNode.nodeType === rootNode.DOCUMENT_NODE;
      },
      /**
       * Checks whether `other` is an inclusive descendant of this node.
       *
       * @param {Node | null | undefined} other
       * The node to check.
       * @returns {boolean}
       * True if `other` is an inclusive descendant of this node; false otherwise.
       * @see https://dom.spec.whatwg.org/#dom-node-contains
       */
      contains: function(other) {
        if (!other) return false;
        var parent = other;
        do {
          if (this === parent) return true;
          parent = other.parentNode;
        } while (parent);
        return false;
      },
      /**
       * @typedef GetRootNodeOptions
       * @property {boolean} [composed=false]
       */
      /**
       * Searches for the root node of this node.
       *
       * **This behavior is slightly different from the in the specs**:
       * - ignores `options.composed`, since `ShadowRoot`s are unsupported, always returns root.
       *
       * @param {GetRootNodeOptions} [options]
       * @returns {Node}
       * Root node.
       * @see https://dom.spec.whatwg.org/#dom-node-getrootnode
       * @see https://dom.spec.whatwg.org/#concept-shadow-including-root
       */
      getRootNode: function(options) {
        var parent = this;
        do {
          if (!parent.parentNode) {
            return parent;
          }
          parent = parent.parentNode;
        } while (parent);
      },
      /**
       * Checks whether the given node is equal to this node.
       *
       * @param {Node} [otherNode]
       * @see https://dom.spec.whatwg.org/#concept-node-equals
       */
      isEqualNode: function(otherNode) {
        if (!otherNode) return false;
        if (this.nodeType !== otherNode.nodeType) return false;
        switch (this.nodeType) {
          case this.DOCUMENT_TYPE_NODE:
            if (this.name !== otherNode.name) return false;
            if (this.publicId !== otherNode.publicId) return false;
            if (this.systemId !== otherNode.systemId) return false;
            break;
          case this.ELEMENT_NODE:
            if (this.namespaceURI !== otherNode.namespaceURI) return false;
            if (this.prefix !== otherNode.prefix) return false;
            if (this.localName !== otherNode.localName) return false;
            if (this.attributes.length !== otherNode.attributes.length) return false;
            for (var i = 0; i < this.attributes.length; i++) {
              var attr = this.attributes.item(i);
              if (!attr.isEqualNode(otherNode.getAttributeNodeNS(attr.namespaceURI, attr.localName))) {
                return false;
              }
            }
            break;
          case this.ATTRIBUTE_NODE:
            if (this.namespaceURI !== otherNode.namespaceURI) return false;
            if (this.localName !== otherNode.localName) return false;
            if (this.value !== otherNode.value) return false;
            break;
          case this.PROCESSING_INSTRUCTION_NODE:
            if (this.target !== otherNode.target || this.data !== otherNode.data) {
              return false;
            }
            break;
          case this.TEXT_NODE:
          case this.COMMENT_NODE:
            if (this.data !== otherNode.data) return false;
            break;
        }
        if (this.childNodes.length !== otherNode.childNodes.length) {
          return false;
        }
        for (var i = 0; i < this.childNodes.length; i++) {
          if (!this.childNodes[i].isEqualNode(otherNode.childNodes[i])) {
            return false;
          }
        }
        return true;
      },
      /**
       * Checks whether or not the given node is this node.
       *
       * @param {Node} [otherNode]
       */
      isSameNode: function(otherNode) {
        return this === otherNode;
      },
      /**
       * Inserts a node before a reference node as a child of this node.
       *
       * @param {Node} newChild
       * The new child node to be inserted.
       * @param {Node | null} refChild
       * The reference node before which newChild will be inserted.
       * @returns {Node}
       * The new child node successfully inserted.
       * @throws {DOMException}
       * Throws a DOMException if inserting the node would result in a DOM tree that is not
       * well-formed, or if `child` is provided but is not a child of `parent`.
       * See {@link _insertBefore} for more details.
       * @since Modified in DOM L2
       */
      insertBefore: function(newChild, refChild) {
        return _insertBefore(this, newChild, refChild);
      },
      /**
       * Replaces an old child node with a new child node within this node.
       *
       * @param {Node} newChild
       * The new node that is to replace the old node.
       * If it already exists in the DOM, it is removed from its original position.
       * @param {Node} oldChild
       * The existing child node to be replaced.
       * @returns {Node}
       * Returns the replaced child node.
       * @throws {DOMException}
       * Throws a DOMException if replacing the node would result in a DOM tree that is not
       * well-formed, or if `oldChild` is not a child of `this`.
       * This can also occur if the pre-replacement validity assertion fails.
       * See {@link _insertBefore}, {@link Node.removeChild}, and
       * {@link assertPreReplacementValidityInDocument} for more details.
       * @see https://dom.spec.whatwg.org/#concept-node-replace
       */
      replaceChild: function(newChild, oldChild) {
        _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
        if (oldChild) {
          this.removeChild(oldChild);
        }
      },
      /**
       * Removes an existing child node from this node.
       *
       * @param {Node} oldChild
       * The child node to be removed.
       * @returns {Node}
       * Returns the removed child node.
       * @throws {DOMException}
       * Throws a DOMException if `oldChild` is not a child of `this`.
       * See {@link _removeChild} for more details.
       */
      removeChild: function(oldChild) {
        return _removeChild(this, oldChild);
      },
      /**
       * Appends a child node to this node.
       *
       * @param {Node} newChild
       * The child node to be appended to this node.
       * If it already exists in the DOM, it is removed from its original position.
       * @returns {Node}
       * Returns the appended child node.
       * @throws {DOMException}
       * Throws a DOMException if appending the node would result in a DOM tree that is not
       * well-formed, or if `newChild` is not a valid Node.
       * See {@link insertBefore} for more details.
       */
      appendChild: function(newChild) {
        return this.insertBefore(newChild, null);
      },
      /**
       * Determines whether this node has any child nodes.
       *
       * @returns {boolean}
       * Returns true if this node has any child nodes, and false otherwise.
       */
      hasChildNodes: function() {
        return this.firstChild != null;
      },
      /**
       * Creates a copy of the calling node.
       *
       * @param {boolean} deep
       * If true, the contents of the node are recursively copied.
       * If false, only the node itself (and its attributes, if it is an element) are copied.
       * @returns {Node}
       * Returns the newly created copy of the node.
       * @throws {DOMException}
       * May throw a DOMException if operations within {@link Element#setAttributeNode} or
       * {@link Node#appendChild} (which are potentially invoked in this method) do not meet their
       * specific constraints.
       * @see {@link cloneNode}
       */
      cloneNode: function(deep) {
        return cloneNode(this.ownerDocument || this, this, deep);
      },
      /**
       * Puts the specified node and all of its subtree into a "normalized" form. In a normalized
       * subtree, no text nodes in the subtree are empty and there are no adjacent text nodes.
       *
       * Specifically, this method merges any adjacent text nodes (i.e., nodes for which `nodeType`
       * is `TEXT_NODE`) into a single node with the combined data. It also removes any empty text
       * nodes.
       *
       * This method operates recursively, so it also normalizes any and all descendent nodes within
       * the subtree.
       *
       * @throws {DOMException}
       * May throw a DOMException if operations within removeChild or appendData (which are
       * potentially invoked in this method) do not meet their specific constraints.
       * @since Modified in DOM Level 2
       * @see {@link Node.removeChild}
       * @see {@link CharacterData.appendData}
       */
      normalize: function() {
        var child = this.firstChild;
        while (child) {
          var next = child.nextSibling;
          if (next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE) {
            this.removeChild(next);
            child.appendData(next.data);
          } else {
            child.normalize();
            child = next;
          }
        }
      },
      /**
       * Checks whether the DOM implementation implements a specific feature and its version.
       *
       * @deprecated
       * Since `DOMImplementation.hasFeature` is deprecated and always returns true.
       * @param {string} feature
       * The package name of the feature to test. This is the same name that can be passed to the
       * method `hasFeature` on `DOMImplementation`.
       * @param {string} version
       * This is the version number of the package name to test.
       * @returns {boolean}
       * Returns true in all cases in the current implementation.
       * @since Introduced in DOM Level 2
       * @see {@link DOMImplementation.hasFeature}
       */
      isSupported: function(feature, version) {
        return this.ownerDocument.implementation.hasFeature(feature, version);
      },
      /**
       * Look up the prefix associated to the given namespace URI, starting from this node.
       * **The default namespace declarations are ignored by this method.**
       * See Namespace Prefix Lookup for details on the algorithm used by this method.
       *
       * **This behavior is different from the in the specs**:
       * - no node type specific handling
       * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
       *
       * @param {string | null} namespaceURI
       * The namespace URI for which to find the associated prefix.
       * @returns {string | null}
       * The associated prefix, if found; otherwise, null.
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespacePrefix
       * @see https://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html#lookupNamespacePrefixAlgo
       * @see https://dom.spec.whatwg.org/#dom-node-lookupprefix
       * @see https://github.com/xmldom/xmldom/issues/322
       * @prettierignore
       */
      lookupPrefix: function(namespaceURI) {
        var el = this;
        while (el) {
          var map = el._nsMap;
          if (map) {
            for (var n in map) {
              if (hasOwn(map, n) && map[n] === namespaceURI) {
                return n;
              }
            }
          }
          el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
        }
        return null;
      },
      /**
       * This function is used to look up the namespace URI associated with the given prefix,
       * starting from this node.
       *
       * **This behavior is different from the in the specs**:
       * - no node type specific handling
       * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
       *
       * @param {string | null} prefix
       * The prefix for which to find the associated namespace URI.
       * @returns {string | null}
       * The associated namespace URI, if found; otherwise, null.
       * @since DOM Level 3
       * @see https://dom.spec.whatwg.org/#dom-node-lookupnamespaceuri
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespaceURI
       * @prettierignore
       */
      lookupNamespaceURI: function(prefix) {
        var el = this;
        while (el) {
          var map = el._nsMap;
          if (map) {
            if (hasOwn(map, prefix)) {
              return map[prefix];
            }
          }
          el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
        }
        return null;
      },
      /**
       * Determines whether the given namespace URI is the default namespace.
       *
       * The function works by looking up the prefix associated with the given namespace URI. If no
       * prefix is found (i.e., the namespace URI is not registered in the namespace map of this
       * node or any of its ancestors), it returns `true`, implying the namespace URI is considered
       * the default.
       *
       * **This behavior is different from the in the specs**:
       * - no node type specific handling
       * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
       *
       * @param {string | null} namespaceURI
       * The namespace URI to be checked.
       * @returns {boolean}
       * Returns true if the given namespace URI is the default namespace, false otherwise.
       * @since DOM Level 3
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isDefaultNamespace
       * @see https://dom.spec.whatwg.org/#dom-node-isdefaultnamespace
       * @prettierignore
       */
      isDefaultNamespace: function(namespaceURI) {
        var prefix = this.lookupPrefix(namespaceURI);
        return prefix == null;
      },
      /**
       * Compares the reference node with a node with regard to their position in the document and
       * according to the document order.
       *
       * @param {Node} other
       * The node to compare the reference node to.
       * @returns {number}
       * Returns how the node is positioned relatively to the reference node according to the
       * bitmask. 0 if reference node and given node are the same.
       * @since DOM Level 3
       * @see https://www.w3.org/TR/2004/REC-DOM-Level-3-Core-20040407/core.html#Node3-compare
       * @see https://dom.spec.whatwg.org/#dom-node-comparedocumentposition
       */
      compareDocumentPosition: function(other) {
        if (this === other) return 0;
        var node1 = other;
        var node2 = this;
        var attr1 = null;
        var attr2 = null;
        if (node1 instanceof Attr) {
          attr1 = node1;
          node1 = attr1.ownerElement;
        }
        if (node2 instanceof Attr) {
          attr2 = node2;
          node2 = attr2.ownerElement;
          if (attr1 && node1 && node2 === node1) {
            for (var i = 0, attr; attr = node2.attributes[i]; i++) {
              if (attr === attr1)
                return DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
              if (attr === attr2)
                return DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
            }
          }
        }
        if (!node1 || !node2 || node2.ownerDocument !== node1.ownerDocument) {
          return DocumentPosition.DOCUMENT_POSITION_DISCONNECTED + DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + (docGUID(node2.ownerDocument) > docGUID(node1.ownerDocument) ? DocumentPosition.DOCUMENT_POSITION_FOLLOWING : DocumentPosition.DOCUMENT_POSITION_PRECEDING);
        }
        if (attr2 && node1 === node2) {
          return DocumentPosition.DOCUMENT_POSITION_CONTAINS + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
        }
        if (attr1 && node1 === node2) {
          return DocumentPosition.DOCUMENT_POSITION_CONTAINED_BY + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
        }
        var chain1 = [];
        var ancestor1 = node1.parentNode;
        while (ancestor1) {
          if (!attr2 && ancestor1 === node2) {
            return DocumentPosition.DOCUMENT_POSITION_CONTAINED_BY + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
          }
          chain1.push(ancestor1);
          ancestor1 = ancestor1.parentNode;
        }
        chain1.reverse();
        var chain2 = [];
        var ancestor2 = node2.parentNode;
        while (ancestor2) {
          if (!attr1 && ancestor2 === node1) {
            return DocumentPosition.DOCUMENT_POSITION_CONTAINS + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
          }
          chain2.push(ancestor2);
          ancestor2 = ancestor2.parentNode;
        }
        chain2.reverse();
        var ca = commonAncestor(chain1, chain2);
        for (var n in ca.childNodes) {
          var child = ca.childNodes[n];
          if (child === node2) return DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
          if (child === node1) return DocumentPosition.DOCUMENT_POSITION_PRECEDING;
          if (chain2.indexOf(child) >= 0) return DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
          if (chain1.indexOf(child) >= 0) return DocumentPosition.DOCUMENT_POSITION_PRECEDING;
        }
        return 0;
      }
    };
    function _xmlEncoder(c) {
      return c == "<" && "&lt;" || c == ">" && "&gt;" || c == "&" && "&amp;" || c == '"' && "&quot;" || "&#" + c.charCodeAt() + ";";
    }
    copy(NodeType, Node);
    copy(NodeType, Node.prototype);
    copy(DocumentPosition, Node);
    copy(DocumentPosition, Node.prototype);
    function _visitNode(node, callback) {
      if (callback(node)) {
        return true;
      }
      if (node = node.firstChild) {
        do {
          if (_visitNode(node, callback)) {
            return true;
          }
        } while (node = node.nextSibling);
      }
    }
    function Document(symbol, options) {
      checkSymbol(symbol);
      var opt = options || {};
      this.ownerDocument = this;
      this.contentType = opt.contentType || MIME_TYPE.XML_APPLICATION;
      this.type = isHTMLMimeType(this.contentType) ? "html" : "xml";
    }
    function _onAddAttribute(doc, el, newAttr) {
      doc && doc._inc++;
      var ns = newAttr.namespaceURI;
      if (ns === NAMESPACE.XMLNS) {
        el._nsMap[newAttr.prefix ? newAttr.localName : ""] = newAttr.value;
      }
    }
    function _onRemoveAttribute(doc, el, newAttr, remove) {
      doc && doc._inc++;
      var ns = newAttr.namespaceURI;
      if (ns === NAMESPACE.XMLNS) {
        delete el._nsMap[newAttr.prefix ? newAttr.localName : ""];
      }
    }
    function _onUpdateChild(doc, parent, newChild) {
      if (doc && doc._inc) {
        doc._inc++;
        var childNodes = parent.childNodes;
        if (newChild && !newChild.nextSibling) {
          childNodes[childNodes.length++] = newChild;
        } else {
          var child = parent.firstChild;
          var i = 0;
          while (child) {
            childNodes[i++] = child;
            child = child.nextSibling;
          }
          childNodes.length = i;
          delete childNodes[childNodes.length];
        }
      }
    }
    function _removeChild(parentNode, child) {
      if (parentNode !== child.parentNode) {
        throw new DOMException(DOMException.NOT_FOUND_ERR, "child's parent is not parent");
      }
      var oldPreviousSibling = child.previousSibling;
      var oldNextSibling = child.nextSibling;
      if (oldPreviousSibling) {
        oldPreviousSibling.nextSibling = oldNextSibling;
      } else {
        parentNode.firstChild = oldNextSibling;
      }
      if (oldNextSibling) {
        oldNextSibling.previousSibling = oldPreviousSibling;
      } else {
        parentNode.lastChild = oldPreviousSibling;
      }
      _onUpdateChild(parentNode.ownerDocument, parentNode);
      child.parentNode = null;
      child.previousSibling = null;
      child.nextSibling = null;
      return child;
    }
    function hasValidParentNodeType(node) {
      return node && (node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.ELEMENT_NODE);
    }
    function hasInsertableNodeType(node) {
      return node && (node.nodeType === Node.CDATA_SECTION_NODE || node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.DOCUMENT_TYPE_NODE || node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.PROCESSING_INSTRUCTION_NODE || node.nodeType === Node.TEXT_NODE);
    }
    function isDocTypeNode(node) {
      return node && node.nodeType === Node.DOCUMENT_TYPE_NODE;
    }
    function isElementNode(node) {
      return node && node.nodeType === Node.ELEMENT_NODE;
    }
    function isTextNode(node) {
      return node && node.nodeType === Node.TEXT_NODE;
    }
    function isElementInsertionPossible(doc, child) {
      var parentChildNodes = doc.childNodes || [];
      if (find(parentChildNodes, isElementNode) || isDocTypeNode(child)) {
        return false;
      }
      var docTypeNode = find(parentChildNodes, isDocTypeNode);
      return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
    }
    function isElementReplacementPossible(doc, child) {
      var parentChildNodes = doc.childNodes || [];
      function hasElementChildThatIsNotChild(node) {
        return isElementNode(node) && node !== child;
      }
      if (find(parentChildNodes, hasElementChildThatIsNotChild)) {
        return false;
      }
      var docTypeNode = find(parentChildNodes, isDocTypeNode);
      return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
    }
    function assertPreInsertionValidity1to5(parent, node, child) {
      if (!hasValidParentNodeType(parent)) {
        throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Unexpected parent node type " + parent.nodeType);
      }
      if (child && child.parentNode !== parent) {
        throw new DOMException(DOMException.NOT_FOUND_ERR, "child not in parent");
      }
      if (
        // 4. If `node` is not a DocumentFragment, DocumentType, Element, or CharacterData node, then throw a "HierarchyRequestError" DOMException.
        !hasInsertableNodeType(node) || // 5. If either `node` is a Text node and `parent` is a document,
        // the sax parser currently adds top level text nodes, this will be fixed in 0.9.0
        // || (node.nodeType === Node.TEXT_NODE && parent.nodeType === Node.DOCUMENT_NODE)
        // or `node` is a doctype and `parent` is not a document, then throw a "HierarchyRequestError" DOMException.
        isDocTypeNode(node) && parent.nodeType !== Node.DOCUMENT_NODE
      ) {
        throw new DOMException(
          DOMException.HIERARCHY_REQUEST_ERR,
          "Unexpected node type " + node.nodeType + " for parent node type " + parent.nodeType
        );
      }
    }
    function assertPreInsertionValidityInDocument(parent, node, child) {
      var parentChildNodes = parent.childNodes || [];
      var nodeChildNodes = node.childNodes || [];
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        var nodeChildElements = nodeChildNodes.filter(isElementNode);
        if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
        }
        if (nodeChildElements.length === 1 && !isElementInsertionPossible(parent, child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
        }
      }
      if (isElementNode(node)) {
        if (!isElementInsertionPossible(parent, child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
        }
      }
      if (isDocTypeNode(node)) {
        if (find(parentChildNodes, isDocTypeNode)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
        }
        var parentElementChild = find(parentChildNodes, isElementNode);
        if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
        }
        if (!child && parentElementChild) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can not be appended since element is present");
        }
      }
    }
    function assertPreReplacementValidityInDocument(parent, node, child) {
      var parentChildNodes = parent.childNodes || [];
      var nodeChildNodes = node.childNodes || [];
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        var nodeChildElements = nodeChildNodes.filter(isElementNode);
        if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
        }
        if (nodeChildElements.length === 1 && !isElementReplacementPossible(parent, child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
        }
      }
      if (isElementNode(node)) {
        if (!isElementReplacementPossible(parent, child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
        }
      }
      if (isDocTypeNode(node)) {
        let hasDoctypeChildThatIsNotChild = function(node2) {
          return isDocTypeNode(node2) && node2 !== child;
        };
        if (find(parentChildNodes, hasDoctypeChildThatIsNotChild)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
        }
        var parentElementChild = find(parentChildNodes, isElementNode);
        if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
        }
      }
    }
    function _insertBefore(parent, node, child, _inDocumentAssertion) {
      assertPreInsertionValidity1to5(parent, node, child);
      if (parent.nodeType === Node.DOCUMENT_NODE) {
        (_inDocumentAssertion || assertPreInsertionValidityInDocument)(parent, node, child);
      }
      var cp = node.parentNode;
      if (cp) {
        cp.removeChild(node);
      }
      if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
        var newFirst = node.firstChild;
        if (newFirst == null) {
          return node;
        }
        var newLast = node.lastChild;
      } else {
        newFirst = newLast = node;
      }
      var pre = child ? child.previousSibling : parent.lastChild;
      newFirst.previousSibling = pre;
      newLast.nextSibling = child;
      if (pre) {
        pre.nextSibling = newFirst;
      } else {
        parent.firstChild = newFirst;
      }
      if (child == null) {
        parent.lastChild = newLast;
      } else {
        child.previousSibling = newLast;
      }
      do {
        newFirst.parentNode = parent;
      } while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
      _onUpdateChild(parent.ownerDocument || parent, parent, node);
      if (node.nodeType == DOCUMENT_FRAGMENT_NODE) {
        node.firstChild = node.lastChild = null;
      }
      return node;
    }
    Document.prototype = {
      /**
       * The implementation that created this document.
       *
       * @type DOMImplementation
       * @readonly
       */
      implementation: null,
      nodeName: "#document",
      nodeType: DOCUMENT_NODE,
      /**
       * The DocumentType node of the document.
       *
       * @type DocumentType
       * @readonly
       */
      doctype: null,
      documentElement: null,
      _inc: 1,
      insertBefore: function(newChild, refChild) {
        if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
          var child = newChild.firstChild;
          while (child) {
            var next = child.nextSibling;
            this.insertBefore(child, refChild);
            child = next;
          }
          return newChild;
        }
        _insertBefore(this, newChild, refChild);
        newChild.ownerDocument = this;
        if (this.documentElement === null && newChild.nodeType === ELEMENT_NODE) {
          this.documentElement = newChild;
        }
        return newChild;
      },
      removeChild: function(oldChild) {
        var removed = _removeChild(this, oldChild);
        if (removed === this.documentElement) {
          this.documentElement = null;
        }
        return removed;
      },
      replaceChild: function(newChild, oldChild) {
        _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
        newChild.ownerDocument = this;
        if (oldChild) {
          this.removeChild(oldChild);
        }
        if (isElementNode(newChild)) {
          this.documentElement = newChild;
        }
      },
      // Introduced in DOM Level 2:
      importNode: function(importedNode, deep) {
        return importNode(this, importedNode, deep);
      },
      // Introduced in DOM Level 2:
      getElementById: function(id) {
        var rtv = null;
        _visitNode(this.documentElement, function(node) {
          if (node.nodeType == ELEMENT_NODE) {
            if (node.getAttribute("id") == id) {
              rtv = node;
              return true;
            }
          }
        });
        return rtv;
      },
      /**
       * Creates a new `Element` that is owned by this `Document`.
       * In HTML Documents `localName` is the lower cased `tagName`,
       * otherwise no transformation is being applied.
       * When `contentType` implies the HTML namespace, it will be set as `namespaceURI`.
       *
       * __This implementation differs from the specification:__ - The provided name is not checked
       * against the `Name` production,
       * so no related error will be thrown.
       * - There is no interface `HTMLElement`, it is always an `Element`.
       * - There is no support for a second argument to indicate using custom elements.
       *
       * @param {string} tagName
       * @returns {Element}
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
       * @see https://dom.spec.whatwg.org/#dom-document-createelement
       * @see https://dom.spec.whatwg.org/#concept-create-element
       */
      createElement: function(tagName) {
        var node = new Element(PDC);
        node.ownerDocument = this;
        if (this.type === "html") {
          tagName = tagName.toLowerCase();
        }
        if (hasDefaultHTMLNamespace(this.contentType)) {
          node.namespaceURI = NAMESPACE.HTML;
        }
        node.nodeName = tagName;
        node.tagName = tagName;
        node.localName = tagName;
        node.childNodes = new NodeList();
        var attrs = node.attributes = new NamedNodeMap();
        attrs._ownerElement = node;
        return node;
      },
      /**
       * @returns {DocumentFragment}
       */
      createDocumentFragment: function() {
        var node = new DocumentFragment(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        return node;
      },
      /**
       * @param {string} data
       * @returns {Text}
       */
      createTextNode: function(data) {
        var node = new Text(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.appendData(data);
        return node;
      },
      /**
       * @param {string} data
       * @returns {Comment}
       */
      createComment: function(data) {
        var node = new Comment(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.appendData(data);
        return node;
      },
      /**
       * @param {string} data
       * @returns {CDATASection}
       */
      createCDATASection: function(data) {
        var node = new CDATASection(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.appendData(data);
        return node;
      },
      /**
       * @param {string} target
       * @param {string} data
       * @returns {ProcessingInstruction}
       */
      createProcessingInstruction: function(target, data) {
        var node = new ProcessingInstruction(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.nodeName = node.target = target;
        node.nodeValue = node.data = data;
        return node;
      },
      /**
       * Creates an `Attr` node that is owned by this document.
       * In HTML Documents `localName` is the lower cased `name`,
       * otherwise no transformation is being applied.
       *
       * __This implementation differs from the specification:__ - The provided name is not checked
       * against the `Name` production,
       * so no related error will be thrown.
       *
       * @param {string} name
       * @returns {Attr}
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createAttribute
       * @see https://dom.spec.whatwg.org/#dom-document-createattribute
       */
      createAttribute: function(name) {
        if (!g.QName_exact.test(name)) {
          throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'invalid character in name "' + name + '"');
        }
        if (this.type === "html") {
          name = name.toLowerCase();
        }
        return this._createAttribute(name);
      },
      _createAttribute: function(name) {
        var node = new Attr(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.name = name;
        node.nodeName = name;
        node.localName = name;
        node.specified = true;
        return node;
      },
      /**
       * Creates an EntityReference object.
       * The current implementation does not fill the `childNodes` with those of the corresponding
       * `Entity`
       *
       * @deprecated
       * In DOM Level 4.
       * @param {string} name
       * The name of the entity to reference. No namespace well-formedness checks are performed.
       * @returns {EntityReference}
       * @throws {DOMException}
       * With code `INVALID_CHARACTER_ERR` when `name` is not valid.
       * @throws {DOMException}
       * with code `NOT_SUPPORTED_ERR` when the document is of type `html`
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-392B75AE
       */
      createEntityReference: function(name) {
        if (!g.Name.test(name)) {
          throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'not a valid xml name "' + name + '"');
        }
        if (this.type === "html") {
          throw new DOMException("document is an html document", DOMExceptionName.NotSupportedError);
        }
        var node = new EntityReference(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.nodeName = name;
        return node;
      },
      // Introduced in DOM Level 2:
      /**
       * @param {string} namespaceURI
       * @param {string} qualifiedName
       * @returns {Element}
       */
      createElementNS: function(namespaceURI, qualifiedName) {
        var validated = validateAndExtract(namespaceURI, qualifiedName);
        var node = new Element(PDC);
        var attrs = node.attributes = new NamedNodeMap();
        node.childNodes = new NodeList();
        node.ownerDocument = this;
        node.nodeName = qualifiedName;
        node.tagName = qualifiedName;
        node.namespaceURI = validated[0];
        node.prefix = validated[1];
        node.localName = validated[2];
        attrs._ownerElement = node;
        return node;
      },
      // Introduced in DOM Level 2:
      /**
       * @param {string} namespaceURI
       * @param {string} qualifiedName
       * @returns {Attr}
       */
      createAttributeNS: function(namespaceURI, qualifiedName) {
        var validated = validateAndExtract(namespaceURI, qualifiedName);
        var node = new Attr(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.nodeName = qualifiedName;
        node.name = qualifiedName;
        node.specified = true;
        node.namespaceURI = validated[0];
        node.prefix = validated[1];
        node.localName = validated[2];
        return node;
      }
    };
    _extends(Document, Node);
    function Element(symbol) {
      checkSymbol(symbol);
      this._nsMap = /* @__PURE__ */ Object.create(null);
    }
    Element.prototype = {
      nodeType: ELEMENT_NODE,
      /**
       * The attributes of this element.
       *
       * @type {NamedNodeMap | null}
       */
      attributes: null,
      getQualifiedName: function() {
        return this.prefix ? this.prefix + ":" + this.localName : this.localName;
      },
      _isInHTMLDocumentAndNamespace: function() {
        return this.ownerDocument.type === "html" && this.namespaceURI === NAMESPACE.HTML;
      },
      /**
       * Implementaton of Level2 Core function hasAttributes.
       *
       * @returns {boolean}
       * True if attribute list is not empty.
       * @see https://www.w3.org/TR/DOM-Level-2-Core/#core-ID-NodeHasAttrs
       */
      hasAttributes: function() {
        return !!(this.attributes && this.attributes.length);
      },
      hasAttribute: function(name) {
        return !!this.getAttributeNode(name);
      },
      /**
       * Returns element’s first attribute whose qualified name is `name`, and `null`
       * if there is no such attribute.
       *
       * @param {string} name
       * @returns {string | null}
       */
      getAttribute: function(name) {
        var attr = this.getAttributeNode(name);
        return attr ? attr.value : null;
      },
      getAttributeNode: function(name) {
        if (this._isInHTMLDocumentAndNamespace()) {
          name = name.toLowerCase();
        }
        return this.attributes.getNamedItem(name);
      },
      /**
       * Sets the value of element’s first attribute whose qualified name is qualifiedName to value.
       *
       * @param {string} name
       * @param {string} value
       */
      setAttribute: function(name, value) {
        if (this._isInHTMLDocumentAndNamespace()) {
          name = name.toLowerCase();
        }
        var attr = this.getAttributeNode(name);
        if (attr) {
          attr.value = attr.nodeValue = "" + value;
        } else {
          attr = this.ownerDocument._createAttribute(name);
          attr.value = attr.nodeValue = "" + value;
          this.setAttributeNode(attr);
        }
      },
      removeAttribute: function(name) {
        var attr = this.getAttributeNode(name);
        attr && this.removeAttributeNode(attr);
      },
      setAttributeNode: function(newAttr) {
        return this.attributes.setNamedItem(newAttr);
      },
      setAttributeNodeNS: function(newAttr) {
        return this.attributes.setNamedItemNS(newAttr);
      },
      removeAttributeNode: function(oldAttr) {
        return this.attributes.removeNamedItem(oldAttr.nodeName);
      },
      //get real attribute name,and remove it by removeAttributeNode
      removeAttributeNS: function(namespaceURI, localName3) {
        var old = this.getAttributeNodeNS(namespaceURI, localName3);
        old && this.removeAttributeNode(old);
      },
      hasAttributeNS: function(namespaceURI, localName3) {
        return this.getAttributeNodeNS(namespaceURI, localName3) != null;
      },
      /**
       * Returns element’s attribute whose namespace is `namespaceURI` and local name is
       * `localName`,
       * or `null` if there is no such attribute.
       *
       * @param {string} namespaceURI
       * @param {string} localName
       * @returns {string | null}
       */
      getAttributeNS: function(namespaceURI, localName3) {
        var attr = this.getAttributeNodeNS(namespaceURI, localName3);
        return attr ? attr.value : null;
      },
      /**
       * Sets the value of element’s attribute whose namespace is `namespaceURI` and local name is
       * `localName` to value.
       *
       * @param {string} namespaceURI
       * @param {string} qualifiedName
       * @param {string} value
       * @see https://dom.spec.whatwg.org/#dom-element-setattributens
       */
      setAttributeNS: function(namespaceURI, qualifiedName, value) {
        var validated = validateAndExtract(namespaceURI, qualifiedName);
        var localName3 = validated[2];
        var attr = this.getAttributeNodeNS(namespaceURI, localName3);
        if (attr) {
          attr.value = attr.nodeValue = "" + value;
        } else {
          attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
          attr.value = attr.nodeValue = "" + value;
          this.setAttributeNode(attr);
        }
      },
      getAttributeNodeNS: function(namespaceURI, localName3) {
        return this.attributes.getNamedItemNS(namespaceURI, localName3);
      },
      /**
       * Returns a LiveNodeList of all child elements which have **all** of the given class name(s).
       *
       * Returns an empty list if `classNames` is an empty string or only contains HTML white space
       * characters.
       *
       * Warning: This returns a live LiveNodeList.
       * Changes in the DOM will reflect in the array as the changes occur.
       * If an element selected by this array no longer qualifies for the selector,
       * it will automatically be removed. Be aware of this for iteration purposes.
       *
       * @param {string} classNames
       * Is a string representing the class name(s) to match; multiple class names are separated by
       * (ASCII-)whitespace.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
       * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
       */
      getElementsByClassName: function(classNames) {
        var classNamesSet = toOrderedSet(classNames);
        return new LiveNodeList(this, function(base) {
          var ls = [];
          if (classNamesSet.length > 0) {
            _visitNode(base, function(node) {
              if (node !== base && node.nodeType === ELEMENT_NODE) {
                var nodeClassNames = node.getAttribute("class");
                if (nodeClassNames) {
                  var matches = classNames === nodeClassNames;
                  if (!matches) {
                    var nodeClassNamesSet = toOrderedSet(nodeClassNames);
                    matches = classNamesSet.every(arrayIncludes(nodeClassNamesSet));
                  }
                  if (matches) {
                    ls.push(node);
                  }
                }
              }
            });
          }
          return ls;
        });
      },
      /**
       * Returns a LiveNodeList of elements with the given qualifiedName.
       * Searching for all descendants can be done by passing `*` as `qualifiedName`.
       *
       * All descendants of the specified element are searched, but not the element itself.
       * The returned list is live, which means it updates itself with the DOM tree automatically.
       * Therefore, there is no need to call `Element.getElementsByTagName()`
       * with the same element and arguments repeatedly if the DOM changes in between calls.
       *
       * When called on an HTML element in an HTML document,
       * `getElementsByTagName` lower-cases the argument before searching for it.
       * This is undesirable when trying to match camel-cased SVG elements (such as
       * `<linearGradient>`) in an HTML document.
       * Instead, use `Element.getElementsByTagNameNS()`,
       * which preserves the capitalization of the tag name.
       *
       * `Element.getElementsByTagName` is similar to `Document.getElementsByTagName()`,
       * except that it only searches for elements that are descendants of the specified element.
       *
       * @param {string} qualifiedName
       * @returns {LiveNodeList}
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
       * @see https://dom.spec.whatwg.org/#concept-getelementsbytagname
       */
      getElementsByTagName: function(qualifiedName) {
        var isHTMLDocument = (this.nodeType === DOCUMENT_NODE ? this : this.ownerDocument).type === "html";
        var lowerQualifiedName = qualifiedName.toLowerCase();
        return new LiveNodeList(this, function(base) {
          var ls = [];
          _visitNode(base, function(node) {
            if (node === base || node.nodeType !== ELEMENT_NODE) {
              return;
            }
            if (qualifiedName === "*") {
              ls.push(node);
            } else {
              var nodeQualifiedName = node.getQualifiedName();
              var matchingQName = isHTMLDocument && node.namespaceURI === NAMESPACE.HTML ? lowerQualifiedName : qualifiedName;
              if (nodeQualifiedName === matchingQName) {
                ls.push(node);
              }
            }
          });
          return ls;
        });
      },
      getElementsByTagNameNS: function(namespaceURI, localName3) {
        return new LiveNodeList(this, function(base) {
          var ls = [];
          _visitNode(base, function(node) {
            if (node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === "*" || node.namespaceURI === namespaceURI) && (localName3 === "*" || node.localName == localName3)) {
              ls.push(node);
            }
          });
          return ls;
        });
      }
    };
    Document.prototype.getElementsByClassName = Element.prototype.getElementsByClassName;
    Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
    Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;
    _extends(Element, Node);
    function Attr(symbol) {
      checkSymbol(symbol);
      this.namespaceURI = null;
      this.prefix = null;
      this.ownerElement = null;
    }
    Attr.prototype.nodeType = ATTRIBUTE_NODE;
    _extends(Attr, Node);
    function CharacterData(symbol) {
      checkSymbol(symbol);
    }
    CharacterData.prototype = {
      data: "",
      substringData: function(offset, count) {
        return this.data.substring(offset, offset + count);
      },
      appendData: function(text) {
        text = this.data + text;
        this.nodeValue = this.data = text;
        this.length = text.length;
      },
      insertData: function(offset, text) {
        this.replaceData(offset, 0, text);
      },
      deleteData: function(offset, count) {
        this.replaceData(offset, count, "");
      },
      replaceData: function(offset, count, text) {
        var start = this.data.substring(0, offset);
        var end = this.data.substring(offset + count);
        text = start + text + end;
        this.nodeValue = this.data = text;
        this.length = text.length;
      }
    };
    _extends(CharacterData, Node);
    function Text(symbol) {
      checkSymbol(symbol);
    }
    Text.prototype = {
      nodeName: "#text",
      nodeType: TEXT_NODE,
      splitText: function(offset) {
        var text = this.data;
        var newText = text.substring(offset);
        text = text.substring(0, offset);
        this.data = this.nodeValue = text;
        this.length = text.length;
        var newNode = this.ownerDocument.createTextNode(newText);
        if (this.parentNode) {
          this.parentNode.insertBefore(newNode, this.nextSibling);
        }
        return newNode;
      }
    };
    _extends(Text, CharacterData);
    function Comment(symbol) {
      checkSymbol(symbol);
    }
    Comment.prototype = {
      nodeName: "#comment",
      nodeType: COMMENT_NODE
    };
    _extends(Comment, CharacterData);
    function CDATASection(symbol) {
      checkSymbol(symbol);
    }
    CDATASection.prototype = {
      nodeName: "#cdata-section",
      nodeType: CDATA_SECTION_NODE
    };
    _extends(CDATASection, Text);
    function DocumentType(symbol) {
      checkSymbol(symbol);
    }
    DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
    _extends(DocumentType, Node);
    function Notation(symbol) {
      checkSymbol(symbol);
    }
    Notation.prototype.nodeType = NOTATION_NODE;
    _extends(Notation, Node);
    function Entity(symbol) {
      checkSymbol(symbol);
    }
    Entity.prototype.nodeType = ENTITY_NODE;
    _extends(Entity, Node);
    function EntityReference(symbol) {
      checkSymbol(symbol);
    }
    EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
    _extends(EntityReference, Node);
    function DocumentFragment(symbol) {
      checkSymbol(symbol);
    }
    DocumentFragment.prototype.nodeName = "#document-fragment";
    DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE;
    _extends(DocumentFragment, Node);
    function ProcessingInstruction(symbol) {
      checkSymbol(symbol);
    }
    ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
    _extends(ProcessingInstruction, CharacterData);
    function XMLSerializer2() {
    }
    XMLSerializer2.prototype.serializeToString = function(node, nodeFilter) {
      return nodeSerializeToString.call(node, nodeFilter);
    };
    Node.prototype.toString = nodeSerializeToString;
    function nodeSerializeToString(nodeFilter) {
      var buf = [];
      var refNode = this.nodeType === DOCUMENT_NODE && this.documentElement || this;
      var prefix = refNode.prefix;
      var uri = refNode.namespaceURI;
      if (uri && prefix == null) {
        var prefix = refNode.lookupPrefix(uri);
        if (prefix == null) {
          var visibleNamespaces = [
            { namespace: uri, prefix: null }
            //{namespace:uri,prefix:''}
          ];
        }
      }
      serializeToString(this, buf, nodeFilter, visibleNamespaces);
      return buf.join("");
    }
    function needNamespaceDefine(node, isHTML, visibleNamespaces) {
      var prefix = node.prefix || "";
      var uri = node.namespaceURI;
      if (!uri) {
        return false;
      }
      if (prefix === "xml" && uri === NAMESPACE.XML || uri === NAMESPACE.XMLNS) {
        return false;
      }
      var i = visibleNamespaces.length;
      while (i--) {
        var ns = visibleNamespaces[i];
        if (ns.prefix === prefix) {
          return ns.namespace !== uri;
        }
      }
      return true;
    }
    function addSerializedAttribute(buf, qualifiedName, value) {
      buf.push(" ", qualifiedName, '="', value.replace(/[<>&"\t\n\r]/g, _xmlEncoder), '"');
    }
    function serializeToString(node, buf, nodeFilter, visibleNamespaces) {
      if (!visibleNamespaces) {
        visibleNamespaces = [];
      }
      var doc = node.nodeType === DOCUMENT_NODE ? node : node.ownerDocument;
      var isHTML = doc.type === "html";
      if (nodeFilter) {
        node = nodeFilter(node);
        if (node) {
          if (typeof node == "string") {
            buf.push(node);
            return;
          }
        } else {
          return;
        }
      }
      switch (node.nodeType) {
        case ELEMENT_NODE:
          var attrs = node.attributes;
          var len = attrs.length;
          var child = node.firstChild;
          var nodeName = node.tagName;
          var prefixedNodeName = nodeName;
          if (!isHTML && !node.prefix && node.namespaceURI) {
            var defaultNS;
            for (var ai = 0; ai < attrs.length; ai++) {
              if (attrs.item(ai).name === "xmlns") {
                defaultNS = attrs.item(ai).value;
                break;
              }
            }
            if (!defaultNS) {
              for (var nsi = visibleNamespaces.length - 1; nsi >= 0; nsi--) {
                var namespace = visibleNamespaces[nsi];
                if (namespace.prefix === "" && namespace.namespace === node.namespaceURI) {
                  defaultNS = namespace.namespace;
                  break;
                }
              }
            }
            if (defaultNS !== node.namespaceURI) {
              for (var nsi = visibleNamespaces.length - 1; nsi >= 0; nsi--) {
                var namespace = visibleNamespaces[nsi];
                if (namespace.namespace === node.namespaceURI) {
                  if (namespace.prefix) {
                    prefixedNodeName = namespace.prefix + ":" + nodeName;
                  }
                  break;
                }
              }
            }
          }
          buf.push("<", prefixedNodeName);
          for (var i = 0; i < len; i++) {
            var attr = attrs.item(i);
            if (attr.prefix == "xmlns") {
              visibleNamespaces.push({
                prefix: attr.localName,
                namespace: attr.value
              });
            } else if (attr.nodeName == "xmlns") {
              visibleNamespaces.push({ prefix: "", namespace: attr.value });
            }
          }
          for (var i = 0; i < len; i++) {
            var attr = attrs.item(i);
            if (needNamespaceDefine(attr, isHTML, visibleNamespaces)) {
              var prefix = attr.prefix || "";
              var uri = attr.namespaceURI;
              addSerializedAttribute(buf, prefix ? "xmlns:" + prefix : "xmlns", uri);
              visibleNamespaces.push({ prefix, namespace: uri });
            }
            serializeToString(attr, buf, nodeFilter, visibleNamespaces);
          }
          if (nodeName === prefixedNodeName && needNamespaceDefine(node, isHTML, visibleNamespaces)) {
            var prefix = node.prefix || "";
            var uri = node.namespaceURI;
            addSerializedAttribute(buf, prefix ? "xmlns:" + prefix : "xmlns", uri);
            visibleNamespaces.push({ prefix, namespace: uri });
          }
          var canCloseTag = !child;
          if (canCloseTag && (isHTML || node.namespaceURI === NAMESPACE.HTML)) {
            canCloseTag = isHTMLVoidElement(nodeName);
          }
          if (canCloseTag) {
            buf.push("/>");
          } else {
            buf.push(">");
            if (isHTML && isHTMLRawTextElement(nodeName)) {
              while (child) {
                if (child.data) {
                  buf.push(child.data);
                } else {
                  serializeToString(child, buf, nodeFilter, visibleNamespaces.slice());
                }
                child = child.nextSibling;
              }
            } else {
              while (child) {
                serializeToString(child, buf, nodeFilter, visibleNamespaces.slice());
                child = child.nextSibling;
              }
            }
            buf.push("</", prefixedNodeName, ">");
          }
          return;
        case DOCUMENT_NODE:
        case DOCUMENT_FRAGMENT_NODE:
          var child = node.firstChild;
          while (child) {
            serializeToString(child, buf, nodeFilter, visibleNamespaces.slice());
            child = child.nextSibling;
          }
          return;
        case ATTRIBUTE_NODE:
          return addSerializedAttribute(buf, node.name, node.value);
        case TEXT_NODE:
          return buf.push(node.data.replace(/[<&>]/g, _xmlEncoder));
        case CDATA_SECTION_NODE:
          return buf.push(g.CDATA_START, node.data, g.CDATA_END);
        case COMMENT_NODE:
          return buf.push(g.COMMENT_START, node.data, g.COMMENT_END);
        case DOCUMENT_TYPE_NODE:
          var pubid = node.publicId;
          var sysid = node.systemId;
          buf.push(g.DOCTYPE_DECL_START, " ", node.name);
          if (pubid) {
            buf.push(" ", g.PUBLIC, " ", pubid);
            if (sysid && sysid !== ".") {
              buf.push(" ", sysid);
            }
          } else if (sysid && sysid !== ".") {
            buf.push(" ", g.SYSTEM, " ", sysid);
          }
          if (node.internalSubset) {
            buf.push(" [", node.internalSubset, "]");
          }
          buf.push(">");
          return;
        case PROCESSING_INSTRUCTION_NODE:
          return buf.push("<?", node.target, " ", node.data, "?>");
        case ENTITY_REFERENCE_NODE:
          return buf.push("&", node.nodeName, ";");
        //case ENTITY_NODE:
        //case NOTATION_NODE:
        default:
          buf.push("??", node.nodeName);
      }
    }
    function importNode(doc, node, deep) {
      var node2;
      switch (node.nodeType) {
        case ELEMENT_NODE:
          node2 = node.cloneNode(false);
          node2.ownerDocument = doc;
        //var attrs = node2.attributes;
        //var len = attrs.length;
        //for(var i=0;i<len;i++){
        //node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
        //}
        case DOCUMENT_FRAGMENT_NODE:
          break;
        case ATTRIBUTE_NODE:
          deep = true;
          break;
      }
      if (!node2) {
        node2 = node.cloneNode(false);
      }
      node2.ownerDocument = doc;
      node2.parentNode = null;
      if (deep) {
        var child = node.firstChild;
        while (child) {
          node2.appendChild(importNode(doc, child, deep));
          child = child.nextSibling;
        }
      }
      return node2;
    }
    function cloneNode(doc, node, deep) {
      var node2 = new node.constructor(PDC);
      for (var n in node) {
        if (hasOwn(node, n)) {
          var v = node[n];
          if (typeof v != "object") {
            if (v != node2[n]) {
              node2[n] = v;
            }
          }
        }
      }
      if (node.childNodes) {
        node2.childNodes = new NodeList();
      }
      node2.ownerDocument = doc;
      switch (node2.nodeType) {
        case ELEMENT_NODE:
          var attrs = node.attributes;
          var attrs2 = node2.attributes = new NamedNodeMap();
          var len = attrs.length;
          attrs2._ownerElement = node2;
          for (var i = 0; i < len; i++) {
            node2.setAttributeNode(cloneNode(doc, attrs.item(i), true));
          }
          break;
        case ATTRIBUTE_NODE:
          deep = true;
      }
      if (deep) {
        var child = node.firstChild;
        while (child) {
          node2.appendChild(cloneNode(doc, child, deep));
          child = child.nextSibling;
        }
      }
      return node2;
    }
    function __set__(object, key, value) {
      object[key] = value;
    }
    try {
      if (Object.defineProperty) {
        let getTextContent2 = function(node) {
          switch (node.nodeType) {
            case ELEMENT_NODE:
            case DOCUMENT_FRAGMENT_NODE:
              var buf = [];
              node = node.firstChild;
              while (node) {
                if (node.nodeType !== 7 && node.nodeType !== 8) {
                  buf.push(getTextContent2(node));
                }
                node = node.nextSibling;
              }
              return buf.join("");
            default:
              return node.nodeValue;
          }
        };
        Object.defineProperty(LiveNodeList.prototype, "length", {
          get: function() {
            _updateLiveList(this);
            return this.$$length;
          }
        });
        Object.defineProperty(Node.prototype, "textContent", {
          get: function() {
            return getTextContent2(this);
          },
          set: function(data) {
            switch (this.nodeType) {
              case ELEMENT_NODE:
              case DOCUMENT_FRAGMENT_NODE:
                while (this.firstChild) {
                  this.removeChild(this.firstChild);
                }
                if (data || String(data)) {
                  this.appendChild(this.ownerDocument.createTextNode(data));
                }
                break;
              default:
                this.data = data;
                this.value = data;
                this.nodeValue = data;
            }
          }
        });
        __set__ = function(object, key, value) {
          object["$$" + key] = value;
        };
      }
    } catch (e) {
    }
    exports._updateLiveList = _updateLiveList;
    exports.Attr = Attr;
    exports.CDATASection = CDATASection;
    exports.CharacterData = CharacterData;
    exports.Comment = Comment;
    exports.Document = Document;
    exports.DocumentFragment = DocumentFragment;
    exports.DocumentType = DocumentType;
    exports.DOMImplementation = DOMImplementation;
    exports.Element = Element;
    exports.Entity = Entity;
    exports.EntityReference = EntityReference;
    exports.LiveNodeList = LiveNodeList;
    exports.NamedNodeMap = NamedNodeMap;
    exports.Node = Node;
    exports.NodeList = NodeList;
    exports.Notation = Notation;
    exports.Text = Text;
    exports.ProcessingInstruction = ProcessingInstruction;
    exports.XMLSerializer = XMLSerializer2;
  }
});

// node_modules/@xmldom/xmldom/lib/entities.js
var require_entities = __commonJS({
  "node_modules/@xmldom/xmldom/lib/entities.js"(exports) {
    "use strict";
    var freeze = require_conventions().freeze;
    exports.XML_ENTITIES = freeze({
      amp: "&",
      apos: "'",
      gt: ">",
      lt: "<",
      quot: '"'
    });
    exports.HTML_ENTITIES = freeze({
      Aacute: "\xC1",
      aacute: "\xE1",
      Abreve: "\u0102",
      abreve: "\u0103",
      ac: "\u223E",
      acd: "\u223F",
      acE: "\u223E\u0333",
      Acirc: "\xC2",
      acirc: "\xE2",
      acute: "\xB4",
      Acy: "\u0410",
      acy: "\u0430",
      AElig: "\xC6",
      aelig: "\xE6",
      af: "\u2061",
      Afr: "\u{1D504}",
      afr: "\u{1D51E}",
      Agrave: "\xC0",
      agrave: "\xE0",
      alefsym: "\u2135",
      aleph: "\u2135",
      Alpha: "\u0391",
      alpha: "\u03B1",
      Amacr: "\u0100",
      amacr: "\u0101",
      amalg: "\u2A3F",
      AMP: "&",
      amp: "&",
      And: "\u2A53",
      and: "\u2227",
      andand: "\u2A55",
      andd: "\u2A5C",
      andslope: "\u2A58",
      andv: "\u2A5A",
      ang: "\u2220",
      ange: "\u29A4",
      angle: "\u2220",
      angmsd: "\u2221",
      angmsdaa: "\u29A8",
      angmsdab: "\u29A9",
      angmsdac: "\u29AA",
      angmsdad: "\u29AB",
      angmsdae: "\u29AC",
      angmsdaf: "\u29AD",
      angmsdag: "\u29AE",
      angmsdah: "\u29AF",
      angrt: "\u221F",
      angrtvb: "\u22BE",
      angrtvbd: "\u299D",
      angsph: "\u2222",
      angst: "\xC5",
      angzarr: "\u237C",
      Aogon: "\u0104",
      aogon: "\u0105",
      Aopf: "\u{1D538}",
      aopf: "\u{1D552}",
      ap: "\u2248",
      apacir: "\u2A6F",
      apE: "\u2A70",
      ape: "\u224A",
      apid: "\u224B",
      apos: "'",
      ApplyFunction: "\u2061",
      approx: "\u2248",
      approxeq: "\u224A",
      Aring: "\xC5",
      aring: "\xE5",
      Ascr: "\u{1D49C}",
      ascr: "\u{1D4B6}",
      Assign: "\u2254",
      ast: "*",
      asymp: "\u2248",
      asympeq: "\u224D",
      Atilde: "\xC3",
      atilde: "\xE3",
      Auml: "\xC4",
      auml: "\xE4",
      awconint: "\u2233",
      awint: "\u2A11",
      backcong: "\u224C",
      backepsilon: "\u03F6",
      backprime: "\u2035",
      backsim: "\u223D",
      backsimeq: "\u22CD",
      Backslash: "\u2216",
      Barv: "\u2AE7",
      barvee: "\u22BD",
      Barwed: "\u2306",
      barwed: "\u2305",
      barwedge: "\u2305",
      bbrk: "\u23B5",
      bbrktbrk: "\u23B6",
      bcong: "\u224C",
      Bcy: "\u0411",
      bcy: "\u0431",
      bdquo: "\u201E",
      becaus: "\u2235",
      Because: "\u2235",
      because: "\u2235",
      bemptyv: "\u29B0",
      bepsi: "\u03F6",
      bernou: "\u212C",
      Bernoullis: "\u212C",
      Beta: "\u0392",
      beta: "\u03B2",
      beth: "\u2136",
      between: "\u226C",
      Bfr: "\u{1D505}",
      bfr: "\u{1D51F}",
      bigcap: "\u22C2",
      bigcirc: "\u25EF",
      bigcup: "\u22C3",
      bigodot: "\u2A00",
      bigoplus: "\u2A01",
      bigotimes: "\u2A02",
      bigsqcup: "\u2A06",
      bigstar: "\u2605",
      bigtriangledown: "\u25BD",
      bigtriangleup: "\u25B3",
      biguplus: "\u2A04",
      bigvee: "\u22C1",
      bigwedge: "\u22C0",
      bkarow: "\u290D",
      blacklozenge: "\u29EB",
      blacksquare: "\u25AA",
      blacktriangle: "\u25B4",
      blacktriangledown: "\u25BE",
      blacktriangleleft: "\u25C2",
      blacktriangleright: "\u25B8",
      blank: "\u2423",
      blk12: "\u2592",
      blk14: "\u2591",
      blk34: "\u2593",
      block: "\u2588",
      bne: "=\u20E5",
      bnequiv: "\u2261\u20E5",
      bNot: "\u2AED",
      bnot: "\u2310",
      Bopf: "\u{1D539}",
      bopf: "\u{1D553}",
      bot: "\u22A5",
      bottom: "\u22A5",
      bowtie: "\u22C8",
      boxbox: "\u29C9",
      boxDL: "\u2557",
      boxDl: "\u2556",
      boxdL: "\u2555",
      boxdl: "\u2510",
      boxDR: "\u2554",
      boxDr: "\u2553",
      boxdR: "\u2552",
      boxdr: "\u250C",
      boxH: "\u2550",
      boxh: "\u2500",
      boxHD: "\u2566",
      boxHd: "\u2564",
      boxhD: "\u2565",
      boxhd: "\u252C",
      boxHU: "\u2569",
      boxHu: "\u2567",
      boxhU: "\u2568",
      boxhu: "\u2534",
      boxminus: "\u229F",
      boxplus: "\u229E",
      boxtimes: "\u22A0",
      boxUL: "\u255D",
      boxUl: "\u255C",
      boxuL: "\u255B",
      boxul: "\u2518",
      boxUR: "\u255A",
      boxUr: "\u2559",
      boxuR: "\u2558",
      boxur: "\u2514",
      boxV: "\u2551",
      boxv: "\u2502",
      boxVH: "\u256C",
      boxVh: "\u256B",
      boxvH: "\u256A",
      boxvh: "\u253C",
      boxVL: "\u2563",
      boxVl: "\u2562",
      boxvL: "\u2561",
      boxvl: "\u2524",
      boxVR: "\u2560",
      boxVr: "\u255F",
      boxvR: "\u255E",
      boxvr: "\u251C",
      bprime: "\u2035",
      Breve: "\u02D8",
      breve: "\u02D8",
      brvbar: "\xA6",
      Bscr: "\u212C",
      bscr: "\u{1D4B7}",
      bsemi: "\u204F",
      bsim: "\u223D",
      bsime: "\u22CD",
      bsol: "\\",
      bsolb: "\u29C5",
      bsolhsub: "\u27C8",
      bull: "\u2022",
      bullet: "\u2022",
      bump: "\u224E",
      bumpE: "\u2AAE",
      bumpe: "\u224F",
      Bumpeq: "\u224E",
      bumpeq: "\u224F",
      Cacute: "\u0106",
      cacute: "\u0107",
      Cap: "\u22D2",
      cap: "\u2229",
      capand: "\u2A44",
      capbrcup: "\u2A49",
      capcap: "\u2A4B",
      capcup: "\u2A47",
      capdot: "\u2A40",
      CapitalDifferentialD: "\u2145",
      caps: "\u2229\uFE00",
      caret: "\u2041",
      caron: "\u02C7",
      Cayleys: "\u212D",
      ccaps: "\u2A4D",
      Ccaron: "\u010C",
      ccaron: "\u010D",
      Ccedil: "\xC7",
      ccedil: "\xE7",
      Ccirc: "\u0108",
      ccirc: "\u0109",
      Cconint: "\u2230",
      ccups: "\u2A4C",
      ccupssm: "\u2A50",
      Cdot: "\u010A",
      cdot: "\u010B",
      cedil: "\xB8",
      Cedilla: "\xB8",
      cemptyv: "\u29B2",
      cent: "\xA2",
      CenterDot: "\xB7",
      centerdot: "\xB7",
      Cfr: "\u212D",
      cfr: "\u{1D520}",
      CHcy: "\u0427",
      chcy: "\u0447",
      check: "\u2713",
      checkmark: "\u2713",
      Chi: "\u03A7",
      chi: "\u03C7",
      cir: "\u25CB",
      circ: "\u02C6",
      circeq: "\u2257",
      circlearrowleft: "\u21BA",
      circlearrowright: "\u21BB",
      circledast: "\u229B",
      circledcirc: "\u229A",
      circleddash: "\u229D",
      CircleDot: "\u2299",
      circledR: "\xAE",
      circledS: "\u24C8",
      CircleMinus: "\u2296",
      CirclePlus: "\u2295",
      CircleTimes: "\u2297",
      cirE: "\u29C3",
      cire: "\u2257",
      cirfnint: "\u2A10",
      cirmid: "\u2AEF",
      cirscir: "\u29C2",
      ClockwiseContourIntegral: "\u2232",
      CloseCurlyDoubleQuote: "\u201D",
      CloseCurlyQuote: "\u2019",
      clubs: "\u2663",
      clubsuit: "\u2663",
      Colon: "\u2237",
      colon: ":",
      Colone: "\u2A74",
      colone: "\u2254",
      coloneq: "\u2254",
      comma: ",",
      commat: "@",
      comp: "\u2201",
      compfn: "\u2218",
      complement: "\u2201",
      complexes: "\u2102",
      cong: "\u2245",
      congdot: "\u2A6D",
      Congruent: "\u2261",
      Conint: "\u222F",
      conint: "\u222E",
      ContourIntegral: "\u222E",
      Copf: "\u2102",
      copf: "\u{1D554}",
      coprod: "\u2210",
      Coproduct: "\u2210",
      COPY: "\xA9",
      copy: "\xA9",
      copysr: "\u2117",
      CounterClockwiseContourIntegral: "\u2233",
      crarr: "\u21B5",
      Cross: "\u2A2F",
      cross: "\u2717",
      Cscr: "\u{1D49E}",
      cscr: "\u{1D4B8}",
      csub: "\u2ACF",
      csube: "\u2AD1",
      csup: "\u2AD0",
      csupe: "\u2AD2",
      ctdot: "\u22EF",
      cudarrl: "\u2938",
      cudarrr: "\u2935",
      cuepr: "\u22DE",
      cuesc: "\u22DF",
      cularr: "\u21B6",
      cularrp: "\u293D",
      Cup: "\u22D3",
      cup: "\u222A",
      cupbrcap: "\u2A48",
      CupCap: "\u224D",
      cupcap: "\u2A46",
      cupcup: "\u2A4A",
      cupdot: "\u228D",
      cupor: "\u2A45",
      cups: "\u222A\uFE00",
      curarr: "\u21B7",
      curarrm: "\u293C",
      curlyeqprec: "\u22DE",
      curlyeqsucc: "\u22DF",
      curlyvee: "\u22CE",
      curlywedge: "\u22CF",
      curren: "\xA4",
      curvearrowleft: "\u21B6",
      curvearrowright: "\u21B7",
      cuvee: "\u22CE",
      cuwed: "\u22CF",
      cwconint: "\u2232",
      cwint: "\u2231",
      cylcty: "\u232D",
      Dagger: "\u2021",
      dagger: "\u2020",
      daleth: "\u2138",
      Darr: "\u21A1",
      dArr: "\u21D3",
      darr: "\u2193",
      dash: "\u2010",
      Dashv: "\u2AE4",
      dashv: "\u22A3",
      dbkarow: "\u290F",
      dblac: "\u02DD",
      Dcaron: "\u010E",
      dcaron: "\u010F",
      Dcy: "\u0414",
      dcy: "\u0434",
      DD: "\u2145",
      dd: "\u2146",
      ddagger: "\u2021",
      ddarr: "\u21CA",
      DDotrahd: "\u2911",
      ddotseq: "\u2A77",
      deg: "\xB0",
      Del: "\u2207",
      Delta: "\u0394",
      delta: "\u03B4",
      demptyv: "\u29B1",
      dfisht: "\u297F",
      Dfr: "\u{1D507}",
      dfr: "\u{1D521}",
      dHar: "\u2965",
      dharl: "\u21C3",
      dharr: "\u21C2",
      DiacriticalAcute: "\xB4",
      DiacriticalDot: "\u02D9",
      DiacriticalDoubleAcute: "\u02DD",
      DiacriticalGrave: "`",
      DiacriticalTilde: "\u02DC",
      diam: "\u22C4",
      Diamond: "\u22C4",
      diamond: "\u22C4",
      diamondsuit: "\u2666",
      diams: "\u2666",
      die: "\xA8",
      DifferentialD: "\u2146",
      digamma: "\u03DD",
      disin: "\u22F2",
      div: "\xF7",
      divide: "\xF7",
      divideontimes: "\u22C7",
      divonx: "\u22C7",
      DJcy: "\u0402",
      djcy: "\u0452",
      dlcorn: "\u231E",
      dlcrop: "\u230D",
      dollar: "$",
      Dopf: "\u{1D53B}",
      dopf: "\u{1D555}",
      Dot: "\xA8",
      dot: "\u02D9",
      DotDot: "\u20DC",
      doteq: "\u2250",
      doteqdot: "\u2251",
      DotEqual: "\u2250",
      dotminus: "\u2238",
      dotplus: "\u2214",
      dotsquare: "\u22A1",
      doublebarwedge: "\u2306",
      DoubleContourIntegral: "\u222F",
      DoubleDot: "\xA8",
      DoubleDownArrow: "\u21D3",
      DoubleLeftArrow: "\u21D0",
      DoubleLeftRightArrow: "\u21D4",
      DoubleLeftTee: "\u2AE4",
      DoubleLongLeftArrow: "\u27F8",
      DoubleLongLeftRightArrow: "\u27FA",
      DoubleLongRightArrow: "\u27F9",
      DoubleRightArrow: "\u21D2",
      DoubleRightTee: "\u22A8",
      DoubleUpArrow: "\u21D1",
      DoubleUpDownArrow: "\u21D5",
      DoubleVerticalBar: "\u2225",
      DownArrow: "\u2193",
      Downarrow: "\u21D3",
      downarrow: "\u2193",
      DownArrowBar: "\u2913",
      DownArrowUpArrow: "\u21F5",
      DownBreve: "\u0311",
      downdownarrows: "\u21CA",
      downharpoonleft: "\u21C3",
      downharpoonright: "\u21C2",
      DownLeftRightVector: "\u2950",
      DownLeftTeeVector: "\u295E",
      DownLeftVector: "\u21BD",
      DownLeftVectorBar: "\u2956",
      DownRightTeeVector: "\u295F",
      DownRightVector: "\u21C1",
      DownRightVectorBar: "\u2957",
      DownTee: "\u22A4",
      DownTeeArrow: "\u21A7",
      drbkarow: "\u2910",
      drcorn: "\u231F",
      drcrop: "\u230C",
      Dscr: "\u{1D49F}",
      dscr: "\u{1D4B9}",
      DScy: "\u0405",
      dscy: "\u0455",
      dsol: "\u29F6",
      Dstrok: "\u0110",
      dstrok: "\u0111",
      dtdot: "\u22F1",
      dtri: "\u25BF",
      dtrif: "\u25BE",
      duarr: "\u21F5",
      duhar: "\u296F",
      dwangle: "\u29A6",
      DZcy: "\u040F",
      dzcy: "\u045F",
      dzigrarr: "\u27FF",
      Eacute: "\xC9",
      eacute: "\xE9",
      easter: "\u2A6E",
      Ecaron: "\u011A",
      ecaron: "\u011B",
      ecir: "\u2256",
      Ecirc: "\xCA",
      ecirc: "\xEA",
      ecolon: "\u2255",
      Ecy: "\u042D",
      ecy: "\u044D",
      eDDot: "\u2A77",
      Edot: "\u0116",
      eDot: "\u2251",
      edot: "\u0117",
      ee: "\u2147",
      efDot: "\u2252",
      Efr: "\u{1D508}",
      efr: "\u{1D522}",
      eg: "\u2A9A",
      Egrave: "\xC8",
      egrave: "\xE8",
      egs: "\u2A96",
      egsdot: "\u2A98",
      el: "\u2A99",
      Element: "\u2208",
      elinters: "\u23E7",
      ell: "\u2113",
      els: "\u2A95",
      elsdot: "\u2A97",
      Emacr: "\u0112",
      emacr: "\u0113",
      empty: "\u2205",
      emptyset: "\u2205",
      EmptySmallSquare: "\u25FB",
      emptyv: "\u2205",
      EmptyVerySmallSquare: "\u25AB",
      emsp: "\u2003",
      emsp13: "\u2004",
      emsp14: "\u2005",
      ENG: "\u014A",
      eng: "\u014B",
      ensp: "\u2002",
      Eogon: "\u0118",
      eogon: "\u0119",
      Eopf: "\u{1D53C}",
      eopf: "\u{1D556}",
      epar: "\u22D5",
      eparsl: "\u29E3",
      eplus: "\u2A71",
      epsi: "\u03B5",
      Epsilon: "\u0395",
      epsilon: "\u03B5",
      epsiv: "\u03F5",
      eqcirc: "\u2256",
      eqcolon: "\u2255",
      eqsim: "\u2242",
      eqslantgtr: "\u2A96",
      eqslantless: "\u2A95",
      Equal: "\u2A75",
      equals: "=",
      EqualTilde: "\u2242",
      equest: "\u225F",
      Equilibrium: "\u21CC",
      equiv: "\u2261",
      equivDD: "\u2A78",
      eqvparsl: "\u29E5",
      erarr: "\u2971",
      erDot: "\u2253",
      Escr: "\u2130",
      escr: "\u212F",
      esdot: "\u2250",
      Esim: "\u2A73",
      esim: "\u2242",
      Eta: "\u0397",
      eta: "\u03B7",
      ETH: "\xD0",
      eth: "\xF0",
      Euml: "\xCB",
      euml: "\xEB",
      euro: "\u20AC",
      excl: "!",
      exist: "\u2203",
      Exists: "\u2203",
      expectation: "\u2130",
      ExponentialE: "\u2147",
      exponentiale: "\u2147",
      fallingdotseq: "\u2252",
      Fcy: "\u0424",
      fcy: "\u0444",
      female: "\u2640",
      ffilig: "\uFB03",
      fflig: "\uFB00",
      ffllig: "\uFB04",
      Ffr: "\u{1D509}",
      ffr: "\u{1D523}",
      filig: "\uFB01",
      FilledSmallSquare: "\u25FC",
      FilledVerySmallSquare: "\u25AA",
      fjlig: "fj",
      flat: "\u266D",
      fllig: "\uFB02",
      fltns: "\u25B1",
      fnof: "\u0192",
      Fopf: "\u{1D53D}",
      fopf: "\u{1D557}",
      ForAll: "\u2200",
      forall: "\u2200",
      fork: "\u22D4",
      forkv: "\u2AD9",
      Fouriertrf: "\u2131",
      fpartint: "\u2A0D",
      frac12: "\xBD",
      frac13: "\u2153",
      frac14: "\xBC",
      frac15: "\u2155",
      frac16: "\u2159",
      frac18: "\u215B",
      frac23: "\u2154",
      frac25: "\u2156",
      frac34: "\xBE",
      frac35: "\u2157",
      frac38: "\u215C",
      frac45: "\u2158",
      frac56: "\u215A",
      frac58: "\u215D",
      frac78: "\u215E",
      frasl: "\u2044",
      frown: "\u2322",
      Fscr: "\u2131",
      fscr: "\u{1D4BB}",
      gacute: "\u01F5",
      Gamma: "\u0393",
      gamma: "\u03B3",
      Gammad: "\u03DC",
      gammad: "\u03DD",
      gap: "\u2A86",
      Gbreve: "\u011E",
      gbreve: "\u011F",
      Gcedil: "\u0122",
      Gcirc: "\u011C",
      gcirc: "\u011D",
      Gcy: "\u0413",
      gcy: "\u0433",
      Gdot: "\u0120",
      gdot: "\u0121",
      gE: "\u2267",
      ge: "\u2265",
      gEl: "\u2A8C",
      gel: "\u22DB",
      geq: "\u2265",
      geqq: "\u2267",
      geqslant: "\u2A7E",
      ges: "\u2A7E",
      gescc: "\u2AA9",
      gesdot: "\u2A80",
      gesdoto: "\u2A82",
      gesdotol: "\u2A84",
      gesl: "\u22DB\uFE00",
      gesles: "\u2A94",
      Gfr: "\u{1D50A}",
      gfr: "\u{1D524}",
      Gg: "\u22D9",
      gg: "\u226B",
      ggg: "\u22D9",
      gimel: "\u2137",
      GJcy: "\u0403",
      gjcy: "\u0453",
      gl: "\u2277",
      gla: "\u2AA5",
      glE: "\u2A92",
      glj: "\u2AA4",
      gnap: "\u2A8A",
      gnapprox: "\u2A8A",
      gnE: "\u2269",
      gne: "\u2A88",
      gneq: "\u2A88",
      gneqq: "\u2269",
      gnsim: "\u22E7",
      Gopf: "\u{1D53E}",
      gopf: "\u{1D558}",
      grave: "`",
      GreaterEqual: "\u2265",
      GreaterEqualLess: "\u22DB",
      GreaterFullEqual: "\u2267",
      GreaterGreater: "\u2AA2",
      GreaterLess: "\u2277",
      GreaterSlantEqual: "\u2A7E",
      GreaterTilde: "\u2273",
      Gscr: "\u{1D4A2}",
      gscr: "\u210A",
      gsim: "\u2273",
      gsime: "\u2A8E",
      gsiml: "\u2A90",
      Gt: "\u226B",
      GT: ">",
      gt: ">",
      gtcc: "\u2AA7",
      gtcir: "\u2A7A",
      gtdot: "\u22D7",
      gtlPar: "\u2995",
      gtquest: "\u2A7C",
      gtrapprox: "\u2A86",
      gtrarr: "\u2978",
      gtrdot: "\u22D7",
      gtreqless: "\u22DB",
      gtreqqless: "\u2A8C",
      gtrless: "\u2277",
      gtrsim: "\u2273",
      gvertneqq: "\u2269\uFE00",
      gvnE: "\u2269\uFE00",
      Hacek: "\u02C7",
      hairsp: "\u200A",
      half: "\xBD",
      hamilt: "\u210B",
      HARDcy: "\u042A",
      hardcy: "\u044A",
      hArr: "\u21D4",
      harr: "\u2194",
      harrcir: "\u2948",
      harrw: "\u21AD",
      Hat: "^",
      hbar: "\u210F",
      Hcirc: "\u0124",
      hcirc: "\u0125",
      hearts: "\u2665",
      heartsuit: "\u2665",
      hellip: "\u2026",
      hercon: "\u22B9",
      Hfr: "\u210C",
      hfr: "\u{1D525}",
      HilbertSpace: "\u210B",
      hksearow: "\u2925",
      hkswarow: "\u2926",
      hoarr: "\u21FF",
      homtht: "\u223B",
      hookleftarrow: "\u21A9",
      hookrightarrow: "\u21AA",
      Hopf: "\u210D",
      hopf: "\u{1D559}",
      horbar: "\u2015",
      HorizontalLine: "\u2500",
      Hscr: "\u210B",
      hscr: "\u{1D4BD}",
      hslash: "\u210F",
      Hstrok: "\u0126",
      hstrok: "\u0127",
      HumpDownHump: "\u224E",
      HumpEqual: "\u224F",
      hybull: "\u2043",
      hyphen: "\u2010",
      Iacute: "\xCD",
      iacute: "\xED",
      ic: "\u2063",
      Icirc: "\xCE",
      icirc: "\xEE",
      Icy: "\u0418",
      icy: "\u0438",
      Idot: "\u0130",
      IEcy: "\u0415",
      iecy: "\u0435",
      iexcl: "\xA1",
      iff: "\u21D4",
      Ifr: "\u2111",
      ifr: "\u{1D526}",
      Igrave: "\xCC",
      igrave: "\xEC",
      ii: "\u2148",
      iiiint: "\u2A0C",
      iiint: "\u222D",
      iinfin: "\u29DC",
      iiota: "\u2129",
      IJlig: "\u0132",
      ijlig: "\u0133",
      Im: "\u2111",
      Imacr: "\u012A",
      imacr: "\u012B",
      image: "\u2111",
      ImaginaryI: "\u2148",
      imagline: "\u2110",
      imagpart: "\u2111",
      imath: "\u0131",
      imof: "\u22B7",
      imped: "\u01B5",
      Implies: "\u21D2",
      in: "\u2208",
      incare: "\u2105",
      infin: "\u221E",
      infintie: "\u29DD",
      inodot: "\u0131",
      Int: "\u222C",
      int: "\u222B",
      intcal: "\u22BA",
      integers: "\u2124",
      Integral: "\u222B",
      intercal: "\u22BA",
      Intersection: "\u22C2",
      intlarhk: "\u2A17",
      intprod: "\u2A3C",
      InvisibleComma: "\u2063",
      InvisibleTimes: "\u2062",
      IOcy: "\u0401",
      iocy: "\u0451",
      Iogon: "\u012E",
      iogon: "\u012F",
      Iopf: "\u{1D540}",
      iopf: "\u{1D55A}",
      Iota: "\u0399",
      iota: "\u03B9",
      iprod: "\u2A3C",
      iquest: "\xBF",
      Iscr: "\u2110",
      iscr: "\u{1D4BE}",
      isin: "\u2208",
      isindot: "\u22F5",
      isinE: "\u22F9",
      isins: "\u22F4",
      isinsv: "\u22F3",
      isinv: "\u2208",
      it: "\u2062",
      Itilde: "\u0128",
      itilde: "\u0129",
      Iukcy: "\u0406",
      iukcy: "\u0456",
      Iuml: "\xCF",
      iuml: "\xEF",
      Jcirc: "\u0134",
      jcirc: "\u0135",
      Jcy: "\u0419",
      jcy: "\u0439",
      Jfr: "\u{1D50D}",
      jfr: "\u{1D527}",
      jmath: "\u0237",
      Jopf: "\u{1D541}",
      jopf: "\u{1D55B}",
      Jscr: "\u{1D4A5}",
      jscr: "\u{1D4BF}",
      Jsercy: "\u0408",
      jsercy: "\u0458",
      Jukcy: "\u0404",
      jukcy: "\u0454",
      Kappa: "\u039A",
      kappa: "\u03BA",
      kappav: "\u03F0",
      Kcedil: "\u0136",
      kcedil: "\u0137",
      Kcy: "\u041A",
      kcy: "\u043A",
      Kfr: "\u{1D50E}",
      kfr: "\u{1D528}",
      kgreen: "\u0138",
      KHcy: "\u0425",
      khcy: "\u0445",
      KJcy: "\u040C",
      kjcy: "\u045C",
      Kopf: "\u{1D542}",
      kopf: "\u{1D55C}",
      Kscr: "\u{1D4A6}",
      kscr: "\u{1D4C0}",
      lAarr: "\u21DA",
      Lacute: "\u0139",
      lacute: "\u013A",
      laemptyv: "\u29B4",
      lagran: "\u2112",
      Lambda: "\u039B",
      lambda: "\u03BB",
      Lang: "\u27EA",
      lang: "\u27E8",
      langd: "\u2991",
      langle: "\u27E8",
      lap: "\u2A85",
      Laplacetrf: "\u2112",
      laquo: "\xAB",
      Larr: "\u219E",
      lArr: "\u21D0",
      larr: "\u2190",
      larrb: "\u21E4",
      larrbfs: "\u291F",
      larrfs: "\u291D",
      larrhk: "\u21A9",
      larrlp: "\u21AB",
      larrpl: "\u2939",
      larrsim: "\u2973",
      larrtl: "\u21A2",
      lat: "\u2AAB",
      lAtail: "\u291B",
      latail: "\u2919",
      late: "\u2AAD",
      lates: "\u2AAD\uFE00",
      lBarr: "\u290E",
      lbarr: "\u290C",
      lbbrk: "\u2772",
      lbrace: "{",
      lbrack: "[",
      lbrke: "\u298B",
      lbrksld: "\u298F",
      lbrkslu: "\u298D",
      Lcaron: "\u013D",
      lcaron: "\u013E",
      Lcedil: "\u013B",
      lcedil: "\u013C",
      lceil: "\u2308",
      lcub: "{",
      Lcy: "\u041B",
      lcy: "\u043B",
      ldca: "\u2936",
      ldquo: "\u201C",
      ldquor: "\u201E",
      ldrdhar: "\u2967",
      ldrushar: "\u294B",
      ldsh: "\u21B2",
      lE: "\u2266",
      le: "\u2264",
      LeftAngleBracket: "\u27E8",
      LeftArrow: "\u2190",
      Leftarrow: "\u21D0",
      leftarrow: "\u2190",
      LeftArrowBar: "\u21E4",
      LeftArrowRightArrow: "\u21C6",
      leftarrowtail: "\u21A2",
      LeftCeiling: "\u2308",
      LeftDoubleBracket: "\u27E6",
      LeftDownTeeVector: "\u2961",
      LeftDownVector: "\u21C3",
      LeftDownVectorBar: "\u2959",
      LeftFloor: "\u230A",
      leftharpoondown: "\u21BD",
      leftharpoonup: "\u21BC",
      leftleftarrows: "\u21C7",
      LeftRightArrow: "\u2194",
      Leftrightarrow: "\u21D4",
      leftrightarrow: "\u2194",
      leftrightarrows: "\u21C6",
      leftrightharpoons: "\u21CB",
      leftrightsquigarrow: "\u21AD",
      LeftRightVector: "\u294E",
      LeftTee: "\u22A3",
      LeftTeeArrow: "\u21A4",
      LeftTeeVector: "\u295A",
      leftthreetimes: "\u22CB",
      LeftTriangle: "\u22B2",
      LeftTriangleBar: "\u29CF",
      LeftTriangleEqual: "\u22B4",
      LeftUpDownVector: "\u2951",
      LeftUpTeeVector: "\u2960",
      LeftUpVector: "\u21BF",
      LeftUpVectorBar: "\u2958",
      LeftVector: "\u21BC",
      LeftVectorBar: "\u2952",
      lEg: "\u2A8B",
      leg: "\u22DA",
      leq: "\u2264",
      leqq: "\u2266",
      leqslant: "\u2A7D",
      les: "\u2A7D",
      lescc: "\u2AA8",
      lesdot: "\u2A7F",
      lesdoto: "\u2A81",
      lesdotor: "\u2A83",
      lesg: "\u22DA\uFE00",
      lesges: "\u2A93",
      lessapprox: "\u2A85",
      lessdot: "\u22D6",
      lesseqgtr: "\u22DA",
      lesseqqgtr: "\u2A8B",
      LessEqualGreater: "\u22DA",
      LessFullEqual: "\u2266",
      LessGreater: "\u2276",
      lessgtr: "\u2276",
      LessLess: "\u2AA1",
      lesssim: "\u2272",
      LessSlantEqual: "\u2A7D",
      LessTilde: "\u2272",
      lfisht: "\u297C",
      lfloor: "\u230A",
      Lfr: "\u{1D50F}",
      lfr: "\u{1D529}",
      lg: "\u2276",
      lgE: "\u2A91",
      lHar: "\u2962",
      lhard: "\u21BD",
      lharu: "\u21BC",
      lharul: "\u296A",
      lhblk: "\u2584",
      LJcy: "\u0409",
      ljcy: "\u0459",
      Ll: "\u22D8",
      ll: "\u226A",
      llarr: "\u21C7",
      llcorner: "\u231E",
      Lleftarrow: "\u21DA",
      llhard: "\u296B",
      lltri: "\u25FA",
      Lmidot: "\u013F",
      lmidot: "\u0140",
      lmoust: "\u23B0",
      lmoustache: "\u23B0",
      lnap: "\u2A89",
      lnapprox: "\u2A89",
      lnE: "\u2268",
      lne: "\u2A87",
      lneq: "\u2A87",
      lneqq: "\u2268",
      lnsim: "\u22E6",
      loang: "\u27EC",
      loarr: "\u21FD",
      lobrk: "\u27E6",
      LongLeftArrow: "\u27F5",
      Longleftarrow: "\u27F8",
      longleftarrow: "\u27F5",
      LongLeftRightArrow: "\u27F7",
      Longleftrightarrow: "\u27FA",
      longleftrightarrow: "\u27F7",
      longmapsto: "\u27FC",
      LongRightArrow: "\u27F6",
      Longrightarrow: "\u27F9",
      longrightarrow: "\u27F6",
      looparrowleft: "\u21AB",
      looparrowright: "\u21AC",
      lopar: "\u2985",
      Lopf: "\u{1D543}",
      lopf: "\u{1D55D}",
      loplus: "\u2A2D",
      lotimes: "\u2A34",
      lowast: "\u2217",
      lowbar: "_",
      LowerLeftArrow: "\u2199",
      LowerRightArrow: "\u2198",
      loz: "\u25CA",
      lozenge: "\u25CA",
      lozf: "\u29EB",
      lpar: "(",
      lparlt: "\u2993",
      lrarr: "\u21C6",
      lrcorner: "\u231F",
      lrhar: "\u21CB",
      lrhard: "\u296D",
      lrm: "\u200E",
      lrtri: "\u22BF",
      lsaquo: "\u2039",
      Lscr: "\u2112",
      lscr: "\u{1D4C1}",
      Lsh: "\u21B0",
      lsh: "\u21B0",
      lsim: "\u2272",
      lsime: "\u2A8D",
      lsimg: "\u2A8F",
      lsqb: "[",
      lsquo: "\u2018",
      lsquor: "\u201A",
      Lstrok: "\u0141",
      lstrok: "\u0142",
      Lt: "\u226A",
      LT: "<",
      lt: "<",
      ltcc: "\u2AA6",
      ltcir: "\u2A79",
      ltdot: "\u22D6",
      lthree: "\u22CB",
      ltimes: "\u22C9",
      ltlarr: "\u2976",
      ltquest: "\u2A7B",
      ltri: "\u25C3",
      ltrie: "\u22B4",
      ltrif: "\u25C2",
      ltrPar: "\u2996",
      lurdshar: "\u294A",
      luruhar: "\u2966",
      lvertneqq: "\u2268\uFE00",
      lvnE: "\u2268\uFE00",
      macr: "\xAF",
      male: "\u2642",
      malt: "\u2720",
      maltese: "\u2720",
      Map: "\u2905",
      map: "\u21A6",
      mapsto: "\u21A6",
      mapstodown: "\u21A7",
      mapstoleft: "\u21A4",
      mapstoup: "\u21A5",
      marker: "\u25AE",
      mcomma: "\u2A29",
      Mcy: "\u041C",
      mcy: "\u043C",
      mdash: "\u2014",
      mDDot: "\u223A",
      measuredangle: "\u2221",
      MediumSpace: "\u205F",
      Mellintrf: "\u2133",
      Mfr: "\u{1D510}",
      mfr: "\u{1D52A}",
      mho: "\u2127",
      micro: "\xB5",
      mid: "\u2223",
      midast: "*",
      midcir: "\u2AF0",
      middot: "\xB7",
      minus: "\u2212",
      minusb: "\u229F",
      minusd: "\u2238",
      minusdu: "\u2A2A",
      MinusPlus: "\u2213",
      mlcp: "\u2ADB",
      mldr: "\u2026",
      mnplus: "\u2213",
      models: "\u22A7",
      Mopf: "\u{1D544}",
      mopf: "\u{1D55E}",
      mp: "\u2213",
      Mscr: "\u2133",
      mscr: "\u{1D4C2}",
      mstpos: "\u223E",
      Mu: "\u039C",
      mu: "\u03BC",
      multimap: "\u22B8",
      mumap: "\u22B8",
      nabla: "\u2207",
      Nacute: "\u0143",
      nacute: "\u0144",
      nang: "\u2220\u20D2",
      nap: "\u2249",
      napE: "\u2A70\u0338",
      napid: "\u224B\u0338",
      napos: "\u0149",
      napprox: "\u2249",
      natur: "\u266E",
      natural: "\u266E",
      naturals: "\u2115",
      nbsp: "\xA0",
      nbump: "\u224E\u0338",
      nbumpe: "\u224F\u0338",
      ncap: "\u2A43",
      Ncaron: "\u0147",
      ncaron: "\u0148",
      Ncedil: "\u0145",
      ncedil: "\u0146",
      ncong: "\u2247",
      ncongdot: "\u2A6D\u0338",
      ncup: "\u2A42",
      Ncy: "\u041D",
      ncy: "\u043D",
      ndash: "\u2013",
      ne: "\u2260",
      nearhk: "\u2924",
      neArr: "\u21D7",
      nearr: "\u2197",
      nearrow: "\u2197",
      nedot: "\u2250\u0338",
      NegativeMediumSpace: "\u200B",
      NegativeThickSpace: "\u200B",
      NegativeThinSpace: "\u200B",
      NegativeVeryThinSpace: "\u200B",
      nequiv: "\u2262",
      nesear: "\u2928",
      nesim: "\u2242\u0338",
      NestedGreaterGreater: "\u226B",
      NestedLessLess: "\u226A",
      NewLine: "\n",
      nexist: "\u2204",
      nexists: "\u2204",
      Nfr: "\u{1D511}",
      nfr: "\u{1D52B}",
      ngE: "\u2267\u0338",
      nge: "\u2271",
      ngeq: "\u2271",
      ngeqq: "\u2267\u0338",
      ngeqslant: "\u2A7E\u0338",
      nges: "\u2A7E\u0338",
      nGg: "\u22D9\u0338",
      ngsim: "\u2275",
      nGt: "\u226B\u20D2",
      ngt: "\u226F",
      ngtr: "\u226F",
      nGtv: "\u226B\u0338",
      nhArr: "\u21CE",
      nharr: "\u21AE",
      nhpar: "\u2AF2",
      ni: "\u220B",
      nis: "\u22FC",
      nisd: "\u22FA",
      niv: "\u220B",
      NJcy: "\u040A",
      njcy: "\u045A",
      nlArr: "\u21CD",
      nlarr: "\u219A",
      nldr: "\u2025",
      nlE: "\u2266\u0338",
      nle: "\u2270",
      nLeftarrow: "\u21CD",
      nleftarrow: "\u219A",
      nLeftrightarrow: "\u21CE",
      nleftrightarrow: "\u21AE",
      nleq: "\u2270",
      nleqq: "\u2266\u0338",
      nleqslant: "\u2A7D\u0338",
      nles: "\u2A7D\u0338",
      nless: "\u226E",
      nLl: "\u22D8\u0338",
      nlsim: "\u2274",
      nLt: "\u226A\u20D2",
      nlt: "\u226E",
      nltri: "\u22EA",
      nltrie: "\u22EC",
      nLtv: "\u226A\u0338",
      nmid: "\u2224",
      NoBreak: "\u2060",
      NonBreakingSpace: "\xA0",
      Nopf: "\u2115",
      nopf: "\u{1D55F}",
      Not: "\u2AEC",
      not: "\xAC",
      NotCongruent: "\u2262",
      NotCupCap: "\u226D",
      NotDoubleVerticalBar: "\u2226",
      NotElement: "\u2209",
      NotEqual: "\u2260",
      NotEqualTilde: "\u2242\u0338",
      NotExists: "\u2204",
      NotGreater: "\u226F",
      NotGreaterEqual: "\u2271",
      NotGreaterFullEqual: "\u2267\u0338",
      NotGreaterGreater: "\u226B\u0338",
      NotGreaterLess: "\u2279",
      NotGreaterSlantEqual: "\u2A7E\u0338",
      NotGreaterTilde: "\u2275",
      NotHumpDownHump: "\u224E\u0338",
      NotHumpEqual: "\u224F\u0338",
      notin: "\u2209",
      notindot: "\u22F5\u0338",
      notinE: "\u22F9\u0338",
      notinva: "\u2209",
      notinvb: "\u22F7",
      notinvc: "\u22F6",
      NotLeftTriangle: "\u22EA",
      NotLeftTriangleBar: "\u29CF\u0338",
      NotLeftTriangleEqual: "\u22EC",
      NotLess: "\u226E",
      NotLessEqual: "\u2270",
      NotLessGreater: "\u2278",
      NotLessLess: "\u226A\u0338",
      NotLessSlantEqual: "\u2A7D\u0338",
      NotLessTilde: "\u2274",
      NotNestedGreaterGreater: "\u2AA2\u0338",
      NotNestedLessLess: "\u2AA1\u0338",
      notni: "\u220C",
      notniva: "\u220C",
      notnivb: "\u22FE",
      notnivc: "\u22FD",
      NotPrecedes: "\u2280",
      NotPrecedesEqual: "\u2AAF\u0338",
      NotPrecedesSlantEqual: "\u22E0",
      NotReverseElement: "\u220C",
      NotRightTriangle: "\u22EB",
      NotRightTriangleBar: "\u29D0\u0338",
      NotRightTriangleEqual: "\u22ED",
      NotSquareSubset: "\u228F\u0338",
      NotSquareSubsetEqual: "\u22E2",
      NotSquareSuperset: "\u2290\u0338",
      NotSquareSupersetEqual: "\u22E3",
      NotSubset: "\u2282\u20D2",
      NotSubsetEqual: "\u2288",
      NotSucceeds: "\u2281",
      NotSucceedsEqual: "\u2AB0\u0338",
      NotSucceedsSlantEqual: "\u22E1",
      NotSucceedsTilde: "\u227F\u0338",
      NotSuperset: "\u2283\u20D2",
      NotSupersetEqual: "\u2289",
      NotTilde: "\u2241",
      NotTildeEqual: "\u2244",
      NotTildeFullEqual: "\u2247",
      NotTildeTilde: "\u2249",
      NotVerticalBar: "\u2224",
      npar: "\u2226",
      nparallel: "\u2226",
      nparsl: "\u2AFD\u20E5",
      npart: "\u2202\u0338",
      npolint: "\u2A14",
      npr: "\u2280",
      nprcue: "\u22E0",
      npre: "\u2AAF\u0338",
      nprec: "\u2280",
      npreceq: "\u2AAF\u0338",
      nrArr: "\u21CF",
      nrarr: "\u219B",
      nrarrc: "\u2933\u0338",
      nrarrw: "\u219D\u0338",
      nRightarrow: "\u21CF",
      nrightarrow: "\u219B",
      nrtri: "\u22EB",
      nrtrie: "\u22ED",
      nsc: "\u2281",
      nsccue: "\u22E1",
      nsce: "\u2AB0\u0338",
      Nscr: "\u{1D4A9}",
      nscr: "\u{1D4C3}",
      nshortmid: "\u2224",
      nshortparallel: "\u2226",
      nsim: "\u2241",
      nsime: "\u2244",
      nsimeq: "\u2244",
      nsmid: "\u2224",
      nspar: "\u2226",
      nsqsube: "\u22E2",
      nsqsupe: "\u22E3",
      nsub: "\u2284",
      nsubE: "\u2AC5\u0338",
      nsube: "\u2288",
      nsubset: "\u2282\u20D2",
      nsubseteq: "\u2288",
      nsubseteqq: "\u2AC5\u0338",
      nsucc: "\u2281",
      nsucceq: "\u2AB0\u0338",
      nsup: "\u2285",
      nsupE: "\u2AC6\u0338",
      nsupe: "\u2289",
      nsupset: "\u2283\u20D2",
      nsupseteq: "\u2289",
      nsupseteqq: "\u2AC6\u0338",
      ntgl: "\u2279",
      Ntilde: "\xD1",
      ntilde: "\xF1",
      ntlg: "\u2278",
      ntriangleleft: "\u22EA",
      ntrianglelefteq: "\u22EC",
      ntriangleright: "\u22EB",
      ntrianglerighteq: "\u22ED",
      Nu: "\u039D",
      nu: "\u03BD",
      num: "#",
      numero: "\u2116",
      numsp: "\u2007",
      nvap: "\u224D\u20D2",
      nVDash: "\u22AF",
      nVdash: "\u22AE",
      nvDash: "\u22AD",
      nvdash: "\u22AC",
      nvge: "\u2265\u20D2",
      nvgt: ">\u20D2",
      nvHarr: "\u2904",
      nvinfin: "\u29DE",
      nvlArr: "\u2902",
      nvle: "\u2264\u20D2",
      nvlt: "<\u20D2",
      nvltrie: "\u22B4\u20D2",
      nvrArr: "\u2903",
      nvrtrie: "\u22B5\u20D2",
      nvsim: "\u223C\u20D2",
      nwarhk: "\u2923",
      nwArr: "\u21D6",
      nwarr: "\u2196",
      nwarrow: "\u2196",
      nwnear: "\u2927",
      Oacute: "\xD3",
      oacute: "\xF3",
      oast: "\u229B",
      ocir: "\u229A",
      Ocirc: "\xD4",
      ocirc: "\xF4",
      Ocy: "\u041E",
      ocy: "\u043E",
      odash: "\u229D",
      Odblac: "\u0150",
      odblac: "\u0151",
      odiv: "\u2A38",
      odot: "\u2299",
      odsold: "\u29BC",
      OElig: "\u0152",
      oelig: "\u0153",
      ofcir: "\u29BF",
      Ofr: "\u{1D512}",
      ofr: "\u{1D52C}",
      ogon: "\u02DB",
      Ograve: "\xD2",
      ograve: "\xF2",
      ogt: "\u29C1",
      ohbar: "\u29B5",
      ohm: "\u03A9",
      oint: "\u222E",
      olarr: "\u21BA",
      olcir: "\u29BE",
      olcross: "\u29BB",
      oline: "\u203E",
      olt: "\u29C0",
      Omacr: "\u014C",
      omacr: "\u014D",
      Omega: "\u03A9",
      omega: "\u03C9",
      Omicron: "\u039F",
      omicron: "\u03BF",
      omid: "\u29B6",
      ominus: "\u2296",
      Oopf: "\u{1D546}",
      oopf: "\u{1D560}",
      opar: "\u29B7",
      OpenCurlyDoubleQuote: "\u201C",
      OpenCurlyQuote: "\u2018",
      operp: "\u29B9",
      oplus: "\u2295",
      Or: "\u2A54",
      or: "\u2228",
      orarr: "\u21BB",
      ord: "\u2A5D",
      order: "\u2134",
      orderof: "\u2134",
      ordf: "\xAA",
      ordm: "\xBA",
      origof: "\u22B6",
      oror: "\u2A56",
      orslope: "\u2A57",
      orv: "\u2A5B",
      oS: "\u24C8",
      Oscr: "\u{1D4AA}",
      oscr: "\u2134",
      Oslash: "\xD8",
      oslash: "\xF8",
      osol: "\u2298",
      Otilde: "\xD5",
      otilde: "\xF5",
      Otimes: "\u2A37",
      otimes: "\u2297",
      otimesas: "\u2A36",
      Ouml: "\xD6",
      ouml: "\xF6",
      ovbar: "\u233D",
      OverBar: "\u203E",
      OverBrace: "\u23DE",
      OverBracket: "\u23B4",
      OverParenthesis: "\u23DC",
      par: "\u2225",
      para: "\xB6",
      parallel: "\u2225",
      parsim: "\u2AF3",
      parsl: "\u2AFD",
      part: "\u2202",
      PartialD: "\u2202",
      Pcy: "\u041F",
      pcy: "\u043F",
      percnt: "%",
      period: ".",
      permil: "\u2030",
      perp: "\u22A5",
      pertenk: "\u2031",
      Pfr: "\u{1D513}",
      pfr: "\u{1D52D}",
      Phi: "\u03A6",
      phi: "\u03C6",
      phiv: "\u03D5",
      phmmat: "\u2133",
      phone: "\u260E",
      Pi: "\u03A0",
      pi: "\u03C0",
      pitchfork: "\u22D4",
      piv: "\u03D6",
      planck: "\u210F",
      planckh: "\u210E",
      plankv: "\u210F",
      plus: "+",
      plusacir: "\u2A23",
      plusb: "\u229E",
      pluscir: "\u2A22",
      plusdo: "\u2214",
      plusdu: "\u2A25",
      pluse: "\u2A72",
      PlusMinus: "\xB1",
      plusmn: "\xB1",
      plussim: "\u2A26",
      plustwo: "\u2A27",
      pm: "\xB1",
      Poincareplane: "\u210C",
      pointint: "\u2A15",
      Popf: "\u2119",
      popf: "\u{1D561}",
      pound: "\xA3",
      Pr: "\u2ABB",
      pr: "\u227A",
      prap: "\u2AB7",
      prcue: "\u227C",
      prE: "\u2AB3",
      pre: "\u2AAF",
      prec: "\u227A",
      precapprox: "\u2AB7",
      preccurlyeq: "\u227C",
      Precedes: "\u227A",
      PrecedesEqual: "\u2AAF",
      PrecedesSlantEqual: "\u227C",
      PrecedesTilde: "\u227E",
      preceq: "\u2AAF",
      precnapprox: "\u2AB9",
      precneqq: "\u2AB5",
      precnsim: "\u22E8",
      precsim: "\u227E",
      Prime: "\u2033",
      prime: "\u2032",
      primes: "\u2119",
      prnap: "\u2AB9",
      prnE: "\u2AB5",
      prnsim: "\u22E8",
      prod: "\u220F",
      Product: "\u220F",
      profalar: "\u232E",
      profline: "\u2312",
      profsurf: "\u2313",
      prop: "\u221D",
      Proportion: "\u2237",
      Proportional: "\u221D",
      propto: "\u221D",
      prsim: "\u227E",
      prurel: "\u22B0",
      Pscr: "\u{1D4AB}",
      pscr: "\u{1D4C5}",
      Psi: "\u03A8",
      psi: "\u03C8",
      puncsp: "\u2008",
      Qfr: "\u{1D514}",
      qfr: "\u{1D52E}",
      qint: "\u2A0C",
      Qopf: "\u211A",
      qopf: "\u{1D562}",
      qprime: "\u2057",
      Qscr: "\u{1D4AC}",
      qscr: "\u{1D4C6}",
      quaternions: "\u210D",
      quatint: "\u2A16",
      quest: "?",
      questeq: "\u225F",
      QUOT: '"',
      quot: '"',
      rAarr: "\u21DB",
      race: "\u223D\u0331",
      Racute: "\u0154",
      racute: "\u0155",
      radic: "\u221A",
      raemptyv: "\u29B3",
      Rang: "\u27EB",
      rang: "\u27E9",
      rangd: "\u2992",
      range: "\u29A5",
      rangle: "\u27E9",
      raquo: "\xBB",
      Rarr: "\u21A0",
      rArr: "\u21D2",
      rarr: "\u2192",
      rarrap: "\u2975",
      rarrb: "\u21E5",
      rarrbfs: "\u2920",
      rarrc: "\u2933",
      rarrfs: "\u291E",
      rarrhk: "\u21AA",
      rarrlp: "\u21AC",
      rarrpl: "\u2945",
      rarrsim: "\u2974",
      Rarrtl: "\u2916",
      rarrtl: "\u21A3",
      rarrw: "\u219D",
      rAtail: "\u291C",
      ratail: "\u291A",
      ratio: "\u2236",
      rationals: "\u211A",
      RBarr: "\u2910",
      rBarr: "\u290F",
      rbarr: "\u290D",
      rbbrk: "\u2773",
      rbrace: "}",
      rbrack: "]",
      rbrke: "\u298C",
      rbrksld: "\u298E",
      rbrkslu: "\u2990",
      Rcaron: "\u0158",
      rcaron: "\u0159",
      Rcedil: "\u0156",
      rcedil: "\u0157",
      rceil: "\u2309",
      rcub: "}",
      Rcy: "\u0420",
      rcy: "\u0440",
      rdca: "\u2937",
      rdldhar: "\u2969",
      rdquo: "\u201D",
      rdquor: "\u201D",
      rdsh: "\u21B3",
      Re: "\u211C",
      real: "\u211C",
      realine: "\u211B",
      realpart: "\u211C",
      reals: "\u211D",
      rect: "\u25AD",
      REG: "\xAE",
      reg: "\xAE",
      ReverseElement: "\u220B",
      ReverseEquilibrium: "\u21CB",
      ReverseUpEquilibrium: "\u296F",
      rfisht: "\u297D",
      rfloor: "\u230B",
      Rfr: "\u211C",
      rfr: "\u{1D52F}",
      rHar: "\u2964",
      rhard: "\u21C1",
      rharu: "\u21C0",
      rharul: "\u296C",
      Rho: "\u03A1",
      rho: "\u03C1",
      rhov: "\u03F1",
      RightAngleBracket: "\u27E9",
      RightArrow: "\u2192",
      Rightarrow: "\u21D2",
      rightarrow: "\u2192",
      RightArrowBar: "\u21E5",
      RightArrowLeftArrow: "\u21C4",
      rightarrowtail: "\u21A3",
      RightCeiling: "\u2309",
      RightDoubleBracket: "\u27E7",
      RightDownTeeVector: "\u295D",
      RightDownVector: "\u21C2",
      RightDownVectorBar: "\u2955",
      RightFloor: "\u230B",
      rightharpoondown: "\u21C1",
      rightharpoonup: "\u21C0",
      rightleftarrows: "\u21C4",
      rightleftharpoons: "\u21CC",
      rightrightarrows: "\u21C9",
      rightsquigarrow: "\u219D",
      RightTee: "\u22A2",
      RightTeeArrow: "\u21A6",
      RightTeeVector: "\u295B",
      rightthreetimes: "\u22CC",
      RightTriangle: "\u22B3",
      RightTriangleBar: "\u29D0",
      RightTriangleEqual: "\u22B5",
      RightUpDownVector: "\u294F",
      RightUpTeeVector: "\u295C",
      RightUpVector: "\u21BE",
      RightUpVectorBar: "\u2954",
      RightVector: "\u21C0",
      RightVectorBar: "\u2953",
      ring: "\u02DA",
      risingdotseq: "\u2253",
      rlarr: "\u21C4",
      rlhar: "\u21CC",
      rlm: "\u200F",
      rmoust: "\u23B1",
      rmoustache: "\u23B1",
      rnmid: "\u2AEE",
      roang: "\u27ED",
      roarr: "\u21FE",
      robrk: "\u27E7",
      ropar: "\u2986",
      Ropf: "\u211D",
      ropf: "\u{1D563}",
      roplus: "\u2A2E",
      rotimes: "\u2A35",
      RoundImplies: "\u2970",
      rpar: ")",
      rpargt: "\u2994",
      rppolint: "\u2A12",
      rrarr: "\u21C9",
      Rrightarrow: "\u21DB",
      rsaquo: "\u203A",
      Rscr: "\u211B",
      rscr: "\u{1D4C7}",
      Rsh: "\u21B1",
      rsh: "\u21B1",
      rsqb: "]",
      rsquo: "\u2019",
      rsquor: "\u2019",
      rthree: "\u22CC",
      rtimes: "\u22CA",
      rtri: "\u25B9",
      rtrie: "\u22B5",
      rtrif: "\u25B8",
      rtriltri: "\u29CE",
      RuleDelayed: "\u29F4",
      ruluhar: "\u2968",
      rx: "\u211E",
      Sacute: "\u015A",
      sacute: "\u015B",
      sbquo: "\u201A",
      Sc: "\u2ABC",
      sc: "\u227B",
      scap: "\u2AB8",
      Scaron: "\u0160",
      scaron: "\u0161",
      sccue: "\u227D",
      scE: "\u2AB4",
      sce: "\u2AB0",
      Scedil: "\u015E",
      scedil: "\u015F",
      Scirc: "\u015C",
      scirc: "\u015D",
      scnap: "\u2ABA",
      scnE: "\u2AB6",
      scnsim: "\u22E9",
      scpolint: "\u2A13",
      scsim: "\u227F",
      Scy: "\u0421",
      scy: "\u0441",
      sdot: "\u22C5",
      sdotb: "\u22A1",
      sdote: "\u2A66",
      searhk: "\u2925",
      seArr: "\u21D8",
      searr: "\u2198",
      searrow: "\u2198",
      sect: "\xA7",
      semi: ";",
      seswar: "\u2929",
      setminus: "\u2216",
      setmn: "\u2216",
      sext: "\u2736",
      Sfr: "\u{1D516}",
      sfr: "\u{1D530}",
      sfrown: "\u2322",
      sharp: "\u266F",
      SHCHcy: "\u0429",
      shchcy: "\u0449",
      SHcy: "\u0428",
      shcy: "\u0448",
      ShortDownArrow: "\u2193",
      ShortLeftArrow: "\u2190",
      shortmid: "\u2223",
      shortparallel: "\u2225",
      ShortRightArrow: "\u2192",
      ShortUpArrow: "\u2191",
      shy: "\xAD",
      Sigma: "\u03A3",
      sigma: "\u03C3",
      sigmaf: "\u03C2",
      sigmav: "\u03C2",
      sim: "\u223C",
      simdot: "\u2A6A",
      sime: "\u2243",
      simeq: "\u2243",
      simg: "\u2A9E",
      simgE: "\u2AA0",
      siml: "\u2A9D",
      simlE: "\u2A9F",
      simne: "\u2246",
      simplus: "\u2A24",
      simrarr: "\u2972",
      slarr: "\u2190",
      SmallCircle: "\u2218",
      smallsetminus: "\u2216",
      smashp: "\u2A33",
      smeparsl: "\u29E4",
      smid: "\u2223",
      smile: "\u2323",
      smt: "\u2AAA",
      smte: "\u2AAC",
      smtes: "\u2AAC\uFE00",
      SOFTcy: "\u042C",
      softcy: "\u044C",
      sol: "/",
      solb: "\u29C4",
      solbar: "\u233F",
      Sopf: "\u{1D54A}",
      sopf: "\u{1D564}",
      spades: "\u2660",
      spadesuit: "\u2660",
      spar: "\u2225",
      sqcap: "\u2293",
      sqcaps: "\u2293\uFE00",
      sqcup: "\u2294",
      sqcups: "\u2294\uFE00",
      Sqrt: "\u221A",
      sqsub: "\u228F",
      sqsube: "\u2291",
      sqsubset: "\u228F",
      sqsubseteq: "\u2291",
      sqsup: "\u2290",
      sqsupe: "\u2292",
      sqsupset: "\u2290",
      sqsupseteq: "\u2292",
      squ: "\u25A1",
      Square: "\u25A1",
      square: "\u25A1",
      SquareIntersection: "\u2293",
      SquareSubset: "\u228F",
      SquareSubsetEqual: "\u2291",
      SquareSuperset: "\u2290",
      SquareSupersetEqual: "\u2292",
      SquareUnion: "\u2294",
      squarf: "\u25AA",
      squf: "\u25AA",
      srarr: "\u2192",
      Sscr: "\u{1D4AE}",
      sscr: "\u{1D4C8}",
      ssetmn: "\u2216",
      ssmile: "\u2323",
      sstarf: "\u22C6",
      Star: "\u22C6",
      star: "\u2606",
      starf: "\u2605",
      straightepsilon: "\u03F5",
      straightphi: "\u03D5",
      strns: "\xAF",
      Sub: "\u22D0",
      sub: "\u2282",
      subdot: "\u2ABD",
      subE: "\u2AC5",
      sube: "\u2286",
      subedot: "\u2AC3",
      submult: "\u2AC1",
      subnE: "\u2ACB",
      subne: "\u228A",
      subplus: "\u2ABF",
      subrarr: "\u2979",
      Subset: "\u22D0",
      subset: "\u2282",
      subseteq: "\u2286",
      subseteqq: "\u2AC5",
      SubsetEqual: "\u2286",
      subsetneq: "\u228A",
      subsetneqq: "\u2ACB",
      subsim: "\u2AC7",
      subsub: "\u2AD5",
      subsup: "\u2AD3",
      succ: "\u227B",
      succapprox: "\u2AB8",
      succcurlyeq: "\u227D",
      Succeeds: "\u227B",
      SucceedsEqual: "\u2AB0",
      SucceedsSlantEqual: "\u227D",
      SucceedsTilde: "\u227F",
      succeq: "\u2AB0",
      succnapprox: "\u2ABA",
      succneqq: "\u2AB6",
      succnsim: "\u22E9",
      succsim: "\u227F",
      SuchThat: "\u220B",
      Sum: "\u2211",
      sum: "\u2211",
      sung: "\u266A",
      Sup: "\u22D1",
      sup: "\u2283",
      sup1: "\xB9",
      sup2: "\xB2",
      sup3: "\xB3",
      supdot: "\u2ABE",
      supdsub: "\u2AD8",
      supE: "\u2AC6",
      supe: "\u2287",
      supedot: "\u2AC4",
      Superset: "\u2283",
      SupersetEqual: "\u2287",
      suphsol: "\u27C9",
      suphsub: "\u2AD7",
      suplarr: "\u297B",
      supmult: "\u2AC2",
      supnE: "\u2ACC",
      supne: "\u228B",
      supplus: "\u2AC0",
      Supset: "\u22D1",
      supset: "\u2283",
      supseteq: "\u2287",
      supseteqq: "\u2AC6",
      supsetneq: "\u228B",
      supsetneqq: "\u2ACC",
      supsim: "\u2AC8",
      supsub: "\u2AD4",
      supsup: "\u2AD6",
      swarhk: "\u2926",
      swArr: "\u21D9",
      swarr: "\u2199",
      swarrow: "\u2199",
      swnwar: "\u292A",
      szlig: "\xDF",
      Tab: "	",
      target: "\u2316",
      Tau: "\u03A4",
      tau: "\u03C4",
      tbrk: "\u23B4",
      Tcaron: "\u0164",
      tcaron: "\u0165",
      Tcedil: "\u0162",
      tcedil: "\u0163",
      Tcy: "\u0422",
      tcy: "\u0442",
      tdot: "\u20DB",
      telrec: "\u2315",
      Tfr: "\u{1D517}",
      tfr: "\u{1D531}",
      there4: "\u2234",
      Therefore: "\u2234",
      therefore: "\u2234",
      Theta: "\u0398",
      theta: "\u03B8",
      thetasym: "\u03D1",
      thetav: "\u03D1",
      thickapprox: "\u2248",
      thicksim: "\u223C",
      ThickSpace: "\u205F\u200A",
      thinsp: "\u2009",
      ThinSpace: "\u2009",
      thkap: "\u2248",
      thksim: "\u223C",
      THORN: "\xDE",
      thorn: "\xFE",
      Tilde: "\u223C",
      tilde: "\u02DC",
      TildeEqual: "\u2243",
      TildeFullEqual: "\u2245",
      TildeTilde: "\u2248",
      times: "\xD7",
      timesb: "\u22A0",
      timesbar: "\u2A31",
      timesd: "\u2A30",
      tint: "\u222D",
      toea: "\u2928",
      top: "\u22A4",
      topbot: "\u2336",
      topcir: "\u2AF1",
      Topf: "\u{1D54B}",
      topf: "\u{1D565}",
      topfork: "\u2ADA",
      tosa: "\u2929",
      tprime: "\u2034",
      TRADE: "\u2122",
      trade: "\u2122",
      triangle: "\u25B5",
      triangledown: "\u25BF",
      triangleleft: "\u25C3",
      trianglelefteq: "\u22B4",
      triangleq: "\u225C",
      triangleright: "\u25B9",
      trianglerighteq: "\u22B5",
      tridot: "\u25EC",
      trie: "\u225C",
      triminus: "\u2A3A",
      TripleDot: "\u20DB",
      triplus: "\u2A39",
      trisb: "\u29CD",
      tritime: "\u2A3B",
      trpezium: "\u23E2",
      Tscr: "\u{1D4AF}",
      tscr: "\u{1D4C9}",
      TScy: "\u0426",
      tscy: "\u0446",
      TSHcy: "\u040B",
      tshcy: "\u045B",
      Tstrok: "\u0166",
      tstrok: "\u0167",
      twixt: "\u226C",
      twoheadleftarrow: "\u219E",
      twoheadrightarrow: "\u21A0",
      Uacute: "\xDA",
      uacute: "\xFA",
      Uarr: "\u219F",
      uArr: "\u21D1",
      uarr: "\u2191",
      Uarrocir: "\u2949",
      Ubrcy: "\u040E",
      ubrcy: "\u045E",
      Ubreve: "\u016C",
      ubreve: "\u016D",
      Ucirc: "\xDB",
      ucirc: "\xFB",
      Ucy: "\u0423",
      ucy: "\u0443",
      udarr: "\u21C5",
      Udblac: "\u0170",
      udblac: "\u0171",
      udhar: "\u296E",
      ufisht: "\u297E",
      Ufr: "\u{1D518}",
      ufr: "\u{1D532}",
      Ugrave: "\xD9",
      ugrave: "\xF9",
      uHar: "\u2963",
      uharl: "\u21BF",
      uharr: "\u21BE",
      uhblk: "\u2580",
      ulcorn: "\u231C",
      ulcorner: "\u231C",
      ulcrop: "\u230F",
      ultri: "\u25F8",
      Umacr: "\u016A",
      umacr: "\u016B",
      uml: "\xA8",
      UnderBar: "_",
      UnderBrace: "\u23DF",
      UnderBracket: "\u23B5",
      UnderParenthesis: "\u23DD",
      Union: "\u22C3",
      UnionPlus: "\u228E",
      Uogon: "\u0172",
      uogon: "\u0173",
      Uopf: "\u{1D54C}",
      uopf: "\u{1D566}",
      UpArrow: "\u2191",
      Uparrow: "\u21D1",
      uparrow: "\u2191",
      UpArrowBar: "\u2912",
      UpArrowDownArrow: "\u21C5",
      UpDownArrow: "\u2195",
      Updownarrow: "\u21D5",
      updownarrow: "\u2195",
      UpEquilibrium: "\u296E",
      upharpoonleft: "\u21BF",
      upharpoonright: "\u21BE",
      uplus: "\u228E",
      UpperLeftArrow: "\u2196",
      UpperRightArrow: "\u2197",
      Upsi: "\u03D2",
      upsi: "\u03C5",
      upsih: "\u03D2",
      Upsilon: "\u03A5",
      upsilon: "\u03C5",
      UpTee: "\u22A5",
      UpTeeArrow: "\u21A5",
      upuparrows: "\u21C8",
      urcorn: "\u231D",
      urcorner: "\u231D",
      urcrop: "\u230E",
      Uring: "\u016E",
      uring: "\u016F",
      urtri: "\u25F9",
      Uscr: "\u{1D4B0}",
      uscr: "\u{1D4CA}",
      utdot: "\u22F0",
      Utilde: "\u0168",
      utilde: "\u0169",
      utri: "\u25B5",
      utrif: "\u25B4",
      uuarr: "\u21C8",
      Uuml: "\xDC",
      uuml: "\xFC",
      uwangle: "\u29A7",
      vangrt: "\u299C",
      varepsilon: "\u03F5",
      varkappa: "\u03F0",
      varnothing: "\u2205",
      varphi: "\u03D5",
      varpi: "\u03D6",
      varpropto: "\u221D",
      vArr: "\u21D5",
      varr: "\u2195",
      varrho: "\u03F1",
      varsigma: "\u03C2",
      varsubsetneq: "\u228A\uFE00",
      varsubsetneqq: "\u2ACB\uFE00",
      varsupsetneq: "\u228B\uFE00",
      varsupsetneqq: "\u2ACC\uFE00",
      vartheta: "\u03D1",
      vartriangleleft: "\u22B2",
      vartriangleright: "\u22B3",
      Vbar: "\u2AEB",
      vBar: "\u2AE8",
      vBarv: "\u2AE9",
      Vcy: "\u0412",
      vcy: "\u0432",
      VDash: "\u22AB",
      Vdash: "\u22A9",
      vDash: "\u22A8",
      vdash: "\u22A2",
      Vdashl: "\u2AE6",
      Vee: "\u22C1",
      vee: "\u2228",
      veebar: "\u22BB",
      veeeq: "\u225A",
      vellip: "\u22EE",
      Verbar: "\u2016",
      verbar: "|",
      Vert: "\u2016",
      vert: "|",
      VerticalBar: "\u2223",
      VerticalLine: "|",
      VerticalSeparator: "\u2758",
      VerticalTilde: "\u2240",
      VeryThinSpace: "\u200A",
      Vfr: "\u{1D519}",
      vfr: "\u{1D533}",
      vltri: "\u22B2",
      vnsub: "\u2282\u20D2",
      vnsup: "\u2283\u20D2",
      Vopf: "\u{1D54D}",
      vopf: "\u{1D567}",
      vprop: "\u221D",
      vrtri: "\u22B3",
      Vscr: "\u{1D4B1}",
      vscr: "\u{1D4CB}",
      vsubnE: "\u2ACB\uFE00",
      vsubne: "\u228A\uFE00",
      vsupnE: "\u2ACC\uFE00",
      vsupne: "\u228B\uFE00",
      Vvdash: "\u22AA",
      vzigzag: "\u299A",
      Wcirc: "\u0174",
      wcirc: "\u0175",
      wedbar: "\u2A5F",
      Wedge: "\u22C0",
      wedge: "\u2227",
      wedgeq: "\u2259",
      weierp: "\u2118",
      Wfr: "\u{1D51A}",
      wfr: "\u{1D534}",
      Wopf: "\u{1D54E}",
      wopf: "\u{1D568}",
      wp: "\u2118",
      wr: "\u2240",
      wreath: "\u2240",
      Wscr: "\u{1D4B2}",
      wscr: "\u{1D4CC}",
      xcap: "\u22C2",
      xcirc: "\u25EF",
      xcup: "\u22C3",
      xdtri: "\u25BD",
      Xfr: "\u{1D51B}",
      xfr: "\u{1D535}",
      xhArr: "\u27FA",
      xharr: "\u27F7",
      Xi: "\u039E",
      xi: "\u03BE",
      xlArr: "\u27F8",
      xlarr: "\u27F5",
      xmap: "\u27FC",
      xnis: "\u22FB",
      xodot: "\u2A00",
      Xopf: "\u{1D54F}",
      xopf: "\u{1D569}",
      xoplus: "\u2A01",
      xotime: "\u2A02",
      xrArr: "\u27F9",
      xrarr: "\u27F6",
      Xscr: "\u{1D4B3}",
      xscr: "\u{1D4CD}",
      xsqcup: "\u2A06",
      xuplus: "\u2A04",
      xutri: "\u25B3",
      xvee: "\u22C1",
      xwedge: "\u22C0",
      Yacute: "\xDD",
      yacute: "\xFD",
      YAcy: "\u042F",
      yacy: "\u044F",
      Ycirc: "\u0176",
      ycirc: "\u0177",
      Ycy: "\u042B",
      ycy: "\u044B",
      yen: "\xA5",
      Yfr: "\u{1D51C}",
      yfr: "\u{1D536}",
      YIcy: "\u0407",
      yicy: "\u0457",
      Yopf: "\u{1D550}",
      yopf: "\u{1D56A}",
      Yscr: "\u{1D4B4}",
      yscr: "\u{1D4CE}",
      YUcy: "\u042E",
      yucy: "\u044E",
      Yuml: "\u0178",
      yuml: "\xFF",
      Zacute: "\u0179",
      zacute: "\u017A",
      Zcaron: "\u017D",
      zcaron: "\u017E",
      Zcy: "\u0417",
      zcy: "\u0437",
      Zdot: "\u017B",
      zdot: "\u017C",
      zeetrf: "\u2128",
      ZeroWidthSpace: "\u200B",
      Zeta: "\u0396",
      zeta: "\u03B6",
      Zfr: "\u2128",
      zfr: "\u{1D537}",
      ZHcy: "\u0416",
      zhcy: "\u0436",
      zigrarr: "\u21DD",
      Zopf: "\u2124",
      zopf: "\u{1D56B}",
      Zscr: "\u{1D4B5}",
      zscr: "\u{1D4CF}",
      zwj: "\u200D",
      zwnj: "\u200C"
    });
    exports.entityMap = exports.HTML_ENTITIES;
  }
});

// node_modules/@xmldom/xmldom/lib/sax.js
var require_sax = __commonJS({
  "node_modules/@xmldom/xmldom/lib/sax.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    var g = require_grammar();
    var errors = require_errors();
    var isHTMLEscapableRawTextElement = conventions.isHTMLEscapableRawTextElement;
    var isHTMLMimeType = conventions.isHTMLMimeType;
    var isHTMLRawTextElement = conventions.isHTMLRawTextElement;
    var hasOwn = conventions.hasOwn;
    var NAMESPACE = conventions.NAMESPACE;
    var ParseError = errors.ParseError;
    var DOMException = errors.DOMException;
    var S_TAG = 0;
    var S_ATTR = 1;
    var S_ATTR_SPACE = 2;
    var S_EQ = 3;
    var S_ATTR_NOQUOT_VALUE = 4;
    var S_ATTR_END = 5;
    var S_TAG_SPACE = 6;
    var S_TAG_CLOSE = 7;
    function XMLReader() {
    }
    XMLReader.prototype = {
      parse: function(source, defaultNSMap, entityMap) {
        var domBuilder = this.domBuilder;
        domBuilder.startDocument();
        _copy(defaultNSMap, defaultNSMap = /* @__PURE__ */ Object.create(null));
        parse2(source, defaultNSMap, entityMap, domBuilder, this.errorHandler);
        domBuilder.endDocument();
      }
    };
    var ENTITY_REG = /&#?\w+;?/g;
    function parse2(source, defaultNSMapCopy, entityMap, domBuilder, errorHandler) {
      var isHTML = isHTMLMimeType(domBuilder.mimeType);
      if (source.indexOf(g.UNICODE_REPLACEMENT_CHARACTER) >= 0) {
        errorHandler.warning("Unicode replacement character detected, source encoding issues?");
      }
      function fixedFromCharCode(code) {
        if (code > 65535) {
          code -= 65536;
          var surrogate1 = 55296 + (code >> 10), surrogate2 = 56320 + (code & 1023);
          return String.fromCharCode(surrogate1, surrogate2);
        } else {
          return String.fromCharCode(code);
        }
      }
      function entityReplacer(a2) {
        var complete = a2[a2.length - 1] === ";" ? a2 : a2 + ";";
        if (!isHTML && complete !== a2) {
          errorHandler.error("EntityRef: expecting ;");
          return a2;
        }
        var match = g.Reference.exec(complete);
        if (!match || match[0].length !== complete.length) {
          errorHandler.error("entity not matching Reference production: " + a2);
          return a2;
        }
        var k = complete.slice(1, -1);
        if (hasOwn(entityMap, k)) {
          return entityMap[k];
        } else if (k.charAt(0) === "#") {
          return fixedFromCharCode(parseInt(k.substring(1).replace("x", "0x")));
        } else {
          errorHandler.error("entity not found:" + a2);
          return a2;
        }
      }
      function appendText(end2) {
        if (end2 > start) {
          var xt = source.substring(start, end2).replace(ENTITY_REG, entityReplacer);
          locator && position(start);
          domBuilder.characters(xt, 0, end2 - start);
          start = end2;
        }
      }
      var lineStart = 0;
      var lineEnd = 0;
      var linePattern = /\r\n?|\n|$/g;
      var locator = domBuilder.locator;
      function position(p, m) {
        while (p >= lineEnd && (m = linePattern.exec(source))) {
          lineStart = lineEnd;
          lineEnd = m.index + m[0].length;
          locator.lineNumber++;
        }
        locator.columnNumber = p - lineStart + 1;
      }
      var parseStack = [{ currentNSMap: defaultNSMapCopy }];
      var unclosedTags = [];
      var start = 0;
      while (true) {
        try {
          var tagStart = source.indexOf("<", start);
          if (tagStart < 0) {
            if (!isHTML && unclosedTags.length > 0) {
              return errorHandler.fatalError("unclosed xml tag(s): " + unclosedTags.join(", "));
            }
            if (!source.substring(start).match(/^\s*$/)) {
              var doc = domBuilder.doc;
              var text = doc.createTextNode(source.substring(start));
              if (doc.documentElement) {
                return errorHandler.error("Extra content at the end of the document");
              }
              doc.appendChild(text);
              domBuilder.currentElement = text;
            }
            return;
          }
          if (tagStart > start) {
            var fromSource = source.substring(start, tagStart);
            if (!isHTML && unclosedTags.length === 0) {
              fromSource = fromSource.replace(new RegExp(g.S_OPT.source, "g"), "");
              fromSource && errorHandler.error("Unexpected content outside root element: '" + fromSource + "'");
            }
            appendText(tagStart);
          }
          switch (source.charAt(tagStart + 1)) {
            case "/":
              var end = source.indexOf(">", tagStart + 2);
              var tagNameRaw = source.substring(tagStart + 2, end > 0 ? end : void 0);
              if (!tagNameRaw) {
                return errorHandler.fatalError("end tag name missing");
              }
              var tagNameMatch = end > 0 && g.reg("^", g.QName_group, g.S_OPT, "$").exec(tagNameRaw);
              if (!tagNameMatch) {
                return errorHandler.fatalError('end tag name contains invalid characters: "' + tagNameRaw + '"');
              }
              if (!domBuilder.currentElement && !domBuilder.doc.documentElement) {
                return;
              }
              var currentTagName = unclosedTags[unclosedTags.length - 1] || domBuilder.currentElement.tagName || domBuilder.doc.documentElement.tagName || "";
              if (currentTagName !== tagNameMatch[1]) {
                var tagNameLower = tagNameMatch[1].toLowerCase();
                if (!isHTML || currentTagName.toLowerCase() !== tagNameLower) {
                  return errorHandler.fatalError('Opening and ending tag mismatch: "' + currentTagName + '" != "' + tagNameRaw + '"');
                }
              }
              var config = parseStack.pop();
              unclosedTags.pop();
              var localNSMap = config.localNSMap;
              domBuilder.endElement(config.uri, config.localName, currentTagName);
              if (localNSMap) {
                for (var prefix in localNSMap) {
                  if (hasOwn(localNSMap, prefix)) {
                    domBuilder.endPrefixMapping(prefix);
                  }
                }
              }
              end++;
              break;
            // end element
            case "?":
              locator && position(tagStart);
              end = parseProcessingInstruction(source, tagStart, domBuilder, errorHandler);
              break;
            case "!":
              locator && position(tagStart);
              end = parseDoctypeCommentOrCData(source, tagStart, domBuilder, errorHandler, isHTML);
              break;
            default:
              locator && position(tagStart);
              var el = new ElementAttributes();
              var currentNSMap = parseStack[parseStack.length - 1].currentNSMap;
              var end = parseElementStartPart(source, tagStart, el, currentNSMap, entityReplacer, errorHandler, isHTML);
              var len = el.length;
              if (!el.closed) {
                if (isHTML && conventions.isHTMLVoidElement(el.tagName)) {
                  el.closed = true;
                } else {
                  unclosedTags.push(el.tagName);
                }
              }
              if (locator && len) {
                var locator2 = copyLocator(locator, {});
                for (var i = 0; i < len; i++) {
                  var a = el[i];
                  position(a.offset);
                  a.locator = copyLocator(locator, {});
                }
                domBuilder.locator = locator2;
                if (appendElement(el, domBuilder, currentNSMap)) {
                  parseStack.push(el);
                }
                domBuilder.locator = locator;
              } else {
                if (appendElement(el, domBuilder, currentNSMap)) {
                  parseStack.push(el);
                }
              }
              if (isHTML && !el.closed) {
                end = parseHtmlSpecialContent(source, end, el.tagName, entityReplacer, domBuilder);
              } else {
                end++;
              }
          }
        } catch (e) {
          if (e instanceof ParseError) {
            throw e;
          } else if (e instanceof DOMException) {
            throw new ParseError(e.name + ": " + e.message, domBuilder.locator, e);
          }
          errorHandler.error("element parse error: " + e);
          end = -1;
        }
        if (end > start) {
          start = end;
        } else {
          appendText(Math.max(tagStart, start) + 1);
        }
      }
    }
    function copyLocator(f, t) {
      t.lineNumber = f.lineNumber;
      t.columnNumber = f.columnNumber;
      return t;
    }
    function parseElementStartPart(source, start, el, currentNSMap, entityReplacer, errorHandler, isHTML) {
      function addAttribute(qname, value2, startIndex) {
        if (hasOwn(el.attributeNames, qname)) {
          return errorHandler.fatalError("Attribute " + qname + " redefined");
        }
        if (!isHTML && value2.indexOf("<") >= 0) {
          return errorHandler.fatalError("Unescaped '<' not allowed in attributes values");
        }
        el.addValue(
          qname,
          // @see https://www.w3.org/TR/xml/#AVNormalize
          // since the xmldom sax parser does not "interpret" DTD the following is not implemented:
          // - recursive replacement of (DTD) entity references
          // - trimming and collapsing multiple spaces into a single one for attributes that are not of type CDATA
          value2.replace(/[\t\n\r]/g, " ").replace(ENTITY_REG, entityReplacer),
          startIndex
        );
      }
      var attrName;
      var value;
      var p = ++start;
      var s = S_TAG;
      while (true) {
        var c = source.charAt(p);
        switch (c) {
          case "=":
            if (s === S_ATTR) {
              attrName = source.slice(start, p);
              s = S_EQ;
            } else if (s === S_ATTR_SPACE) {
              s = S_EQ;
            } else {
              throw new Error("attribute equal must after attrName");
            }
            break;
          case "'":
          case '"':
            if (s === S_EQ || s === S_ATTR) {
              if (s === S_ATTR) {
                errorHandler.warning('attribute value must after "="');
                attrName = source.slice(start, p);
              }
              start = p + 1;
              p = source.indexOf(c, start);
              if (p > 0) {
                value = source.slice(start, p);
                addAttribute(attrName, value, start - 1);
                s = S_ATTR_END;
              } else {
                throw new Error("attribute value no end '" + c + "' match");
              }
            } else if (s == S_ATTR_NOQUOT_VALUE) {
              value = source.slice(start, p);
              addAttribute(attrName, value, start);
              errorHandler.warning('attribute "' + attrName + '" missed start quot(' + c + ")!!");
              start = p + 1;
              s = S_ATTR_END;
            } else {
              throw new Error('attribute value must after "="');
            }
            break;
          case "/":
            switch (s) {
              case S_TAG:
                el.setTagName(source.slice(start, p));
              case S_ATTR_END:
              case S_TAG_SPACE:
              case S_TAG_CLOSE:
                s = S_TAG_CLOSE;
                el.closed = true;
              case S_ATTR_NOQUOT_VALUE:
              case S_ATTR:
                break;
              case S_ATTR_SPACE:
                el.closed = true;
                break;
              //case S_EQ:
              default:
                throw new Error("attribute invalid close char('/')");
            }
            break;
          case "":
            errorHandler.error("unexpected end of input");
            if (s == S_TAG) {
              el.setTagName(source.slice(start, p));
            }
            return p;
          case ">":
            switch (s) {
              case S_TAG:
                el.setTagName(source.slice(start, p));
              case S_ATTR_END:
              case S_TAG_SPACE:
              case S_TAG_CLOSE:
                break;
              //normal
              case S_ATTR_NOQUOT_VALUE:
              //Compatible state
              case S_ATTR:
                value = source.slice(start, p);
                if (value.slice(-1) === "/") {
                  el.closed = true;
                  value = value.slice(0, -1);
                }
              case S_ATTR_SPACE:
                if (s === S_ATTR_SPACE) {
                  value = attrName;
                }
                if (s == S_ATTR_NOQUOT_VALUE) {
                  errorHandler.warning('attribute "' + value + '" missed quot(")!');
                  addAttribute(attrName, value, start);
                } else {
                  if (!isHTML) {
                    errorHandler.warning('attribute "' + value + '" missed value!! "' + value + '" instead!!');
                  }
                  addAttribute(value, value, start);
                }
                break;
              case S_EQ:
                if (!isHTML) {
                  return errorHandler.fatalError(`AttValue: ' or " expected`);
                }
            }
            return p;
          /*xml space '\x20' | #x9 | #xD | #xA; */
          case "\x80":
            c = " ";
          default:
            if (c <= " ") {
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                  s = S_TAG_SPACE;
                  break;
                case S_ATTR:
                  attrName = source.slice(start, p);
                  s = S_ATTR_SPACE;
                  break;
                case S_ATTR_NOQUOT_VALUE:
                  var value = source.slice(start, p);
                  errorHandler.warning('attribute "' + value + '" missed quot(")!!');
                  addAttribute(attrName, value, start);
                case S_ATTR_END:
                  s = S_TAG_SPACE;
                  break;
              }
            } else {
              switch (s) {
                //case S_TAG:void();break;
                //case S_ATTR:void();break;
                //case S_ATTR_NOQUOT_VALUE:void();break;
                case S_ATTR_SPACE:
                  if (!isHTML) {
                    errorHandler.warning('attribute "' + attrName + '" missed value!! "' + attrName + '" instead2!!');
                  }
                  addAttribute(attrName, attrName, start);
                  start = p;
                  s = S_ATTR;
                  break;
                case S_ATTR_END:
                  errorHandler.warning('attribute space is required"' + attrName + '"!!');
                case S_TAG_SPACE:
                  s = S_ATTR;
                  start = p;
                  break;
                case S_EQ:
                  s = S_ATTR_NOQUOT_VALUE;
                  start = p;
                  break;
                case S_TAG_CLOSE:
                  throw new Error("elements closed character '/' and '>' must be connected to");
              }
            }
        }
        p++;
      }
    }
    function appendElement(el, domBuilder, currentNSMap) {
      var tagName = el.tagName;
      var localNSMap = null;
      var i = el.length;
      while (i--) {
        var a = el[i];
        var qName = a.qName;
        var value = a.value;
        var nsp = qName.indexOf(":");
        if (nsp > 0) {
          var prefix = a.prefix = qName.slice(0, nsp);
          var localName3 = qName.slice(nsp + 1);
          var nsPrefix = prefix === "xmlns" && localName3;
        } else {
          localName3 = qName;
          prefix = null;
          nsPrefix = qName === "xmlns" && "";
        }
        a.localName = localName3;
        if (nsPrefix !== false) {
          if (localNSMap == null) {
            localNSMap = /* @__PURE__ */ Object.create(null);
            _copy(currentNSMap, currentNSMap = /* @__PURE__ */ Object.create(null));
          }
          currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
          a.uri = NAMESPACE.XMLNS;
          domBuilder.startPrefixMapping(nsPrefix, value);
        }
      }
      var i = el.length;
      while (i--) {
        a = el[i];
        if (a.prefix) {
          if (a.prefix === "xml") {
            a.uri = NAMESPACE.XML;
          }
          if (a.prefix !== "xmlns") {
            a.uri = currentNSMap[a.prefix];
          }
        }
      }
      var nsp = tagName.indexOf(":");
      if (nsp > 0) {
        prefix = el.prefix = tagName.slice(0, nsp);
        localName3 = el.localName = tagName.slice(nsp + 1);
      } else {
        prefix = null;
        localName3 = el.localName = tagName;
      }
      var ns = el.uri = currentNSMap[prefix || ""];
      domBuilder.startElement(ns, localName3, tagName, el);
      if (el.closed) {
        domBuilder.endElement(ns, localName3, tagName);
        if (localNSMap) {
          for (prefix in localNSMap) {
            if (hasOwn(localNSMap, prefix)) {
              domBuilder.endPrefixMapping(prefix);
            }
          }
        }
      } else {
        el.currentNSMap = currentNSMap;
        el.localNSMap = localNSMap;
        return true;
      }
    }
    function parseHtmlSpecialContent(source, elStartEnd, tagName, entityReplacer, domBuilder) {
      var isEscapableRaw = isHTMLEscapableRawTextElement(tagName);
      if (isEscapableRaw || isHTMLRawTextElement(tagName)) {
        var elEndStart = source.indexOf("</" + tagName + ">", elStartEnd);
        var text = source.substring(elStartEnd + 1, elEndStart);
        if (isEscapableRaw) {
          text = text.replace(ENTITY_REG, entityReplacer);
        }
        domBuilder.characters(text, 0, text.length);
        return elEndStart;
      }
      return elStartEnd + 1;
    }
    function _copy(source, target) {
      for (var n in source) {
        if (hasOwn(source, n)) {
          target[n] = source[n];
        }
      }
    }
    function parseUtils(source, start) {
      var index = start;
      function char(n) {
        n = n || 0;
        return source.charAt(index + n);
      }
      function skip(n) {
        n = n || 1;
        index += n;
      }
      function skipBlanks() {
        var blanks = 0;
        while (index < source.length) {
          var c = char();
          if (c !== " " && c !== "\n" && c !== "	" && c !== "\r") {
            return blanks;
          }
          blanks++;
          skip();
        }
        return -1;
      }
      function substringFromIndex() {
        return source.substring(index);
      }
      function substringStartsWith(text) {
        return source.substring(index, index + text.length) === text;
      }
      function substringStartsWithCaseInsensitive(text) {
        return source.substring(index, index + text.length).toUpperCase() === text.toUpperCase();
      }
      function getMatch(args) {
        var expr = g.reg("^", args);
        var match = expr.exec(substringFromIndex());
        if (match) {
          skip(match[0].length);
          return match[0];
        }
        return null;
      }
      return {
        char,
        getIndex: function() {
          return index;
        },
        getMatch,
        getSource: function() {
          return source;
        },
        skip,
        skipBlanks,
        substringFromIndex,
        substringStartsWith,
        substringStartsWithCaseInsensitive
      };
    }
    function parseDoctypeInternalSubset(p, errorHandler) {
      function parsePI(p2, errorHandler2) {
        var match = g.PI.exec(p2.substringFromIndex());
        if (!match) {
          return errorHandler2.fatalError("processing instruction is not well-formed at position " + p2.getIndex());
        }
        if (match[1].toLowerCase() === "xml") {
          return errorHandler2.fatalError(
            "xml declaration is only allowed at the start of the document, but found at position " + p2.getIndex()
          );
        }
        p2.skip(match[0].length);
        return match[0];
      }
      var source = p.getSource();
      if (p.char() === "[") {
        p.skip(1);
        var intSubsetStart = p.getIndex();
        while (p.getIndex() < source.length) {
          p.skipBlanks();
          if (p.char() === "]") {
            var internalSubset = source.substring(intSubsetStart, p.getIndex());
            p.skip(1);
            return internalSubset;
          }
          var current = null;
          if (p.char() === "<" && p.char(1) === "!") {
            switch (p.char(2)) {
              case "E":
                if (p.char(3) === "L") {
                  current = p.getMatch(g.elementdecl);
                } else if (p.char(3) === "N") {
                  current = p.getMatch(g.EntityDecl);
                }
                break;
              case "A":
                current = p.getMatch(g.AttlistDecl);
                break;
              case "N":
                current = p.getMatch(g.NotationDecl);
                break;
              case "-":
                current = p.getMatch(g.Comment);
                break;
            }
          } else if (p.char() === "<" && p.char(1) === "?") {
            current = parsePI(p, errorHandler);
          } else if (p.char() === "%") {
            current = p.getMatch(g.PEReference);
          } else {
            return errorHandler.fatalError("Error detected in Markup declaration");
          }
          if (!current) {
            return errorHandler.fatalError("Error in internal subset at position " + p.getIndex());
          }
        }
        return errorHandler.fatalError("doctype internal subset is not well-formed, missing ]");
      }
    }
    function parseDoctypeCommentOrCData(source, start, domBuilder, errorHandler, isHTML) {
      var p = parseUtils(source, start);
      switch (isHTML ? p.char(2).toUpperCase() : p.char(2)) {
        case "-":
          var comment = p.getMatch(g.Comment);
          if (comment) {
            domBuilder.comment(comment, g.COMMENT_START.length, comment.length - g.COMMENT_START.length - g.COMMENT_END.length);
            return p.getIndex();
          } else {
            return errorHandler.fatalError("comment is not well-formed at position " + p.getIndex());
          }
        case "[":
          var cdata = p.getMatch(g.CDSect);
          if (cdata) {
            if (!isHTML && !domBuilder.currentElement) {
              return errorHandler.fatalError("CDATA outside of element");
            }
            domBuilder.startCDATA();
            domBuilder.characters(cdata, g.CDATA_START.length, cdata.length - g.CDATA_START.length - g.CDATA_END.length);
            domBuilder.endCDATA();
            return p.getIndex();
          } else {
            return errorHandler.fatalError("Invalid CDATA starting at position " + start);
          }
        case "D": {
          if (domBuilder.doc && domBuilder.doc.documentElement) {
            return errorHandler.fatalError("Doctype not allowed inside or after documentElement at position " + p.getIndex());
          }
          if (isHTML ? !p.substringStartsWithCaseInsensitive(g.DOCTYPE_DECL_START) : !p.substringStartsWith(g.DOCTYPE_DECL_START)) {
            return errorHandler.fatalError("Expected " + g.DOCTYPE_DECL_START + " at position " + p.getIndex());
          }
          p.skip(g.DOCTYPE_DECL_START.length);
          if (p.skipBlanks() < 1) {
            return errorHandler.fatalError("Expected whitespace after " + g.DOCTYPE_DECL_START + " at position " + p.getIndex());
          }
          var doctype = {
            name: void 0,
            publicId: void 0,
            systemId: void 0,
            internalSubset: void 0
          };
          doctype.name = p.getMatch(g.Name);
          if (!doctype.name)
            return errorHandler.fatalError("doctype name missing or contains unexpected characters at position " + p.getIndex());
          if (isHTML && doctype.name.toLowerCase() !== "html") {
            errorHandler.warning("Unexpected DOCTYPE in HTML document at position " + p.getIndex());
          }
          p.skipBlanks();
          if (p.substringStartsWith(g.PUBLIC) || p.substringStartsWith(g.SYSTEM)) {
            var match = g.ExternalID_match.exec(p.substringFromIndex());
            if (!match) {
              return errorHandler.fatalError("doctype external id is not well-formed at position " + p.getIndex());
            }
            if (match.groups.SystemLiteralOnly !== void 0) {
              doctype.systemId = match.groups.SystemLiteralOnly;
            } else {
              doctype.systemId = match.groups.SystemLiteral;
              doctype.publicId = match.groups.PubidLiteral;
            }
            p.skip(match[0].length);
          } else if (isHTML && p.substringStartsWithCaseInsensitive(g.SYSTEM)) {
            p.skip(g.SYSTEM.length);
            if (p.skipBlanks() < 1) {
              return errorHandler.fatalError("Expected whitespace after " + g.SYSTEM + " at position " + p.getIndex());
            }
            doctype.systemId = p.getMatch(g.ABOUT_LEGACY_COMPAT_SystemLiteral);
            if (!doctype.systemId) {
              return errorHandler.fatalError(
                "Expected " + g.ABOUT_LEGACY_COMPAT + " in single or double quotes after " + g.SYSTEM + " at position " + p.getIndex()
              );
            }
          }
          if (isHTML && doctype.systemId && !g.ABOUT_LEGACY_COMPAT_SystemLiteral.test(doctype.systemId)) {
            errorHandler.warning("Unexpected doctype.systemId in HTML document at position " + p.getIndex());
          }
          if (!isHTML) {
            p.skipBlanks();
            doctype.internalSubset = parseDoctypeInternalSubset(p, errorHandler);
          }
          p.skipBlanks();
          if (p.char() !== ">") {
            return errorHandler.fatalError("doctype not terminated with > at position " + p.getIndex());
          }
          p.skip(1);
          domBuilder.startDTD(doctype.name, doctype.publicId, doctype.systemId, doctype.internalSubset);
          domBuilder.endDTD();
          return p.getIndex();
        }
        default:
          return errorHandler.fatalError('Not well-formed XML starting with "<!" at position ' + start);
      }
    }
    function parseProcessingInstruction(source, start, domBuilder, errorHandler) {
      var match = source.substring(start).match(g.PI);
      if (!match) {
        return errorHandler.fatalError("Invalid processing instruction starting at position " + start);
      }
      if (match[1].toLowerCase() === "xml") {
        if (start > 0) {
          return errorHandler.fatalError(
            "processing instruction at position " + start + " is an xml declaration which is only at the start of the document"
          );
        }
        if (!g.XMLDecl.test(source.substring(start))) {
          return errorHandler.fatalError("xml declaration is not well-formed");
        }
      }
      domBuilder.processingInstruction(match[1], match[2]);
      return start + match[0].length;
    }
    function ElementAttributes() {
      this.attributeNames = /* @__PURE__ */ Object.create(null);
    }
    ElementAttributes.prototype = {
      setTagName: function(tagName) {
        if (!g.QName_exact.test(tagName)) {
          throw new Error("invalid tagName:" + tagName);
        }
        this.tagName = tagName;
      },
      addValue: function(qName, value, offset) {
        if (!g.QName_exact.test(qName)) {
          throw new Error("invalid attribute:" + qName);
        }
        this.attributeNames[qName] = this.length;
        this[this.length++] = { qName, value, offset };
      },
      length: 0,
      getLocalName: function(i) {
        return this[i].localName;
      },
      getLocator: function(i) {
        return this[i].locator;
      },
      getQName: function(i) {
        return this[i].qName;
      },
      getURI: function(i) {
        return this[i].uri;
      },
      getValue: function(i) {
        return this[i].value;
      }
      //	,getIndex:function(uri, localName)){
      //		if(localName){
      //
      //		}else{
      //			var qName = uri
      //		}
      //	},
      //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
      //	getType:function(uri,localName){}
      //	getType:function(i){},
    };
    exports.XMLReader = XMLReader;
    exports.parseUtils = parseUtils;
    exports.parseDoctypeCommentOrCData = parseDoctypeCommentOrCData;
  }
});

// node_modules/@xmldom/xmldom/lib/dom-parser.js
var require_dom_parser = __commonJS({
  "node_modules/@xmldom/xmldom/lib/dom-parser.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    var dom = require_dom();
    var errors = require_errors();
    var entities = require_entities();
    var sax = require_sax();
    var DOMImplementation = dom.DOMImplementation;
    var hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
    var isHTMLMimeType = conventions.isHTMLMimeType;
    var isValidMimeType = conventions.isValidMimeType;
    var MIME_TYPE = conventions.MIME_TYPE;
    var NAMESPACE = conventions.NAMESPACE;
    var ParseError = errors.ParseError;
    var XMLReader = sax.XMLReader;
    function normalizeLineEndings(input) {
      return input.replace(/\r[\n\u0085]/g, "\n").replace(/[\r\u0085\u2028\u2029]/g, "\n");
    }
    function DOMParser6(options) {
      options = options || {};
      if (options.locator === void 0) {
        options.locator = true;
      }
      this.assign = options.assign || conventions.assign;
      this.domHandler = options.domHandler || DOMHandler;
      this.onError = options.onError || options.errorHandler;
      if (options.errorHandler && typeof options.errorHandler !== "function") {
        throw new TypeError("errorHandler object is no longer supported, switch to onError!");
      } else if (options.errorHandler) {
        options.errorHandler("warning", "The `errorHandler` option has been deprecated, use `onError` instead!", this);
      }
      this.normalizeLineEndings = options.normalizeLineEndings || normalizeLineEndings;
      this.locator = !!options.locator;
      this.xmlns = this.assign(/* @__PURE__ */ Object.create(null), options.xmlns);
    }
    DOMParser6.prototype.parseFromString = function(source, mimeType) {
      if (!isValidMimeType(mimeType)) {
        throw new TypeError('DOMParser.parseFromString: the provided mimeType "' + mimeType + '" is not valid.');
      }
      var defaultNSMap = this.assign(/* @__PURE__ */ Object.create(null), this.xmlns);
      var entityMap = entities.XML_ENTITIES;
      var defaultNamespace = defaultNSMap[""] || null;
      if (hasDefaultHTMLNamespace(mimeType)) {
        entityMap = entities.HTML_ENTITIES;
        defaultNamespace = NAMESPACE.HTML;
      } else if (mimeType === MIME_TYPE.XML_SVG_IMAGE) {
        defaultNamespace = NAMESPACE.SVG;
      }
      defaultNSMap[""] = defaultNamespace;
      defaultNSMap.xml = defaultNSMap.xml || NAMESPACE.XML;
      var domBuilder = new this.domHandler({
        mimeType,
        defaultNamespace,
        onError: this.onError
      });
      var locator = this.locator ? {} : void 0;
      if (this.locator) {
        domBuilder.setDocumentLocator(locator);
      }
      var sax2 = new XMLReader();
      sax2.errorHandler = domBuilder;
      sax2.domBuilder = domBuilder;
      var isXml = !conventions.isHTMLMimeType(mimeType);
      if (isXml && typeof source !== "string") {
        sax2.errorHandler.fatalError("source is not a string");
      }
      sax2.parse(this.normalizeLineEndings(String(source)), defaultNSMap, entityMap);
      if (!domBuilder.doc.documentElement) {
        sax2.errorHandler.fatalError("missing root element");
      }
      return domBuilder.doc;
    };
    function DOMHandler(options) {
      var opt = options || {};
      this.mimeType = opt.mimeType || MIME_TYPE.XML_APPLICATION;
      this.defaultNamespace = opt.defaultNamespace || null;
      this.cdata = false;
      this.currentElement = void 0;
      this.doc = void 0;
      this.locator = void 0;
      this.onError = opt.onError;
    }
    function position(locator, node) {
      node.lineNumber = locator.lineNumber;
      node.columnNumber = locator.columnNumber;
    }
    DOMHandler.prototype = {
      /**
       * Either creates an XML or an HTML document and stores it under `this.doc`.
       * If it is an XML document, `this.defaultNamespace` is used to create it,
       * and it will not contain any `childNodes`.
       * If it is an HTML document, it will be created without any `childNodes`.
       *
       * @see http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
       */
      startDocument: function() {
        var impl = new DOMImplementation();
        this.doc = isHTMLMimeType(this.mimeType) ? impl.createHTMLDocument(false) : impl.createDocument(this.defaultNamespace, "");
      },
      startElement: function(namespaceURI, localName3, qName, attrs) {
        var doc = this.doc;
        var el = doc.createElementNS(namespaceURI, qName || localName3);
        var len = attrs.length;
        appendElement(this, el);
        this.currentElement = el;
        this.locator && position(this.locator, el);
        for (var i = 0; i < len; i++) {
          var namespaceURI = attrs.getURI(i);
          var value = attrs.getValue(i);
          var qName = attrs.getQName(i);
          var attr = doc.createAttributeNS(namespaceURI, qName);
          this.locator && position(attrs.getLocator(i), attr);
          attr.value = attr.nodeValue = value;
          el.setAttributeNode(attr);
        }
      },
      endElement: function(namespaceURI, localName3, qName) {
        this.currentElement = this.currentElement.parentNode;
      },
      startPrefixMapping: function(prefix, uri) {
      },
      endPrefixMapping: function(prefix) {
      },
      processingInstruction: function(target, data) {
        var ins = this.doc.createProcessingInstruction(target, data);
        this.locator && position(this.locator, ins);
        appendElement(this, ins);
      },
      ignorableWhitespace: function(ch, start, length) {
      },
      characters: function(chars, start, length) {
        chars = _toString.apply(this, arguments);
        if (chars) {
          if (this.cdata) {
            var charNode = this.doc.createCDATASection(chars);
          } else {
            var charNode = this.doc.createTextNode(chars);
          }
          if (this.currentElement) {
            this.currentElement.appendChild(charNode);
          } else if (/^\s*$/.test(chars)) {
            this.doc.appendChild(charNode);
          }
          this.locator && position(this.locator, charNode);
        }
      },
      skippedEntity: function(name) {
      },
      endDocument: function() {
        this.doc.normalize();
      },
      /**
       * Stores the locator to be able to set the `columnNumber` and `lineNumber`
       * on the created DOM nodes.
       *
       * @param {Locator} locator
       */
      setDocumentLocator: function(locator) {
        if (locator) {
          locator.lineNumber = 0;
        }
        this.locator = locator;
      },
      //LexicalHandler
      comment: function(chars, start, length) {
        chars = _toString.apply(this, arguments);
        var comm = this.doc.createComment(chars);
        this.locator && position(this.locator, comm);
        appendElement(this, comm);
      },
      startCDATA: function() {
        this.cdata = true;
      },
      endCDATA: function() {
        this.cdata = false;
      },
      startDTD: function(name, publicId, systemId, internalSubset) {
        var impl = this.doc.implementation;
        if (impl && impl.createDocumentType) {
          var dt = impl.createDocumentType(name, publicId, systemId, internalSubset);
          this.locator && position(this.locator, dt);
          appendElement(this, dt);
          this.doc.doctype = dt;
        }
      },
      reportError: function(level, message) {
        if (typeof this.onError === "function") {
          try {
            this.onError(level, message, this);
          } catch (e) {
            throw new ParseError("Reporting " + level + ' "' + message + '" caused ' + e, this.locator);
          }
        } else {
          console.error("[xmldom " + level + "]	" + message, _locator(this.locator));
        }
      },
      /**
       * @see http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
       */
      warning: function(message) {
        this.reportError("warning", message);
      },
      error: function(message) {
        this.reportError("error", message);
      },
      /**
       * This function reports a fatal error and throws a ParseError.
       *
       * @param {string} message
       * - The message to be used for reporting and throwing the error.
       * @returns {never}
       * This function always throws an error and never returns a value.
       * @throws {ParseError}
       * Always throws a ParseError with the provided message.
       */
      fatalError: function(message) {
        this.reportError("fatalError", message);
        throw new ParseError(message, this.locator);
      }
    };
    function _locator(l) {
      if (l) {
        return "\n@#[line:" + l.lineNumber + ",col:" + l.columnNumber + "]";
      }
    }
    function _toString(chars, start, length) {
      if (typeof chars == "string") {
        return chars.substr(start, length);
      } else {
        if (chars.length >= start + length || start) {
          return new java.lang.String(chars, start, length) + "";
        }
        return chars;
      }
    }
    "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(
      /\w+/g,
      function(key) {
        DOMHandler.prototype[key] = function() {
          return null;
        };
      }
    );
    function appendElement(handler, node) {
      if (!handler.currentElement) {
        handler.doc.appendChild(node);
      } else {
        handler.currentElement.appendChild(node);
      }
    }
    function onErrorStopParsing(level) {
      if (level === "error") throw "onErrorStopParsing";
    }
    function onWarningStopParsing() {
      throw "onWarningStopParsing";
    }
    exports.__DOMHandler = DOMHandler;
    exports.DOMParser = DOMParser6;
    exports.normalizeLineEndings = normalizeLineEndings;
    exports.onErrorStopParsing = onErrorStopParsing;
    exports.onWarningStopParsing = onWarningStopParsing;
  }
});

// node_modules/@xmldom/xmldom/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/@xmldom/xmldom/lib/index.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    exports.assign = conventions.assign;
    exports.hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
    exports.isHTMLMimeType = conventions.isHTMLMimeType;
    exports.isValidMimeType = conventions.isValidMimeType;
    exports.MIME_TYPE = conventions.MIME_TYPE;
    exports.NAMESPACE = conventions.NAMESPACE;
    var errors = require_errors();
    exports.DOMException = errors.DOMException;
    exports.DOMExceptionName = errors.DOMExceptionName;
    exports.ExceptionCode = errors.ExceptionCode;
    exports.ParseError = errors.ParseError;
    var dom = require_dom();
    exports.Attr = dom.Attr;
    exports.CDATASection = dom.CDATASection;
    exports.CharacterData = dom.CharacterData;
    exports.Comment = dom.Comment;
    exports.Document = dom.Document;
    exports.DocumentFragment = dom.DocumentFragment;
    exports.DocumentType = dom.DocumentType;
    exports.DOMImplementation = dom.DOMImplementation;
    exports.Element = dom.Element;
    exports.Entity = dom.Entity;
    exports.EntityReference = dom.EntityReference;
    exports.LiveNodeList = dom.LiveNodeList;
    exports.NamedNodeMap = dom.NamedNodeMap;
    exports.Node = dom.Node;
    exports.NodeList = dom.NodeList;
    exports.Notation = dom.Notation;
    exports.ProcessingInstruction = dom.ProcessingInstruction;
    exports.Text = dom.Text;
    exports.XMLSerializer = dom.XMLSerializer;
    var domParser = require_dom_parser();
    exports.DOMParser = domParser.DOMParser;
    exports.normalizeLineEndings = domParser.normalizeLineEndings;
    exports.onErrorStopParsing = domParser.onErrorStopParsing;
    exports.onWarningStopParsing = domParser.onWarningStopParsing;
  }
});

// src/hwpx/parser.ts
var import_jszip = __toESM(require_lib(), 1);
var import_xmldom = __toESM(require_lib2(), 1);
import { inflateRawSync } from "zlib";

// src/hwpx/com-fallback.ts
import { execFileSync } from "child_process";
import { platform } from "os";
function isComFallbackAvailable() {
  return platform() === "win32";
}
function isEncryptedHwpx(manifestXml) {
  return manifestXml.includes("encryption-data");
}
function extractTextViaCom(filePath) {
  if (!isComFallbackAvailable()) {
    throw new Error("COM fallback\uC740 Windows\uC5D0\uC11C\uB9CC \uC0AC\uC6A9 \uAC00\uB2A5\uD569\uB2C8\uB2E4");
  }
  const escaped = filePath.replace(/'/g, "''");
  const ps1 = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'

$src = '${escaped}'
$tmpDir = Join-Path $env:TEMP ('hwp-com-' + [guid]::NewGuid().ToString('N'))
[void](New-Item -ItemType Directory -Path $tmpDir -Force)
$tmpFile = Join-Path $tmpDir (Split-Path $src -Leaf)
Copy-Item -LiteralPath $src -Destination $tmpFile -Force

try {
  $hwp = New-Object -ComObject HWPFrame.HwpObject
  $hwp.RegisterModule('FilePathCheckerModule', 'FilePathCheckerModuleExample') | Out-Null
  $hwp.Open($tmpFile, '', '') | Out-Null
  $pc = $hwp.PageCount
  $result = @{ pageCount = $pc; pages = @() }
  for ($p = 1; $p -le $pc; $p++) {
    $t = $hwp.GetPageText($p, 0)
    $result.pages += @($t)
  }
  $hwp.Clear(1) | Out-Null
  try { $hwp.Quit() | Out-Null } catch { }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($hwp) | Out-Null
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
  $result | ConvertTo-Json -Depth 3 -Compress
} catch {
  @{ error = $_.Exception.Message } | ConvertTo-Json -Compress
} finally {
  # \uC784\uC2DC \uD30C\uC77C \uC815\uB9AC + \uC880\uBE44 Hwp.exe \uBC29\uC9C0\uC6A9 garbage collect
  try { Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue } catch { }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
`;
  const stdout = execFileSync("powershell", [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    ps1
  ], {
    encoding: "utf-8",
    timeout: 12e4,
    // 2분 타임아웃
    windowsHide: true,
    maxBuffer: 50 * 1024 * 1024
    // 50MB
  });
  const trimmed = stdout.trim();
  const jsonStart = trimmed.indexOf("{");
  if (jsonStart < 0) throw new Error(`COM \uCD9C\uB825\uC5D0 JSON\uC774 \uC5C6\uC2B5\uB2C8\uB2E4: ${trimmed.slice(0, 200)}`);
  const json = JSON.parse(trimmed.slice(jsonStart));
  if (json.error) {
    throw new Error(`COM \uD14D\uC2A4\uD2B8 \uCD94\uCD9C \uC2E4\uD328: ${json.error}`);
  }
  const warnings = [];
  const pages = Array.isArray(json.pages) ? json.pages : [];
  const pageCount = json.pageCount ?? pages.length;
  if (pages.length === 0) {
    warnings.push({ message: "COM\uC73C\uB85C \uD14D\uC2A4\uD2B8\uB97C \uCD94\uCD9C\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4", code: "COM_EMPTY" });
  }
  return { pages, pageCount, warnings };
}
function comResultToParseResult(pages, pageCount, warnings) {
  const blocks = [];
  const lines = [];
  for (let i = 0; i < pages.length; i++) {
    const text = (pages[i] ?? "").trim();
    if (!text) continue;
    const paragraphs = text.split(/\n/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      blocks.push({ type: "paragraph", text: trimmed, pageNumber: i + 1 });
      lines.push(trimmed);
    }
  }
  const markdown = lines.join("\n\n");
  const metadata = { pageCount };
  warnings.push({
    message: "DRM \uBB38\uC11C: \uD55C\uCEF4 COM API\uB85C \uD14D\uC2A4\uD2B8 \uCD94\uCD9C (\uC11C\uC2DD/\uD45C \uC815\uBCF4 \uC81C\uD55C\uC801)",
    code: "DRM_COM_FALLBACK"
  });
  return {
    markdown,
    blocks,
    metadata,
    warnings: warnings.length > 0 ? warnings : void 0
  };
}

// src/hwpx/equation.ts
var CONVERT_MAP = {
  TIMES: "\\times",
  times: "\\times",
  LEFT: "\\left",
  RIGHT: "\\right",
  under: "\\underline",
  SMALLSUM: "\\sum",
  sum: "\\sum",
  SMALLPROD: "\\prod",
  prod: "\\prod",
  SMALLINTER: "\\cap",
  CUP: "\\cup",
  OPLUS: "\\oplus",
  OMINUS: "\\ominus",
  OTIMES: "\\otimes",
  ODIV: "\\oslash",
  ODOT: "\\odot",
  LOR: "\\lor",
  LAND: "\\land",
  SUBSET: "\\subset",
  SUPERSET: "\\supset",
  SUBSETEQ: "\\subseteq",
  SUPSETEQ: "\\supseteq",
  IN: "\\in",
  OWNS: "\\owns",
  NOTIN: "\\notin",
  LEQ: "\\leq",
  GEQ: "\\geq",
  "<<": "\\ll",
  ">>": "\\gg",
  "<<<": "\\lll",
  ">>>": "\\ggg",
  PREC: "\\prec",
  SUCC: "\\succ",
  UPLUS: "\\uplus",
  "\xB1": "\\pm",
  "-+": "\\mp",
  "\xF7": "\\div",
  CIRC: "\\circ",
  BULLET: "\\bullet",
  DEG: " ^\\circ",
  AST: "\\ast",
  STAR: "\\bigstar",
  BIGCIRC: "\\bigcirc",
  EMPTYSET: "\\emptyset",
  THEREFORE: "\\therefore",
  BECAUSE: "\\because",
  EXIST: "\\exists",
  "!=": "\\neq",
  SMCOPROD: "\\coprod",
  coprod: "\\coprod",
  SQCAP: "\\sqcap",
  SQCUP: "\\sqcup",
  SQSUBSET: "\\sqsubset",
  SQSUBSETEQ: "\\sqsubseteq",
  BIGSQCUP: "\\bigsqcup",
  BIGOPLUS: "\\bigoplus",
  BIGOTIMES: "\\bigotimes",
  BIGODOT: "\\bigodot",
  BIGUPLUS: "\\biguplus",
  inter: "\\bigcap",
  union: "\\bigcup",
  BIGOMINUS: "{\\Large\\ominus}",
  BIGODIV: "{\\Large\\oslash}",
  UNDEROVER: "",
  SIM: "\\sim",
  APPROX: "\\approx",
  SIMEQ: "\\simeq",
  CONG: "\\cong",
  "==": "\\equiv",
  DIAMOND: "\\diamond",
  FORALL: "\\forall",
  prime: "'",
  Partial: "\\partial",
  INF: "\\infty",
  PROPTO: "\\propto",
  lim: "\\lim",
  Lim: "\\lim",
  larrow: "\\leftarrow",
  "->": "\\rightarrow",
  uparrow: "\\uparrow",
  downarrow: "\\downarrow",
  LARROW: "\\Leftarrow",
  RARROW: "\\Rightarrow",
  UPARROW: "\\Uparrow",
  DOWNARROW: "\\Downarrow",
  udarrow: "\\updownarrow",
  "<->": "\\leftrightarrow",
  UDARROW: "\\Updownarrow",
  LRARROW: "\\Leftrightarrow",
  NWARROW: "\\nwarrow",
  SEARROW: "\\searrow",
  NEARROW: "\\nearrow",
  SWARROW: "\\swarrow",
  HOOKLEFT: "\\hookleftarrow",
  HOOKRIGHT: "\\hookrightarrow",
  PVER: "\\|",
  MAPSTO: "\\mapsto",
  CDOTS: "\\cdots",
  LDOTS: "\\ldots",
  VDOTS: "\\vdots",
  DDOTS: "\\ddots",
  DAGGER: "\\dagger",
  DDAGGER: "\\ddagger",
  DOTEQ: "\\doteq",
  image: "\\fallingdotseq",
  REIMAGE: "\\risingdotseq",
  ASYMP: "\\asymp",
  ISO: "\\Bumpeq",
  DSUM: "\\dotplus",
  XOR: "\\veebar",
  TRIANGLE: "\\triangle",
  NABLA: "\\nabla",
  ANGLE: "\\angle",
  MSANGLE: "\\measuredangle",
  SANGLE: "\\sphericalangle",
  VDASH: "\\vdash",
  DASHV: "\\dashv",
  BOT: "\\bot",
  TOP: "\\top",
  MODELS: "\\models",
  LAPLACE: "\\mathcal{L}",
  CENTIGRADE: "^{\\circ}C",
  FAHRENHEIT: "^{\\circ}F",
  LSLANT: "\\diagup",
  RSLANT: "\\diagdown",
  sqrt: "\\sqrt",
  int: "\\int",
  dint: "\\iint",
  tint: "\\iiint",
  oint: "\\oint",
  alpha: "\\alpha",
  beta: "\\beta",
  gamma: "\\gamma",
  delta: "\\delta",
  epsilon: "\\epsilon",
  zeta: "\\zeta",
  eta: "\\eta",
  theta: "\\theta",
  iota: "\\iota",
  kappa: "\\kappa",
  lambda: "\\lambda",
  mu: "\\mu",
  nu: "\\nu",
  xi: "\\xi",
  omicron: "\\omicron",
  pi: "\\pi",
  rho: "\\rho",
  sigma: "\\sigma",
  tau: "\\tau",
  upsilon: "\\upsilon",
  phi: "\\phi",
  chi: "\\chi",
  psi: "\\psi",
  omega: "\\omega",
  ALPHA: "A",
  BETA: "B",
  GAMMA: "\\Gamma",
  DELTA: "\\Delta",
  EPSILON: "E",
  ZETA: "Z",
  ETA: "H",
  THETA: "\\Theta",
  IOTA: "I",
  KAPPA: "K",
  LAMBDA: "\\Lambda",
  MU: "M",
  NU: "N",
  XI: "\\Xi",
  OMICRON: "O",
  PI: "\\Pi",
  RHO: "P",
  SIGMA: "\\Sigma",
  TAU: "T",
  UPSILON: "\\Upsilon",
  PHI: "\\Phi",
  CHI: "X",
  PSI: "\\Psi",
  OMEGA: "\\Omega",
  "\u2308": "\\lceil",
  "\u2309": "\\rceil",
  "\u230A": "\\lfloor",
  "\u230B": "\\rfloor",
  "\u2225": "\\|",
  "\u2290": "\\sqsupset",
  "\u2292": "\\sqsupseteq",
  odint: "\\mathop \u222F",
  otint: "\\mathop \u2230",
  BIGSQCAP: "\\mathop \u2A05",
  ATT: "\\mathop \u203B",
  HUND: "\\mathop \u2030",
  THOU: "\\mathop \u2031",
  IDENTICAL: "\\mathop \u2237",
  RTANGLE: "\\mathop \u22BE",
  BASE: "\\mathop \u2302",
  BENZENE: "\\mathop \u232C"
};
var MIDDLE_CONVERT_MAP = {
  matrix: "HULKMATRIX",
  pmatrix: "HULKPMATRIX",
  bmatrix: "HULKBMATRIX",
  dmatrix: "HULKDMATRIX",
  eqalign: "HULKEQALIGN",
  cases: "HULKCASE",
  vec: "HULKVEC",
  dyad: "HULKDYAD",
  acute: "HULKACUTE",
  grave: "HULKGRAVE",
  dot: "HULKDOT",
  ddot: "HULKDDOT",
  bar: "HULKBAR",
  hat: "HULKHAT",
  check: "HULKCHECK",
  arch: "HULKARCH",
  tilde: "HULKTILDE",
  BOX: "HULKBOX",
  OVERBRACE: "HULKOVERBRACE",
  UNDERBRACE: "HULKUNDERBRACE"
};
var BAR_CONVERT_MAP = {
  HULKVEC: "\\overrightarrow",
  HULKDYAD: "\\overleftrightarrow",
  HULKACUTE: "\\acute",
  HULKGRAVE: "\\grave",
  HULKDOT: "\\dot",
  HULKDDOT: "\\ddot",
  HULKBAR: "\\overline",
  HULKHAT: "\\widehat",
  HULKCHECK: "\\check",
  HULKARCH: "\\overset{\\frown}",
  HULKTILDE: "\\widetilde",
  HULKBOX: "\\boxed"
};
var MATRIX_CONVERT_MAP = {
  HULKMATRIX: { begin: "\\begin{matrix}", end: "\\end{matrix}", removeOutterBrackets: true },
  HULKPMATRIX: { begin: "\\begin{pmatrix}", end: "\\end{pmatrix}", removeOutterBrackets: true },
  HULKBMATRIX: { begin: "\\begin{bmatrix}", end: "\\end{bmatrix}", removeOutterBrackets: true },
  HULKDMATRIX: { begin: "\\begin{vmatrix}", end: "\\end{vmatrix}", removeOutterBrackets: true },
  HULKCASE: { begin: "\\begin{cases}", end: "\\end{cases}", removeOutterBrackets: true },
  HULKEQALIGN: { begin: "\\eqalign{", end: "}", removeOutterBrackets: false }
};
var BRACE_CONVERT_MAP = {
  HULKOVERBRACE: "\\overbrace",
  HULKUNDERBRACE: "\\underbrace"
};
function findBrackets(eqString, startIdx, direction) {
  if (direction === 1) {
    const startCur = eqString.indexOf("{", startIdx);
    if (startCur === -1) throw new Error("cannot find bracket");
    let bracketCount = 1;
    for (let i = startCur + 1; i < eqString.length; i++) {
      const ch = eqString[i];
      if (ch === "{") bracketCount += 1;
      else if (ch === "}") bracketCount -= 1;
      if (bracketCount === 0) return [startCur, i + 1];
    }
    throw new Error("cannot find bracket");
  }
  const reversed = Array.from(eqString).reverse();
  for (let i = 0; i < reversed.length; i++) {
    if (reversed[i] === "{") reversed[i] = "}";
    else if (reversed[i] === "}") reversed[i] = "{";
  }
  const flipped = reversed.join("");
  const newStartIdx = flipped.length - (startIdx + 1);
  const [s, e] = findBrackets(flipped, newStartIdx, 1);
  return [flipped.length - e, flipped.length - s];
}
function findOutterBrackets(eqString, startIdx) {
  let idx = startIdx;
  while (true) {
    idx -= 1;
    if (idx < 0) throw new Error("cannot find bracket");
    if (eqString[idx] === "{") break;
  }
  return findBrackets(eqString, idx, 1);
}
function replaceFrac(eqString) {
  const hmlFrac = "over";
  while (true) {
    const cursor = eqString.indexOf(hmlFrac);
    if (cursor === -1) break;
    try {
      const [numStart, numEnd] = findBrackets(eqString, cursor, 0);
      const numerator = eqString.slice(numStart, numEnd);
      const beforeFrac = eqString.slice(0, numStart);
      const afterFrac = eqString.slice(cursor + hmlFrac.length);
      eqString = beforeFrac + "\\frac" + numerator + afterFrac;
    } catch {
      return eqString;
    }
  }
  return eqString;
}
function replaceRootOf(eqString) {
  while (true) {
    const rootCursor = eqString.indexOf("root");
    if (rootCursor === -1) break;
    try {
      const ofCursor = eqString.indexOf("of");
      if (ofCursor === -1) return eqString;
      const elem1 = findBrackets(eqString, rootCursor, 1);
      const elem2 = findBrackets(eqString, ofCursor, 1);
      const e1 = eqString.slice(elem1[0] + 1, elem1[1] - 1);
      const e2 = eqString.slice(elem2[0] + 1, elem2[1] - 1);
      eqString = eqString.slice(0, rootCursor) + "\\sqrt[" + e1 + "]{" + e2 + "}" + eqString.slice(elem2[1] + 1);
    } catch {
      return eqString;
    }
  }
  return eqString;
}
function replaceAllMatrix(eqString) {
  const replaceElements = (bracketStr) => {
    let inner = bracketStr.slice(1, -1);
    inner = inner.replace(/#/g, " \\\\ ");
    inner = inner.replace(/&amp;/g, "&");
    return inner;
  };
  const replaceMatrix = (input, matStr, matElem) => {
    while (true) {
      const cursor = input.indexOf(matStr);
      if (cursor === -1) break;
      try {
        const [eStart, eEnd] = findBrackets(input, cursor, 1);
        const elem = replaceElements(input.slice(eStart, eEnd));
        let beforeMat;
        let afterMat;
        if (matElem.removeOutterBrackets) {
          const [bStart, bEnd] = findOutterBrackets(input, cursor);
          beforeMat = input.slice(0, bStart);
          afterMat = input.slice(bEnd);
        } else {
          beforeMat = input.slice(0, cursor);
          afterMat = input.slice(eEnd);
        }
        input = beforeMat + matElem.begin + elem + matElem.end + afterMat;
      } catch {
        return input;
      }
    }
    return input;
  };
  for (const [matKey, matElem] of Object.entries(MATRIX_CONVERT_MAP)) {
    eqString = replaceMatrix(eqString, matKey, matElem);
  }
  return eqString;
}
function replaceAllBar(eqString) {
  const replaceBar = (input, barStr, barElem) => {
    while (true) {
      const cursor = input.indexOf(barStr);
      if (cursor === -1) break;
      try {
        const [eStart, eEnd] = findBrackets(input, cursor, 1);
        const [bStart, bEnd] = findOutterBrackets(input, cursor);
        const elem = input.slice(eStart, eEnd);
        const beforeBar = input.slice(0, bStart);
        const afterBar = input.slice(bEnd);
        input = beforeBar + barElem + elem + afterBar;
      } catch {
        return input;
      }
    }
    return input;
  };
  for (const [barKey, barElem] of Object.entries(BAR_CONVERT_MAP)) {
    eqString = replaceBar(eqString, barKey, barElem);
  }
  return eqString;
}
function replaceAllBrace(eqString) {
  const replaceBrace = (input, braceStr, braceElem) => {
    while (true) {
      const cursor = input.indexOf(braceStr);
      if (cursor === -1) break;
      try {
        const [eStart1, eEnd1] = findBrackets(input, cursor, 1);
        const [eStart2, eEnd2] = findBrackets(input, eEnd1, 1);
        const elem1 = input.slice(eStart1, eEnd1);
        const elem2 = input.slice(eStart2, eEnd2);
        const beforeBrace = input.slice(0, cursor);
        const afterBrace = input.slice(eEnd2);
        input = beforeBrace + braceElem + elem1 + "^" + elem2 + afterBrace;
      } catch {
        return input;
      }
    }
    return input;
  };
  for (const [braceKey, braceElem] of Object.entries(BRACE_CONVERT_MAP)) {
    eqString = replaceBrace(eqString, braceKey, braceElem);
  }
  return eqString;
}
function replaceBracket(strList) {
  for (let i = 0; i < strList.length; i++) {
    if (strList[i] === "{" && i > 0 && strList[i - 1] === "\\left") strList[i] = "\\{";
    if (strList[i] === "}" && i > 0 && strList[i - 1] === "\\right") strList[i] = "\\}";
  }
  return strList;
}
function hmlToLatex(hmlEqStr) {
  if (!hmlEqStr) return "";
  let s = hmlEqStr.replace(/`/g, " ");
  s = s.replace(/\{/g, " { ").replace(/\}/g, " } ").replace(/&/g, " & ");
  let tokens = s.split(" ");
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t in CONVERT_MAP) tokens[i] = CONVERT_MAP[t];
    else if (t in MIDDLE_CONVERT_MAP) tokens[i] = MIDDLE_CONVERT_MAP[t];
  }
  tokens = tokens.filter((tok) => tok.length !== 0);
  tokens = replaceBracket(tokens);
  let out = tokens.join(" ");
  out = replaceFrac(out);
  out = replaceRootOf(out);
  out = replaceAllMatrix(out);
  out = replaceAllBar(out);
  out = replaceAllBrace(out);
  return out;
}

// src/hwpx/parser.ts
var MAX_DECOMPRESS_SIZE = 100 * 1024 * 1024;
var MAX_ZIP_ENTRIES = 500;
function clampSpan(val, max) {
  return Math.max(1, Math.min(val, max));
}
var MAX_XML_DEPTH = 200;
function createXmlParser(warnings) {
  return new import_xmldom.DOMParser({
    onError(level, msg) {
      if (level === "fatalError") throw new KordocError(`XML \uD30C\uC2F1 \uC2E4\uD328: ${msg}`);
      warnings?.push({ code: "MALFORMED_XML", message: `XML ${level === "warn" ? "\uACBD\uACE0" : "\uC624\uB958"}: ${msg}` });
    }
  });
}
async function extractHwpxStyles(zip, decompressed) {
  const result = {
    charProperties: /* @__PURE__ */ new Map(),
    styles: /* @__PURE__ */ new Map()
  };
  const headerPaths = ["Contents/header.xml", "header.xml", "Contents/head.xml", "head.xml"];
  for (const hp of headerPaths) {
    const hpLower = hp.toLowerCase();
    const file = zip.file(hp) || Object.values(zip.files).find((f) => f.name.toLowerCase() === hpLower) || null;
    if (!file) continue;
    try {
      const xml = await file.async("text");
      if (decompressed) {
        decompressed.total += xml.length * 2;
        if (decompressed.total > MAX_DECOMPRESS_SIZE) throw new KordocError("ZIP \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (ZIP bomb \uC758\uC2EC)");
      }
      const parser = createXmlParser();
      const doc = parser.parseFromString(stripDtd(xml), "text/xml");
      if (!doc.documentElement) continue;
      parseCharProperties(doc, result.charProperties);
      parseStyleElements(doc, result.styles);
      break;
    } catch {
      continue;
    }
  }
  return result;
}
function parseCharProperties(doc, map) {
  const tagNames = ["hh:charPr", "charPr", "hp:charPr"];
  for (const tagName of tagNames) {
    const elements = doc.getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const id = el.getAttribute("id") || el.getAttribute("IDRef") || "";
      if (!id) continue;
      const prop = {};
      const height = el.getAttribute("height");
      if (height) {
        const parsedHeight = parseInt(height, 10);
        if (!isNaN(parsedHeight) && parsedHeight > 0) {
          prop.fontSize = parsedHeight / 100;
        }
      }
      const bold = el.getAttribute("bold");
      if (bold === "true" || bold === "1") prop.bold = true;
      const italic = el.getAttribute("italic");
      if (italic === "true" || italic === "1") prop.italic = true;
      const fontFaces = el.getElementsByTagName("*");
      for (let j = 0; j < fontFaces.length; j++) {
        const ff = fontFaces[j];
        const localTag = (ff.tagName || "").replace(/^[^:]+:/, "");
        if (localTag === "fontface" || localTag === "fontRef") {
          const face = ff.getAttribute("face") || ff.getAttribute("FontFace");
          if (face) {
            prop.fontName = face;
            break;
          }
        }
      }
      map.set(id, prop);
    }
  }
}
function parseStyleElements(doc, map) {
  const tagNames = ["hh:style", "style", "hp:style"];
  for (const tagName of tagNames) {
    const elements = doc.getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const id = el.getAttribute("id") || el.getAttribute("IDRef") || String(i);
      const name = el.getAttribute("name") || el.getAttribute("engName") || "";
      const charPrId = el.getAttribute("charPrIDRef") || void 0;
      const paraPrId = el.getAttribute("paraPrIDRef") || void 0;
      map.set(id, { name, charPrId, paraPrId });
    }
  }
}
async function parseHwpxDocument(buffer, options) {
  precheckZipSize(buffer, MAX_DECOMPRESS_SIZE, MAX_ZIP_ENTRIES);
  let zip;
  try {
    zip = await import_jszip.default.loadAsync(buffer);
  } catch {
    return extractFromBrokenZip(buffer);
  }
  const actualEntryCount = Object.keys(zip.files).length;
  if (actualEntryCount > MAX_ZIP_ENTRIES) {
    throw new KordocError("ZIP \uC5D4\uD2B8\uB9AC \uC218 \uCD08\uACFC (ZIP bomb \uC758\uC2EC)");
  }
  const manifestFile = zip.file("META-INF/manifest.xml");
  if (manifestFile) {
    const manifestXml = await manifestFile.async("text");
    if (isEncryptedHwpx(manifestXml)) {
      if (isComFallbackAvailable() && options?.filePath) {
        const { pages, pageCount, warnings: warnings2 } = extractTextViaCom(options.filePath);
        if (pages.some((p) => p && p.trim().length > 0)) {
          return comResultToParseResult(pages, pageCount, warnings2);
        }
      }
      throw new KordocError("DRM \uC554\uD638\uD654\uB41C HWPX \uD30C\uC77C\uC785\uB2C8\uB2E4. Windows + \uD55C\uCEF4 \uC624\uD53C\uC2A4 \uC124\uCE58 \uC2DC \uC790\uB3D9 \uCD94\uCD9C\uB429\uB2C8\uB2E4.");
    }
  }
  const decompressed = { total: 0 };
  const metadata = {};
  await extractHwpxMetadata(zip, metadata, decompressed);
  const styleMap = await extractHwpxStyles(zip, decompressed);
  const warnings = [];
  const sectionPaths = await resolveSectionPaths(zip);
  if (sectionPaths.length === 0) throw new KordocError("HWPX\uC5D0\uC11C \uC139\uC158 \uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
  metadata.pageCount = sectionPaths.length;
  const pageFilter = options?.pages ? parsePageRange(options.pages, sectionPaths.length) : null;
  const totalTarget = pageFilter ? pageFilter.size : sectionPaths.length;
  const blocks = [];
  const nestedTableCounter = { count: 0 };
  let parsedSections = 0;
  for (let si = 0; si < sectionPaths.length; si++) {
    if (pageFilter && !pageFilter.has(si + 1)) continue;
    const file = zip.file(sectionPaths[si]);
    if (!file) continue;
    try {
      const xml = await file.async("text");
      decompressed.total += xml.length * 2;
      if (decompressed.total > MAX_DECOMPRESS_SIZE) throw new KordocError("ZIP \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (ZIP bomb \uC758\uC2EC)");
      blocks.push(...parseSectionXml(xml, styleMap, warnings, si + 1, nestedTableCounter));
      parsedSections++;
      options?.onProgress?.(parsedSections, totalTarget);
    } catch (secErr) {
      if (secErr instanceof KordocError) throw secErr;
      warnings.push({ page: si + 1, message: `\uC139\uC158 ${si + 1} \uD30C\uC2F1 \uC2E4\uD328: ${secErr instanceof Error ? secErr.message : "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958"}`, code: "PARTIAL_PARSE" });
    }
  }
  const images = await extractImagesFromZip(zip, blocks, decompressed, warnings);
  detectHwpxHeadings(blocks, styleMap);
  const outline = blocks.filter((b) => b.type === "heading" && b.level && b.text).map((b) => ({ level: b.level, text: b.text, pageNumber: b.pageNumber }));
  const markdown = blocksToMarkdown(blocks);
  return { markdown, blocks, metadata, outline: outline.length > 0 ? outline : void 0, warnings: warnings.length > 0 ? warnings : void 0, images: images.length > 0 ? images : void 0 };
}
function imageExtToMime(ext) {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    case "tif":
    case "tiff":
      return "image/tiff";
    case "wmf":
      return "image/wmf";
    case "emf":
      return "image/emf";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
function mimeToExt(mime) {
  if (mime.includes("jpeg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("bmp")) return "bmp";
  if (mime.includes("tiff")) return "tif";
  if (mime.includes("wmf")) return "wmf";
  if (mime.includes("emf")) return "emf";
  if (mime.includes("svg")) return "svg";
  return "bin";
}
async function extractImagesFromZip(zip, blocks, decompressed, warnings) {
  const images = [];
  let imageIndex = 0;
  for (const block of blocks) {
    if (block.type !== "image" || !block.text) continue;
    const ref = block.text;
    const candidates = [
      `BinData/${ref}`,
      `Contents/BinData/${ref}`,
      ref
      // 절대 경로일 수도 있음
    ];
    let resolvedPath = null;
    if (!ref.includes(".")) {
      const prefixes = [`BinData/${ref}`, `Contents/BinData/${ref}`];
      for (const prefix of prefixes) {
        const match = zip.file(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.[a-zA-Z0-9]+$`));
        if (match.length > 0) {
          resolvedPath = match[0].name;
          break;
        }
      }
    }
    let found = false;
    const allCandidates = resolvedPath ? [resolvedPath, ...candidates] : candidates;
    for (const path of allCandidates) {
      if (isPathTraversal(path)) continue;
      const file = zip.file(path);
      if (!file) continue;
      try {
        const data = await file.async("uint8array");
        decompressed.total += data.length;
        if (decompressed.total > MAX_DECOMPRESS_SIZE) throw new KordocError("ZIP \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (ZIP bomb \uC758\uC2EC)");
        const actualPath = path;
        const ext = actualPath.includes(".") ? actualPath.split(".").pop() || "png" : "png";
        const mimeType = imageExtToMime(ext);
        imageIndex++;
        const filename = `image_${String(imageIndex).padStart(3, "0")}.${mimeToExt(mimeType)}`;
        images.push({ filename, data, mimeType });
        block.text = filename;
        block.imageData = { data, mimeType, filename: ref };
        found = true;
        break;
      } catch (err) {
        if (err instanceof KordocError) throw err;
      }
    }
    if (!found) {
      warnings?.push({ page: block.pageNumber, message: `\uC774\uBBF8\uC9C0 \uD30C\uC77C \uC5C6\uC74C: ${ref}`, code: "SKIPPED_IMAGE" });
      block.type = "paragraph";
      block.text = `[\uC774\uBBF8\uC9C0: ${ref}]`;
    }
  }
  return images;
}
async function extractHwpxMetadata(zip, metadata, decompressed) {
  try {
    const metaPaths = ["meta.xml", "META-INF/meta.xml", "docProps/core.xml"];
    for (const mp of metaPaths) {
      const file = zip.file(mp) || Object.values(zip.files).find((f) => f.name.toLowerCase() === mp.toLowerCase()) || null;
      if (!file) continue;
      const xml = await file.async("text");
      if (decompressed) {
        decompressed.total += xml.length * 2;
        if (decompressed.total > MAX_DECOMPRESS_SIZE) throw new KordocError("ZIP \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (ZIP bomb \uC758\uC2EC)");
      }
      parseDublinCoreMetadata(xml, metadata);
      if (metadata.title || metadata.author) return;
    }
  } catch {
  }
}
function parseDublinCoreMetadata(xml, metadata) {
  const parser = createXmlParser();
  const doc = parser.parseFromString(stripDtd(xml), "text/xml");
  if (!doc.documentElement) return;
  const getText = (tagNames) => {
    for (const tag of tagNames) {
      const els = doc.getElementsByTagName(tag);
      if (els.length > 0) {
        const text = els[0].textContent?.trim();
        if (text) return text;
      }
    }
    return void 0;
  };
  metadata.title = metadata.title || getText(["dc:title", "title"]);
  metadata.author = metadata.author || getText(["dc:creator", "creator", "cp:lastModifiedBy"]);
  metadata.description = metadata.description || getText(["dc:description", "description", "dc:subject", "subject"]);
  metadata.createdAt = metadata.createdAt || getText(["dcterms:created", "meta:creation-date"]);
  metadata.modifiedAt = metadata.modifiedAt || getText(["dcterms:modified", "meta:date"]);
  const keywords = getText(["dc:keyword", "cp:keywords", "meta:keyword"]);
  if (keywords && !metadata.keywords) {
    metadata.keywords = keywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean);
  }
}
async function extractHwpxMetadataOnly(buffer) {
  let zip;
  try {
    zip = await import_jszip.default.loadAsync(buffer);
  } catch {
    throw new KordocError("HWPX ZIP\uC744 \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  const metadata = {};
  await extractHwpxMetadata(zip, metadata);
  const sectionPaths = await resolveSectionPaths(zip);
  metadata.pageCount = sectionPaths.length;
  return metadata;
}
function extractFromBrokenZip(buffer) {
  const data = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let pos = 0;
  const blocks = [];
  const warnings = [
    { code: "BROKEN_ZIP_RECOVERY", message: "\uC190\uC0C1\uB41C ZIP \uAD6C\uC870 \u2014 Local File Header \uAE30\uBC18 \uBCF5\uAD6C \uBAA8\uB4DC" }
  ];
  let totalDecompressed = 0;
  let entryCount = 0;
  let sectionNum = 0;
  const nestedTableCounter = { count: 0 };
  while (pos < data.length - 30) {
    if (data[pos] !== 80 || data[pos + 1] !== 75 || data[pos + 2] !== 3 || data[pos + 3] !== 4) {
      pos++;
      while (pos < data.length - 30) {
        if (data[pos] === 80 && data[pos + 1] === 75 && data[pos + 2] === 3 && data[pos + 3] === 4) break;
        pos++;
      }
      continue;
    }
    if (++entryCount > MAX_ZIP_ENTRIES) break;
    const method = view.getUint16(pos + 8, true);
    const compSize = view.getUint32(pos + 18, true);
    const nameLen = view.getUint16(pos + 26, true);
    const extraLen = view.getUint16(pos + 28, true);
    if (nameLen > 1024 || extraLen > 65535) {
      pos += 30 + nameLen + extraLen;
      continue;
    }
    const fileStart = pos + 30 + nameLen + extraLen;
    if (fileStart + compSize > data.length) break;
    if (compSize === 0 && method !== 0) {
      pos = fileStart;
      continue;
    }
    const nameBytes = data.slice(pos + 30, pos + 30 + nameLen);
    const name = new TextDecoder().decode(nameBytes);
    if (isPathTraversal(name)) {
      pos = fileStart + compSize;
      continue;
    }
    const fileData = data.slice(fileStart, fileStart + compSize);
    pos = fileStart + compSize;
    if (!name.toLowerCase().includes("section") || !name.endsWith(".xml")) continue;
    try {
      let content;
      if (method === 0) {
        content = new TextDecoder().decode(fileData);
      } else if (method === 8) {
        const decompressed = inflateRawSync(Buffer.from(fileData), { maxOutputLength: MAX_DECOMPRESS_SIZE });
        content = new TextDecoder().decode(decompressed);
      } else {
        continue;
      }
      totalDecompressed += content.length * 2;
      if (totalDecompressed > MAX_DECOMPRESS_SIZE) throw new KordocError("\uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC");
      sectionNum++;
      blocks.push(...parseSectionXml(content, void 0, warnings, sectionNum, nestedTableCounter));
    } catch {
      continue;
    }
  }
  if (blocks.length === 0) throw new KordocError("\uC190\uC0C1\uB41C HWPX\uC5D0\uC11C \uC139\uC158 \uB370\uC774\uD130\uB97C \uBCF5\uAD6C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
  const markdown = blocksToMarkdown(blocks);
  return { markdown, blocks, warnings: warnings.length > 0 ? warnings : void 0 };
}
async function resolveSectionPaths(zip) {
  const manifestPaths = ["Contents/content.hpf", "content.hpf"];
  for (const mp of manifestPaths) {
    const mpLower = mp.toLowerCase();
    const file = zip.file(mp) || Object.values(zip.files).find((f) => f.name.toLowerCase() === mpLower) || null;
    if (!file) continue;
    const xml = await file.async("text");
    const paths = parseSectionPathsFromManifest(xml);
    if (paths.length > 0) return paths;
  }
  const sectionFiles = zip.file(/[Ss]ection\d+\.xml$/);
  return sectionFiles.map((f) => f.name).sort();
}
function parseSectionPathsFromManifest(xml) {
  const parser = createXmlParser();
  const doc = parser.parseFromString(stripDtd(xml), "text/xml");
  const items = doc.getElementsByTagName("opf:item");
  const spine = doc.getElementsByTagName("opf:itemref");
  const isSectionId = (id) => /^s/i.test(id) || id.toLowerCase().includes("section");
  const idToHref = /* @__PURE__ */ new Map();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const id = item.getAttribute("id") || "";
    let href = item.getAttribute("href") || "";
    const mediaType = item.getAttribute("media-type") || "";
    if (!isSectionId(id) && !mediaType.includes("xml")) continue;
    if (!href.startsWith("/") && !href.startsWith("Contents/") && isSectionId(id))
      href = "Contents/" + href;
    idToHref.set(id, href);
  }
  if (spine.length > 0) {
    const ordered = [];
    for (let i = 0; i < spine.length; i++) {
      const href = idToHref.get(spine[i].getAttribute("idref") || "");
      if (href) ordered.push(href);
    }
    if (ordered.length > 0) return ordered;
  }
  return Array.from(idToHref.entries()).filter(([id]) => isSectionId(id)).sort((a, b) => a[0].localeCompare(b[0])).map(([, href]) => href);
}
function detectHwpxHeadings(blocks, styleMap) {
  let baseFontSize = 0;
  const sizeFreq = /* @__PURE__ */ new Map();
  for (const b of blocks) {
    if (b.style?.fontSize) {
      sizeFreq.set(b.style.fontSize, (sizeFreq.get(b.style.fontSize) || 0) + 1);
    }
  }
  let maxCount = 0;
  for (const [size, count] of sizeFreq) {
    if (count > maxCount) {
      maxCount = count;
      baseFontSize = size;
    }
  }
  for (const block of blocks) {
    if (block.type !== "paragraph" || !block.text) continue;
    const text = block.text.trim();
    if (text.length === 0 || text.length > 200 || /^\d+$/.test(text)) continue;
    let level = 0;
    if (baseFontSize > 0 && block.style?.fontSize) {
      const ratio = block.style.fontSize / baseFontSize;
      if (ratio >= HEADING_RATIO_H1) level = 1;
      else if (ratio >= HEADING_RATIO_H2) level = 2;
      else if (ratio >= HEADING_RATIO_H3) level = 3;
    }
    const compactText = text.replace(/\s+/g, "");
    if (/^제\d+[조장절편]/.test(compactText) && text.length <= 50) {
      if (level === 0) level = 3;
    }
    if (level > 0) {
      block.type = "heading";
      block.level = level;
    }
  }
}
function makeNestedTableMarker(counter, rows) {
  counter.count++;
  const firstRow = rows[0] ?? [];
  const hint = firstRow.map((c) => c.text.trim().replace(/\n/g, " ")).filter(Boolean).join(" | ");
  const hintChars = [...hint];
  const truncated = hintChars.length > 60 ? hintChars.slice(0, 60).join("") + "\u2026" : hint;
  return truncated ? `[\uC911\uCCA9 \uD14C\uC774\uBE14 #${counter.count}: ${truncated}]` : `[\uC911\uCCA9 \uD14C\uC774\uBE14 #${counter.count}]`;
}
function handleNestedTable(newTable, tableStack, blocks, ctx) {
  const parentTable = tableStack.pop();
  let nestedCols = 0;
  for (const r of newTable.rows) if (r.length > nestedCols) nestedCols = r.length;
  if (newTable.rows.length >= 3 && nestedCols >= 2) {
    blocks.push({ type: "table", table: buildTable(newTable.rows), pageNumber: ctx.sectionNum });
    if (parentTable.cell) {
      const marker = ctx.counter ? makeNestedTableMarker(ctx.counter, newTable.rows) : "[\uC911\uCCA9 \uD14C\uC774\uBE14]";
      parentTable.cell.text += (parentTable.cell.text ? "\n" : "") + marker;
    }
  } else {
    const nestedText = convertTableToText(newTable.rows);
    if (parentTable.cell) {
      const marker = ctx.counter ? makeNestedTableMarker(ctx.counter, newTable.rows) : "[\uC911\uCCA9 \uD14C\uC774\uBE14]";
      parentTable.cell.text += (parentTable.cell.text ? "\n" : "") + marker + "\n" + nestedText;
    }
  }
  return parentTable;
}
function parseSectionXml(xml, styleMap, warnings, sectionNum, counter) {
  const parser = createXmlParser(warnings);
  const doc = parser.parseFromString(stripDtd(xml), "text/xml");
  if (!doc.documentElement) return [];
  const blocks = [];
  const ctx = { styleMap, warnings, sectionNum, counter };
  walkSection(doc.documentElement, blocks, null, [], ctx);
  return blocks;
}
function extractImageRef(el) {
  const children = el.childNodes;
  if (!children) return null;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType !== 1) continue;
    const tag = (child.tagName || child.localName || "").replace(/^[^:]+:/, "");
    if (tag === "imgRect" || tag === "img" || tag === "imgClip") {
      const ref = child.getAttribute("binaryItemIDRef") || child.getAttribute("href") || "";
      if (ref) return ref;
    }
    const nested = extractImageRef(child);
    if (nested) return nested;
  }
  const directRef = el.getAttribute("binaryItemIDRef") || "";
  if (directRef) return directRef;
  return null;
}
function walkSection(node, blocks, tableCtx, tableStack, ctx, depth = 0) {
  if (depth > MAX_XML_DEPTH) return;
  const children = node.childNodes;
  if (!children) return;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1) continue;
    const tag = el.tagName || el.localName || "";
    const localTag = tag.replace(/^[^:]+:/, "");
    switch (localTag) {
      case "tbl": {
        if (tableCtx) tableStack.push(tableCtx);
        const newTable = { rows: [], currentRow: [], cell: null };
        walkSection(el, blocks, newTable, tableStack, ctx, depth + 1);
        if (newTable.rows.length > 0) {
          if (tableStack.length > 0) {
            tableCtx = handleNestedTable(newTable, tableStack, blocks, ctx);
          } else {
            blocks.push({ type: "table", table: buildTable(newTable.rows), pageNumber: ctx.sectionNum });
            tableCtx = null;
          }
        } else {
          tableCtx = tableStack.length > 0 ? tableStack.pop() : null;
        }
        break;
      }
      case "tr":
        if (tableCtx) {
          tableCtx.currentRow = [];
          walkSection(el, blocks, tableCtx, tableStack, ctx, depth + 1);
          if (tableCtx.currentRow.length > 0) tableCtx.rows.push(tableCtx.currentRow);
          tableCtx.currentRow = [];
        }
        break;
      case "tc":
        if (tableCtx) {
          tableCtx.cell = { text: "", colSpan: 1, rowSpan: 1 };
          walkSection(el, blocks, tableCtx, tableStack, ctx, depth + 1);
          if (tableCtx.cell) {
            tableCtx.currentRow.push(tableCtx.cell);
            tableCtx.cell = null;
          }
        }
        break;
      case "cellAddr":
        if (tableCtx?.cell) {
          const ca = parseInt(el.getAttribute("colAddr") || "", 10);
          const ra = parseInt(el.getAttribute("rowAddr") || "", 10);
          if (!isNaN(ca)) tableCtx.cell.colAddr = ca;
          if (!isNaN(ra)) tableCtx.cell.rowAddr = ra;
        }
        break;
      case "cellSpan":
        if (tableCtx?.cell) {
          const rawCs = parseInt(el.getAttribute("colSpan") || "1", 10);
          const cs = isNaN(rawCs) ? 1 : rawCs;
          const rawRs = parseInt(el.getAttribute("rowSpan") || "1", 10);
          const rs = isNaN(rawRs) ? 1 : rawRs;
          tableCtx.cell.colSpan = clampSpan(cs, MAX_COLS);
          tableCtx.cell.rowSpan = clampSpan(rs, MAX_ROWS);
        }
        break;
      case "p": {
        const { text, href, footnote, style } = extractParagraphInfo(el, ctx.styleMap);
        if (text) {
          if (tableCtx?.cell) {
            tableCtx.cell.text += (tableCtx.cell.text ? "\n" : "") + text;
          } else if (!tableCtx) {
            const block = { type: "paragraph", text, pageNumber: ctx.sectionNum };
            if (style) block.style = style;
            if (href) block.href = href;
            if (footnote) block.footnoteText = footnote;
            blocks.push(block);
          }
        }
        tableCtx = walkParagraphChildren(el, blocks, tableCtx, tableStack, ctx, depth + 1);
        break;
      }
      // 이미지/그림 — 경로 추출 또는 경고
      case "pic":
      case "shape":
      case "drawingObject": {
        const imgRef = extractImageRef(el);
        if (imgRef) {
          blocks.push({ type: "image", text: imgRef, pageNumber: ctx.sectionNum });
        } else if (ctx.warnings && ctx.sectionNum) {
          ctx.warnings.push({ page: ctx.sectionNum, message: `\uC2A4\uD0B5\uB41C \uC694\uC18C: ${localTag}`, code: "SKIPPED_IMAGE" });
        }
        break;
      }
      default:
        walkSection(el, blocks, tableCtx, tableStack, ctx, depth + 1);
        break;
    }
  }
}
function walkParagraphChildren(node, blocks, tableCtx, tableStack, ctx, depth = 0) {
  if (depth > MAX_XML_DEPTH) return tableCtx;
  const children = node.childNodes;
  if (!children) return tableCtx;
  const walkChildren = (parent, d) => {
    if (d > MAX_XML_DEPTH) return;
    const kids2 = parent.childNodes;
    if (!kids2) return;
    for (let i = 0; i < kids2.length; i++) {
      const el = kids2[i];
      if (el.nodeType !== 1) continue;
      const tag = el.tagName || el.localName || "";
      const localTag = tag.replace(/^[^:]+:/, "");
      if (localTag === "tbl") {
        if (tableCtx) tableStack.push(tableCtx);
        const newTable = { rows: [], currentRow: [], cell: null };
        walkSection(el, blocks, newTable, tableStack, ctx, d + 1);
        if (newTable.rows.length > 0) {
          if (tableStack.length > 0) {
            tableCtx = handleNestedTable(newTable, tableStack, blocks, ctx);
          } else {
            blocks.push({ type: "table", table: buildTable(newTable.rows), pageNumber: ctx.sectionNum });
            tableCtx = null;
          }
        } else {
          tableCtx = tableStack.length > 0 ? tableStack.pop() : null;
        }
      } else if (localTag === "pic" || localTag === "shape" || localTag === "drawingObject") {
        const drawTextChild = findDescendant(el, "drawText");
        if (drawTextChild) {
          extractDrawTextBlocks(drawTextChild, blocks, ctx.styleMap, ctx.sectionNum);
        } else {
          const imgRef = extractImageRef(el);
          if (imgRef) {
            blocks.push({ type: "image", text: imgRef, pageNumber: ctx.sectionNum });
          } else if (ctx.warnings && ctx.sectionNum) {
            ctx.warnings.push({ page: ctx.sectionNum, message: `\uC2A4\uD0B5\uB41C \uC694\uC18C: ${localTag}`, code: "SKIPPED_IMAGE" });
          }
        }
      } else if (localTag === "drawText") {
        extractDrawTextBlocks(el, blocks, ctx.styleMap, ctx.sectionNum);
      } else if (localTag === "r" || localTag === "run" || localTag === "ctrl" || localTag === "rect" || localTag === "ellipse" || localTag === "polygon" || localTag === "line" || localTag === "arc" || localTag === "curve" || localTag === "connectLine" || localTag === "container") {
        walkChildren(el, d + 1);
      } else if (localTag === "run") {
        tableCtx = walkParagraphChildren(el, blocks, tableCtx, tableStack, ctx, depth + 1);
      }
    }
  };
  walkChildren(node, depth);
  return tableCtx;
}
function findDescendant(node, targetTag, depth = 0) {
  if (depth > 5) return null;
  const children = node.childNodes;
  if (!children) return null;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType !== 1) continue;
    const tag = (child.tagName || child.localName || "").replace(/^[^:]+:/, "");
    if (tag === targetTag) return child;
    const found = findDescendant(child, targetTag, depth + 1);
    if (found) return found;
  }
  return null;
}
function extractDrawTextBlocks(drawTextNode, blocks, styleMap, sectionNum) {
  const children = drawTextNode.childNodes;
  if (!children) return;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType !== 1) continue;
    const tag = (child.tagName || child.localName || "").replace(/^[^:]+:/, "");
    if (tag === "subList" || tag === "p" || tag === "para") {
      if (tag === "subList") {
        extractDrawTextBlocks(child, blocks, styleMap, sectionNum);
      } else {
        const info = extractParagraphInfo(child, styleMap);
        const text = info.text.trim();
        if (text) {
          blocks.push({ type: "paragraph", text, style: info.style ?? void 0, pageNumber: sectionNum });
        }
      }
    }
  }
}
function extractParagraphInfo(para, styleMap) {
  let text = "";
  let href;
  let footnote;
  let charPrId;
  const walk = (node) => {
    const children = node.childNodes;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType === 3) {
        text += child.textContent || "";
        continue;
      }
      if (child.nodeType !== 1) continue;
      const tag = (child.tagName || child.localName || "").replace(/^[^:]+:/, "");
      switch (tag) {
        case "t":
          walk(child);
          break;
        // 자식 순회 (tab 등 하위 요소 처리)
        case "tab": {
          const leader = child.getAttribute("leader");
          if (leader && leader !== "0") {
            text += "";
          } else {
            text += "	";
          }
          break;
        }
        case "br":
          if ((child.getAttribute("type") || "line") === "line") text += "\n";
          break;
        case "fwSpace":
        case "hwSpace":
          text += " ";
          break;
        case "tbl":
          break;
        // 테이블은 walkSection에서 처리
        // 하이퍼링크
        case "hyperlink": {
          const url = child.getAttribute("url") || child.getAttribute("href") || "";
          if (url) {
            const safe = sanitizeHref(url);
            if (safe) href = safe;
          }
          walk(child);
          break;
        }
        // 각주/미주
        case "footNote":
        case "endNote":
        case "fn":
        case "en": {
          const noteText = extractTextFromNode(child);
          if (noteText) footnote = (footnote ? footnote + "; " : "") + noteText;
          break;
        }
        // 제어 요소 — 필드, 컨트롤, 매개변수 등 스킵
        case "ctrl":
        case "fieldBegin":
        case "fieldEnd":
        case "parameters":
        case "stringParam":
        case "integerParam":
        case "boolParam":
        case "floatParam":
        case "secPr":
        // 섹션 속성 (페이지 설정 등)
        case "colPr":
        // 다단 속성
        case "linesegarray":
        case "lineseg":
        // 레이아웃 정보
        // 도형/이미지 요소 — 대체텍스트("사각형입니다." 등) 누출 방지
        case "pic":
        case "shape":
        case "drawingObject":
        case "shapeComment":
        case "drawText":
          break;
        // 수식: <hp:equation> 내부의 <hp:script> 에 HULK-style equation
        // 스크립트가 담겨 있음. hml-equation-parser 로 LaTeX 변환 후 `$...$`
        // 로 래핑. 실패/빈 스크립트면 무시 (대체 텍스트 누출 방지).
        case "equation": {
          const script = findChildByLocalName(child, "script");
          const raw = script ? extractTextFromNode(script) : "";
          if (raw.trim()) {
            try {
              const latex = hmlToLatex(raw).trim();
              if (latex) text += " $" + latex + "$ ";
            } catch {
            }
          }
          break;
        }
        // run 요소에서 charPrIDRef 추출
        case "r": {
          const runCharPr = child.getAttribute("charPrIDRef");
          if (runCharPr && !charPrId) charPrId = runCharPr;
          walk(child);
          break;
        }
        default:
          walk(child);
          break;
      }
    }
  };
  walk(para);
  const leaderIdx = text.indexOf("");
  if (leaderIdx >= 0) text = text.substring(0, leaderIdx);
  let cleanText = text.replace(/[ \t]+/g, " ").trim();
  if (/^그림입니다\.?\s*원본\s*그림의\s*(이름|크기)/.test(cleanText)) cleanText = "";
  cleanText = cleanText.replace(/그림입니다\.?\s*원본\s*그림의\s*(이름|크기)[^\n]*(\n[^\n]*원본\s*그림의\s*(이름|크기)[^\n]*)*/g, "").trim();
  cleanText = cleanText.replace(/(?:모서리가 둥근 |둥근 )?(?:사각형|직사각형|정사각형|원|타원|삼각형|선|직선|곡선|화살표|오각형|육각형|팔각형|별|십자|구름|마름모|도넛|평행사변형|사다리꼴|개체|그리기\s?개체|묶음\s?개체|글상자|표|그림|OLE\s?개체)\s?입니다\.?/g, "").trim();
  let style;
  if (styleMap && charPrId) {
    const charProp = styleMap.charProperties.get(charPrId);
    if (charProp) {
      style = {};
      if (charProp.fontSize) style.fontSize = charProp.fontSize;
      if (charProp.bold) style.bold = true;
      if (charProp.italic) style.italic = true;
      if (charProp.fontName) style.fontName = charProp.fontName;
      if (!style.fontSize && !style.bold && !style.italic) style = void 0;
    }
  }
  return { text: cleanText, href, footnote, style };
}
function findChildByLocalName(parent, name) {
  const children = parent.childNodes;
  if (!children) return null;
  for (let i = 0; i < children.length; i++) {
    const ch = children[i];
    if (ch.nodeType !== 1) continue;
    const tag = (ch.tagName || ch.localName || "").replace(/^[^:]+:/, "");
    if (tag === name) return ch;
  }
  return null;
}
function extractTextFromNode(node) {
  let result = "";
  const children = node.childNodes;
  if (!children) return result;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === 3) result += child.textContent || "";
    else if (child.nodeType === 1) result += extractTextFromNode(child);
  }
  return result.trim();
}

// src/hwp5/record.ts
import { inflateRawSync as inflateRawSync2, inflateSync } from "zlib";
var TAG_PARA_HEADER = 66;
var TAG_PARA_TEXT = 67;
var TAG_CHAR_SHAPE = 68;
var TAG_CTRL_HEADER = 71;
var TAG_LIST_HEADER = 72;
var TAG_TABLE = 77;
var TAG_EQEDIT = 88;
var TAG_DOC_CHAR_SHAPE = 21;
var TAG_DOC_PARA_SHAPE = 25;
var TAG_DOC_STYLE = 26;
var CHAR_LINE = 0;
var CHAR_SECTION_BREAK = 10;
var CHAR_PARA = 13;
var CHAR_TAB = 9;
var CHAR_HYPHEN = 30;
var CHAR_NBSP = 31;
var CHAR_FIXED_NBSP = 24;
var CHAR_FIXED_WIDTH = 25;
var FLAG_COMPRESSED = 1 << 0;
var FLAG_ENCRYPTED = 1 << 1;
var FLAG_DISTRIBUTION = 1 << 2;
var FLAG_DRM = 1 << 4;
var MAX_RECORDS = 5e5;
function readRecords(data) {
  const records = [];
  let offset = 0;
  while (offset + 4 <= data.length && records.length < MAX_RECORDS) {
    const header = data.readUInt32LE(offset);
    offset += 4;
    const tagId = header & 1023;
    const level = header >> 10 & 1023;
    let size = header >> 20 & 4095;
    if (size === 4095) {
      if (offset + 4 > data.length) break;
      size = data.readUInt32LE(offset);
      offset += 4;
    }
    if (offset + size > data.length) break;
    records.push({ tagId, level, size, data: data.subarray(offset, offset + size) });
    offset += size;
  }
  return records;
}
var MAX_DECOMPRESS_SIZE2 = 100 * 1024 * 1024;
function decompressStream(data) {
  const opts = { maxOutputLength: MAX_DECOMPRESS_SIZE2 };
  if (data.length >= 2 && data[0] === 120) {
    try {
      return inflateSync(data, opts);
    } catch {
    }
  }
  return inflateRawSync2(data, opts);
}
function parseFileHeader(data) {
  if (data.length < 40) throw new KordocError("FileHeader\uAC00 \uB108\uBB34 \uC9E7\uC2B5\uB2C8\uB2E4 (\uCD5C\uC18C 40\uBC14\uC774\uD2B8)");
  const sig = data.subarray(0, 32).toString("utf8").replace(/\0+$/, "");
  return {
    signature: sig,
    versionMajor: data[35],
    flags: data.readUInt32LE(36)
  };
}
function parseDocInfo(records) {
  const charShapes = [];
  const paraShapes = [];
  const styles = [];
  for (const rec of records) {
    if (rec.tagId === TAG_DOC_PARA_SHAPE && rec.data.length >= 4) {
      const flags = rec.data.readUInt32LE(0);
      const outlineLevel = flags >> 25 & 7;
      paraShapes.push({ outlineLevel });
    }
    if (rec.tagId === TAG_DOC_CHAR_SHAPE && rec.data.length >= 18) {
      if (rec.data.length >= 50) {
        const fontSize = rec.data.readUInt32LE(42);
        const attrFlags = rec.data.readUInt32LE(46);
        charShapes.push({ fontSize, attrFlags });
      } else {
        charShapes.push({ fontSize: 0, attrFlags: 0 });
      }
    }
    if (rec.tagId === TAG_DOC_STYLE && rec.data.length >= 8) {
      try {
        let offset = 0;
        const nameLen = rec.data.readUInt16LE(offset);
        offset += 2;
        const nameBytes = nameLen * 2;
        const name = nameBytes > 0 && offset + nameBytes <= rec.data.length ? rec.data.subarray(offset, offset + nameBytes).toString("utf16le") : "";
        offset += nameBytes;
        let nameKo = "";
        if (offset + 2 <= rec.data.length) {
          const nameKoLen = rec.data.readUInt16LE(offset);
          offset += 2;
          const nameKoBytes = nameKoLen * 2;
          if (nameKoBytes > 0 && offset + nameKoBytes <= rec.data.length) {
            nameKo = rec.data.subarray(offset, offset + nameKoBytes).toString("utf16le");
          }
          offset += nameKoBytes;
        }
        const type = offset < rec.data.length ? rec.data.readUInt8(offset) : 0;
        offset += 1;
        offset += 2;
        offset += 2;
        const paraShapeId = offset + 2 <= rec.data.length ? rec.data.readUInt16LE(offset) : 0;
        offset += 2;
        const charShapeId = offset + 2 <= rec.data.length ? rec.data.readUInt16LE(offset) : 0;
        styles.push({ name, nameKo, charShapeId, paraShapeId, type });
      } catch {
      }
    }
  }
  return { charShapes, paraShapes, styles };
}
function extractTextWithControls(data, resolveControl) {
  let result = "";
  let i = 0;
  while (i + 1 < data.length) {
    const ch = data.readUInt16LE(i);
    i += 2;
    switch (ch) {
      // ── char 타입 (2바이트만, 확장 데이터 없음) ──
      case CHAR_LINE:
        result += "\n";
        break;
      case CHAR_SECTION_BREAK: {
        if (i + 16 <= data.length && data.readUInt16LE(i) === 11) {
          const ctrlId = data.subarray(i + 2, i + 6).toString("ascii");
          const replacement = resolveControl?.(ctrlId);
          if (replacement) result += replacement;
          i += 16;
          break;
        }
        result += "\n";
        if (i + 14 <= data.length) i += 14;
        break;
      }
      case CHAR_PARA:
        break;
      // 문단 끝
      case CHAR_HYPHEN:
        result += "-";
        break;
      case CHAR_NBSP:
        result += " ";
        break;
      case CHAR_FIXED_NBSP:
        result += "\xA0";
        break;
      // 진짜 NBSP
      case CHAR_FIXED_WIDTH:
        result += " ";
        break;
      // 고정폭 공백
      // ── inline 타입 (2바이트 + 14바이트 확장) ──
      case CHAR_TAB:
        result += "	";
        if (i + 14 <= data.length) i += 14;
        break;
      default:
        if (ch >= 1 && ch <= 31) {
          const isExtended = ch >= 1 && ch <= 3 || ch >= 11 && ch <= 12 || ch >= 14 && ch <= 18 || ch >= 21 && ch <= 23;
          const isInline = ch >= 4 && ch <= 9 || ch >= 19 && ch <= 20;
          if ((isExtended || isInline) && i + 14 <= data.length) {
            const ctrlId = data.subarray(i, i + 4).toString("ascii");
            const replacement = resolveControl?.(ctrlId);
            if (replacement) result += replacement;
            i += 14;
          }
        } else if (ch >= 32) {
          if (ch >= 55296 && ch <= 56319 && i + 1 < data.length) {
            const lo = data.readUInt16LE(i);
            if (lo >= 56320 && lo <= 57343) {
              i += 2;
              const codePoint = (ch - 55296 << 10) + (lo - 56320) + 65536;
              result += String.fromCodePoint(codePoint);
              break;
            }
          }
          result += String.fromCharCode(ch);
        }
        break;
    }
  }
  return result;
}
function extractEquationText(data) {
  if (data.length < 6) return null;
  const scriptLength = data.readUInt16LE(4);
  const scriptStart = 6;
  const scriptEnd = scriptStart + scriptLength * 2;
  if (scriptLength <= 0 || scriptEnd > data.length) return null;
  const equation = data.subarray(scriptStart, scriptEnd).toString("utf16le").replace(/\0+/g, "").trim();
  return equation || null;
}

// src/hwp5/aes.ts
var S_BOX = new Uint8Array([
  99,
  124,
  119,
  123,
  242,
  107,
  111,
  197,
  48,
  1,
  103,
  43,
  254,
  215,
  171,
  118,
  202,
  130,
  201,
  125,
  250,
  89,
  71,
  240,
  173,
  212,
  162,
  175,
  156,
  164,
  114,
  192,
  183,
  253,
  147,
  38,
  54,
  63,
  247,
  204,
  52,
  165,
  229,
  241,
  113,
  216,
  49,
  21,
  4,
  199,
  35,
  195,
  24,
  150,
  5,
  154,
  7,
  18,
  128,
  226,
  235,
  39,
  178,
  117,
  9,
  131,
  44,
  26,
  27,
  110,
  90,
  160,
  82,
  59,
  214,
  179,
  41,
  227,
  47,
  132,
  83,
  209,
  0,
  237,
  32,
  252,
  177,
  91,
  106,
  203,
  190,
  57,
  74,
  76,
  88,
  207,
  208,
  239,
  170,
  251,
  67,
  77,
  51,
  133,
  69,
  249,
  2,
  127,
  80,
  60,
  159,
  168,
  81,
  163,
  64,
  143,
  146,
  157,
  56,
  245,
  188,
  182,
  218,
  33,
  16,
  255,
  243,
  210,
  205,
  12,
  19,
  236,
  95,
  151,
  68,
  23,
  196,
  167,
  126,
  61,
  100,
  93,
  25,
  115,
  96,
  129,
  79,
  220,
  34,
  42,
  144,
  136,
  70,
  238,
  184,
  20,
  222,
  94,
  11,
  219,
  224,
  50,
  58,
  10,
  73,
  6,
  36,
  92,
  194,
  211,
  172,
  98,
  145,
  149,
  228,
  121,
  231,
  200,
  55,
  109,
  141,
  213,
  78,
  169,
  108,
  86,
  244,
  234,
  101,
  122,
  174,
  8,
  186,
  120,
  37,
  46,
  28,
  166,
  180,
  198,
  232,
  221,
  116,
  31,
  75,
  189,
  139,
  138,
  112,
  62,
  181,
  102,
  72,
  3,
  246,
  14,
  97,
  53,
  87,
  185,
  134,
  193,
  29,
  158,
  225,
  248,
  152,
  17,
  105,
  217,
  142,
  148,
  155,
  30,
  135,
  233,
  206,
  85,
  40,
  223,
  140,
  161,
  137,
  13,
  191,
  230,
  66,
  104,
  65,
  153,
  45,
  15,
  176,
  84,
  187,
  22
]);
var INV_S_BOX = new Uint8Array([
  82,
  9,
  106,
  213,
  48,
  54,
  165,
  56,
  191,
  64,
  163,
  158,
  129,
  243,
  215,
  251,
  124,
  227,
  57,
  130,
  155,
  47,
  255,
  135,
  52,
  142,
  67,
  68,
  196,
  222,
  233,
  203,
  84,
  123,
  148,
  50,
  166,
  194,
  35,
  61,
  238,
  76,
  149,
  11,
  66,
  250,
  195,
  78,
  8,
  46,
  161,
  102,
  40,
  217,
  36,
  178,
  118,
  91,
  162,
  73,
  109,
  139,
  209,
  37,
  114,
  248,
  246,
  100,
  134,
  104,
  152,
  22,
  212,
  164,
  92,
  204,
  93,
  101,
  182,
  146,
  108,
  112,
  72,
  80,
  253,
  237,
  185,
  218,
  94,
  21,
  70,
  87,
  167,
  141,
  157,
  132,
  144,
  216,
  171,
  0,
  140,
  188,
  211,
  10,
  247,
  228,
  88,
  5,
  184,
  179,
  69,
  6,
  208,
  44,
  30,
  143,
  202,
  63,
  15,
  2,
  193,
  175,
  189,
  3,
  1,
  19,
  138,
  107,
  58,
  145,
  17,
  65,
  79,
  103,
  220,
  234,
  151,
  242,
  207,
  206,
  240,
  180,
  230,
  115,
  150,
  172,
  116,
  34,
  231,
  173,
  53,
  133,
  226,
  249,
  55,
  232,
  28,
  117,
  223,
  110,
  71,
  241,
  26,
  113,
  29,
  41,
  197,
  137,
  111,
  183,
  98,
  14,
  170,
  24,
  190,
  27,
  252,
  86,
  62,
  75,
  198,
  210,
  121,
  32,
  154,
  219,
  192,
  254,
  120,
  205,
  90,
  244,
  31,
  221,
  168,
  51,
  136,
  7,
  199,
  49,
  177,
  18,
  16,
  89,
  39,
  128,
  236,
  95,
  96,
  81,
  127,
  169,
  25,
  181,
  74,
  13,
  45,
  229,
  122,
  159,
  147,
  201,
  156,
  239,
  160,
  224,
  59,
  77,
  174,
  42,
  245,
  176,
  200,
  235,
  187,
  60,
  131,
  83,
  153,
  97,
  23,
  43,
  4,
  126,
  186,
  119,
  214,
  38,
  225,
  105,
  20,
  99,
  85,
  33,
  12,
  125
]);
var RCON = new Uint8Array([1, 2, 4, 8, 16, 32, 64, 128, 27, 54]);
function gmul(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 128;
    a = a << 1 & 255;
    if (hi) a ^= 27;
    b >>= 1;
  }
  return p;
}
function expandKey(key) {
  const w = new Uint32Array(44);
  for (let i = 0; i < 4; i++) {
    w[i] = key[4 * i] << 24 | key[4 * i + 1] << 16 | key[4 * i + 2] << 8 | key[4 * i + 3];
  }
  for (let i = 4; i < 44; i++) {
    let temp = w[i - 1];
    if (i % 4 === 0) {
      temp = (temp << 8 | temp >>> 24) >>> 0;
      temp = S_BOX[temp >>> 24 & 255] << 24 | S_BOX[temp >>> 16 & 255] << 16 | S_BOX[temp >>> 8 & 255] << 8 | S_BOX[temp & 255];
      temp = (temp ^ RCON[i / 4 - 1] << 24) >>> 0;
    }
    w[i] = (w[i - 4] ^ temp) >>> 0;
  }
  return w;
}
function decryptBlock(block, roundKeys) {
  const s = new Uint8Array(16);
  for (let i = 0; i < 16; i++) s[i] = block[i];
  addRoundKey(s, roundKeys, 10);
  for (let round = 9; round >= 1; round--) {
    invShiftRows(s);
    invSubBytes(s);
    addRoundKey(s, roundKeys, round);
    invMixColumns(s);
  }
  invShiftRows(s);
  invSubBytes(s);
  addRoundKey(s, roundKeys, 0);
  return s;
}
function addRoundKey(s, w, round) {
  const base = round * 4;
  for (let c = 0; c < 4; c++) {
    const k = w[base + c];
    s[c * 4] ^= k >>> 24 & 255;
    s[c * 4 + 1] ^= k >>> 16 & 255;
    s[c * 4 + 2] ^= k >>> 8 & 255;
    s[c * 4 + 3] ^= k & 255;
  }
}
function invSubBytes(s) {
  for (let i = 0; i < 16; i++) s[i] = INV_S_BOX[s[i]];
}
function invShiftRows(s) {
  let t = s[13];
  s[13] = s[9];
  s[9] = s[5];
  s[5] = s[1];
  s[1] = t;
  t = s[2];
  s[2] = s[10];
  s[10] = t;
  t = s[6];
  s[6] = s[14];
  s[14] = t;
  t = s[3];
  s[3] = s[7];
  s[7] = s[11];
  s[11] = s[15];
  s[15] = t;
}
function invMixColumns(s) {
  for (let c = 0; c < 4; c++) {
    const i = c * 4;
    const a0 = s[i], a1 = s[i + 1], a2 = s[i + 2], a3 = s[i + 3];
    s[i] = gmul(a0, 14) ^ gmul(a1, 11) ^ gmul(a2, 13) ^ gmul(a3, 9);
    s[i + 1] = gmul(a0, 9) ^ gmul(a1, 14) ^ gmul(a2, 11) ^ gmul(a3, 13);
    s[i + 2] = gmul(a0, 13) ^ gmul(a1, 9) ^ gmul(a2, 14) ^ gmul(a3, 11);
    s[i + 3] = gmul(a0, 11) ^ gmul(a1, 13) ^ gmul(a2, 9) ^ gmul(a3, 14);
  }
}
function aes128EcbDecrypt(data, key) {
  if (key.length !== 16) throw new Error("AES-128 \uD0A4\uB294 16\uBC14\uC774\uD2B8\uC5EC\uC57C \uD569\uB2C8\uB2E4");
  if (data.length % 16 !== 0) throw new Error("AES ECB \uC785\uB825\uC740 16\uBC14\uC774\uD2B8\uC758 \uBC30\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4");
  const roundKeys = expandKey(key);
  const out = new Uint8Array(data.length);
  for (let offset = 0; offset < data.length; offset += 16) {
    const block = data.subarray(offset, offset + 16);
    const decrypted = decryptBlock(block, roundKeys);
    out.set(decrypted, offset);
  }
  return out;
}

// src/hwp5/crypto.ts
var MsvcLcg = class {
  seed;
  constructor(seed) {
    this.seed = seed >>> 0;
  }
  /** 0 ~ 0x7FFF 범위 난수 반환 (MSVC rand() 호환) */
  rand() {
    this.seed = Math.imul(this.seed, 214013) + 2531011 >>> 0;
    return this.seed >>> 16 & 32767;
  }
};
function decryptDistributePayload(payload) {
  if (payload.length < 256) throw new Error("\uBC30\uD3EC\uC6A9 payload\uAC00 256\uBC14\uC774\uD2B8 \uBBF8\uB9CC\uC785\uB2C8\uB2E4");
  const seed = (payload[0] | payload[1] << 8 | payload[2] << 16 | payload[3] << 24) >>> 0;
  const lcg = new MsvcLcg(seed);
  const result = new Uint8Array(payload.subarray(0, 256));
  let i = 0;
  let n = 0;
  let key = 0;
  while (i < 256) {
    if (n === 0) {
      key = lcg.rand() & 255;
      n = (lcg.rand() & 15) + 1;
    }
    if (i >= 4) {
      result[i] ^= key;
    }
    i++;
    n--;
  }
  return result;
}
function extractAesKey(decryptedPayload) {
  const offset = 4 + (decryptedPayload[0] & 15);
  if (offset + 16 > decryptedPayload.length) {
    throw new Error("AES \uD0A4 \uCD94\uCD9C \uC2E4\uD328: \uC624\uD504\uC14B\uC774 payload \uBC94\uC704\uB97C \uCD08\uACFC\uD569\uB2C8\uB2E4");
  }
  return decryptedPayload.slice(offset, offset + 16);
}
function parseRecordHeader(data, offset) {
  if (offset + 4 > data.length) throw new Error("\uB808\uCF54\uB4DC \uD5E4\uB354 \uD30C\uC2F1 \uC2E4\uD328: \uB370\uC774\uD130 \uBD80\uC871");
  const header = (data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24) >>> 0;
  const tagId = header & 1023;
  let size = header >>> 20 & 4095;
  let headerSize = 4;
  if (size === 4095) {
    if (offset + 8 > data.length) throw new Error("\uD655\uC7A5 \uB808\uCF54\uB4DC \uD06C\uAE30 \uD30C\uC2F1 \uC2E4\uD328: \uB370\uC774\uD130 \uBD80\uC871");
    size = (data[offset + 4] | data[offset + 5] << 8 | data[offset + 6] << 16 | data[offset + 7] << 24) >>> 0;
    headerSize = 8;
  }
  return { tagId, size, headerSize };
}
var TAG_DISTRIBUTE_DOC_DATA = 16 + 12;
function decryptViewText(viewTextRaw, compressed) {
  const data = new Uint8Array(viewTextRaw);
  const rec = parseRecordHeader(data, 0);
  if (rec.tagId !== TAG_DISTRIBUTE_DOC_DATA) {
    throw new Error(`\uBC30\uD3EC\uC6A9 \uBB38\uC11C\uC758 \uCCAB \uB808\uCF54\uB4DC\uAC00 DISTRIBUTE_DOC_DATA(${TAG_DISTRIBUTE_DOC_DATA})\uAC00 \uC544\uB2D9\uB2C8\uB2E4 (\uC2E4\uC81C: ${rec.tagId})`);
  }
  const payloadStart = rec.headerSize;
  const payloadEnd = payloadStart + rec.size;
  if (payloadEnd > data.length || rec.size < 256) {
    throw new Error("\uBC30\uD3EC\uC6A9 payload\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4");
  }
  const payload = data.subarray(payloadStart, payloadStart + 256);
  const decryptedPayload = decryptDistributePayload(payload);
  const aesKey = extractAesKey(decryptedPayload);
  const encryptedStart = payloadEnd;
  const encryptedData = data.subarray(encryptedStart);
  if (encryptedData.length === 0) {
    throw new Error("\uBC30\uD3EC\uC6A9 \uBB38\uC11C\uC5D0 \uC554\uD638\uD654\uB41C \uBCF8\uBB38 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  const alignedLen = encryptedData.length - encryptedData.length % 16;
  if (alignedLen === 0) {
    throw new Error("\uC554\uD638\uD654\uB41C \uB370\uC774\uD130\uAC00 \uB108\uBB34 \uC9E7\uC2B5\uB2C8\uB2E4 (16\uBC14\uC774\uD2B8 \uBBF8\uB9CC)");
  }
  const alignedData = encryptedData.subarray(0, alignedLen);
  const decrypted = aes128EcbDecrypt(alignedData, aesKey);
  if (compressed) {
    try {
      return decompressStream(Buffer.from(decrypted));
    } catch {
      return Buffer.from(decrypted);
    }
  }
  return Buffer.from(decrypted);
}

// src/hwp5/equation.ts
var WORD_COMMANDS = /* @__PURE__ */ new Map([
  ["alpha", "\\alpha"],
  ["beta", "\\beta"],
  ["gamma", "\\gamma"],
  ["delta", "\\delta"],
  ["epsilon", "\\epsilon"],
  ["theta", "\\theta"],
  ["lambda", "\\lambda"],
  ["mu", "\\mu"],
  ["pi", "\\pi"],
  ["sigma", "\\sigma"],
  ["tau", "\\tau"],
  ["phi", "\\phi"],
  ["omega", "\\omega"],
  ["sin", "\\sin"],
  ["cos", "\\cos"],
  ["tan", "\\tan"],
  ["sec", "\\sec"],
  ["csc", "\\csc"],
  ["cot", "\\cot"],
  ["log", "\\log"],
  ["ln", "\\ln"],
  ["lim", "\\lim"],
  ["inf", "\\infty"],
  ["sum", "\\sum"],
  ["smallsum", "\\sum"],
  ["prod", "\\prod"],
  ["int", "\\int"],
  ["oint", "\\oint"],
  ["rightarrow", "\\rightarrow"],
  ["leftarrow", "\\leftarrow"],
  ["partial", "\\partial"],
  ["nabla", "\\nabla"],
  ["angle", "\\angle"],
  ["triangle", "\\triangle"],
  ["vec", "\\vec"],
  ["bar", "\\overline"],
  ["dot", "\\dot"],
  ["hat", "\\hat"],
  ["left", "\\left"],
  ["right", "\\right"]
]);
var SYMBOL_WORDS = /* @__PURE__ */ new Map([
  ["times", "\\times"],
  ["divide", "\\div"],
  ["div", "\\div"],
  ["le", "\\leq"],
  ["ge", "\\geq"],
  ["geq", "\\geq"],
  ["deg", "^\\circ"],
  ["rarrow", "\\rightarrow"],
  ["larrow", "\\leftarrow"],
  ["lrarrow", "\\leftrightarrow"],
  ["in", "\\in"],
  ["notin", "\\notin"],
  ["emptyset", "\\emptyset"],
  ["subset", "\\subset"],
  ["nsubset", "\\nsubseteq"],
  ["cup", "\\cup"],
  ["cap", "\\cap"],
  ["smallinter", "\\cap"],
  ["sim", "\\sim"],
  ["circ", "\\circ"],
  ["bot", "\\perp"],
  ["dyad", "\\overleftrightarrow"],
  ["arch", "\\overset{\\frown}"]
]);
function hwpEquationToLatex(equation) {
  return convertEquation(equation.replace(/\0/g, "").trim(), 0);
}
function convertEquation(equation, depth) {
  if (!equation || depth > 12) return equation;
  let result = equation.replace(/\s+/g, " ").replace(/`+/g, "\\,").replace(/~+/g, "\\,").trim();
  result = convertMatrixLike(result);
  result = convertRoots(result, depth);
  result = convertOver(result, depth);
  result = convertSqrt(result, depth);
  result = convertScripts(result);
  result = convertOperators(result);
  result = removeFontDirectives(result);
  result = convertWords(result);
  result = cleanupLatexSpacing(result);
  return result;
}
function convertMatrixLike(input) {
  return input.replace(
    /\bmatrix\s*\{([^{}]*)\}/gi,
    (_match, body) => `\\begin{matrix} ${body.split("#").map((part) => part.trim()).join(" & ")} \\end{matrix}`
  ).replace(
    /\bcases\s*\{([^{}]*)\}/gi,
    (_match, body) => `\\begin{cases} ${body.split("#").map((part) => part.trim()).join(" \\\\ ")} \\end{cases}`
  );
}
function convertRoots(input, depth) {
  return input.replace(/(?<!\\)\broot\s+({[^{}]*}|\S+)\s+of\s+({[^{}]*}|\S+)/gi, (_match, degree, radicand) => {
    return `\\sqrt[${convertEquation(unwrapGroup(degree), depth + 1)}]{${convertEquation(unwrapGroup(radicand), depth + 1)}}`;
  });
}
function convertSqrt(input, depth) {
  return input.replace(/(?<!\\)\bsqrt\s*({[^{}]*}|\S+)/gi, (_match, radicand) => {
    return `\\sqrt{${convertEquation(unwrapGroup(radicand), depth + 1)}}`;
  });
}
function convertOver(input, depth) {
  let result = input;
  for (let guard = 0; guard < 50; guard++) {
    const over = findTopLevelWord(result, "over");
    if (over < 0) break;
    const left = readLeftAtom(result, over);
    const right = readRightAtom(result, over + "over".length);
    if (!left || !right) break;
    const numerator = convertEquation(unwrapGroup(left.atom), depth + 1);
    const denominator = convertEquation(unwrapGroup(right.atom), depth + 1);
    result = result.slice(0, left.start) + `\\frac{${numerator}}{${denominator}}` + result.slice(right.end);
  }
  return result;
}
function convertScripts(input) {
  return input.replace(/\s*\^\s*/g, "^").replace(/\s*_\s*/g, "_").replace(/\^(?!\{)([^\s{}_^]+)/g, "^{$1}").replace(/_(?!\{)([^\s{}_^]+)/g, "_{$1}");
}
function convertOperators(input) {
  return input.replace(/\+-/g, "\\pm").replace(/-\+/g, "\\mp").replace(/\/\//g, "\\parallel").replace(/△/g, "\\triangle ").replace(/□/g, "\\square ").replace(/‧/g, "\\cdot ").replace(/!=/g, "\\neq").replace(/<=/g, "\\leq").replace(/>=/g, "\\geq").replace(/==/g, "\\equiv");
}
function removeFontDirectives(input) {
  return input.replace(/(?<!\\)\b(?:rm|it)\b\s*/gi, "");
}
function convertWords(input) {
  return input.replace(/(?<![\\A-Za-z0-9])([A-Za-z][A-Za-z0-9]*)(?![A-Za-z0-9])/g, (word) => {
    const exact = SYMBOL_WORDS.get(word);
    if (exact) return exact;
    const lower = word.toLowerCase();
    return SYMBOL_WORDS.get(lower) ?? WORD_COMMANDS.get(lower) ?? word;
  });
}
function cleanupLatexSpacing(input) {
  return input.replace(/\\left\s*\{/g, "\\left\\{").replace(/\\right\s*\}/g, "\\right\\}").replace(/\\left\s*([\[\]\(\)\|])/g, "\\left$1").replace(/\\right\s*([\[\]\(\)\|])/g, "\\right$1").replace(/\s*\\,\s*/g, "\\,").replace(/\s+/g, " ").replace(/\{\s+/g, "{").replace(/\s+\}/g, "}").trim();
}
function findTopLevelWord(input, word) {
  let curly = 0;
  let paren = 0;
  for (let i = 0; i <= input.length - word.length; i++) {
    const ch = input[i];
    if (ch === "{") curly++;
    else if (ch === "}") curly = Math.max(0, curly - 1);
    else if (ch === "(") paren++;
    else if (ch === ")") paren = Math.max(0, paren - 1);
    if (curly !== 0 || paren !== 0) continue;
    if (input.slice(i, i + word.length).toLowerCase() !== word) continue;
    if (isWordChar(input[i - 1]) || isWordChar(input[i + word.length])) continue;
    return i;
  }
  return -1;
}
function readLeftAtom(input, end) {
  let pos = end - 1;
  while (pos >= 0 && /\s/.test(input[pos])) pos--;
  if (pos < 0) return null;
  if (input[pos] === "}") {
    const start2 = findMatchingLeft(input, pos, "{", "}");
    if (start2 >= 0) return { start: start2, atom: input.slice(start2, pos + 1) };
  }
  if (input[pos] === ")") {
    const start2 = findMatchingLeft(input, pos, "(", ")");
    if (start2 >= 0) return { start: start2, atom: input.slice(start2, pos + 1) };
  }
  let start = pos;
  while (start >= 0 && !/\s/.test(input[start]) && !/[+\-=<>]/.test(input[start])) start--;
  return { start: start + 1, atom: input.slice(start + 1, pos + 1) };
}
function readRightAtom(input, start) {
  let pos = start;
  while (pos < input.length && /\s/.test(input[pos])) pos++;
  if (pos >= input.length) return null;
  if (input[pos] === "{") {
    const end2 = findMatchingRight(input, pos, "{", "}");
    if (end2 >= 0) return { end: end2 + 1, atom: input.slice(pos, end2 + 1) };
  }
  if (input[pos] === "(") {
    const end2 = findMatchingRight(input, pos, "(", ")");
    if (end2 >= 0) return { end: end2 + 1, atom: input.slice(pos, end2 + 1) };
  }
  let end = pos;
  while (end < input.length && !/\s/.test(input[end]) && !/[+\-=<>]/.test(input[end])) end++;
  return { end, atom: input.slice(pos, end) };
}
function findMatchingLeft(input, closeIndex, open, close) {
  let depth = 0;
  for (let i = closeIndex; i >= 0; i--) {
    if (input[i] === close) depth++;
    else if (input[i] === open) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function findMatchingRight(input, openIndex, open, close) {
  let depth = 0;
  for (let i = openIndex; i < input.length; i++) {
    if (input[i] === open) depth++;
    else if (input[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function unwrapGroup(input) {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed.slice(1, -1);
  return trimmed;
}
function isWordChar(ch) {
  return !!ch && /[A-Za-z0-9_]/.test(ch);
}

// src/hwp5/cfb-lenient.ts
var CFB_MAGIC = Buffer.from([208, 207, 17, 224, 161, 177, 26, 225]);
var END_OF_CHAIN = 4294967294;
var FREE_SECT = 4294967295;
var MAX_CHAIN_LENGTH = 1e6;
var MAX_DIR_ENTRIES = 1e5;
var MAX_STREAM_SIZE = 100 * 1024 * 1024;
function parseLenientCfb(data) {
  if (data.length < 512) throw new Error("CFB \uD30C\uC77C\uC774 \uB108\uBB34 \uC9E7\uC2B5\uB2C8\uB2E4 (\uCD5C\uC18C 512\uBC14\uC774\uD2B8)");
  if (!data.subarray(0, 8).equals(CFB_MAGIC)) throw new Error("CFB \uB9E4\uC9C1 \uBC14\uC774\uD2B8 \uBD88\uC77C\uCE58");
  const sectorSizeShift = data.readUInt16LE(30);
  if (sectorSizeShift < 7 || sectorSizeShift > 16) throw new Error("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC139\uD130 \uD06C\uAE30 \uC2DC\uD504\uD2B8: " + sectorSizeShift);
  const sectorSize = 1 << sectorSizeShift;
  const miniSectorSizeShift = data.readUInt16LE(32);
  if (miniSectorSizeShift > 16) throw new Error("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uBBF8\uB2C8 \uC139\uD130 \uD06C\uAE30 \uC2DC\uD504\uD2B8: " + miniSectorSizeShift);
  const miniSectorSize = 1 << miniSectorSizeShift;
  const fatSectorCount = data.readUInt32LE(44);
  if (fatSectorCount > 1e4) throw new Error("FAT \uC139\uD130 \uC218\uAC00 \uB108\uBB34 \uB9CE\uC2B5\uB2C8\uB2E4: " + fatSectorCount);
  const firstDirSector = data.readUInt32LE(48);
  const miniStreamCutoff = data.readUInt32LE(56);
  const firstMiniFatSector = data.readUInt32LE(60);
  const miniFatSectorCount = data.readUInt32LE(64);
  const firstDifatSector = data.readUInt32LE(68);
  const difatSectorCount = data.readUInt32LE(72);
  function sectorOffset(id) {
    return 512 + id * sectorSize;
  }
  function readSectorData(id) {
    const off = sectorOffset(id);
    if (off + sectorSize > data.length) return Buffer.alloc(0);
    return data.subarray(off, off + sectorSize);
  }
  const fatSectors = [];
  for (let i = 0; i < 109 && fatSectors.length < fatSectorCount; i++) {
    const sid = data.readUInt32LE(76 + i * 4);
    if (sid === FREE_SECT || sid === END_OF_CHAIN) break;
    fatSectors.push(sid);
  }
  let difatSector = firstDifatSector;
  const visitedDifat = /* @__PURE__ */ new Set();
  for (let d = 0; d < difatSectorCount && difatSector !== END_OF_CHAIN && difatSector !== FREE_SECT; d++) {
    if (visitedDifat.has(difatSector)) break;
    visitedDifat.add(difatSector);
    const buf = readSectorData(difatSector);
    const entriesPerSector = sectorSize / 4 - 1;
    for (let i = 0; i < entriesPerSector && fatSectors.length < fatSectorCount; i++) {
      const sid = buf.readUInt32LE(i * 4);
      if (sid === FREE_SECT || sid === END_OF_CHAIN) continue;
      fatSectors.push(sid);
    }
    difatSector = buf.readUInt32LE(entriesPerSector * 4);
  }
  const entriesPerFatSector = sectorSize / 4;
  const fatTable = new Uint32Array(fatSectors.length * entriesPerFatSector);
  for (let fi = 0; fi < fatSectors.length; fi++) {
    const buf = readSectorData(fatSectors[fi]);
    for (let i = 0; i < entriesPerFatSector; i++) {
      fatTable[fi * entriesPerFatSector + i] = i * 4 + 3 < buf.length ? buf.readUInt32LE(i * 4) : FREE_SECT;
    }
  }
  function readChain(startSector, maxBytes) {
    if (startSector === END_OF_CHAIN || startSector === FREE_SECT) return Buffer.alloc(0);
    if (maxBytes > MAX_STREAM_SIZE) throw new Error("\uC2A4\uD2B8\uB9BC\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4");
    const chunks = [];
    let current = startSector;
    let totalRead = 0;
    const visited = /* @__PURE__ */ new Set();
    while (current !== END_OF_CHAIN && current !== FREE_SECT && totalRead < maxBytes) {
      if (visited.has(current)) break;
      if (visited.size > MAX_CHAIN_LENGTH) break;
      visited.add(current);
      const buf = readSectorData(current);
      const remaining = maxBytes - totalRead;
      chunks.push(remaining < sectorSize ? buf.subarray(0, remaining) : buf);
      totalRead += Math.min(buf.length, remaining);
      current = current < fatTable.length ? fatTable[current] : END_OF_CHAIN;
    }
    return Buffer.concat(chunks);
  }
  let miniFatTable = null;
  function getMiniFatTable() {
    if (miniFatTable) return miniFatTable;
    if (miniFatSectorCount === 0 || firstMiniFatSector === END_OF_CHAIN) {
      miniFatTable = new Uint32Array(0);
      return miniFatTable;
    }
    const miniFatData = readChain(firstMiniFatSector, miniFatSectorCount * sectorSize);
    const entries = miniFatData.length / 4;
    miniFatTable = new Uint32Array(entries);
    for (let i = 0; i < entries; i++) {
      miniFatTable[i] = miniFatData.readUInt32LE(i * 4);
    }
    return miniFatTable;
  }
  const dirData = readChain(firstDirSector, MAX_DIR_ENTRIES * 128);
  const dirEntries = [];
  for (let offset = 0; offset + 128 <= dirData.length && dirEntries.length < MAX_DIR_ENTRIES; offset += 128) {
    const nameLen = dirData.readUInt16LE(offset + 64);
    if (nameLen <= 0 || nameLen > 64) {
      dirEntries.push({ name: "", type: 0, startSector: 0, size: 0 });
      continue;
    }
    const nameBytes = nameLen - 2;
    const name = nameBytes > 0 ? dirData.subarray(offset, offset + nameBytes).toString("utf16le") : "";
    const type = dirData[offset + 66];
    const startSector = dirData.readUInt32LE(offset + 116);
    const size = dirData.readUInt32LE(offset + 120);
    dirEntries.push({ name, type, startSector, size });
  }
  let miniStreamData = null;
  function getMiniStream() {
    if (miniStreamData) return miniStreamData;
    const root = dirEntries[0];
    if (!root || root.type !== 5) {
      miniStreamData = Buffer.alloc(0);
      return miniStreamData;
    }
    miniStreamData = readChain(root.startSector, root.size || MAX_STREAM_SIZE);
    return miniStreamData;
  }
  function readMiniStream(startSector, size) {
    const mft = getMiniFatTable();
    const ms = getMiniStream();
    if (mft.length === 0 || ms.length === 0) return Buffer.alloc(0);
    const chunks = [];
    let current = startSector;
    let totalRead = 0;
    const visited = /* @__PURE__ */ new Set();
    while (current !== END_OF_CHAIN && current !== FREE_SECT && totalRead < size) {
      if (visited.has(current)) break;
      if (visited.size > MAX_CHAIN_LENGTH) break;
      visited.add(current);
      const off = current * miniSectorSize;
      const remaining = size - totalRead;
      const chunkSize = Math.min(miniSectorSize, remaining);
      if (off + chunkSize <= ms.length) {
        chunks.push(ms.subarray(off, off + chunkSize));
      }
      totalRead += chunkSize;
      current = current < mft.length ? mft[current] : END_OF_CHAIN;
    }
    return Buffer.concat(chunks);
  }
  function readStreamData(entry) {
    if (entry.size === 0) return Buffer.alloc(0);
    if (entry.size < miniStreamCutoff) {
      const miniResult = readMiniStream(entry.startSector, entry.size);
      if (miniResult.length > 0) return miniResult;
    }
    return readChain(entry.startSector, entry.size);
  }
  function findEntryByPath(path) {
    const parts = path.replace(/^\//, "").split("/");
    if (parts.length === 1) {
      return dirEntries.find((e) => e.name === parts[0] && e.type === 2) ?? null;
    }
    const storageName = parts[0];
    const streamName = parts.slice(1).join("/");
    for (const e of dirEntries) {
      if (e.type === 2 && e.name === streamName) {
        return e;
      }
    }
    const lastPart = parts[parts.length - 1];
    return dirEntries.find((e) => e.type === 2 && e.name === lastPart) ?? null;
  }
  return {
    findStream(path) {
      const normalized = path.replace(/^\//, "");
      const entry = findEntryByPath(normalized);
      if (!entry || entry.type !== 2) return null;
      const stream = readStreamData(entry);
      return stream.length > 0 ? stream : null;
    },
    entries() {
      return dirEntries.filter((e) => e.type === 2);
    }
  };
}

// src/hwp5/parser.ts
import { createRequire } from "module";
var require2 = createRequire(import.meta.url);
var CFB = require2("cfb");
var MAX_SECTIONS = 100;
var MAX_TOTAL_DECOMPRESS = 100 * 1024 * 1024;
function parseHwp5Document(buffer, options) {
  let cfb = null;
  let lenientCfb = null;
  const warnings = [];
  try {
    cfb = CFB.parse(buffer);
  } catch {
    try {
      lenientCfb = parseLenientCfb(buffer);
      warnings.push({ message: "\uC190\uC0C1\uB41C CFB \uCEE8\uD14C\uC774\uB108 \u2014 lenient \uBAA8\uB4DC\uB85C \uBCF5\uAD6C", code: "LENIENT_CFB_RECOVERY" });
    } catch {
      throw new KordocError("CFB \uCEE8\uD14C\uC774\uB108 \uD30C\uC2F1 \uC2E4\uD328 (strict \uBC0F lenient \uBAA8\uB450)");
    }
  }
  const findStream = (path) => {
    if (cfb) {
      const entry = CFB.find(cfb, path);
      return entry?.content ? Buffer.from(entry.content) : null;
    }
    return lenientCfb.findStream(path);
  };
  const headerData = findStream("/FileHeader");
  if (!headerData) throw new KordocError("FileHeader \uC2A4\uD2B8\uB9BC \uC5C6\uC74C");
  const header = parseFileHeader(headerData);
  if (header.signature !== "HWP Document File") throw new KordocError("HWP \uC2DC\uADF8\uB2C8\uCC98 \uBD88\uC77C\uCE58");
  if (header.flags & FLAG_ENCRYPTED) throw new KordocError("\uC554\uD638\uD654\uB41C HWP\uB294 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4");
  if (header.flags & FLAG_DRM) throw new KordocError("DRM \uBCF4\uD638\uB41C HWP\uB294 \uC9C0\uC6D0\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4");
  const compressed = (header.flags & FLAG_COMPRESSED) !== 0;
  const distribution = (header.flags & FLAG_DISTRIBUTION) !== 0;
  const metadata = {
    version: `${header.versionMajor}.x`
  };
  if (cfb) extractHwp5Metadata(cfb, metadata);
  const docInfo = cfb ? parseDocInfoStream(cfb, compressed) : parseDocInfoFromStream(findStream("/DocInfo"), compressed);
  const sections = distribution ? cfb ? findViewTextSections(cfb, compressed) : findViewTextSectionsLenient(lenientCfb, compressed) : cfb ? findSections(cfb) : findSectionsLenient(lenientCfb, compressed);
  if (sections.length === 0) throw new KordocError("\uC139\uC158 \uC2A4\uD2B8\uB9BC\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
  metadata.pageCount = sections.length;
  const pageFilter = options?.pages ? parsePageRange(options.pages, sections.length) : null;
  const totalTarget = pageFilter ? pageFilter.size : sections.length;
  const blocks = [];
  const nestedTableCounter = { count: 0 };
  let totalDecompressed = 0;
  let parsedSections = 0;
  for (let si = 0; si < sections.length; si++) {
    if (pageFilter && !pageFilter.has(si + 1)) continue;
    try {
      const sectionData = sections[si];
      const data = !distribution && compressed ? decompressStream(Buffer.from(sectionData)) : Buffer.from(sectionData);
      totalDecompressed += data.length;
      if (totalDecompressed > MAX_TOTAL_DECOMPRESS) throw new KordocError("\uCD1D \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (decompression bomb \uC758\uC2EC)");
      const records = readRecords(data);
      const sectionBlocks = parseSection(records, docInfo, warnings, si + 1, nestedTableCounter);
      blocks.push(...sectionBlocks);
      parsedSections++;
      options?.onProgress?.(parsedSections, totalTarget);
    } catch (secErr) {
      if (secErr instanceof KordocError) throw secErr;
      warnings.push({ page: si + 1, message: `\uC139\uC158 ${si + 1} \uD30C\uC2F1 \uC2E4\uD328: ${secErr instanceof Error ? secErr.message : "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958"}`, code: "PARTIAL_PARSE" });
    }
  }
  const images = cfb ? extractHwp5Images(cfb, blocks, compressed, warnings) : extractHwp5ImagesLenient(lenientCfb, blocks, compressed, warnings);
  const flatBlocks = flattenLayoutTables(blocks);
  if (docInfo) {
    detectHwp5Headings(flatBlocks, docInfo);
  }
  const outline = flatBlocks.filter((b) => b.type === "heading" && b.level && b.text).map((b) => ({ level: b.level, text: b.text, pageNumber: b.pageNumber }));
  const markdown = blocksToMarkdown(flatBlocks);
  return { markdown, blocks: flatBlocks, metadata, outline: outline.length > 0 ? outline : void 0, warnings: warnings.length > 0 ? warnings : void 0, images: images.length > 0 ? images : void 0 };
}
function parseDocInfoStream(cfb, compressed) {
  try {
    const entry = CFB.find(cfb, "/DocInfo");
    if (!entry?.content) return null;
    const data = compressed ? decompressStream(Buffer.from(entry.content)) : Buffer.from(entry.content);
    const records = readRecords(data);
    return parseDocInfo(records);
  } catch {
    return null;
  }
}
function parseDocInfoFromStream(raw, compressed) {
  if (!raw) return null;
  try {
    const data = compressed ? decompressStream(raw) : raw;
    return parseDocInfo(readRecords(data));
  } catch {
    return null;
  }
}
function detectHwp5Headings(blocks, docInfo) {
  let baseFontSize = 0;
  for (const style of docInfo.styles) {
    const name = (style.nameKo || style.name).toLowerCase();
    if (name.includes("\uBC14\uD0D5") || name.includes("\uBCF8\uBB38") || name === "normal" || name === "body") {
      const cs = docInfo.charShapes[style.charShapeId];
      if (cs?.fontSize > 0) {
        baseFontSize = cs.fontSize / 10;
        break;
      }
    }
  }
  if (baseFontSize === 0) {
    const sizeFreq = /* @__PURE__ */ new Map();
    for (const b of blocks) {
      if (b.style?.fontSize) {
        sizeFreq.set(b.style.fontSize, (sizeFreq.get(b.style.fontSize) || 0) + 1);
      }
    }
    let maxCount = 0;
    for (const [size, count] of sizeFreq) {
      if (count > maxCount) {
        maxCount = count;
        baseFontSize = size;
      }
    }
  }
  if (baseFontSize <= 0) return;
  for (const block of blocks) {
    if (block.type === "heading") continue;
    if (block.type !== "paragraph" || !block.text) continue;
    const text = block.text.trim();
    if (text.length === 0 || text.length > 200) continue;
    if (/^\d+$/.test(text)) continue;
    let level = 0;
    if (block.style?.fontSize && baseFontSize > 0) {
      const ratio = block.style.fontSize / baseFontSize;
      if (ratio >= HEADING_RATIO_H1) level = 1;
      else if (ratio >= HEADING_RATIO_H2) level = 2;
      else if (ratio >= HEADING_RATIO_H3) level = 3;
    }
    if (/^제\d+[장절편]\s/.test(text) && text.length <= 50) {
      if (level === 0) level = 2;
    } else if (/^제\d+(조의?\d*)\s*[\(（]/.test(text) && text.length <= 80) {
      if (level === 0) level = 3;
    }
    if (level > 0) {
      block.type = "heading";
      block.level = level;
    }
  }
}
function extractHwp5Metadata(cfb, metadata) {
  try {
    const summaryEntry = CFB.find(cfb, "/HwpSummaryInformation") || CFB.find(cfb, "/SummaryInformation");
    if (!summaryEntry?.content) return;
    const data = Buffer.from(summaryEntry.content);
    if (data.length < 48) return;
    const numSets = data.readUInt32LE(24);
    if (numSets === 0) return;
    const setOffset = data.readUInt32LE(44);
    if (setOffset >= data.length - 8) return;
    const numProps = data.readUInt32LE(setOffset + 4);
    if (numProps === 0 || numProps > 100) return;
    for (let i = 0; i < numProps; i++) {
      const entryOffset = setOffset + 8 + i * 8;
      if (entryOffset + 8 > data.length) break;
      const propId = data.readUInt32LE(entryOffset);
      const propOffset = setOffset + data.readUInt32LE(entryOffset + 4);
      if (propOffset + 8 > data.length) continue;
      if (propId !== 2 && propId !== 4 && propId !== 6) continue;
      const propType = data.readUInt32LE(propOffset);
      if (propType !== 30) continue;
      const strLen = data.readUInt32LE(propOffset + 4);
      if (strLen === 0 || strLen > 1e4 || propOffset + 8 + strLen > data.length) continue;
      const str = data.subarray(propOffset + 8, propOffset + 8 + strLen).toString("utf8").replace(/\0+$/, "").trim();
      if (!str) continue;
      if (propId === 2) metadata.title = str;
      else if (propId === 4) metadata.author = str;
      else if (propId === 6) metadata.description = str;
    }
  } catch {
  }
}
function extractHwp5MetadataOnly(buffer) {
  const cfb = CFB.parse(buffer);
  const headerEntry = CFB.find(cfb, "/FileHeader");
  if (!headerEntry?.content) throw new KordocError("FileHeader \uC2A4\uD2B8\uB9BC \uC5C6\uC74C");
  const header = parseFileHeader(Buffer.from(headerEntry.content));
  if (header.signature !== "HWP Document File") throw new KordocError("HWP \uC2DC\uADF8\uB2C8\uCC98 \uBD88\uC77C\uCE58");
  const metadata = {
    version: `${header.versionMajor}.x`
  };
  extractHwp5Metadata(cfb, metadata);
  const sections = findSections(cfb);
  metadata.pageCount = sections.length;
  return metadata;
}
function findViewTextSections(cfb, compressed) {
  const sections = [];
  for (let i = 0; i < MAX_SECTIONS; i++) {
    const entry = CFB.find(cfb, `/ViewText/Section${i}`);
    if (!entry?.content) break;
    try {
      const decrypted = decryptViewText(Buffer.from(entry.content), compressed);
      sections.push({ idx: i, content: decrypted });
    } catch {
      break;
    }
  }
  return sections.sort((a, b) => a.idx - b.idx).map((s) => s.content);
}
function findSections(cfb) {
  const sections = [];
  for (let i = 0; i < MAX_SECTIONS; i++) {
    const entry = CFB.find(cfb, `/BodyText/Section${i}`);
    if (!entry?.content) break;
    sections.push({ idx: i, content: Buffer.from(entry.content) });
  }
  if (sections.length === 0 && cfb.FileIndex) {
    for (const entry of cfb.FileIndex) {
      if (sections.length >= MAX_SECTIONS) break;
      if (entry.name?.startsWith("Section") && entry.content) {
        const idx = parseInt(entry.name.replace("Section", ""), 10) || 0;
        sections.push({ idx, content: Buffer.from(entry.content) });
      }
    }
  }
  return sections.sort((a, b) => a.idx - b.idx).map((s) => s.content);
}
function findSectionsLenient(lcfb, compressed) {
  const sections = [];
  let totalDecompressed = 0;
  for (let i = 0; i < MAX_SECTIONS; i++) {
    const raw = lcfb.findStream(`/BodyText/Section${i}`) ?? lcfb.findStream(`Section${i}`);
    if (!raw) break;
    const content = compressed ? decompressStream(raw) : raw;
    totalDecompressed += content.length;
    if (totalDecompressed > MAX_TOTAL_DECOMPRESS) throw new KordocError("\uCD1D \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (decompression bomb \uC758\uC2EC)");
    sections.push({ idx: i, content });
  }
  if (sections.length === 0) {
    for (const e of lcfb.entries()) {
      if (sections.length >= MAX_SECTIONS) break;
      if (e.name.startsWith("Section")) {
        const idx = parseInt(e.name.replace("Section", ""), 10) || 0;
        const raw = lcfb.findStream(e.name);
        if (raw) {
          const content = compressed ? decompressStream(raw) : raw;
          totalDecompressed += content.length;
          if (totalDecompressed > MAX_TOTAL_DECOMPRESS) throw new KordocError("\uCD1D \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (decompression bomb \uC758\uC2EC)");
          sections.push({ idx, content });
        }
      }
    }
  }
  return sections.sort((a, b) => a.idx - b.idx).map((s) => s.content);
}
function findViewTextSectionsLenient(lcfb, compressed) {
  const sections = [];
  let totalDecompressed = 0;
  for (let i = 0; i < MAX_SECTIONS; i++) {
    const raw = lcfb.findStream(`/ViewText/Section${i}`) ?? lcfb.findStream(`Section${i}`);
    if (!raw) break;
    try {
      const content = decryptViewText(raw, compressed);
      totalDecompressed += content.length;
      if (totalDecompressed > MAX_TOTAL_DECOMPRESS) throw new KordocError("\uCD1D \uC555\uCD95 \uD574\uC81C \uD06C\uAE30 \uCD08\uACFC (decompression bomb \uC758\uC2EC)");
      sections.push({ idx: i, content });
    } catch {
      break;
    }
  }
  return sections.sort((a, b) => a.idx - b.idx).map((s) => s.content);
}
var TAG_SHAPE_COMPONENT = 74;
var CTRL_ID_EQEDIT = "deqe";
function extractBinDataId(records, ctrlIdx) {
  const ctrlLevel = records[ctrlIdx].level;
  for (let j = ctrlIdx + 1; j < records.length && j < ctrlIdx + 50; j++) {
    const r = records[j];
    if (r.level <= ctrlLevel) break;
    if (r.data.length >= 2) {
      if (r.tagId > TAG_SHAPE_COMPONENT && r.level > ctrlLevel + 1 && r.data.length >= 4) {
        const possibleId = r.data.readUInt16LE(0);
        if (possibleId < 1e4) return possibleId;
      }
    }
  }
  return -1;
}
function isEquationControlId(ctrlId) {
  return ctrlId === CTRL_ID_EQEDIT || ctrlId === "eqed";
}
function formatEquationForMarkdown(equation) {
  const normalized = hwpEquationToLatex(equation);
  if (!normalized) return "";
  return `$${normalized.replace(/\$/g, "\\$")}$`;
}
function extractEquationFromControl(records, ctrlIdx) {
  const ctrlLevel = records[ctrlIdx].level;
  for (let j = ctrlIdx + 1; j < records.length && j < ctrlIdx + 10; j++) {
    const r = records[j];
    if (r.level <= ctrlLevel) break;
    if (r.tagId !== TAG_EQEDIT) continue;
    const equation = extractEquationText(r.data);
    return equation ? formatEquationForMarkdown(equation) : null;
  }
  return null;
}
function renderTextWithEquations(textRecords, equations) {
  const queue = [...equations];
  return textRecords.map((data) => extractTextWithControls(data, (ctrlId) => {
    if (!isEquationControlId(ctrlId) || queue.length === 0) return null;
    return queue.shift();
  })).join("").replace(/\$\$/g, "$ $");
}
function detectImageMime(data) {
  if (data.length < 4) return null;
  if (data[0] === 137 && data[1] === 80 && data[2] === 78 && data[3] === 71) return "image/png";
  if (data[0] === 255 && data[1] === 216 && data[2] === 255) return "image/jpeg";
  if (data[0] === 71 && data[1] === 73 && data[2] === 70) return "image/gif";
  if (data[0] === 66 && data[1] === 77) return "image/bmp";
  if (data[0] === 215 && data[1] === 205 && data[2] === 198 && data[3] === 154) return "image/wmf";
  if (data[0] === 1 && data[1] === 0 && data[2] === 0 && data[3] === 0) return "image/emf";
  return null;
}
function extractHwp5Images(cfb, blocks, compressed, warnings) {
  const binDataMap = /* @__PURE__ */ new Map();
  const binDataRe = /\/BinData\/[Bb][Ii][Nn](\d{4})$/;
  if (cfb.FileIndex) {
    for (const entry of cfb.FileIndex) {
      if (!entry?.name || !entry.content) continue;
      const match = entry.name.match(binDataRe);
      if (!match) continue;
      const idx = parseInt(match[1], 10);
      let data = Buffer.from(entry.content);
      if (compressed) {
        try {
          data = decompressStream(data);
        } catch {
        }
      }
      binDataMap.set(idx, { data, name: entry.name });
    }
  }
  if (binDataMap.size === 0) return [];
  const images = [];
  let imageIndex = 0;
  for (const block of blocks) {
    if (block.type !== "image" || !block.text) continue;
    const binId = parseInt(block.text, 10);
    if (isNaN(binId)) continue;
    const bin = binDataMap.get(binId);
    if (!bin) {
      warnings.push({ page: block.pageNumber, message: `BinData ${binId} \uC5C6\uC74C`, code: "SKIPPED_IMAGE" });
      block.type = "paragraph";
      block.text = `[\uC774\uBBF8\uC9C0: BinData ${binId}]`;
      continue;
    }
    const mime = detectImageMime(bin.data);
    if (!mime) {
      warnings.push({ page: block.pageNumber, message: `BinData ${binId}: \uC54C \uC218 \uC5C6\uB294 \uC774\uBBF8\uC9C0 \uD615\uC2DD`, code: "SKIPPED_IMAGE" });
      block.type = "paragraph";
      block.text = `[\uC774\uBBF8\uC9C0: ${bin.name}]`;
      continue;
    }
    imageIndex++;
    const ext = mime.includes("jpeg") ? "jpg" : mime.includes("png") ? "png" : mime.includes("gif") ? "gif" : mime.includes("bmp") ? "bmp" : "bin";
    const filename = `image_${String(imageIndex).padStart(3, "0")}.${ext}`;
    images.push({ filename, data: new Uint8Array(bin.data), mimeType: mime });
    block.text = filename;
    block.imageData = { data: new Uint8Array(bin.data), mimeType: mime, filename: bin.name };
  }
  return images;
}
function extractHwp5ImagesLenient(lcfb, blocks, compressed, warnings) {
  const binDataMap = /* @__PURE__ */ new Map();
  const binRe = /^BIN(\d{4})/i;
  for (const e of lcfb.entries()) {
    const match = e.name.match(binRe);
    if (!match) continue;
    const idx = parseInt(match[1], 10);
    let raw = lcfb.findStream(e.name);
    if (!raw) continue;
    if (compressed) {
      try {
        raw = decompressStream(raw);
      } catch {
      }
    }
    binDataMap.set(idx, { data: raw, name: e.name });
  }
  if (binDataMap.size === 0) return [];
  const images = [];
  let imageIndex = 0;
  for (const block of blocks) {
    if (block.type !== "image" || !block.text) continue;
    const binId = parseInt(block.text, 10);
    if (isNaN(binId)) continue;
    const bin = binDataMap.get(binId);
    if (!bin) {
      warnings.push({ page: block.pageNumber, message: `BinData ${binId} \uFFFD\uFFFD\uFFFD\uC74C`, code: "SKIPPED_IMAGE" });
      block.type = "paragraph";
      block.text = `[\uC774\uBBF8\uC9C0: BinData ${binId}]`;
      continue;
    }
    const mime = detectImageMime(bin.data);
    if (!mime) {
      warnings.push({ page: block.pageNumber, message: `BinData ${binId}: \uC54C \uC218 \uC5C6\uB294 \uC774\uBBF8\uC9C0 \uD615\uC2DD`, code: "SKIPPED_IMAGE" });
      block.type = "paragraph";
      block.text = `[\uC774\uBBF8\uC9C0: ${bin.name}]`;
      continue;
    }
    imageIndex++;
    const ext = mime.includes("jpeg") ? "jpg" : mime.includes("png") ? "png" : mime.includes("gif") ? "gif" : mime.includes("bmp") ? "bmp" : "bin";
    const filename = `image_${String(imageIndex).padStart(3, "0")}.${ext}`;
    images.push({ filename, data: new Uint8Array(bin.data), mimeType: mime });
    block.text = filename;
    block.imageData = { data: new Uint8Array(bin.data), mimeType: mime, filename: bin.name };
  }
  return images;
}
function parseSection(records, docInfo, warnings, sectionNum, counter) {
  const blocks = [];
  let i = 0;
  while (i < records.length) {
    const rec = records[i];
    if (rec.tagId === TAG_PARA_HEADER && rec.level === 0) {
      const { paragraph, tables, nextIdx, charShapeIds, paraShapeId } = parseParagraphWithTables(records, i, counter);
      if (paragraph) {
        const block = { type: "paragraph", text: paragraph, pageNumber: sectionNum };
        if (docInfo && charShapeIds.length > 0) {
          const style = resolveCharStyle(charShapeIds, docInfo);
          if (style) block.style = style;
        }
        if (docInfo && paraShapeId >= 0 && paraShapeId < docInfo.paraShapes.length) {
          const ol = docInfo.paraShapes[paraShapeId].outlineLevel;
          if (ol >= 1 && ol <= 6) {
            block.type = "heading";
            block.level = ol;
          }
        }
        blocks.push(block);
      }
      for (const t of tables) blocks.push({ type: "table", table: t, pageNumber: sectionNum });
      i = nextIdx;
      continue;
    }
    if (rec.tagId === TAG_CTRL_HEADER && rec.level <= 1 && rec.data.length >= 4) {
      const ctrlId = rec.data.subarray(0, 4).toString("ascii");
      if (ctrlId === " lbt" || ctrlId === "tbl ") {
        const { table, nextIdx } = parseTableBlock(records, i, counter);
        if (table) blocks.push({ type: "table", table, pageNumber: sectionNum });
        i = nextIdx;
        continue;
      }
      if (ctrlId === "gso " || ctrlId === " osg") {
        const binId = extractBinDataId(records, i);
        if (binId >= 0) {
          blocks.push({ type: "image", text: String(binId), pageNumber: sectionNum });
        } else {
          const boxText = extractTextBoxText(records, i);
          if (boxText) {
            blocks.push({ type: "paragraph", text: boxText, pageNumber: sectionNum });
          }
        }
      } else if (ctrlId === " elo" || ctrlId === "ole ") {
        warnings.push({ page: sectionNum, message: `\uC2A4\uD0B5\uB41C \uC81C\uC5B4 \uC694\uC18C: ${ctrlId.trim()}`, code: "SKIPPED_IMAGE" });
      } else if (ctrlId === "fn  " || ctrlId === " nf " || ctrlId === "en  " || ctrlId === " ne ") {
        const noteText = extractNoteText(records, i);
        if (noteText && blocks.length > 0) {
          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock.type === "paragraph") {
            lastBlock.footnoteText = lastBlock.footnoteText ? lastBlock.footnoteText + "; " + noteText : noteText;
          }
        }
      } else if (ctrlId === "%tok" || ctrlId === "klnk") {
        const url = extractHyperlinkUrl(rec.data);
        if (url && blocks.length > 0) {
          const lastBlock = blocks[blocks.length - 1];
          if (lastBlock.type === "paragraph" && !lastBlock.href) {
            lastBlock.href = sanitizeHref(url) ?? void 0;
          }
        }
      }
    }
    i++;
  }
  return blocks;
}
function extractNoteText(records, ctrlIdx) {
  const ctrlLevel = records[ctrlIdx].level;
  const texts = [];
  let textRecords = [];
  let equations = [];
  const flushText = () => {
    const text = renderTextWithEquations(textRecords, equations).trim();
    if (text) texts.push(text);
    textRecords = [];
    equations = [];
  };
  for (let j = ctrlIdx + 1; j < records.length && j < ctrlIdx + 100; j++) {
    const r = records[j];
    if (r.level <= ctrlLevel) break;
    if (r.tagId === TAG_PARA_HEADER) {
      flushText();
    }
    if (r.tagId === TAG_PARA_TEXT) {
      textRecords.push(r.data);
    }
    if (r.tagId === TAG_CTRL_HEADER && r.data.length >= 4) {
      const ctrlId = r.data.subarray(0, 4).toString("ascii");
      if (isEquationControlId(ctrlId)) {
        const equation = extractEquationFromControl(records, j);
        if (equation) equations.push(equation);
      }
    }
  }
  flushText();
  return texts.length > 0 ? texts.join(" ") : null;
}
function extractTextBoxText(records, ctrlIdx) {
  const ctrlLevel = records[ctrlIdx].level;
  const texts = [];
  let textRecords = [];
  let equations = [];
  const flushText = () => {
    const text = renderTextWithEquations(textRecords, equations).trim();
    if (text) texts.push(text);
    textRecords = [];
    equations = [];
  };
  for (let j = ctrlIdx + 1; j < records.length && j < ctrlIdx + 200; j++) {
    const r = records[j];
    if (r.level <= ctrlLevel) break;
    if (r.tagId === TAG_PARA_HEADER) {
      flushText();
    }
    if (r.tagId === TAG_PARA_TEXT) {
      textRecords.push(r.data);
    }
    if (r.tagId === TAG_CTRL_HEADER && r.data.length >= 4) {
      const ctrlId = r.data.subarray(0, 4).toString("ascii");
      if (isEquationControlId(ctrlId)) {
        const equation = extractEquationFromControl(records, j);
        if (equation) equations.push(equation);
      }
    }
  }
  flushText();
  return texts.length > 0 ? texts.join("\n") : null;
}
function extractHyperlinkUrl(data) {
  try {
    const httpSig = Buffer.from("http", "utf16le");
    const idx = data.indexOf(httpSig);
    if (idx >= 0) {
      let end = idx;
      while (end + 1 < data.length) {
        const ch = data.readUInt16LE(end);
        if (ch === 0) break;
        end += 2;
      }
      const url = data.subarray(idx, end).toString("utf16le");
      if (/^https?:\/\/.+/.test(url) && url.length < 2e3) {
        return url;
      }
    }
  } catch {
  }
  return null;
}
function resolveCharStyle(charShapeIds, docInfo) {
  if (charShapeIds.length === 0 || docInfo.charShapes.length === 0) return void 0;
  const freq = /* @__PURE__ */ new Map();
  let maxCount = 0, dominantId = charShapeIds[0];
  for (const id of charShapeIds) {
    const count = (freq.get(id) || 0) + 1;
    freq.set(id, count);
    if (count > maxCount) {
      maxCount = count;
      dominantId = id;
    }
  }
  const cs = docInfo.charShapes[dominantId];
  if (!cs) return void 0;
  const style = {};
  if (cs.fontSize > 0) style.fontSize = cs.fontSize / 10;
  if (cs.attrFlags & 1) style.italic = true;
  if (cs.attrFlags & 2) style.bold = true;
  return style.fontSize || style.bold || style.italic ? style : void 0;
}
function parseParagraphWithTables(records, startIdx, counter) {
  const startLevel = records[startIdx].level;
  const textRecords = [];
  const equations = [];
  const tables = [];
  const charShapeIds = [];
  const paraHeaderData = records[startIdx].data;
  const paraShapeId = paraHeaderData.length >= 10 ? paraHeaderData.readUInt16LE(8) : -1;
  let i = startIdx + 1;
  while (i < records.length) {
    const rec = records[i];
    if (rec.tagId === TAG_PARA_HEADER && rec.level <= startLevel) break;
    if (rec.tagId === TAG_PARA_TEXT) {
      textRecords.push(rec.data);
    }
    if (rec.tagId === TAG_CHAR_SHAPE && rec.data.length >= 8) {
      for (let offset = 0; offset + 7 < rec.data.length; offset += 8) {
        charShapeIds.push(rec.data.readUInt32LE(offset + 4));
      }
    }
    if (rec.tagId === TAG_CTRL_HEADER && rec.data.length >= 4) {
      const ctrlId = rec.data.subarray(0, 4).toString("ascii");
      if (isEquationControlId(ctrlId)) {
        const equation = extractEquationFromControl(records, i);
        if (equation) equations.push(equation);
      } else if (ctrlId === " lbt" || ctrlId === "tbl ") {
        const { table, nextIdx } = parseTableBlock(records, i, counter);
        if (table) tables.push(table);
        i = nextIdx;
        continue;
      }
    }
    i++;
  }
  const text = renderTextWithEquations(textRecords, equations);
  const trimmed = text.trim();
  return { paragraph: trimmed || null, tables, nextIdx: i, charShapeIds, paraShapeId };
}
function parseTableBlock(records, startIdx, counter) {
  const tableLevel = records[startIdx].level;
  let i = startIdx + 1;
  let rows = 0, cols = 0;
  const cells = [];
  while (i < records.length) {
    const rec = records[i];
    if (rec.tagId === TAG_PARA_HEADER && rec.level <= tableLevel) break;
    if (rec.tagId === TAG_CTRL_HEADER && rec.level <= tableLevel) break;
    if (rec.tagId === TAG_TABLE && rec.data.length >= 8) {
      rows = Math.min(rec.data.readUInt16LE(4), MAX_ROWS);
      cols = Math.min(rec.data.readUInt16LE(6), MAX_COLS);
    }
    if (rec.tagId === TAG_LIST_HEADER) {
      const { cell, nextIdx } = parseCellBlock(records, i, tableLevel, counter);
      if (cell) cells.push(cell);
      i = nextIdx;
      continue;
    }
    i++;
  }
  if (rows === 0 || cols === 0 || cells.length === 0) return { table: null, nextIdx: i };
  const hasAddr = cells.some((c) => c.colAddr !== void 0 && c.rowAddr !== void 0);
  if (hasAddr) {
    const cellRows2 = arrangeCells(rows, cols, cells);
    const irCells = cellRows2.map((row) => row.map((c) => ({
      text: c.text.trim(),
      colSpan: c.colSpan,
      rowSpan: c.rowSpan
    })));
    return { table: { rows, cols, cells: irCells, hasHeader: rows > 1 }, nextIdx: i };
  }
  const cellRows = arrangeCells(rows, cols, cells);
  return { table: buildTable(cellRows), nextIdx: i };
}
function parseCellBlock(records, startIdx, tableLevel, counter) {
  const rec = records[startIdx];
  const cellLevel = rec.level;
  const texts = [];
  let textRecords = [];
  let equations = [];
  const flushText = () => {
    const text = renderTextWithEquations(textRecords, equations).trim();
    if (text) texts.push(text);
    textRecords = [];
    equations = [];
  };
  let colSpan = 1;
  let rowSpan = 1;
  let colAddr;
  let rowAddr;
  if (rec.data.length >= 16) {
    colAddr = rec.data.readUInt16LE(8);
    rowAddr = rec.data.readUInt16LE(10);
    const cs = rec.data.readUInt16LE(12);
    const rs = rec.data.readUInt16LE(14);
    if (cs > 0) colSpan = Math.min(cs, MAX_COLS);
    if (rs > 0) rowSpan = Math.min(rs, MAX_ROWS);
  }
  let i = startIdx + 1;
  while (i < records.length) {
    const r = records[i];
    if (r.tagId === TAG_LIST_HEADER && r.level <= cellLevel) break;
    if (r.level <= tableLevel && (r.tagId === TAG_PARA_HEADER || r.tagId === TAG_CTRL_HEADER)) break;
    if (r.tagId === TAG_PARA_HEADER) {
      flushText();
    }
    if (r.tagId === TAG_PARA_TEXT) {
      textRecords.push(r.data);
    }
    if (r.tagId === TAG_CTRL_HEADER && r.data.length >= 4) {
      const ctrlId = r.data.subarray(0, 4).toString("ascii");
      if (isEquationControlId(ctrlId)) {
        const equation = extractEquationFromControl(records, i);
        if (equation) equations.push(equation);
      } else if (ctrlId === " lbt" || ctrlId === "tbl ") {
        flushText();
        if (counter) {
          counter.count++;
          texts.push(`[\uC911\uCCA9 \uD14C\uC774\uBE14 #${counter.count}]`);
        } else {
          texts.push("[\uC911\uCCA9 \uD14C\uC774\uBE14]");
        }
      }
    }
    i++;
  }
  flushText();
  return { cell: { text: texts.join("\n"), colSpan, rowSpan, colAddr, rowAddr }, nextIdx: i };
}
function arrangeCells(rows, cols, cells) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const hasAddr = cells.some((c) => c.colAddr !== void 0 && c.rowAddr !== void 0);
  if (hasAddr) {
    for (const cell of cells) {
      const r = cell.rowAddr ?? 0;
      const c = cell.colAddr ?? 0;
      if (r >= rows || c >= cols) continue;
      grid[r][c] = cell;
      for (let dr = 0; dr < cell.rowSpan; dr++) {
        for (let dc = 0; dc < cell.colSpan; dc++) {
          if (dr === 0 && dc === 0) continue;
          if (r + dr < rows && c + dc < cols)
            grid[r + dr][c + dc] = { text: "", colSpan: 1, rowSpan: 1 };
        }
      }
    }
  } else {
    let cellIdx = 0;
    for (let r = 0; r < rows && cellIdx < cells.length; r++) {
      for (let c = 0; c < cols && cellIdx < cells.length; c++) {
        if (grid[r][c] !== null) continue;
        const cell = cells[cellIdx++];
        grid[r][c] = cell;
        for (let dr = 0; dr < cell.rowSpan; dr++) {
          for (let dc = 0; dc < cell.colSpan; dc++) {
            if (dr === 0 && dc === 0) continue;
            if (r + dr < rows && c + dc < cols)
              grid[r + dr][c + dc] = { text: "", colSpan: 1, rowSpan: 1 };
          }
        }
      }
    }
  }
  return grid.map((row) => row.map((c) => c || { text: "", colSpan: 1, rowSpan: 1 }));
}

// src/form/recognize.ts
var LABEL_KEYWORDS = /* @__PURE__ */ new Set([
  "\uC131\uBA85",
  "\uC774\uB984",
  "\uC8FC\uC18C",
  "\uC804\uD654",
  "\uC804\uD654\uBC88\uD638",
  "\uD734\uB300\uD3F0",
  "\uD578\uB4DC\uD3F0",
  "\uC5F0\uB77D\uCC98",
  "\uC0DD\uB144\uC6D4\uC77C",
  "\uC8FC\uBBFC\uB4F1\uB85D\uBC88\uD638",
  "\uC18C\uC18D",
  "\uC9C1\uC704",
  "\uC9C1\uAE09",
  "\uBD80\uC11C",
  "\uC774\uBA54\uC77C",
  "\uD329\uC2A4",
  "\uD559\uAD50",
  "\uD559\uB144",
  "\uBC18",
  "\uBC88\uD638",
  "\uC2E0\uCCAD\uC778",
  "\uB300\uD45C\uC790",
  "\uB2F4\uB2F9\uC790",
  "\uC791\uC131\uC790",
  "\uD655\uC778\uC790",
  "\uC2B9\uC778\uC790",
  "\uC77C\uC2DC",
  "\uB0A0\uC9DC",
  "\uAE30\uAC04",
  "\uC7A5\uC18C",
  "\uBAA9\uC801",
  "\uC0AC\uC720",
  "\uBE44\uACE0",
  "\uAE08\uC561",
  "\uC218\uB7C9",
  "\uB2E8\uAC00",
  "\uD569\uACC4",
  "\uACC4",
  "\uC18C\uACC4",
  "\uB4F1\uB85D\uAE30\uC900\uC9C0",
  "\uBCF8\uC801",
  "\uC704\uC784\uC778",
  "\uCCAD\uAD6C\uC0AC\uC720",
  "\uC18C\uBA85\uC790\uB8CC"
]);
function isLabelCell(text) {
  const trimmed = text.trim().replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰*※]+$/g, "").trim();
  if (!trimmed || trimmed.length > 30) return false;
  for (const kw of LABEL_KEYWORDS) {
    if (trimmed.includes(kw)) return true;
  }
  if (/^[가-힣\s()（）·:：]+$/.test(trimmed) && trimmed.replace(/\s/g, "").length >= 2 && trimmed.replace(/\s/g, "").length <= 8 && !/\d/.test(trimmed)) return true;
  if (/^[가-힣A-Za-z\s]+[:：]$/.test(trimmed)) return true;
  return false;
}
function extractFormFields(blocks) {
  const fields = [];
  let totalTables = 0;
  let formTables = 0;
  for (const block of blocks) {
    if (block.type !== "table" || !block.table) continue;
    totalTables++;
    const tableFields = extractFromTable(block.table);
    if (tableFields.length > 0) {
      formTables++;
      fields.push(...tableFields);
    }
  }
  for (const block of blocks) {
    if (block.type === "paragraph" && block.text) {
      const inlineFields = extractInlineFields(block.text);
      fields.push(...inlineFields);
    }
  }
  const confidence = totalTables > 0 ? formTables / totalTables : fields.length > 0 ? 0.3 : 0;
  return { fields, confidence: Math.min(confidence, 1) };
}
function extractFromTable(table) {
  const fields = [];
  if (table.cols >= 2) {
    for (let r = 0; r < table.rows; r++) {
      for (let c = 0; c < table.cols - 1; c++) {
        const labelCell = table.cells[r][c];
        const valueCell = table.cells[r][c + 1];
        if (isLabelCell(labelCell.text)) {
          fields.push({
            label: labelCell.text.trim().replace(/[:：]\s*$/, ""),
            value: valueCell.text.trim(),
            row: r,
            col: c
          });
        }
      }
    }
  }
  if (fields.length === 0 && table.rows >= 2 && table.cols >= 2) {
    const headerRow = table.cells[0];
    const allLabels = headerRow.every((cell) => {
      const t = cell.text.trim();
      return t.length > 0 && t.length <= 20;
    });
    if (allLabels) {
      for (let r = 1; r < table.rows; r++) {
        for (let c = 0; c < table.cols; c++) {
          const label = headerRow[c].text.trim();
          const value = table.cells[r][c].text.trim();
          if (label && value) {
            fields.push({ label, value, row: r, col: c });
          }
        }
      }
    }
  }
  return fields;
}
function extractInlineFields(text) {
  const fields = [];
  const pattern = /([가-힣A-Za-z]{2,10})\s*[:：]\s*([^\n,;]{1,100})/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const label = match[1].trim();
    const value = match[2].trim();
    if (value) {
      fields.push({ label, value, row: -1, col: -1 });
    }
  }
  return fields;
}

// src/form/match.ts
function normalizeLabel(label) {
  return label.trim().replace(/[:：\s()（）·]/g, "");
}
function findMatchingKey(cellLabel, values) {
  if (values.has(cellLabel)) return cellLabel;
  let bestKey;
  let bestLen = 0;
  for (const key of values.keys()) {
    if (cellLabel.startsWith(key)) {
      if (key.length >= cellLabel.length * 0.6 && key.length > bestLen) {
        bestLen = key.length;
        bestKey = key;
      }
    } else if (key.startsWith(cellLabel)) {
      if (cellLabel.length >= key.length * 0.6 && cellLabel.length > bestLen) {
        bestLen = cellLabel.length;
        bestKey = key;
      }
    }
  }
  return bestKey;
}
function isKeywordLabel(text) {
  const trimmed = text.trim().replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰*※]+$/g, "").trim();
  if (!trimmed || trimmed.length > 15) return false;
  for (const kw of LABEL_KEYWORDS) {
    if (trimmed.includes(kw)) return true;
  }
  return false;
}
function fillInCellPatterns(cellText, values, matchedLabels) {
  let text = cellText;
  const matches = [];
  text = text.replace(
    /([가-힣A-Za-z]+)\(\s{1,}\)([가-힣A-Za-z]*)/g,
    (match, prefix, suffix) => {
      const label = prefix + suffix;
      const normalizedLabel = normalizeLabel(label);
      const matchKey = values.has(normalizedLabel) ? normalizedLabel : values.has(normalizeLabel(prefix)) ? normalizeLabel(prefix) : void 0;
      if (matchKey === void 0) return match;
      const newValue = values.get(matchKey);
      matchedLabels.add(matchKey);
      matches.push({ key: matchKey, label, value: newValue });
      return `${prefix}(${newValue})${suffix}`;
    }
  );
  text = text.replace(
    /□([가-힣A-Za-z]+)/g,
    (match, keyword) => {
      const normalizedKw = normalizeLabel(keyword);
      const matchKey = values.has(normalizedKw) ? normalizedKw : void 0;
      if (matchKey === void 0) return match;
      const val = values.get(matchKey);
      const isTruthy = ["\u2611", "\u2713", "\u2714", "v", "V", "true", "1", "yes", "o", "O"].includes(val.trim()) || val.trim() === "";
      if (!isTruthy) return match;
      matchedLabels.add(matchKey);
      matches.push({ key: matchKey, label: `\u25A1${keyword}`, value: "\u2611" });
      return `\u2611${keyword}`;
    }
  );
  text = text.replace(
    /\(([가-힣A-Za-z]+)[:：]\s{1,}\)/g,
    (match, keyword) => {
      const normalizedKw = normalizeLabel(keyword);
      const matchKey = values.has(normalizedKw) ? normalizedKw : void 0;
      if (matchKey === void 0) return match;
      const newValue = values.get(matchKey);
      matchedLabels.add(matchKey);
      matches.push({ key: matchKey, label: keyword, value: newValue });
      return `(${keyword}\uFF1A${newValue})`;
    }
  );
  return matches.length > 0 ? { text, matches } : null;
}
function normalizeValues(values) {
  const map = /* @__PURE__ */ new Map();
  for (const [label, value] of Object.entries(values)) {
    map.set(normalizeLabel(label), value);
  }
  return map;
}
function resolveUnmatched(normalizedValues, matchedLabels, originalValues) {
  return [...normalizedValues.keys()].filter((k) => !matchedLabels.has(k)).map((k) => {
    for (const orig of Object.keys(originalValues)) {
      if (normalizeLabel(orig) === k) return orig;
    }
    return k;
  });
}

// src/form/filler.ts
function fillFormFields(blocks, values) {
  const cloned = structuredClone(blocks);
  const filled = [];
  const matchedLabels = /* @__PURE__ */ new Set();
  const normalizedValues = normalizeValues(values);
  const patternFilledCells = /* @__PURE__ */ new Set();
  for (const block of cloned) {
    if (block.type !== "table" || !block.table) continue;
    for (let r = 0; r < block.table.rows; r++) {
      for (let c = 0; c < block.table.cols; c++) {
        const cell = block.table.cells[r]?.[c];
        if (!cell) continue;
        const result = fillInCellPatterns(cell.text, normalizedValues, matchedLabels);
        if (result) {
          cell.text = result.text;
          patternFilledCells.add(`${r},${c}`);
          for (const m of result.matches) {
            filled.push({ label: m.label, value: m.value, row: r, col: c });
          }
        }
      }
    }
  }
  for (const block of cloned) {
    if (block.type !== "table" || !block.table) continue;
    fillTable(block.table, normalizedValues, filled, matchedLabels, patternFilledCells);
  }
  for (const block of cloned) {
    if (block.type !== "paragraph" || !block.text) continue;
    const newText = fillInlineFields(block.text, normalizedValues, filled, matchedLabels);
    if (newText !== block.text) block.text = newText;
  }
  const unmatched = resolveUnmatched(normalizedValues, matchedLabels, values);
  return { blocks: cloned, filled, unmatched };
}
function fillTable(table, values, filled, matchedLabels, patternFilledCells) {
  if (table.cols < 2) return;
  for (let r = 0; r < table.rows; r++) {
    for (let c = 0; c < table.cols - 1; c++) {
      const labelCell = table.cells[r][c];
      const valueCell = table.cells[r][c + 1];
      if (!labelCell || !valueCell) continue;
      if (!isLabelCell(labelCell.text)) continue;
      if (isKeywordLabel(valueCell.text)) continue;
      const normalizedCellLabel = normalizeLabel(labelCell.text);
      if (!normalizedCellLabel) continue;
      const matchKey = findMatchingKey(normalizedCellLabel, values);
      if (matchKey === void 0) continue;
      const newValue = values.get(matchKey);
      if (patternFilledCells?.has(`${r},${c + 1}`)) {
        valueCell.text = newValue + " " + valueCell.text;
      } else {
        valueCell.text = newValue;
      }
      matchedLabels.add(matchKey);
      filled.push({
        label: labelCell.text.trim().replace(/[:：]\s*$/, ""),
        value: newValue,
        row: r,
        col: c
      });
    }
  }
  if (table.rows >= 2 && table.cols >= 2) {
    const headerRow = table.cells[0];
    const allLabels = headerRow.every((cell) => {
      const t = cell.text.trim();
      return t.length > 0 && t.length <= 20 && isLabelCell(t);
    });
    if (!allLabels) return;
    for (let r = 1; r < table.rows; r++) {
      for (let c = 0; c < table.cols; c++) {
        const headerLabel = normalizeLabel(headerRow[c].text);
        const matchKey = findMatchingKey(headerLabel, values);
        if (matchKey === void 0) continue;
        if (matchedLabels.has(matchKey)) continue;
        const newValue = values.get(matchKey);
        table.cells[r][c].text = newValue;
        matchedLabels.add(matchKey);
        filled.push({
          label: headerRow[c].text.trim(),
          value: newValue,
          row: r,
          col: c
        });
      }
    }
  }
}
function fillInlineFields(text, values, filled, matchedLabels) {
  return text.replace(
    /([가-힣A-Za-z]{2,10})\s*[:：]\s*([^\n,;]{0,100})/g,
    (match, rawLabel, _oldValue) => {
      const normalized = normalizeLabel(rawLabel);
      const matchKey = findMatchingKey(normalized, values);
      if (matchKey === void 0) return match;
      const newValue = values.get(matchKey);
      matchedLabels.add(matchKey);
      filled.push({
        label: rawLabel.trim(),
        value: newValue,
        row: -1,
        col: -1
      });
      return `${rawLabel}: ${newValue}`;
    }
  );
}

// src/form/filler-hwpx.ts
var import_jszip2 = __toESM(require_lib(), 1);
var import_xmldom2 = __toESM(require_lib2(), 1);
async function fillHwpx(hwpxBuffer, values) {
  const zip = await import_jszip2.default.loadAsync(hwpxBuffer);
  const filled = [];
  const matchedLabels = /* @__PURE__ */ new Set();
  const normalizedValues = normalizeValues(values);
  const sectionFiles = Object.keys(zip.files).filter((name) => /[Ss]ection\d+\.xml$/i.test(name)).sort();
  if (sectionFiles.length === 0) {
    throw new KordocError("HWPX\uC5D0\uC11C \uC139\uC158 \uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  const xmlParser = new import_xmldom2.DOMParser();
  const xmlSerializer = new import_xmldom2.XMLSerializer();
  for (const sectionPath of sectionFiles) {
    const zipEntry = zip.file(sectionPath);
    if (!zipEntry) continue;
    const rawXml = await zipEntry.async("text");
    const doc = xmlParser.parseFromString(stripDtd(rawXml), "text/xml");
    if (!doc.documentElement) continue;
    let modified = false;
    const tables = findAllElements(doc.documentElement, "tbl");
    const cellPatternApplied = /* @__PURE__ */ new Set();
    for (const tblEl of tables) {
      const allCells = findAllElements(tblEl, "tc");
      for (const tcEl of allCells) {
        const tNodes = collectCellTextNodes(tcEl);
        const fullText = tNodes.map((n) => n.text).join("");
        const result = fillInCellPatterns(fullText, normalizedValues, matchedLabels);
        if (!result) continue;
        applyTextReplacements(tNodes, fullText, result.text);
        cellPatternApplied.add(tcEl);
        for (const m of result.matches) {
          filled.push({ label: m.label, value: m.value, row: -1, col: -1 });
        }
        modified = true;
      }
    }
    for (const tblEl of tables) {
      const rows = findDirectChildren(tblEl, "tr");
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const trEl = rows[rowIdx];
        const cells = findDirectChildren(trEl, "tc");
        for (let colIdx = 0; colIdx < cells.length - 1; colIdx++) {
          const labelText = extractCellText(cells[colIdx]);
          if (!isLabelCell(labelText)) continue;
          const valueCell = cells[colIdx + 1];
          const valueText = extractCellText(valueCell);
          if (isKeywordLabel(valueText)) continue;
          const normalizedCellLabel = normalizeLabel(labelText);
          if (!normalizedCellLabel) continue;
          const matchKey = findMatchingKey(normalizedCellLabel, normalizedValues);
          if (matchKey === void 0) continue;
          const newValue = normalizedValues.get(matchKey);
          if (cellPatternApplied.has(valueCell)) {
            prependCellText(valueCell, newValue);
          } else {
            replaceCellText(valueCell, newValue);
          }
          matchedLabels.add(matchKey);
          filled.push({
            label: labelText.trim().replace(/[:：]\s*$/, ""),
            value: newValue,
            row: rowIdx,
            col: colIdx
          });
          modified = true;
        }
      }
      if (rows.length >= 2) {
        const headerCells = findDirectChildren(rows[0], "tc");
        const allLabels = headerCells.every((cell) => {
          const t = extractCellText(cell).trim();
          return t.length > 0 && t.length <= 20 && isLabelCell(t);
        });
        if (allLabels) {
          for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
            const dataCells = findDirectChildren(rows[rowIdx], "tc");
            for (let colIdx = 0; colIdx < Math.min(headerCells.length, dataCells.length); colIdx++) {
              const headerLabel = normalizeLabel(extractCellText(headerCells[colIdx]));
              const matchKey = findMatchingKey(headerLabel, normalizedValues);
              if (matchKey === void 0) continue;
              if (matchedLabels.has(matchKey)) continue;
              const newValue = normalizedValues.get(matchKey);
              replaceCellText(dataCells[colIdx], newValue);
              matchedLabels.add(matchKey);
              filled.push({
                label: extractCellText(headerCells[colIdx]).trim(),
                value: newValue,
                row: rowIdx,
                col: colIdx
              });
              modified = true;
            }
          }
        }
      }
    }
    const allParagraphs = findAllElements(doc.documentElement, "p");
    for (const pEl of allParagraphs) {
      if (isInsideTable(pEl)) continue;
      const tNodes = collectTextNodes(pEl);
      const fullText = tNodes.map((n) => n.text).join("");
      const pattern = /([가-힣A-Za-z]{2,10})\s*[:：]\s*([^\n,;]{0,100})/g;
      let match;
      while ((match = pattern.exec(fullText)) !== null) {
        const rawLabel = match[1];
        const normalized = normalizeLabel(rawLabel);
        const matchKey = findMatchingKey(normalized, normalizedValues);
        if (matchKey === void 0) continue;
        const newValue = normalizedValues.get(matchKey);
        const valueStart = match.index + match[0].length - match[2].length;
        const valueEnd = match.index + match[0].length;
        replaceTextRange(tNodes, valueStart, valueEnd, newValue);
        matchedLabels.add(matchKey);
        filled.push({ label: rawLabel.trim(), value: newValue, row: -1, col: -1 });
        modified = true;
        break;
      }
    }
    if (modified) {
      const newXml = xmlSerializer.serializeToString(doc);
      zip.file(sectionPath, newXml);
    }
  }
  const unmatched = resolveUnmatched(normalizedValues, matchedLabels, values);
  const buffer = await zip.generateAsync({ type: "arraybuffer" });
  return { buffer, filled, unmatched };
}
function localName(el) {
  return (el.tagName || el.localName || "").replace(/^[^:]+:/, "");
}
function findAllElements(node, tagLocalName) {
  const result = [];
  const walk = (n) => {
    const children = n.childNodes;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType !== 1) continue;
      if (localName(child) === tagLocalName) result.push(child);
      walk(child);
    }
  };
  walk(node);
  return result;
}
function findDirectChildren(parent, tagLocalName) {
  const result = [];
  const children = parent.childNodes;
  if (!children) return result;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === 1 && localName(child) === tagLocalName) {
      result.push(child);
    }
  }
  return result;
}
function isInsideTable(el) {
  let parent = el.parentNode;
  while (parent) {
    if (parent.nodeType === 1 && localName(parent) === "tbl") return true;
    parent = parent.parentNode;
  }
  return false;
}
function extractCellText(tcEl) {
  const parts = [];
  const walk = (node) => {
    const children = node.childNodes;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType === 3) {
        parts.push(child.textContent || "");
      } else if (child.nodeType === 1) {
        const tag = localName(child);
        if (tag === "t") walk(child);
        else if (tag === "run" || tag === "r" || tag === "p" || tag === "subList") walk(child);
        else if (tag === "tab") parts.push("	");
        else if (tag === "br") parts.push("\n");
      }
    }
  };
  walk(tcEl);
  return parts.join("");
}
function prependCellText(tcEl, text) {
  const tElements = findAllElements(tcEl, "t");
  if (tElements.length === 0) return;
  const firstT = tElements[0];
  const existing = firstT.textContent || "";
  clearChildren(firstT);
  firstT.appendChild(firstT.ownerDocument.createTextNode(text + " " + existing));
}
function replaceCellText(tcEl, newValue) {
  const paragraphs = findAllElements(tcEl, "p");
  if (paragraphs.length === 0) return;
  const firstP = paragraphs[0];
  const runs = findAllElements(firstP, "run").concat(findAllElements(firstP, "r"));
  if (runs.length > 0) {
    setRunText(runs[0], newValue);
    for (let i = 1; i < runs.length; i++) {
      setRunText(runs[i], "");
    }
  } else {
    const tElements = findAllElements(firstP, "t");
    if (tElements.length > 0) {
      clearChildren(tElements[0]);
      tElements[0].appendChild(tElements[0].ownerDocument.createTextNode(newValue));
      for (let i = 1; i < tElements.length; i++) {
        clearChildren(tElements[i]);
      }
    }
  }
  for (let i = 1; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    if (p.parentNode) {
      const pRuns = findAllElements(p, "run").concat(findAllElements(p, "r"));
      for (const run of pRuns) setRunText(run, "");
      const pTs = findAllElements(p, "t");
      for (const t of pTs) clearChildren(t);
    }
  }
}
function setRunText(runEl, text) {
  const tElements = findAllElements(runEl, "t");
  if (tElements.length > 0) {
    clearChildren(tElements[0]);
    tElements[0].appendChild(tElements[0].ownerDocument.createTextNode(text));
    for (let i = 1; i < tElements.length; i++) {
      clearChildren(tElements[i]);
    }
  }
}
function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}
function collectTextNodes(pEl) {
  const tElements = findAllElements(pEl, "t");
  const result = [];
  let offset = 0;
  for (const t of tElements) {
    const text = t.textContent || "";
    result.push({ element: t, text, offset });
    offset += text.length;
  }
  return result;
}
function replaceTextRange(tNodes, globalStart, globalEnd, newValue) {
  let replaced = false;
  for (const node of tNodes) {
    const nodeStart = node.offset;
    const nodeEnd = node.offset + node.text.length;
    if (nodeEnd <= globalStart || nodeStart >= globalEnd) continue;
    const localStart = Math.max(0, globalStart - nodeStart);
    const localEnd = Math.min(node.text.length, globalEnd - nodeStart);
    if (!replaced) {
      const before = node.text.slice(0, localStart);
      const after = node.text.slice(localEnd);
      const newText = before + newValue + after;
      clearChildren(node.element);
      node.element.appendChild(node.element.ownerDocument.createTextNode(newText));
      replaced = true;
    } else {
      const before = node.text.slice(0, localStart);
      const after = node.text.slice(localEnd);
      const newText = before + after;
      clearChildren(node.element);
      node.element.appendChild(node.element.ownerDocument.createTextNode(newText));
    }
  }
}
function collectCellTextNodes(tcEl) {
  const tElements = findAllElements(tcEl, "t");
  const result = [];
  let offset = 0;
  for (const t of tElements) {
    const text = t.textContent || "";
    result.push({ element: t, text, offset });
    offset += text.length;
  }
  return result;
}
function applyTextReplacements(tNodes, originalFull, replacedFull) {
  if (originalFull === replacedFull) return;
  if (tNodes.length === 1) {
    clearChildren(tNodes[0].element);
    tNodes[0].element.appendChild(
      tNodes[0].element.ownerDocument.createTextNode(replacedFull)
    );
    return;
  }
  let diffStart = 0;
  while (diffStart < originalFull.length && diffStart < replacedFull.length && originalFull[diffStart] === replacedFull[diffStart]) {
    diffStart++;
  }
  let diffEndOrig = originalFull.length;
  let diffEndRepl = replacedFull.length;
  while (diffEndOrig > diffStart && diffEndRepl > diffStart && originalFull[diffEndOrig - 1] === replacedFull[diffEndRepl - 1]) {
    diffEndOrig--;
    diffEndRepl--;
  }
  const newPart = replacedFull.slice(diffStart, diffEndRepl);
  replaceTextRange(tNodes, diffStart, diffEndOrig, newPart);
}

// src/hwpx/generator.ts
var import_jszip3 = __toESM(require_lib(), 1);
var NS_SECTION = "http://www.hancom.co.kr/hwpml/2011/section";
var NS_PARA = "http://www.hancom.co.kr/hwpml/2011/paragraph";
var NS_HEAD = "http://www.hancom.co.kr/hwpml/2011/head";
var NS_OPF = "http://www.idpf.org/2007/opf/";
var NS_HPF = "http://www.hancom.co.kr/schema/2011/hpf";
var NS_OCF = "urn:oasis:names:tc:opendocument:xmlns:container";
var CHAR_NORMAL = 0;
var CHAR_BOLD = 1;
var CHAR_ITALIC = 2;
var CHAR_BOLD_ITALIC = 3;
var CHAR_CODE = 4;
var CHAR_H1 = 5;
var CHAR_H2 = 6;
var CHAR_H3 = 7;
var CHAR_H4 = 8;
var PARA_NORMAL = 0;
var PARA_H1 = 1;
var PARA_H2 = 2;
var PARA_H3 = 3;
var PARA_H4 = 4;
var PARA_CODE = 5;
var PARA_QUOTE = 6;
var PARA_LIST = 7;
async function markdownToHwpx(markdown) {
  const blocks = parseMarkdownToBlocks(markdown);
  const sectionXml = blocksToSectionXml(blocks);
  const zip = new import_jszip3.default();
  zip.file("mimetype", "application/hwp+zip", { compression: "STORE" });
  zip.file("META-INF/container.xml", generateContainerXml());
  zip.file("Contents/content.hpf", generateManifest());
  zip.file("Contents/header.xml", generateHeaderXml());
  zip.file("Contents/section0.xml", sectionXml);
  zip.file("Preview/PrvText.txt", buildPrvText(blocks));
  return await zip.generateAsync({ type: "arraybuffer" });
}
function buildPrvText(blocks) {
  const lines = [];
  let bytes = 0;
  for (const b of blocks) {
    const text = b.text || (b.rows ? b.rows.map((r) => r.join(" ")).join("\n") : "");
    if (!text) continue;
    lines.push(text);
    bytes += text.length * 3;
    if (bytes > 1024) break;
  }
  return lines.join("\n").slice(0, 1024);
}
function parseMarkdownToBlocks(md) {
  const lines = md.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const fenceMatch = line.match(/^(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      const lang = fenceMatch[2].trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(fence)) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ type: "code_block", text: codeLines.join("\n"), lang });
      continue;
    }
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({ type: "heading", text: headingMatch[2].trim(), level: headingMatch[1].length });
      i++;
      continue;
    }
    if (line.trimStart().startsWith("|")) {
      const tableRows = [];
      while (i < lines.length && lines[i].trimStart().startsWith("|")) {
        const row = lines[i];
        if (/^[\s|:\-]+$/.test(row)) {
          i++;
          continue;
        }
        const cells = row.split("|").slice(1, -1).map((c) => c.trim());
        if (cells.length > 0) tableRows.push(cells);
        i++;
      }
      if (tableRows.length > 0) blocks.push({ type: "table", rows: tableRows });
      continue;
    }
    if (line.trimStart().startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && (lines[i].trimStart().startsWith("> ") || lines[i].trimStart().startsWith(">"))) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      for (const ql of quoteLines) {
        blocks.push({ type: "blockquote", text: ql.trim() || "" });
      }
      continue;
    }
    const listMatch = line.match(/^(\s*)([-*+]|\d+[.)]) (.+)$/);
    if (listMatch) {
      const indent = Math.floor(listMatch[1].length / 2);
      const ordered = /\d/.test(listMatch[2]);
      blocks.push({ type: "list_item", text: listMatch[3].trim(), ordered, indent });
      i++;
      continue;
    }
    blocks.push({ type: "paragraph", text: line.trim() });
    i++;
  }
  return blocks;
}
function parseInlineMarkdown(text) {
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  text = text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, t, u) => t || u);
  text = text.replace(/~~([^~]+)~~/g, "$1");
  const spans = [];
  const regex = /(`[^`]+`|\*{3}[^*]+\*{3}|\*{2}[^*]+\*{2}|\*[^*]+\*|_{2}[^_]+_{2}|_[^_]+_)/g;
  let lastIdx = 0;
  for (const match of text.matchAll(regex)) {
    const idx = match.index;
    if (idx > lastIdx) {
      spans.push({ text: text.slice(lastIdx, idx), bold: false, italic: false, code: false });
    }
    const raw = match[0];
    if (raw.startsWith("`")) {
      spans.push({ text: raw.slice(1, -1), bold: false, italic: false, code: true });
    } else if (raw.startsWith("***") || raw.startsWith("___")) {
      spans.push({ text: raw.slice(3, -3), bold: true, italic: true, code: false });
    } else if (raw.startsWith("**") || raw.startsWith("__")) {
      spans.push({ text: raw.slice(2, -2), bold: true, italic: false, code: false });
    } else {
      spans.push({ text: raw.slice(1, -1), bold: false, italic: true, code: false });
    }
    lastIdx = idx + raw.length;
  }
  if (lastIdx < text.length) {
    spans.push({ text: text.slice(lastIdx), bold: false, italic: false, code: false });
  }
  if (spans.length === 0) {
    spans.push({ text, bold: false, italic: false, code: false });
  }
  return spans;
}
function spanToCharPrId(span) {
  if (span.code) return CHAR_CODE;
  if (span.bold && span.italic) return CHAR_BOLD_ITALIC;
  if (span.bold) return CHAR_BOLD;
  if (span.italic) return CHAR_ITALIC;
  return CHAR_NORMAL;
}
function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function generateRuns(text, defaultCharPr = CHAR_NORMAL) {
  const spans = parseInlineMarkdown(text);
  return spans.map((span) => {
    const charId = span.code || span.bold || span.italic ? spanToCharPrId(span) : defaultCharPr;
    return `<hp:run charPrIDRef="${charId}"><hp:t>${escapeXml(span.text)}</hp:t></hp:run>`;
  }).join("");
}
function generateParagraph(text, paraPrId = PARA_NORMAL, charPrId = CHAR_NORMAL) {
  if (paraPrId === PARA_CODE) {
    return `<hp:p paraPrIDRef="${paraPrId}" styleIDRef="0"><hp:run charPrIDRef="${CHAR_CODE}"><hp:t>${escapeXml(text)}</hp:t></hp:run></hp:p>`;
  }
  const runs = generateRuns(text, charPrId);
  return `<hp:p paraPrIDRef="${paraPrId}" styleIDRef="0">${runs}</hp:p>`;
}
function headingParaPrId(level) {
  if (level === 1) return PARA_H1;
  if (level === 2) return PARA_H2;
  if (level === 3) return PARA_H3;
  return PARA_H4;
}
function headingCharPrId(level) {
  if (level === 1) return CHAR_H1;
  if (level === 2) return CHAR_H2;
  if (level === 3) return CHAR_H3;
  return CHAR_H4;
}
function generateContainerXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<ocf:container xmlns:ocf="${NS_OCF}" xmlns:hpf="${NS_HPF}">
  <ocf:rootfiles>
    <ocf:rootfile full-path="Contents/content.hpf" media-type="application/hwpml-package+xml"/>
  </ocf:rootfiles>
</ocf:container>`;
}
function generateManifest() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<opf:package xmlns:opf="${NS_OPF}" xmlns:hpf="${NS_HPF}" xmlns:hh="${NS_HEAD}">
  <opf:manifest>
    <opf:item id="header" href="Contents/header.xml" media-type="application/xml"/>
    <opf:item id="section0" href="Contents/section0.xml" media-type="application/xml"/>
  </opf:manifest>
  <opf:spine>
    <opf:itemref idref="header" linear="no"/>
    <opf:itemref idref="section0" linear="yes"/>
  </opf:spine>
</opf:package>`;
}
function charPr(id, height, bold, italic, fontId = 0) {
  const boldAttr = bold ? ` bold="1"` : "";
  const italicAttr = italic ? ` italic="1"` : "";
  const effFont = bold ? 2 : fontId;
  return `      <hh:charPr id="${id}" height="${height}" textColor="#000000" shadeColor="none" useFontSpace="0" useKerning="0" symMark="NONE" borderFillIDRef="0"${boldAttr}${italicAttr}>
        <hh:fontRef hangul="${effFont}" latin="${effFont}" hanja="${effFont}" japanese="${effFont}" other="${effFont}" symbol="${effFont}" user="${effFont}"/>
        <hh:ratio hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:spacing hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
        <hh:relSz hangul="100" latin="100" hanja="100" japanese="100" other="100" symbol="100" user="100"/>
        <hh:offset hangul="0" latin="0" hanja="0" japanese="0" other="0" symbol="0" user="0"/>
      </hh:charPr>`;
}
function paraPr(id, opts = {}) {
  const { align = "JUSTIFY", spaceBefore = 0, spaceAfter = 0, lineSpacing = 160, indent = 0 } = opts;
  return `      <hh:paraPr id="${id}" tabPrIDRef="0" condense="0" fontLineHeight="0" snapToGrid="1" suppressLineNumbers="0" checked="0" textDir="AUTO">
        <hh:align horizontal="${align}" vertical="BASELINE"/>
        <hh:heading type="NONE" idRef="0" level="0"/>
        <hh:breakSetting breakLatinWord="KEEP_WORD" breakNonLatinWord="BREAK_WORD" widowOrphan="0" keepWithNext="0" keepLines="0" pageBreakBefore="0" lineWrap="BREAK"/>
        <hh:autoSpacing eAsianEng="0" eAsianNum="0"/>
        <hh:margin indent="${indent}" left="0" right="0" prev="${spaceBefore}" next="${spaceAfter}"/>
        <hh:lineSpacing type="PERCENT" value="${lineSpacing}"/>
        <hh:border borderFillIDRef="0" offsetLeft="0" offsetRight="0" offsetTop="0" offsetBottom="0" connect="0" ignoreMargin="0"/>
      </hh:paraPr>`;
}
function generateHeaderXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<hh:head xmlns:hh="${NS_HEAD}" xmlns:hp="${NS_PARA}" version="1.4" secCnt="1">
  <hh:beginNum page="1" footnote="1" endnote="1" pic="1" tbl="1" equation="1"/>
  <hh:refList>
    <hh:fontfaces itemCnt="7">
      <hh:fontface lang="HANGUL" fontCnt="3">
        <hh:font id="0" face="\uD568\uCD08\uB86C\uBC14\uD0D5" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
        <hh:font id="1" face="\uD568\uCD08\uB86C\uB3CB\uC6C0" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
        <hh:font id="2" face="HY\uACAC\uACE0\uB515" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="9" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="LATIN" fontCnt="3">
        <hh:font id="0" face="Times New Roman" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_OLDSTYLE" weight="5" proportion="4" contrast="2" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="4"/>
        </hh:font>
        <hh:font id="1" face="Consolas" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_MODERN" weight="5" proportion="0" contrast="0" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="0"/>
        </hh:font>
        <hh:font id="2" face="Arial Black" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="9" proportion="0" contrast="0" strokeVariation="0" armStyle="0" letterform="0" midline="0" xHeight="0"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="HANJA" fontCnt="1">
        <hh:font id="0" face="\uD568\uCD08\uB86C\uBC14\uD0D5" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="4" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="JAPANESE" fontCnt="1">
        <hh:font id="0" face="\uAD74\uB9BC" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="OTHER" fontCnt="1">
        <hh:font id="0" face="\uAD74\uB9BC" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="SYMBOL" fontCnt="1">
        <hh:font id="0" face="Symbol" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
      <hh:fontface lang="USER" fontCnt="1">
        <hh:font id="0" face="\uAD74\uB9BC" type="TTF" isEmbedded="0">
          <hh:typeInfo familyType="FCAT_GOTHIC" weight="6" proportion="0" contrast="0" strokeVariation="1" armStyle="1" letterform="1" midline="1" xHeight="1"/>
        </hh:font>
      </hh:fontface>
    </hh:fontfaces>
    <hh:borderFills itemCnt="2">
      <hh:borderFill id="0" threeD="0" shadow="0" centerLine="0" breakCellSeparateLine="0">
        <hh:slash type="NONE" Crooked="0" isCounter="0"/>
        <hh:backSlash type="NONE" Crooked="0" isCounter="0"/>
        <hh:leftBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:rightBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:topBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:bottomBorder type="NONE" width="0.1 mm" color="#000000"/>
        <hh:diagonal type="NONE" width="0.1 mm" color="#000000"/>
        <hh:fillInfo/>
      </hh:borderFill>
      <hh:borderFill id="1" threeD="0" shadow="0" centerLine="0" breakCellSeparateLine="0">
        <hh:slash type="NONE" Crooked="0" isCounter="0"/>
        <hh:backSlash type="NONE" Crooked="0" isCounter="0"/>
        <hh:leftBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:rightBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:topBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:bottomBorder type="SOLID" width="0.12 mm" color="#000000"/>
        <hh:diagonal type="NONE" width="0.1 mm" color="#000000"/>
        <hh:fillInfo/>
      </hh:borderFill>
    </hh:borderFills>
    <hh:charProperties itemCnt="9">
${charPr(0, 1e3, false, false)}
${charPr(1, 1e3, true, false)}
${charPr(2, 1e3, false, true)}
${charPr(3, 1e3, true, true)}
${charPr(4, 900, false, false, 1)}
${charPr(5, 1800, true, false, 1)}
${charPr(6, 1400, true, false, 1)}
${charPr(7, 1200, true, false, 1)}
${charPr(8, 1100, true, false, 1)}
    </hh:charProperties>
    <hh:tabProperties itemCnt="0"/>
    <hh:numberings itemCnt="0"/>
    <hh:bullets itemCnt="0"/>
    <hh:paraProperties itemCnt="8">
${paraPr(0)}
${paraPr(1, { align: "LEFT", spaceBefore: 800, spaceAfter: 200, lineSpacing: 180 })}
${paraPr(2, { align: "LEFT", spaceBefore: 600, spaceAfter: 150, lineSpacing: 170 })}
${paraPr(3, { align: "LEFT", spaceBefore: 400, spaceAfter: 100, lineSpacing: 160 })}
${paraPr(4, { align: "LEFT", spaceBefore: 300, spaceAfter: 100, lineSpacing: 160 })}
${paraPr(5, { align: "LEFT", lineSpacing: 130, indent: 400 })}
${paraPr(6, { align: "LEFT", lineSpacing: 150, indent: 600 })}
${paraPr(7, { align: "LEFT", lineSpacing: 160, indent: 600 })}
    </hh:paraProperties>
    <hh:styles itemCnt="1">
      <hh:style id="0" type="PARA" name="\uBC14\uD0D5\uAE00" engName="Normal" paraPrIDRef="0" charPrIDRef="0" nextStyleIDRef="0" langIDRef="1042" lockForm="0"/>
    </hh:styles>
  </hh:refList>
  <hh:compatibleDocument targetProgram="HWP2018"/>
</hh:head>`;
}
function generateSecPr() {
  return `<hp:secPr textDirection="HORIZONTAL" spaceColumns="1134" tabStop="8000" outlineShapeIDRef="0" memoShapeIDRef="0" textVerticalWidthHead="0" masterPageCnt="0"><hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0"/><hp:startNum pageStartsOn="BOTH" page="0" pic="0" tbl="0" equation="0"/><hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" showLineNumber="0"/><hp:pagePr landscape="WIDELY" width="59528" height="84188" gutterType="LEFT_ONLY"><hp:margin header="2835" footer="2835" gutter="0" left="5670" right="4252" top="8504" bottom="4252"/></hp:pagePr><hp:footNotePr><hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/><hp:noteLine length="-1" type="SOLID" width="0.12 mm" color="#000000"/><hp:noteSpacing betweenNotes="283" belowLine="567" aboveLine="850"/><hp:numbering type="CONTINUOUS" newNum="1"/><hp:placement place="EACH_COLUMN" beneathText="0"/></hp:footNotePr><hp:endNotePr><hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/><hp:noteLine length="14692344" type="SOLID" width="0.12 mm" color="#000000"/><hp:noteSpacing betweenNotes="0" belowLine="567" aboveLine="850"/><hp:numbering type="CONTINUOUS" newNum="1"/><hp:placement place="END_OF_DOCUMENT" beneathText="0"/></hp:endNotePr></hp:secPr>`;
}
var TABLE_ID_BASE = 1e3;
var tableIdCounter = TABLE_ID_BASE;
function nextTableId() {
  return ++tableIdCounter;
}
function generateTable(rows) {
  const rowCnt = rows.length;
  const colCnt = Math.max(...rows.map((r) => r.length), 1);
  const cellW = Math.floor(44e3 / colCnt);
  const cellH = 1500;
  const tblW = cellW * colCnt;
  const tblH = cellH * rowCnt;
  const tblId = nextTableId();
  const trElements = rows.map((row, rowIdx) => {
    const cells = row.length < colCnt ? [...row, ...Array(colCnt - row.length).fill("")] : row;
    const tdElements = cells.map((cell, colIdx) => {
      const runs = generateRuns(cell);
      const p = `<hp:p paraPrIDRef="0" styleIDRef="0">${runs}</hp:p>`;
      return `<hp:tc name="" header="${rowIdx === 0 ? 1 : 0}" hasMargin="0" protect="0" editable="1" dirty="0" borderFillIDRef="1"><hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="TOP" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">${p}</hp:subList><hp:cellAddr colAddr="${colIdx}" rowAddr="${rowIdx}"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="${cellW}" height="${cellH}"/><hp:cellMargin left="141" right="141" top="141" bottom="141"/></hp:tc>`;
    }).join("");
    return `<hp:tr>${tdElements}</hp:tr>`;
  }).join("");
  const tblInner = `<hp:sz width="${tblW}" widthRelTo="ABSOLUTE" height="${tblH}" heightRelTo="ABSOLUTE" protect="0"/><hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="0" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="PARA" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/><hp:outMargin left="0" right="0" top="0" bottom="0"/><hp:inMargin left="510" right="510" top="141" bottom="141"/>` + trElements;
  const tbl = `<hp:tbl id="${tblId}" zOrder="0" numberingType="TABLE" pageBreak="CELL" repeatHeader="0" rowCnt="${rowCnt}" colCnt="${colCnt}" cellSpacing="0" borderFillIDRef="1" noShading="0">${tblInner}</hp:tbl>`;
  return `<hp:p paraPrIDRef="0" styleIDRef="0"><hp:run charPrIDRef="0">${tbl}</hp:run></hp:p>`;
}
function blocksToSectionXml(blocks) {
  const paraXmls = [];
  let isFirst = true;
  const orderedCounters = {};
  let prevWasOrdered = false;
  for (const block of blocks) {
    let xml = "";
    if (block.type !== "list_item" || !block.ordered) {
      if (prevWasOrdered) {
        for (const k of Object.keys(orderedCounters)) delete orderedCounters[+k];
      }
      prevWasOrdered = false;
    }
    switch (block.type) {
      case "heading": {
        const pId = headingParaPrId(block.level || 1);
        const cId = headingCharPrId(block.level || 1);
        xml = generateParagraph(block.text || "", pId, cId);
        break;
      }
      case "paragraph":
        xml = generateParagraph(block.text || "");
        break;
      case "code_block": {
        const codeLines = (block.text || "").split("\n");
        xml = codeLines.map((line) => generateParagraph(line || " ", PARA_CODE)).join("\n  ");
        break;
      }
      case "blockquote":
        xml = generateParagraph(block.text || "", PARA_QUOTE);
        break;
      case "list_item": {
        const indent = block.indent || 0;
        let marker;
        if (block.ordered) {
          orderedCounters[indent] = (orderedCounters[indent] || 0) + 1;
          for (const k of Object.keys(orderedCounters)) {
            if (+k > indent) delete orderedCounters[+k];
          }
          marker = `${orderedCounters[indent]}. `;
          prevWasOrdered = true;
        } else {
          marker = "\xB7 ";
          if (prevWasOrdered) {
            for (const k of Object.keys(orderedCounters)) delete orderedCounters[+k];
          }
          prevWasOrdered = false;
        }
        const indentPrefix = "  ".repeat(indent);
        xml = generateParagraph(indentPrefix + marker + (block.text || ""), PARA_LIST);
        break;
      }
      case "hr":
        xml = `<hp:p paraPrIDRef="0" styleIDRef="0"><hp:run charPrIDRef="0"><hp:t>\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500</hp:t></hp:run></hp:p>`;
        break;
      case "table":
        if (block.rows) {
          if (isFirst) {
            const secRun = `<hp:run charPrIDRef="0">${generateSecPr()}<hp:t></hp:t></hp:run>`;
            paraXmls.push(`<hp:p paraPrIDRef="0" styleIDRef="0">${secRun}</hp:p>`);
            isFirst = false;
          }
          xml = generateTable(block.rows);
        }
        break;
    }
    if (!xml) continue;
    if (isFirst && block.type !== "table") {
      xml = xml.replace(
        /<hp:run charPrIDRef="(\d+)">/,
        `<hp:run charPrIDRef="$1">${generateSecPr()}`
      );
      isFirst = false;
    }
    paraXmls.push(xml);
  }
  if (paraXmls.length === 0) {
    paraXmls.push(`<hp:p paraPrIDRef="0" styleIDRef="0"><hp:run charPrIDRef="0">${generateSecPr()}<hp:t></hp:t></hp:run></hp:p>`);
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
<hs:sec xmlns:hs="${NS_SECTION}" xmlns:hp="${NS_PARA}">
  ${paraXmls.join("\n  ")}
</hs:sec>`;
}

// src/index.ts
import { readFile } from "fs/promises";

// src/hwp5/sentinel.ts
var SENTINEL_PATTERNS = [
  /상위\s*버전의\s*배포용\s*문서/,
  /최신\s*버전의\s*한글.*뷰어/,
  /문서를\s*읽으려면/
];
function isDistributionSentinel(markdown) {
  if (!markdown) return false;
  const hit = SENTINEL_PATTERNS.some((p) => p.test(markdown));
  if (!hit) return false;
  const stripped = markdown.split(/\r?\n/).filter((line) => !SENTINEL_PATTERNS.some((p) => p.test(line))).join("").replace(/\s+/g, "");
  return stripped.length < 120;
}

// src/xlsx/parser.ts
var import_jszip4 = __toESM(require_lib(), 1);
var import_xmldom3 = __toESM(require_lib2(), 1);
var MAX_SHEETS = 100;
var MAX_DECOMPRESS_SIZE3 = 100 * 1024 * 1024;
var MAX_ROWS2 = 1e4;
var MAX_COLS2 = 200;
function cleanNumericValue(raw) {
  if (!/^-?\d+\.\d+$/.test(raw)) return raw;
  const num = parseFloat(raw);
  if (!isFinite(num)) return raw;
  const cleaned = parseFloat(num.toPrecision(15)).toString();
  return cleaned;
}
function parseCellRef(ref) {
  const m = ref.match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  let col = 0;
  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { col: col - 1, row: parseInt(m[2], 10) - 1 };
}
function parseMergeRef(ref) {
  const parts = ref.split(":");
  if (parts.length !== 2) return null;
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  if (!start || !end) return null;
  return { startCol: start.col, startRow: start.row, endCol: end.col, endRow: end.row };
}
function getElements(parent, tagName) {
  const nodes = parent.getElementsByTagName(tagName);
  const result = [];
  for (let i = 0; i < nodes.length; i++) result.push(nodes[i]);
  return result;
}
function getTextContent(el) {
  return el.textContent?.trim() ?? "";
}
function parseXml(text) {
  return new import_xmldom3.DOMParser().parseFromString(stripDtd(text), "text/xml");
}
function parseSharedStrings(xml) {
  const doc = parseXml(xml);
  const strings = [];
  const siList = getElements(doc.documentElement, "si");
  for (const si of siList) {
    const tElements = getElements(si, "t");
    strings.push(tElements.map((t) => t.textContent ?? "").join(""));
  }
  return strings;
}
function parseWorkbook(xml) {
  const doc = parseXml(xml);
  const sheets = [];
  const sheetElements = getElements(doc.documentElement, "sheet");
  for (const el of sheetElements) {
    sheets.push({
      name: el.getAttribute("name") ?? `Sheet${sheets.length + 1}`,
      sheetId: el.getAttribute("sheetId") ?? "",
      rId: el.getAttribute("r:id") ?? ""
    });
  }
  return sheets;
}
function parseRels(xml) {
  const doc = parseXml(xml);
  const map = /* @__PURE__ */ new Map();
  const rels = getElements(doc.documentElement, "Relationship");
  for (const rel of rels) {
    const id = rel.getAttribute("Id");
    const target = rel.getAttribute("Target");
    if (id && target) map.set(id, target);
  }
  return map;
}
function parseWorksheet(xml, sharedStrings) {
  const doc = parseXml(xml);
  const grid = [];
  let maxRow = 0;
  let maxCol = 0;
  const rows = getElements(doc.documentElement, "row");
  for (const rowEl of rows) {
    const rowNum = parseInt(rowEl.getAttribute("r") ?? "0", 10) - 1;
    if (rowNum < 0 || rowNum >= MAX_ROWS2) continue;
    const cells = getElements(rowEl, "c");
    for (const cellEl of cells) {
      const ref = cellEl.getAttribute("r");
      if (!ref) continue;
      const pos = parseCellRef(ref);
      if (!pos || pos.col >= MAX_COLS2) continue;
      const type = cellEl.getAttribute("t");
      const vElements = getElements(cellEl, "v");
      const fElements = getElements(cellEl, "f");
      let value = "";
      if (vElements.length > 0) {
        const raw = getTextContent(vElements[0]);
        if (type === "s") {
          const idx = parseInt(raw, 10);
          value = sharedStrings[idx] ?? "";
        } else if (type === "b") {
          value = raw === "1" ? "TRUE" : "FALSE";
        } else {
          value = cleanNumericValue(raw);
        }
      } else if (type === "inlineStr") {
        const isEl = getElements(cellEl, "is");
        if (isEl.length > 0) {
          const tElements = getElements(isEl[0], "t");
          value = tElements.map((t) => t.textContent ?? "").join("");
        }
      }
      if (!value && fElements.length > 0) {
        value = `=${getTextContent(fElements[0])}`;
      }
      while (grid.length <= pos.row) grid.push([]);
      while (grid[pos.row].length <= pos.col) grid[pos.row].push("");
      grid[pos.row][pos.col] = value;
      if (pos.row > maxRow) maxRow = pos.row;
      if (pos.col > maxCol) maxCol = pos.col;
    }
  }
  const merges = [];
  const mergeCellElements = getElements(doc.documentElement, "mergeCell");
  for (const el of mergeCellElements) {
    const ref = el.getAttribute("ref");
    if (!ref) continue;
    const m = parseMergeRef(ref);
    if (m) merges.push(m);
  }
  return { grid, merges, maxRow, maxCol };
}
function sheetToBlocks(sheetName, grid, merges, maxRow, maxCol, sheetIndex) {
  const blocks = [];
  if (sheetName) {
    blocks.push({
      type: "heading",
      text: sheetName,
      level: 2,
      pageNumber: sheetIndex + 1
    });
  }
  if (maxRow < 0 || maxCol < 0 || grid.length === 0) return blocks;
  const mergeMap = /* @__PURE__ */ new Map();
  const mergeSkip = /* @__PURE__ */ new Set();
  for (const m of merges) {
    const colSpan = m.endCol - m.startCol + 1;
    const rowSpan = m.endRow - m.startRow + 1;
    mergeMap.set(`${m.startRow},${m.startCol}`, { colSpan, rowSpan });
    for (let r = m.startRow; r <= m.endRow; r++) {
      for (let c = m.startCol; c <= m.endCol; c++) {
        if (r !== m.startRow || c !== m.startCol) {
          mergeSkip.add(`${r},${c}`);
        }
      }
    }
  }
  let firstRow = -1;
  let lastRow = -1;
  for (let r = 0; r <= maxRow; r++) {
    const row = grid[r];
    if (row && row.some((cell) => cell !== "")) {
      if (firstRow === -1) firstRow = r;
      lastRow = r;
    }
  }
  if (firstRow === -1) return blocks;
  const cellRows = [];
  for (let r = firstRow; r <= lastRow; r++) {
    const row = [];
    for (let c = 0; c <= maxCol; c++) {
      const key = `${r},${c}`;
      if (mergeSkip.has(key)) continue;
      const text = (grid[r] && grid[r][c]) ?? "";
      const merge = mergeMap.get(key);
      row.push({
        text,
        colSpan: merge?.colSpan ?? 1,
        rowSpan: merge?.rowSpan ?? 1
      });
    }
    cellRows.push(row);
  }
  if (cellRows.length > 0) {
    const table = buildTable(cellRows);
    if (table.rows > 0) {
      blocks.push({ type: "table", table, pageNumber: sheetIndex + 1 });
    }
  }
  return blocks;
}
async function parseXlsxDocument(buffer, options) {
  precheckZipSize(buffer, MAX_DECOMPRESS_SIZE3);
  const zip = await import_jszip4.default.loadAsync(buffer);
  const warnings = [];
  const workbookFile = zip.file("xl/workbook.xml");
  if (!workbookFile) {
    throw new KordocError("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 XLSX \uD30C\uC77C: xl/workbook.xml\uC774 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  let sharedStrings = [];
  const ssFile = zip.file("xl/sharedStrings.xml");
  if (ssFile) {
    sharedStrings = parseSharedStrings(await ssFile.async("text"));
  }
  const sheets = parseWorkbook(await workbookFile.async("text"));
  if (sheets.length === 0) {
    throw new KordocError("XLSX \uD30C\uC77C\uC5D0 \uC2DC\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  let relsMap = /* @__PURE__ */ new Map();
  const relsFile = zip.file("xl/_rels/workbook.xml.rels");
  if (relsFile) {
    relsMap = parseRels(await relsFile.async("text"));
  }
  let pageFilter = null;
  if (options?.pages) {
    const { parsePageRange: parsePageRange2 } = await import("./page-range-YS2WKQNM.js");
    pageFilter = parsePageRange2(options.pages, sheets.length);
  }
  const blocks = [];
  const processedSheets = Math.min(sheets.length, MAX_SHEETS);
  for (let i = 0; i < processedSheets; i++) {
    if (pageFilter && !pageFilter.has(i + 1)) continue;
    const sheet = sheets[i];
    options?.onProgress?.(i + 1, processedSheets);
    let sheetPath = relsMap.get(sheet.rId);
    if (sheetPath) {
      if (!sheetPath.startsWith("xl/") && !sheetPath.startsWith("/")) {
        sheetPath = `xl/${sheetPath}`;
      } else if (sheetPath.startsWith("/")) {
        sheetPath = sheetPath.slice(1);
      }
    } else {
      sheetPath = `xl/worksheets/sheet${i + 1}.xml`;
    }
    const sheetFile = zip.file(sheetPath);
    if (!sheetFile) {
      warnings.push({
        page: i + 1,
        message: `\uC2DC\uD2B8 "${sheet.name}" \uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4: ${sheetPath}`,
        code: "PARTIAL_PARSE"
      });
      continue;
    }
    try {
      const sheetXml = await sheetFile.async("text");
      const { grid, merges, maxRow, maxCol } = parseWorksheet(sheetXml, sharedStrings);
      const sheetBlocks = sheetToBlocks(sheet.name, grid, merges, maxRow, maxCol, i);
      blocks.push(...sheetBlocks);
    } catch (err) {
      warnings.push({
        page: i + 1,
        message: `\uC2DC\uD2B8 "${sheet.name}" \uD30C\uC2F1 \uC2E4\uD328: ${err instanceof Error ? err.message : "\uC54C \uC218 \uC5C6\uB294 \uC624\uB958"}`,
        code: "PARTIAL_PARSE"
      });
    }
  }
  const metadata = {
    pageCount: processedSheets
  };
  const coreFile = zip.file("docProps/core.xml");
  if (coreFile) {
    try {
      const coreXml = await coreFile.async("text");
      const doc = parseXml(coreXml);
      const getFirst = (tag) => {
        const els = doc.getElementsByTagName(tag);
        return els.length > 0 ? (els[0].textContent ?? "").trim() : void 0;
      };
      metadata.title = getFirst("dc:title") || getFirst("dcterms:title");
      metadata.author = getFirst("dc:creator");
      metadata.description = getFirst("dc:description");
      const created = getFirst("dcterms:created");
      if (created) metadata.createdAt = created;
      const modified = getFirst("dcterms:modified");
      if (modified) metadata.modifiedAt = modified;
    } catch {
    }
  }
  const markdown = blocksToMarkdown(blocks);
  return { markdown, blocks, metadata, warnings: warnings.length > 0 ? warnings : void 0 };
}

// src/docx/parser.ts
var import_jszip5 = __toESM(require_lib(), 1);
var import_xmldom4 = __toESM(require_lib2(), 1);

// src/docx/equation.ts
function lname(el) {
  return el.localName || el.tagName?.replace(/^[^:]+:/, "") || "";
}
function kids(parent, name) {
  const out = [];
  const nodes = parent.childNodes;
  if (!nodes) return out;
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.nodeType !== 1) continue;
    const el = n;
    if (lname(el) === name) out.push(el);
  }
  return out;
}
function firstKid(parent, name) {
  const list = kids(parent, name);
  return list[0] ?? null;
}
function eachChild(parent) {
  const out = [];
  const nodes = parent.childNodes;
  if (!nodes) return out;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].nodeType === 1) out.push(nodes[i]);
  }
  return out;
}
function runToLatex(r) {
  let out = "";
  for (const t of kids(r, "t")) out += t.textContent ?? "";
  return out;
}
var FUNC_NAMES = /* @__PURE__ */ new Set([
  "sin",
  "cos",
  "tan",
  "cot",
  "sec",
  "csc",
  "sinh",
  "cosh",
  "tanh",
  "coth",
  "arcsin",
  "arccos",
  "arctan",
  "log",
  "ln",
  "lg",
  "exp",
  "det",
  "dim",
  "gcd",
  "inf",
  "sup",
  "lim",
  "max",
  "min",
  "Pr",
  "arg"
]);
var ACCENT_MAP = {
  "\u0302": "\\hat",
  // U+0302 COMBINING CIRCUMFLEX
  "\u0303": "\\tilde",
  // U+0303
  "\u0304": "\\bar",
  // U+0304
  "\u0307": "\\dot",
  // U+0307
  "\u0308": "\\ddot",
  // U+0308
  "\u0301": "\\acute",
  // U+0301
  "\u0300": "\\grave",
  // U+0300
  "\u0306": "\\breve",
  // U+0306
  "\u030C": "\\check",
  // U+030C
  "\u20D7": "\\vec",
  // U+20D7 COMBINING RIGHT ARROW ABOVE
  "\u2192": "\\vec"
};
var NARY_MAP = {
  "\u2211": "\\sum",
  "\u220F": "\\prod",
  "\u2210": "\\coprod",
  "\u222B": "\\int",
  "\u222C": "\\iint",
  "\u222D": "\\iiint",
  "\u222E": "\\oint",
  "\u222F": "\\oiint",
  "\u2230": "\\oiiint",
  "\u22C3": "\\bigcup",
  "\u22C2": "\\bigcap",
  "\u2A01": "\\bigoplus",
  "\u2A02": "\\bigotimes",
  "\u2A00": "\\bigodot"
};
function mapDelim(ch, isLeft) {
  const l = {
    "(": "(",
    "[": "[",
    "{": "\\{",
    "\u27E8": "\\langle",
    "|": "|",
    "\u2016": "\\|",
    "\u230A": "\\lfloor",
    "\u2308": "\\lceil",
    "": "."
  };
  const r = {
    ")": ")",
    "]": "]",
    "}": "\\}",
    "\u27E9": "\\rangle",
    "|": "|",
    "\u2016": "\\|",
    "\u230B": "\\rfloor",
    "\u2309": "\\rceil",
    "": "."
  };
  const map = isLeft ? l : r;
  return map[ch] ?? ch;
}
function grp(body) {
  const s = body.trim();
  if (s.length === 0) return "{}";
  if (s.startsWith("{") && s.endsWith("}")) return s;
  return "{" + s + "}";
}
function childrenToLatex(parent) {
  let out = "";
  for (const ch of eachChild(parent)) {
    out += nodeToLatex(ch);
  }
  return out;
}
function nodeToLatex(el) {
  const tag = lname(el);
  switch (tag) {
    case "r":
      return runToLatex(el);
    case "e":
    // generic container (인자로 쓰임) — 자식 연결
    case "num":
    case "den":
    case "sub":
    case "sup":
    case "deg":
    case "lim":
    case "fName":
      return childrenToLatex(el);
    // 분수
    case "f": {
      const n = firstKid(el, "num");
      const d = firstKid(el, "den");
      const num = n ? childrenToLatex(n) : "";
      const den = d ? childrenToLatex(d) : "";
      return "\\frac" + grp(num) + grp(den);
    }
    // 첨자
    case "sSup": {
      const e = firstKid(el, "e");
      const sup = firstKid(el, "sup");
      return grp(e ? childrenToLatex(e) : "") + "^" + grp(sup ? childrenToLatex(sup) : "");
    }
    case "sSub": {
      const e = firstKid(el, "e");
      const sub = firstKid(el, "sub");
      return grp(e ? childrenToLatex(e) : "") + "_" + grp(sub ? childrenToLatex(sub) : "");
    }
    case "sSubSup": {
      const e = firstKid(el, "e");
      const sub = firstKid(el, "sub");
      const sup = firstKid(el, "sup");
      return grp(e ? childrenToLatex(e) : "") + "_" + grp(sub ? childrenToLatex(sub) : "") + "^" + grp(sup ? childrenToLatex(sup) : "");
    }
    case "sPre": {
      const sub = firstKid(el, "sub");
      const sup = firstKid(el, "sup");
      const e = firstKid(el, "e");
      const preSub = sub ? grp(childrenToLatex(sub)) : "{}";
      const preSup = sup ? grp(childrenToLatex(sup)) : "{}";
      const body = e ? childrenToLatex(e) : "";
      return "{}_" + preSub + "^" + preSup + grp(body);
    }
    // 근호
    case "rad": {
      const deg = firstKid(el, "deg");
      const e = firstKid(el, "e");
      const body = e ? childrenToLatex(e) : "";
      const radPr = firstKid(el, "radPr");
      let hide = false;
      if (radPr) {
        const degHide = firstKid(radPr, "degHide");
        if (degHide) {
          const val = degHide.getAttribute("m:val") ?? degHide.getAttribute("val");
          hide = val === "1" || val === "on" || val === "true";
        }
      }
      const degStr = !hide && deg ? childrenToLatex(deg).trim() : "";
      return degStr ? "\\sqrt[" + degStr + "]" + grp(body) : "\\sqrt" + grp(body);
    }
    // n-ary 연산자 (sum, prod, int, …)
    case "nary": {
      const naryPr = firstKid(el, "naryPr");
      let op = "\\int";
      let subHide = false;
      let supHide = false;
      let limLoc = "";
      if (naryPr) {
        const chr = firstKid(naryPr, "chr");
        if (chr) {
          const v = chr.getAttribute("m:val") ?? chr.getAttribute("val") ?? "";
          if (v && NARY_MAP[v]) op = NARY_MAP[v];
          else if (v) op = v;
        } else {
          op = "\\int";
        }
        const sh = firstKid(naryPr, "subHide");
        const ph = firstKid(naryPr, "supHide");
        if (sh) subHide = (sh.getAttribute("m:val") ?? sh.getAttribute("val")) !== "0";
        if (ph) supHide = (ph.getAttribute("m:val") ?? ph.getAttribute("val")) !== "0";
        const ll = firstKid(naryPr, "limLoc");
        if (ll) limLoc = ll.getAttribute("m:val") ?? ll.getAttribute("val") ?? "";
      }
      const sub = firstKid(el, "sub");
      const sup = firstKid(el, "sup");
      const e = firstKid(el, "e");
      const subStr = !subHide && sub ? childrenToLatex(sub) : "";
      const supStr = !supHide && sup ? childrenToLatex(sup) : "";
      const body = e ? childrenToLatex(e) : "";
      let head = op;
      if (limLoc === "undOvr") {
        if (subStr) head += "_" + grp(subStr);
        if (supStr) head += "^" + grp(supStr);
      } else {
        if (subStr) head += "_" + grp(subStr);
        if (supStr) head += "^" + grp(supStr);
      }
      return head + " " + body;
    }
    // 괄호 (delimiter)
    case "d": {
      const dPr = firstKid(el, "dPr");
      let beg = "(";
      let end = ")";
      let sep = ",";
      if (dPr) {
        const begChr = firstKid(dPr, "begChr");
        const endChr = firstKid(dPr, "endChr");
        const sepChr = firstKid(dPr, "sepChr");
        if (begChr) beg = begChr.getAttribute("m:val") ?? begChr.getAttribute("val") ?? beg;
        if (endChr) end = endChr.getAttribute("m:val") ?? endChr.getAttribute("val") ?? end;
        if (sepChr) sep = sepChr.getAttribute("m:val") ?? sepChr.getAttribute("val") ?? sep;
      }
      const items = kids(el, "e").map(childrenToLatex);
      const body = items.join(sep);
      return "\\left" + mapDelim(beg, true) + body + "\\right" + mapDelim(end, false);
    }
    // 행렬
    case "m": {
      const rows = [];
      for (const mr of kids(el, "mr")) {
        const cells = kids(mr, "e").map(childrenToLatex);
        rows.push(cells.join(" & "));
      }
      return "\\begin{matrix}" + rows.join(" \\\\ ") + "\\end{matrix}";
    }
    // 상자/박스 (acc 와 유사하지만 bar 가 아닌 box)
    case "box":
      return childrenToLatex(el);
    // 함수 적용 (sin, cos, log …)
    case "func": {
      const fn = firstKid(el, "fName");
      const e = firstKid(el, "e");
      const fnStr = fn ? childrenToLatex(fn).trim() : "";
      const body = e ? childrenToLatex(e) : "";
      const fnLatex = FUNC_NAMES.has(fnStr) ? "\\" + fnStr : fnStr;
      return fnLatex + grp(body);
    }
    // 악센트 (hat/bar/vec/…)
    case "acc": {
      const accPr = firstKid(el, "accPr");
      let chr = "";
      if (accPr) {
        const chrEl = firstKid(accPr, "chr");
        if (chrEl) chr = chrEl.getAttribute("m:val") ?? chrEl.getAttribute("val") ?? "";
      }
      if (!chr) chr = "\u0302";
      const e = firstKid(el, "e");
      const body = e ? childrenToLatex(e) : "";
      const cmd = ACCENT_MAP[chr] ?? "\\hat";
      return cmd + grp(body);
    }
    // bar (위/아래 줄)
    case "bar": {
      const barPr = firstKid(el, "barPr");
      let pos = "top";
      if (barPr) {
        const posEl = firstKid(barPr, "pos");
        if (posEl) pos = posEl.getAttribute("m:val") ?? posEl.getAttribute("val") ?? pos;
      }
      const e = firstKid(el, "e");
      const body = e ? childrenToLatex(e) : "";
      return (pos === "bot" ? "\\underline" : "\\overline") + grp(body);
    }
    // lim 위/아래
    case "limLow": {
      const e = firstKid(el, "e");
      const lim = firstKid(el, "lim");
      const base = e ? childrenToLatex(e).trim() : "";
      const below = lim ? childrenToLatex(lim) : "";
      if (FUNC_NAMES.has(base)) return "\\" + base + "_" + grp(below);
      return base + "_" + grp(below);
    }
    case "limUpp": {
      const e = firstKid(el, "e");
      const lim = firstKid(el, "lim");
      const base = e ? childrenToLatex(e).trim() : "";
      const above = lim ? childrenToLatex(lim) : "";
      if (FUNC_NAMES.has(base)) return "\\" + base + "^" + grp(above);
      return base + "^" + grp(above);
    }
    // group character (over/underset 비슷)
    case "groupChr":
      return childrenToLatex(firstKid(el, "e") ?? el);
    // box/borderBox/phantom/eqArr/… 는 자식 본문만 유지
    case "borderBox":
    case "phant":
    case "eqArr":
      return childrenToLatex(el);
    // 최상위 컨테이너
    case "oMath":
    case "oMathPara":
      return childrenToLatex(el);
    // 메타 — 속성만 들어있으므로 출력 제외
    case "rPr":
    case "fPr":
    case "sSubPr":
    case "sSupPr":
    case "sSubSupPr":
    case "radPr":
    case "naryPr":
    case "dPr":
    case "accPr":
    case "barPr":
    case "funcPr":
    case "mPr":
    case "ctrlPr":
      return "";
    default:
      return childrenToLatex(el);
  }
}
function isOmmlRoot(el) {
  const t = lname(el);
  return t === "oMath" || t === "oMathPara";
}
function ommlElementToLatex(el) {
  if (!isOmmlRoot(el)) return "";
  const raw = childrenToLatex(el);
  return raw.replace(/\s+/g, " ").trim();
}
function isDisplayMath(el) {
  return lname(el) === "oMathPara";
}

// src/docx/parser.ts
var MAX_DECOMPRESS_SIZE4 = 100 * 1024 * 1024;
function getChildElements(parent, localName3) {
  const result = [];
  const children = parent.childNodes;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.nodeType === 1) {
      const el = node;
      if (el.localName === localName3 || el.tagName?.endsWith(`:${localName3}`)) {
        result.push(el);
      }
    }
  }
  return result;
}
function findElements(parent, localName3) {
  const result = [];
  const walk = (node) => {
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType === 1) {
        const el = child;
        if (el.localName === localName3 || el.tagName?.endsWith(`:${localName3}`)) {
          result.push(el);
        }
        walk(el);
      }
    }
  };
  walk(parent);
  return result;
}
function getAttr(el, localName3) {
  const attrs = el.attributes;
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (attr.localName === localName3 || attr.name === localName3) return attr.value;
  }
  return null;
}
function parseXml2(text) {
  return new import_xmldom4.DOMParser().parseFromString(stripDtd(text), "text/xml");
}
function parseStyles(xml) {
  const doc = parseXml2(xml);
  const styles = /* @__PURE__ */ new Map();
  const styleElements = findElements(doc, "style");
  for (const el of styleElements) {
    const styleId = getAttr(el, "styleId");
    if (!styleId) continue;
    const nameEls = getChildElements(el, "name");
    const name = nameEls.length > 0 ? getAttr(nameEls[0], "val") ?? "" : "";
    const basedOnEls = getChildElements(el, "basedOn");
    const basedOn = basedOnEls.length > 0 ? getAttr(basedOnEls[0], "val") ?? void 0 : void 0;
    const pPrEls = getChildElements(el, "pPr");
    let outlineLevel;
    if (pPrEls.length > 0) {
      const outlineEls = getChildElements(pPrEls[0], "outlineLvl");
      if (outlineEls.length > 0) {
        const val = getAttr(outlineEls[0], "val");
        if (val !== null) outlineLevel = parseInt(val, 10);
      }
    }
    if (outlineLevel === void 0) {
      const headingMatch = name.match(/^(?:heading|Heading)\s*(\d+)$/i);
      if (headingMatch) outlineLevel = parseInt(headingMatch[1], 10) - 1;
    }
    styles.set(styleId, { name, basedOn, outlineLevel });
  }
  return styles;
}
function parseNumbering(xml) {
  const doc = parseXml2(xml);
  const abstractNums = /* @__PURE__ */ new Map();
  const abstractElements = findElements(doc, "abstractNum");
  for (const el of abstractElements) {
    const abstractNumId = getAttr(el, "abstractNumId");
    if (!abstractNumId) continue;
    const levels = /* @__PURE__ */ new Map();
    const lvlElements = getChildElements(el, "lvl");
    for (const lvl of lvlElements) {
      const ilvl = parseInt(getAttr(lvl, "ilvl") ?? "0", 10);
      const numFmtEls = getChildElements(lvl, "numFmt");
      const numFmt = numFmtEls.length > 0 ? getAttr(numFmtEls[0], "val") ?? "bullet" : "bullet";
      levels.set(ilvl, { numFmt, level: ilvl });
    }
    abstractNums.set(abstractNumId, levels);
  }
  const nums = /* @__PURE__ */ new Map();
  const numElements = findElements(doc, "num");
  for (const el of numElements) {
    const numId = getAttr(el, "numId");
    if (!numId) continue;
    const abstractRefs = getChildElements(el, "abstractNumId");
    if (abstractRefs.length > 0) {
      const ref = getAttr(abstractRefs[0], "val");
      if (ref && abstractNums.has(ref)) {
        nums.set(numId, abstractNums.get(ref));
      }
    }
  }
  return nums;
}
function parseRels2(xml) {
  const doc = parseXml2(xml);
  const map = /* @__PURE__ */ new Map();
  const rels = findElements(doc, "Relationship");
  for (const rel of rels) {
    const id = getAttr(rel, "Id");
    const target = getAttr(rel, "Target");
    if (id && target) map.set(id, target);
  }
  return map;
}
function parseFootnotes(xml) {
  const doc = parseXml2(xml);
  const notes = /* @__PURE__ */ new Map();
  const fnElements = findElements(doc, "footnote");
  for (const fn of fnElements) {
    const id = getAttr(fn, "id");
    if (!id || id === "0" || id === "-1") continue;
    const texts = [];
    const pElements = findElements(fn, "p");
    for (const p of pElements) {
      const runs = findElements(p, "r");
      for (const r of runs) {
        const tElements = getChildElements(r, "t");
        for (const t of tElements) texts.push(t.textContent ?? "");
      }
    }
    notes.set(id, texts.join("").trim());
  }
  return notes;
}
function collectOmmlRoots(p) {
  const out = [];
  const walk = (node) => {
    const children = node.childNodes;
    if (!children) return;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType !== 1) continue;
      const el = child;
      const tag = el.localName || el.tagName?.replace(/^[^:]+:/, "") || "";
      if (tag === "oMath" || tag === "oMathPara") {
        out.push(el);
      } else {
        walk(el);
      }
    }
  };
  walk(p);
  return out;
}
function extractRun(r) {
  const tElements = getChildElements(r, "t");
  const text = tElements.map((t) => t.textContent ?? "").join("");
  let bold = false;
  let italic = false;
  const rPrEls = getChildElements(r, "rPr");
  if (rPrEls.length > 0) {
    bold = getChildElements(rPrEls[0], "b").length > 0;
    italic = getChildElements(rPrEls[0], "i").length > 0;
  }
  return { text, bold, italic };
}
function parseParagraph(p, styles, numbering, footnotes, rels) {
  const pPrEls = getChildElements(p, "pPr");
  let styleId = "";
  let numId = "";
  let ilvl = 0;
  if (pPrEls.length > 0) {
    const pStyleEls = getChildElements(pPrEls[0], "pStyle");
    if (pStyleEls.length > 0) styleId = getAttr(pStyleEls[0], "val") ?? "";
    const numPrEls = getChildElements(pPrEls[0], "numPr");
    if (numPrEls.length > 0) {
      const numIdEls = getChildElements(numPrEls[0], "numId");
      const ilvlEls = getChildElements(numPrEls[0], "ilvl");
      numId = numIdEls.length > 0 ? getAttr(numIdEls[0], "val") ?? "" : "";
      ilvl = ilvlEls.length > 0 ? parseInt(getAttr(ilvlEls[0], "val") ?? "0", 10) : 0;
    }
  }
  const parts = [];
  let hasBold = false;
  let hasItalic = false;
  let href;
  let footnoteText;
  const hyperlinks = getChildElements(p, "hyperlink");
  const hyperlinkTexts = /* @__PURE__ */ new Set();
  for (const hl of hyperlinks) {
    const rId = getAttr(hl, "id");
    const hlText = [];
    const runs2 = findElements(hl, "r");
    for (const r of runs2) {
      const result = extractRun(r);
      hlText.push(result.text);
    }
    const text2 = hlText.join("");
    if (text2) {
      hyperlinkTexts.add(text2);
      if (rId && rels.has(rId)) {
        href = rels.get(rId);
        parts.push(text2);
      } else {
        parts.push(text2);
      }
    }
  }
  const runs = getChildElements(p, "r");
  for (const r of runs) {
    if (r.parentNode && r.parentNode.localName === "hyperlink") continue;
    const result = extractRun(r);
    if (result.bold) hasBold = true;
    if (result.italic) hasItalic = true;
    const fnRefEls = getChildElements(r, "footnoteReference");
    if (fnRefEls.length > 0) {
      const fnId = getAttr(fnRefEls[0], "id");
      if (fnId && footnotes.has(fnId)) {
        footnoteText = footnotes.get(fnId);
      }
    }
    if (result.text) parts.push(result.text);
  }
  for (const om of collectOmmlRoots(p)) {
    const latex = ommlElementToLatex(om);
    if (!latex) continue;
    if (isDisplayMath(om)) parts.push(" $$" + latex + "$$ ");
    else parts.push(" $" + latex + "$ ");
  }
  const text = parts.join("").replace(/[ \t]{2,}/g, " ").trim();
  if (!text) return null;
  const style = styles.get(styleId);
  if (style?.outlineLevel !== void 0 && style.outlineLevel >= 0 && style.outlineLevel <= 5) {
    return {
      type: "heading",
      text,
      level: style.outlineLevel + 1
    };
  }
  if (numId && numId !== "0") {
    const numDef = numbering.get(numId);
    const levelInfo = numDef?.get(ilvl);
    const listType = levelInfo?.numFmt === "bullet" ? "unordered" : "ordered";
    return { type: "list", text, listType };
  }
  const block = { type: "paragraph", text };
  if (hasBold || hasItalic) {
    block.style = { bold: hasBold || void 0, italic: hasItalic || void 0 };
  }
  if (href) block.href = href;
  if (footnoteText) block.footnoteText = footnoteText;
  return block;
}
function parseTable(tbl, styles, numbering, footnotes, rels) {
  const trElements = getChildElements(tbl, "tr");
  if (trElements.length === 0) return null;
  const rows = [];
  let maxCols = 0;
  for (const tr of trElements) {
    const tcElements = getChildElements(tr, "tc");
    const row = [];
    for (const tc of tcElements) {
      let colSpan = 1;
      let rowSpan = 1;
      const tcPrEls = getChildElements(tc, "tcPr");
      if (tcPrEls.length > 0) {
        const gridSpanEls = getChildElements(tcPrEls[0], "gridSpan");
        if (gridSpanEls.length > 0) {
          colSpan = parseInt(getAttr(gridSpanEls[0], "val") ?? "1", 10);
        }
        const vMergeEls = getChildElements(tcPrEls[0], "vMerge");
        if (vMergeEls.length > 0) {
          const val = getAttr(vMergeEls[0], "val");
          if (val !== "restart" && val !== null) {
            row.push({ text: "", colSpan, rowSpan: 0 });
            continue;
          }
        }
      }
      const cellTexts = [];
      const pElements = getChildElements(tc, "p");
      for (const p of pElements) {
        const block = parseParagraph(p, styles, numbering, footnotes, rels);
        if (block?.text) cellTexts.push(block.text);
      }
      row.push({ text: cellTexts.join("\n"), colSpan, rowSpan });
    }
    rows.push(row);
    if (row.length > maxCols) maxCols = row.length;
  }
  for (let c = 0; c < maxCols; c++) {
    for (let r = 0; r < rows.length; r++) {
      const cell = rows[r][c];
      if (!cell || cell.rowSpan === 0) continue;
      let span = 1;
      for (let nr = r + 1; nr < rows.length; nr++) {
        if (rows[nr][c]?.rowSpan === 0) span++;
        else break;
      }
      cell.rowSpan = span;
    }
  }
  const cleanRows = [];
  for (const row of rows) {
    const clean = row.filter((cell) => cell.rowSpan !== 0);
    cleanRows.push(clean);
  }
  if (cleanRows.length === 0) return null;
  let cols = 0;
  for (const row of cleanRows) {
    let c = 0;
    for (const cell of row) c += cell.colSpan;
    if (c > cols) cols = c;
  }
  const table = {
    rows: cleanRows.length,
    cols,
    cells: cleanRows,
    hasHeader: cleanRows.length > 1
  };
  return { type: "table", table };
}
async function extractImages(zip, rels, doc) {
  const blocks = [];
  const images = [];
  const drawingElements = findElements(doc.documentElement, "drawing");
  let imgIdx = 0;
  for (const drawing of drawingElements) {
    const blips = findElements(drawing, "blip");
    for (const blip of blips) {
      const embedId = getAttr(blip, "embed");
      if (!embedId) continue;
      const target = rels.get(embedId);
      if (!target) continue;
      const imgPath = target.startsWith("/") ? target.slice(1) : target.startsWith("word/") ? target : `word/${target}`;
      const imgFile = zip.file(imgPath);
      if (!imgFile) continue;
      try {
        const data = await imgFile.async("uint8array");
        imgIdx++;
        const ext = imgPath.split(".").pop()?.toLowerCase() ?? "png";
        const mimeMap = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          gif: "image/gif",
          bmp: "image/bmp",
          wmf: "image/wmf",
          emf: "image/emf"
        };
        const filename = `image_${String(imgIdx).padStart(3, "0")}.${ext}`;
        images.push({ filename, data, mimeType: mimeMap[ext] ?? "image/png" });
        blocks.push({ type: "image", text: filename });
      } catch {
      }
    }
  }
  return { blocks, images };
}
async function parseDocxDocument(buffer, options) {
  precheckZipSize(buffer, MAX_DECOMPRESS_SIZE4);
  const zip = await import_jszip5.default.loadAsync(buffer);
  const warnings = [];
  const docFile = zip.file("word/document.xml");
  if (!docFile) {
    throw new KordocError("\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 DOCX \uD30C\uC77C: word/document.xml\uC774 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  let rels = /* @__PURE__ */ new Map();
  const relsFile = zip.file("word/_rels/document.xml.rels");
  if (relsFile) {
    rels = parseRels2(await relsFile.async("text"));
  }
  let styles = /* @__PURE__ */ new Map();
  const stylesFile = zip.file("word/styles.xml");
  if (stylesFile) {
    try {
      styles = parseStyles(await stylesFile.async("text"));
    } catch {
    }
  }
  let numbering = /* @__PURE__ */ new Map();
  const numFile = zip.file("word/numbering.xml");
  if (numFile) {
    try {
      numbering = parseNumbering(await numFile.async("text"));
    } catch {
    }
  }
  let footnotes = /* @__PURE__ */ new Map();
  const fnFile = zip.file("word/footnotes.xml");
  if (fnFile) {
    try {
      footnotes = parseFootnotes(await fnFile.async("text"));
    } catch {
    }
  }
  const docXml = await docFile.async("text");
  const doc = parseXml2(docXml);
  const body = findElements(doc, "body");
  if (body.length === 0) {
    throw new KordocError("DOCX \uBCF8\uBB38(w:body)\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
  }
  const blocks = [];
  const bodyEl = body[0];
  const children = bodyEl.childNodes;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.nodeType !== 1) continue;
    const el = node;
    const localName3 = el.localName ?? el.tagName?.split(":").pop();
    if (localName3 === "p") {
      const block = parseParagraph(el, styles, numbering, footnotes, rels);
      if (block) blocks.push(block);
    } else if (localName3 === "tbl") {
      const block = parseTable(el, styles, numbering, footnotes, rels);
      if (block) blocks.push(block);
    }
  }
  const { blocks: imgBlocks, images } = await extractImages(zip, rels, doc);
  const metadata = {};
  const coreFile = zip.file("docProps/core.xml");
  if (coreFile) {
    try {
      const coreXml = await coreFile.async("text");
      const coreDoc = parseXml2(coreXml);
      const getFirst = (tag) => {
        const els = coreDoc.getElementsByTagName(tag);
        return els.length > 0 ? (els[0].textContent ?? "").trim() : void 0;
      };
      metadata.title = getFirst("dc:title") || getFirst("dcterms:title");
      metadata.author = getFirst("dc:creator");
      metadata.description = getFirst("dc:description");
      const created = getFirst("dcterms:created");
      if (created) metadata.createdAt = created;
      const modified = getFirst("dcterms:modified");
      if (modified) metadata.modifiedAt = modified;
    } catch {
    }
  }
  const outline = blocks.filter((b) => b.type === "heading").map((b) => ({ level: b.level ?? 2, text: b.text ?? "" }));
  const markdown = blocksToMarkdown(blocks);
  return {
    markdown,
    blocks,
    metadata,
    outline: outline.length > 0 ? outline : void 0,
    warnings: warnings.length > 0 ? warnings : void 0,
    images: images.length > 0 ? images : void 0
  };
}

// src/hwpml/parser.ts
var import_xmldom5 = __toESM(require_lib2(), 1);
var MAX_XML_DEPTH2 = 200;
var MAX_TABLE_ROWS = 5e3;
var MAX_TABLE_COLS = 500;
var MAX_HWPML_BYTES = 50 * 1024 * 1024;
function parseHwpmlDocument(buffer, options) {
  if (buffer.byteLength > MAX_HWPML_BYTES) {
    throw new Error(`HWPML \uD30C\uC77C \uD06C\uAE30 \uCD08\uACFC (${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB > 50MB)`);
  }
  const text = new TextDecoder("utf-8").decode(buffer).replace(/^\uFEFF/, "");
  const normalized = text.replace(/&nbsp;/g, "&#160;");
  const xml = stripDtd(normalized);
  const warnings = [];
  const parser = new import_xmldom5.DOMParser({
    onError: (_level, msg) => {
      warnings.push({ message: `HWPML XML \uD30C\uC2F1 \uACBD\uACE0: ${msg}`, code: "MALFORMED_XML" });
    }
  });
  const doc = parser.parseFromString(xml, "text/xml");
  if (!doc.documentElement) {
    return { markdown: "", blocks: [], warnings };
  }
  const root = doc.documentElement;
  const metadata = {};
  const docSummary = findChild(root, "DOCSUMMARY");
  if (docSummary) {
    const title = findChild(docSummary, "TITLE");
    const author = findChild(docSummary, "AUTHOR");
    const date = findChild(docSummary, "DATE");
    if (title) metadata.title = textContent(title).trim();
    if (author) metadata.author = textContent(author).trim();
    if (date) metadata.createdAt = textContent(date).trim() || void 0;
  }
  const paraShapeMap = buildParaShapeMap(root);
  const body = findChild(root, "BODY");
  if (!body) {
    return { markdown: "", blocks: [], metadata, warnings };
  }
  const blocks = [];
  const pageFilter = options?.pages ? parsePageRange(options.pages, countSections(body)) : null;
  let sectionIdx = 0;
  const children = body.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1) continue;
    if (localName2(el) !== "SECTION") continue;
    sectionIdx++;
    if (pageFilter && !pageFilter.has(sectionIdx)) continue;
    parseSection2(el, blocks, paraShapeMap, sectionIdx, warnings);
  }
  const outline = blocks.filter((b) => b.type === "heading" && b.text).map((b) => ({ level: b.level ?? 1, text: b.text, pageNumber: b.pageNumber }));
  const markdown = blocksToMarkdown(blocks);
  return {
    markdown,
    blocks,
    metadata: Object.keys(metadata).length > 0 ? metadata : void 0,
    outline: outline.length > 0 ? outline : void 0,
    warnings: warnings.length > 0 ? warnings : void 0
  };
}
function buildParaShapeMap(root) {
  const map = /* @__PURE__ */ new Map();
  const head = findChild(root, "HEAD");
  if (!head) return map;
  const mappingTable = findChild(head, "MAPPINGTABLE");
  if (!mappingTable) return map;
  const paraShapeList = findChild(mappingTable, "PARASHAPELIST");
  if (!paraShapeList) return map;
  const children = paraShapeList.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1 || localName2(el) !== "PARASHAPE") continue;
    const id = el.getAttribute("Id") ?? "";
    const headingType = el.getAttribute("HeadingType") ?? "None";
    const level = parseInt(el.getAttribute("Level") ?? "0", 10);
    let headingLevel = null;
    if (headingType === "Outline") {
      const safeLevel = isNaN(level) ? 0 : Math.max(0, level);
      headingLevel = Math.min(safeLevel + 1, 6);
    }
    map.set(id, { headingLevel });
  }
  return map;
}
function parseSection2(section, blocks, paraShapeMap, sectionNum, warnings) {
  walkContent(section, blocks, paraShapeMap, sectionNum, warnings, false);
}
function walkContent(node, blocks, paraShapeMap, sectionNum, warnings, inHeaderFooter, depth = 0) {
  if (depth > MAX_XML_DEPTH2) return;
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1) continue;
    const tag = localName2(el);
    if (tag === "HEADER" || tag === "FOOTER") {
      continue;
    }
    if (tag === "P") {
      if (!inHeaderFooter) {
        parseParagraph2(el, blocks, paraShapeMap, sectionNum);
      }
      continue;
    }
    if (tag === "TABLE") {
      if (!inHeaderFooter) {
        parseTable2(el, blocks, paraShapeMap, sectionNum, warnings);
      }
      continue;
    }
    if (tag === "PARALIST" || tag === "SECTION" || tag === "COLDEF") {
      walkContent(el, blocks, paraShapeMap, sectionNum, warnings, inHeaderFooter, depth + 1);
      continue;
    }
    walkContent(el, blocks, paraShapeMap, sectionNum, warnings, inHeaderFooter, depth + 1);
  }
}
function parseParagraph2(el, blocks, paraShapeMap, sectionNum) {
  const paraShapeId = el.getAttribute("ParaShape") ?? "";
  const shapeInfo = paraShapeMap.get(paraShapeId);
  const text = extractParagraphText(el);
  if (!text) return;
  if (shapeInfo?.headingLevel != null) {
    blocks.push({ type: "heading", text, level: shapeInfo.headingLevel, pageNumber: sectionNum });
  } else {
    blocks.push({ type: "paragraph", text, pageNumber: sectionNum });
  }
}
function extractParagraphText(p) {
  const parts = [];
  collectCharText(p, parts);
  return parts.join("").trim();
}
function collectCharText(node, parts, depth = 0) {
  if (depth > MAX_XML_DEPTH2) return;
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1) continue;
    const tag = localName2(el);
    if (tag === "CHAR") {
      const t = textContent(el);
      if (t) parts.push(t);
    } else if (tag === "TABLE" || tag === "PICTURE" || tag === "SHAPEOBJECT") {
    } else if (tag === "AUTONUM") {
    } else {
      collectCharText(el, parts, depth + 1);
    }
  }
}
function parseTable2(el, blocks, paraShapeMap, sectionNum, warnings) {
  const cells = [];
  const rowCount = parseInt(el.getAttribute("RowCount") ?? "0", 10);
  const colCount = parseInt(el.getAttribute("ColCount") ?? "0", 10);
  if (isNaN(rowCount) || isNaN(colCount) || rowCount === 0 || colCount === 0) return;
  if (rowCount > MAX_TABLE_ROWS || colCount > MAX_TABLE_COLS) {
    warnings.push({ message: `\uD14C\uC774\uBE14 \uD06C\uAE30 \uCD08\uACFC (${rowCount}x${colCount}) \u2014 \uC2A4\uD0B5`, code: "TRUNCATED_TABLE" });
    return;
  }
  const children = el.childNodes;
  for (let i = 0; i < children.length; i++) {
    const rowEl = children[i];
    if (rowEl.nodeType !== 1 || localName2(rowEl) !== "ROW") continue;
    const rowCells = rowEl.childNodes;
    for (let j = 0; j < rowCells.length; j++) {
      const cellEl = rowCells[j];
      if (cellEl.nodeType !== 1 || localName2(cellEl) !== "CELL") continue;
      const colAddr = parseInt(cellEl.getAttribute("ColAddr") ?? "0", 10);
      const rowAddr = parseInt(cellEl.getAttribute("RowAddr") ?? "0", 10);
      const colSpan = Math.min(Math.max(1, parseInt(cellEl.getAttribute("ColSpan") ?? "1", 10) || 1), MAX_TABLE_COLS);
      const rowSpan = Math.min(Math.max(1, parseInt(cellEl.getAttribute("RowSpan") ?? "1", 10) || 1), MAX_TABLE_ROWS);
      const cellText = extractCellText2(cellEl);
      cells.push({ text: cellText, colSpan, rowSpan, colAddr, rowAddr });
    }
  }
  if (cells.length === 0) return;
  const grid = Array.from({ length: rowCount }, () => Array(colCount).fill(null));
  for (const cell of cells) {
    const r = cell.rowAddr ?? 0;
    const c = cell.colAddr ?? 0;
    if (isNaN(r) || isNaN(c) || r >= rowCount || c >= colCount) continue;
    grid[r][c] = cell;
    for (let dr = 0; dr < cell.rowSpan; dr++) {
      for (let dc = 0; dc < cell.colSpan; dc++) {
        if (dr === 0 && dc === 0) continue;
        if (r + dr < rowCount && c + dc < colCount) {
          grid[r + dr][c + dc] = { text: "", colSpan: 1, rowSpan: 1 };
        }
      }
    }
  }
  const cellRows = grid.map(
    (row) => row.map((cell) => cell ?? { text: "", colSpan: 1, rowSpan: 1 })
  );
  const table = buildTable(cellRows);
  blocks.push({ type: "table", table, pageNumber: sectionNum });
}
function extractCellText2(cellEl) {
  const textParts = [];
  collectCellText(cellEl, textParts, 0);
  return textParts.filter(Boolean).join("\n").trim();
}
function collectCellText(node, parts, depth) {
  if (depth > 20) return;
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType !== 1) continue;
    const tag = localName2(el);
    if (tag === "P") {
      const t = extractParagraphText(el);
      if (t) parts.push(t);
    } else if (tag === "TABLE") {
      parts.push("[\uC911\uCCA9 \uD14C\uC774\uBE14]");
    } else {
      collectCellText(el, parts, depth + 1);
    }
  }
}
function localName2(el) {
  return (el.tagName || el.localName || "").replace(/^[^:]+:/, "");
}
function findChild(parent, tag) {
  const children = parent.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType === 1 && localName2(el) === tag) return el;
  }
  return null;
}
function textContent(el) {
  const children = el.childNodes;
  const parts = [];
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.nodeType === 3) {
      parts.push(node.nodeValue || "");
    } else if (node.nodeType === 1) {
      parts.push(textContent(node));
    }
  }
  return parts.join("");
}
function countSections(body) {
  let count = 0;
  const children = body.childNodes;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.nodeType === 1 && localName2(el) === "SECTION") count++;
  }
  return count;
}

// src/index.ts
async function parse(input, options) {
  let buffer;
  const opts = typeof input === "string" && !options?.filePath ? { ...options, filePath: input } : options;
  if (typeof input === "string") {
    try {
      const buf = await readFile(input);
      buffer = toArrayBuffer(buf);
    } catch (err) {
      const msg = err instanceof Error && "code" in err && err.code === "ENOENT" ? `\uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4: ${input}` : `\uD30C\uC77C \uC77D\uAE30 \uC2E4\uD328: ${input}`;
      return { success: false, fileType: "unknown", error: msg, code: "PARSE_ERROR" };
    }
  } else if (Buffer.isBuffer(input)) {
    buffer = toArrayBuffer(input);
  } else {
    buffer = input;
  }
  if (!buffer || buffer.byteLength === 0) {
    return { success: false, fileType: "unknown", error: "\uBE48 \uBC84\uD37C\uC774\uAC70\uB098 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC785\uB825\uC785\uB2C8\uB2E4.", code: "EMPTY_INPUT" };
  }
  const format = detectFormat(buffer);
  switch (format) {
    case "hwpx": {
      const zipFormat = await detectZipFormat(buffer);
      if (zipFormat === "xlsx") return parseXlsx(buffer, opts);
      if (zipFormat === "docx") return parseDocx(buffer, opts);
      return parseHwpx(buffer, opts);
    }
    case "hwp":
      return parseHwp(buffer, opts);
    case "hwpml":
      return parseHwpml(buffer, opts);
    case "pdf":
      return parsePdf(buffer, opts);
    default:
      return { success: false, fileType: "unknown", error: "\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uD30C\uC77C \uD615\uC2DD\uC785\uB2C8\uB2E4.", code: "UNSUPPORTED_FORMAT" };
  }
}
async function parseHwpx(buffer, options) {
  try {
    const { markdown, blocks, metadata, outline, warnings, images } = await parseHwpxDocument(buffer, options);
    return { success: true, fileType: "hwpx", markdown, blocks, metadata, outline, warnings, images: images?.length ? images : void 0 };
  } catch (err) {
    return { success: false, fileType: "hwpx", error: err instanceof Error ? err.message : "HWPX \uD30C\uC2F1 \uC2E4\uD328", code: classifyError(err) };
  }
}
async function parseHwp(buffer, options) {
  try {
    const { markdown, blocks, metadata, outline, warnings, images } = parseHwp5Document(Buffer.from(buffer), options);
    if (isDistributionSentinel(markdown) && isComFallbackAvailable() && options?.filePath) {
      try {
        const { pages, pageCount, warnings: comWarns } = extractTextViaCom(options.filePath);
        if (pages.some((p) => p && p.trim().length > 0)) {
          const com = comResultToParseResult(pages, pageCount, comWarns);
          return {
            success: true,
            fileType: "hwp",
            markdown: com.markdown,
            blocks: com.blocks,
            metadata: com.metadata,
            warnings: com.warnings
          };
        }
      } catch {
      }
    }
    return { success: true, fileType: "hwp", markdown, blocks, metadata, outline, warnings, images: images?.length ? images : void 0 };
  } catch (err) {
    return { success: false, fileType: "hwp", error: err instanceof Error ? err.message : "HWP \uD30C\uC2F1 \uC2E4\uD328", code: classifyError(err) };
  }
}
async function parsePdf(buffer, options) {
  let parsePdfDocument;
  try {
    const mod = await import("./parser-64US4XHN.js");
    parsePdfDocument = mod.parsePdfDocument;
  } catch {
    return {
      success: false,
      fileType: "pdf",
      error: "PDF \uD30C\uC2F1\uC5D0 pdfjs-dist\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4. \uC124\uCE58: npm install pdfjs-dist",
      code: "MISSING_DEPENDENCY"
    };
  }
  try {
    const { markdown, blocks, metadata, outline, warnings, isImageBased } = await parsePdfDocument(buffer, options);
    return { success: true, fileType: "pdf", markdown, blocks, metadata, outline, warnings, isImageBased };
  } catch (err) {
    const isImageBased = err instanceof Error && "isImageBased" in err ? true : void 0;
    return { success: false, fileType: "pdf", error: err instanceof Error ? err.message : "PDF \uD30C\uC2F1 \uC2E4\uD328", code: classifyError(err), isImageBased };
  }
}
async function parseXlsx(buffer, options) {
  try {
    const { markdown, blocks, metadata, warnings } = await parseXlsxDocument(buffer, options);
    return { success: true, fileType: "xlsx", markdown, blocks, metadata, warnings };
  } catch (err) {
    return { success: false, fileType: "xlsx", error: err instanceof Error ? err.message : "XLSX \uD30C\uC2F1 \uC2E4\uD328", code: classifyError(err) };
  }
}
async function parseDocx(buffer, options) {
  try {
    const { markdown, blocks, metadata, outline, warnings, images } = await parseDocxDocument(buffer, options);
    return { success: true, fileType: "docx", markdown, blocks, metadata, outline, warnings, images: images?.length ? images : void 0 };
  } catch (err) {
    return { success: false, fileType: "docx", error: err instanceof Error ? err.message : "DOCX \uD30C\uC2F1 \uC2E4\uD328", code: classifyError(err) };
  }
}
async function parseHwpml(buffer, options) {
  try {
    const { markdown, blocks, metadata, outline, warnings } = parseHwpmlDocument(buffer, options);
    return { success: true, fileType: "hwpml", markdown, blocks, metadata, outline, warnings };
  } catch (err) {
    return { success: false, fileType: "hwpml", error: err instanceof Error ? err.message : "HWPML \uD30C\uC2F1 \uC2E4\uD328", code: classifyError(err) };
  }
}

// src/diff/text-diff.ts
function similarity(a, b) {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}
function normalizedSimilarity(a, b) {
  return similarity(normalize(a), normalize(b));
}
function normalize(s) {
  return s.replace(/\s+/g, " ").trim();
}
var MAX_LEVENSHTEIN_LEN = 1e4;
function levenshtein(a, b) {
  if (a.length + b.length > MAX_LEVENSHTEIN_LEN) {
    const sampleLen = Math.min(500, a.length, b.length);
    let diffs = 0;
    for (let i = 0; i < sampleLen; i++) if (a[i] !== b[i]) diffs++;
    const sampleRate = sampleLen > 0 ? diffs / sampleLen : 1;
    return Math.abs(a.length - b.length) + Math.round(Math.min(a.length, b.length) * sampleRate);
  }
  if (a.length > b.length) [a, b] = [b, a];
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: m + 1 }, (_, i) => i);
  let curr = new Array(m + 1);
  for (let j = 1; j <= n; j++) {
    curr[0] = j;
    for (let i = 1; i <= m; i++) {
      if (a[i - 1] === b[j - 1]) {
        curr[i] = prev[i - 1];
      } else {
        curr[i] = 1 + Math.min(prev[i - 1], prev[i], curr[i - 1]);
      }
    }
    ;
    [prev, curr] = [curr, prev];
  }
  return prev[m];
}

// src/diff/compare.ts
var SIMILARITY_THRESHOLD = 0.4;
async function compare(bufferA, bufferB, options) {
  const [resultA, resultB] = await Promise.all([
    parse(bufferA, options),
    parse(bufferB, options)
  ]);
  if (!resultA.success) throw new Error(`\uBB38\uC11CA \uD30C\uC2F1 \uC2E4\uD328: ${resultA.error}`);
  if (!resultB.success) throw new Error(`\uBB38\uC11CB \uD30C\uC2F1 \uC2E4\uD328: ${resultB.error}`);
  return diffBlocks(resultA.blocks, resultB.blocks);
}
function diffBlocks(blocksA, blocksB) {
  const aligned = alignBlocks(blocksA, blocksB);
  const stats = { added: 0, removed: 0, modified: 0, unchanged: 0 };
  const diffs = [];
  for (const [a, b] of aligned) {
    if (a && b) {
      const sim = blockSimilarity(a, b);
      if (sim >= 0.99) {
        diffs.push({ type: "unchanged", before: a, after: b, similarity: 1 });
        stats.unchanged++;
      } else {
        const diff = { type: "modified", before: a, after: b, similarity: sim };
        if (a.type === "table" && b.type === "table" && a.table && b.table) {
          diff.cellDiffs = diffTableCells(a.table, b.table);
        }
        diffs.push(diff);
        stats.modified++;
      }
    } else if (a) {
      diffs.push({ type: "removed", before: a });
      stats.removed++;
    } else if (b) {
      diffs.push({ type: "added", after: b });
      stats.added++;
    }
  }
  return { stats, diffs };
}
function alignBlocks(a, b) {
  const m = a.length, n = b.length;
  if (m * n > 1e7) return fallbackAlign(a, b);
  const simCache = /* @__PURE__ */ new Map();
  const getSim = (i2, j2) => {
    const key = `${i2},${j2}`;
    let v = simCache.get(key);
    if (v === void 0) {
      v = blockSimilarity(a[i2], b[j2]);
      simCache.set(key, v);
    }
    return v;
  };
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i2 = 1; i2 <= m; i2++) {
    for (let j2 = 1; j2 <= n; j2++) {
      if (getSim(i2 - 1, j2 - 1) >= SIMILARITY_THRESHOLD) {
        dp[i2][j2] = dp[i2 - 1][j2 - 1] + 1;
      } else {
        dp[i2][j2] = Math.max(dp[i2 - 1][j2], dp[i2][j2 - 1]);
      }
    }
  }
  const pairs = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (getSim(i - 1, j - 1) >= SIMILARITY_THRESHOLD && dp[i][j] === dp[i - 1][j - 1] + 1) {
      pairs.push([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  pairs.reverse();
  const result = [];
  let ai = 0, bi = 0;
  for (const [pi, pj] of pairs) {
    while (ai < pi) result.push([a[ai++], null]);
    while (bi < pj) result.push([null, b[bi++]]);
    result.push([a[ai++], b[bi++]]);
  }
  while (ai < m) result.push([a[ai++], null]);
  while (bi < n) result.push([null, b[bi++]]);
  return result;
}
function fallbackAlign(a, b) {
  const result = [];
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    result.push([a[i] || null, b[i] || null]);
  }
  return result;
}
function blockSimilarity(a, b) {
  if (a.type !== b.type) return 0;
  if (a.text !== void 0 && b.text !== void 0) {
    return normalizedSimilarity(a.text || "", b.text || "");
  }
  if (a.type === "table" && a.table && b.table) {
    return tableSimilarity(a.table, b.table);
  }
  if (a.type === b.type) return 1;
  return 0;
}
function tableSimilarity(a, b) {
  const dimSim = 1 - Math.abs(a.rows * a.cols - b.rows * b.cols) / Math.max(a.rows * a.cols, b.rows * b.cols, 1);
  const textsA = a.cells.flat().map((c) => c.text).join(" ");
  const textsB = b.cells.flat().map((c) => c.text).join(" ");
  const contentSim = normalizedSimilarity(textsA, textsB);
  return dimSim * 0.3 + contentSim * 0.7;
}
function diffTableCells(a, b) {
  const maxRows = Math.max(a.rows, b.rows);
  const maxCols = Math.max(a.cols, b.cols);
  const result = [];
  for (let r = 0; r < maxRows; r++) {
    const row = [];
    for (let c = 0; c < maxCols; c++) {
      const cellA = r < a.rows && c < a.cols ? a.cells[r][c].text : void 0;
      const cellB = r < b.rows && c < b.cols ? b.cells[r][c].text : void 0;
      let type;
      if (cellA === void 0) type = "added";
      else if (cellB === void 0) type = "removed";
      else if (cellA === cellB) type = "unchanged";
      else type = "modified";
      row.push({ type, before: cellA, after: cellB });
    }
    result.push(row);
  }
  return result;
}

export {
  extractHwpxMetadataOnly,
  extractHwp5MetadataOnly,
  extractFormFields,
  fillFormFields,
  fillHwpx,
  markdownToHwpx,
  compare,
  parse
};
//# sourceMappingURL=chunk-4DMPYLJY.js.map