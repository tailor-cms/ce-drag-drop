# Drag & Drop

Gradable drag & drop question element. Learners drag answers into the correct
answer groups.

**Type:** `DRAG_DROP`

## Data

| Field | Type | Description |
|-------|------|-------------|
| `question` | `string[]` | Embedded question (Tiptap HTML) element ids |
| `embeds` | `Record<string, any>` | Embedded element map keyed by id |
| `groups` | `Record<string, string>` | Answer group names keyed by group id |
| `answers` | `Record<string, string>` | Answer labels keyed by answer id |
| `correct` | `Record<string, string[]>?` | Correct answer ids per group (gradable only) |
| `hint` | `string` | Optional hint shown to the learner |
| `isGradable` | `boolean?` | Whether the question is graded |

## Edit

- Question prompt area (embedded Tiptap element)
- Answer groups list with inline rename and add/remove controls
- Per-group answers with add/remove controls
- Requires at least two groups with at least one answer each
- Confirmation dialog on group removal
- Hint field (question form)

## Display

- Answers pool chip area that the learner drags from
- One drop zone per group; chips can be returned to the pool via the close icon
- Validates that all answers are placed before submit
- On submit, chips are color-coded as correct (green) or incorrect (red)
- Retry restores the initial state

## Development

```sh
pnpm dev     # Preview :8080 | Edit :8010 | Display :8020 | Server :8030
pnpm build
pnpm lint
pnpm test
```

## Run with Docker

```sh
docker compose up
```
