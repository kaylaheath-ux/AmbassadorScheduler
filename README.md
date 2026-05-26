# AmbassadorScheduler

## Student API — Plan

A local TypeScript REST API that serves student information from a hardcoded JSON file.

### Stack
- **Node.js + TypeScript**
- **Express** for the HTTP server (small, ubiquitous, easy to extend later)
- **tsx** for running TS directly in dev (no separate build step needed locally)

### Project structure
```
AmbassadorScheduler/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # server entry, wires up routes, listens on port
│   ├── routes/
│   │   └── students.ts   # GET /students/:id handler
│   └── data/
│       └── students.json # hardcoded student data
```

### Endpoints
- `GET /students/:id` → returns the student object, or `404` if no match
- `GET /students` → returns the full list (useful for sanity-checking)

### Implementation steps
1. `npm init -y`, install `express`, `@types/express`, `typescript`, `tsx`, `@types/node`
2. Add `tsconfig.json` (target ES2022, strict, moduleResolution node, `resolveJsonModule: true`)
3. Define a `Student` TypeScript type matching the JSON shape
4. Load `students.json` once at startup (import it directly)
5. Build the route: parse `:id` to number, find in array, return JSON or 404
6. Add an `npm run dev` script that runs `tsx watch src/index.ts`
7. Move `students.json` into `src/data/`
8. Run locally and curl `http://localhost:3000/students/1` to verify

### Defaults
- Port: `3000`
- `students.json` lives at `src/data/students.json` (single source of truth)
- List endpoint (`GET /students`) included