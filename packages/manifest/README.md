# @tailor-cms/ce-drag-drop-manifest

Shared element definition for the **Drag & Drop** content element in [Tailor CMS](https://github.com/tailor-cms/author).

Declares the element type, display name, UI configuration and initial state. The authoring, end-user and server packages all build on it, so it is the only package that has to be understood to know what the element *is*.

## Installation

```sh
npm install @tailor-cms/ce-drag-drop-manifest
```

## Usage

Content elements are normally registered with Tailor through the element
registry rather than imported directly, but the package can be consumed on its
own:

```ts
import manifest, { type ElementData } from '@tailor-cms/ce-drag-drop-manifest';

manifest.type;       // 'DRAG_DROP'
manifest.initState(); // initial element data
```

## Element

| Property | Value |
| --- | --- |
| Name | Drag & Drop |
| Type | `DRAG_DROP` |
| Icon | [`mdi-cursor-move`](https://pictogrammers.com/library/mdi/) |
| Composite | Yes |
| Question | Yes |

## Packages

This element ships as four packages, published together from the
[`ce-drag-drop`](https://github.com/tailor-cms/ce-drag-drop) repository:

| Package | Role |
| --- | --- |
| [`@tailor-cms/ce-drag-drop-manifest`](https://www.npmjs.com/package/@tailor-cms/ce-drag-drop-manifest) | Shared element definition |
| [`@tailor-cms/ce-drag-drop-edit`](https://www.npmjs.com/package/@tailor-cms/ce-drag-drop-edit) | Authoring component |
| [`@tailor-cms/ce-drag-drop-display`](https://www.npmjs.com/package/@tailor-cms/ce-drag-drop-display) | End-user component |
| [`@tailor-cms/ce-drag-drop-server`](https://www.npmjs.com/package/@tailor-cms/ce-drag-drop-server) | Server-side module |

## Development

```sh
pnpm install
pnpm dev     # start the Content Element Kit runtime
pnpm build   # build all packages
pnpm test    # Playwright end-to-end suite
```

Changes are released with [changesets](https://github.com/changesets/changesets);
run `pnpm changeset` to record one.
