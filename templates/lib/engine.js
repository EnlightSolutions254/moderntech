'use strict';

/**
 * Minimal, dependency-free template engine.
 *
 * Supported syntax:
 *   {{path.to.value}}              -> prints a value from the root data object
 *   {{this}}                       -> current loop item (inside #each)
 *   {{this.field}}                 -> field on current loop item (inside #each)
 *   {{@index1}}                    -> 1-based index of current loop item
 *   {{@index}}                     -> 0-based index of current loop item
 *   {{@first}} / {{@last}}         -> booleans, true on first/last loop item
 *   {{#each path}} ... {{/each}}   -> loop over an array (path resolves against
 *                                     root data, OR "this.field" for an array
 *                                     nested on the current loop item)
 *   {{#if path}} ... {{/if}}       -> conditional (truthy check)
 *   {{#if path}} ... {{else}} ... {{/if}}
 *
 * Paths are dot-separated and support numeric array indices, e.g.
 * "product.images.0.src".
 */

function getPath(obj, path) {
  if (path === '' || path == null) return obj;
  const parts = path.split('.');
  let cur = obj;
  for (const part of parts) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

function resolve(token, scopeStack, root) {
  token = token.trim();

  if (token.startsWith('@')) {
    const scope = scopeStack[scopeStack.length - 1];
    if (!scope) return undefined;
    switch (token) {
      case '@index': return scope.index;
      case '@index1': return scope.index + 1;
      case '@first': return scope.index === 0;
      case '@last': return scope.index === scope.length - 1;
      default: return undefined;
    }
  }

  if (token === 'this') {
    const scope = scopeStack[scopeStack.length - 1];
    return scope ? scope.item : undefined;
  }

  if (token.startsWith('this.')) {
    const scope = scopeStack[scopeStack.length - 1];
    if (!scope) return undefined;
    return getPath(scope.item, token.slice(5));
  }

  // Plain dotted path always resolves against the root data object.
  return getPath(root, token);
}

function escapeHtmlAttr(val) {
  // Templates already contain literal HTML; we only stringify values.
  // (Escaping is intentionally minimal since this generates static HTML
  // from trusted, hand-authored data files, not user input.)
  if (val === undefined || val === null) return '';
  return String(val);
}

/**
 * Tokenizes and renders `template` against `root` data.
 */
function render(template, root) {
  let i = 0;
  const len = template.length;

  function nextTag() {
    const start = template.indexOf('{{', i);
    if (start === -1) return null;
    const end = template.indexOf('}}', start);
    if (end === -1) throw new Error('Unclosed {{ tag near position ' + start);
    return { start, end, raw: template.slice(start + 2, end).trim() };
  }

  function renderBlock(scopeStack, stopTags) {
    let out = '';
    while (i < len) {
      const tag = nextTag();
      if (!tag) {
        out += template.slice(i);
        i = len;
        break;
      }
      // literal text before the tag
      out += template.slice(i, tag.start);
      i = tag.end + 2;

      if (stopTags && stopTags.includes(tag.raw)) {
        // Let caller consume this closing/else tag; rewind so caller sees it.
        i = tag.start;
        return { out, stopTag: tag.raw };
      }

      if (tag.raw.startsWith('#each ')) {
        const path = tag.raw.slice(6).trim();
        const arr = resolve(path, scopeStack, root) || [];
        const bodyStart = i;
        // Find matching {{/each}} accounting for nesting of #each/#if.
        const bodyEnd = findMatchingEnd(bodyStart, '#each', '/each');
        const bodyTpl = template.slice(bodyStart, bodyEnd.start);
        i = bodyEnd.end + 2; // move past {{/each}}

        for (let idx = 0; idx < arr.length; idx++) {
          const childStack = scopeStack.concat([{ item: arr[idx], index: idx, length: arr.length }]);
          out += render(bodyTpl, root, childStack);
        }
        continue;
      }

      if (tag.raw.startsWith('#if ')) {
        const path = tag.raw.slice(4).trim();
        const val = resolve(path, scopeStack, root);
        const truthy = Array.isArray(val) ? val.length > 0 : !!val;
        const bodyStart = i;
        const bodyEnd = findMatchingEndIf(bodyStart);
        const ifTpl = template.slice(bodyStart, bodyEnd.elseStart != null ? bodyEnd.elseStart : bodyEnd.end);
        const elseTpl = bodyEnd.elseStart != null ? template.slice(bodyEnd.elseEnd, bodyEnd.end) : '';
        i = bodyEnd.close.end + 2; // past {{/if}}
        out += render(truthy ? ifTpl : elseTpl, root, scopeStack);
        continue;
      }

      // plain variable
      out += escapeHtmlAttr(resolve(tag.raw, scopeStack, root));
    }
    return { out, stopTag: null };
  }

  // Helpers that scan for matching #each/#if closers, honoring nesting.
  function findMatchingEnd(from, openPrefix, closeTag) {
    let depth = 1;
    let pos = from;
    while (depth > 0) {
      const start = template.indexOf('{{', pos);
      if (start === -1) throw new Error('Unclosed {{' + openPrefix + '}} block');
      const end = template.indexOf('}}', start);
      const raw = template.slice(start + 2, end).trim();
      if (raw.startsWith(openPrefix + ' ')) depth++;
      else if (raw === closeTag) depth--;
      pos = end + 2;
      if (depth === 0) return { start, end };
    }
  }

  function findMatchingEndIf(from) {
    let depth = 1;
    let pos = from;
    let elseStart = null, elseEnd = null;
    while (depth > 0) {
      const start = template.indexOf('{{', pos);
      if (start === -1) throw new Error('Unclosed {{#if}} block');
      const end = template.indexOf('}}', start);
      const raw = template.slice(start + 2, end).trim();
      if (raw.startsWith('#if ')) depth++;
      else if (raw === '/if') depth--;
      else if (raw === 'else' && depth === 1) { elseStart = start; elseEnd = end + 2; }
      pos = end + 2;
      if (depth === 0) return { close: { start, end }, elseStart, elseEnd, end: start };
    }
  }

  if (arguments.length > 2) {
    // internal recursive call signature: render(tpl, root, scopeStack)
  }

  const scopeStack = arguments[2] || [];
  i = 0;
  const result = renderBlock(scopeStack, null);
  return result.out;
}

module.exports = { render, getPath, resolve };
