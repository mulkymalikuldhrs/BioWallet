# Contributing to Our Project

First off, thank you for considering contributing! We welcome everyone — whether you're fixing a typo, reporting a bug, suggesting a feature, or writing code. Every contribution matters.

## Welcome

We're glad you're here. This project is built by people who care, and we'd love for you to be part of it. No contribution is too small — from fixing a typo in documentation to implementing a new feature, we appreciate it all.

If you're new to open source, look for issues labeled `good first issue` or `help wanted`. Those are great starting points.

## How to Contribute

### 1. Fork the Repository

Click the **Fork** button at the top right of the repository page. This creates your own copy of the project.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME
```

### 3. Create a Branch

```bash
git checkout -b my-contribution
```

Use a descriptive branch name like `fix/login-bug` or `feature/add-search`.

### 4. Make Your Changes

Write your code, fix that bug, improve that doc — whatever you set out to do.

### 5. Commit Your Changes

```bash
git add .
git commit -m "Brief description of what you changed"
```

Write clear, concise commit messages. Explain **what** and **why**, not **how**.

### 6. Push to Your Fork

```bash
git push origin my-contribution
```

### 7. Open a Pull Request

Go to the original repository on GitHub. You'll see a **Compare & pull request** button. Click it, fill out the PR template, and submit!

## Development Setup

BioWallet is a **Yarn workspaces + Turborepo monorepo** (Yarn 1 Classic, not npm) with a PostgreSQL database run via Docker.

1. Fork and clone the repo (see above)
2. Follow the **[Quick Start in the README](./README.md#quick-start)** for the full, tested setup — in short:
   ```bash
   yarn install                              # install all workspaces
   cp .env.example .env
   cp backend/api/.env.example backend/api/.env
   cp apps/web/.env.example apps/web/.env.local
   yarn docker:up                            # start PostgreSQL
   yarn prisma:generate && yarn prisma:migrate
   yarn dev:backend   # API  → http://localhost:3001
   yarn dev:web       # web  → http://localhost:12000
   ```

   > **Keep `POSTGRES_PASSWORD` in sync:** the value in `.env` must match the
   > password inside `backend/api/.env`'s `DATABASE_URL`, or the API can't
   > connect to Postgres. Replace every `CHANGE_ME_*` placeholder before starting.
3. Create a branch for your work
4. Make changes and test them locally
5. Run `yarn test` and ensure existing tests pass before submitting

> **Note:** The README's Quick Start is the source of truth for setup — keep it and this section in sync when either changes.

## Code Style Guidelines

- **Consistency** matters more than personal preference. Follow the existing code style.
- Use meaningful variable and function names.
- Write comments for complex logic — help the next person understand your thinking.
- Keep functions small and focused.
- Run any existing linters or formatters before committing:
  ```bash
  # Examples (project-dependent):
  npm run lint        # JavaScript/TypeScript
  flake8 .            # Python
  cargo clippy        # Rust
  ```
- If the project has a `.editorconfig` or formatting config, respect it.

## Reporting Bugs

Found a bug? Please open an [issue](../../issues) and include:

1. **What happened** — the unexpected behavior
2. **What you expected** — what should have happened
3. **Steps to reproduce** — how to trigger the bug
4. **Environment** — OS, browser, runtime version, etc.
5. **Screenshots or logs** — if applicable

The more detail you provide, the faster we can fix it.

## Suggesting Features

We love feature ideas! Open an [issue](../../issues) with:

1. **The problem** — what are you trying to solve?
2. **Your proposed solution** — how would you like it to work?
3. **Alternatives considered** — any other approaches you thought of
4. **Additional context** — screenshots, links, examples from other projects

Even if we can't implement it right away, good feature requests help us plan.

## Pull Request Process

1. **One thing per PR** — keep PRs focused on a single change. It's easier to review and merge.
2. **Update documentation** — if your change affects behavior, update the relevant docs.
3. **Add tests** — if applicable, add tests for your changes.
4. **Ensure CI passes** — fix any failing checks before requesting review.
5. **Be responsive** — if a reviewer asks questions or suggests changes, respond promptly.
6. **Be patient** — maintainers review PRs as time allows. We'll get to yours.

### PR Checklist

Before submitting, make sure you've:

- [ ] Read the contributing guidelines
- [ ] Made your changes in a new branch (not main)
- [ ] Written clear commit messages
- [ ] Added/updated tests if applicable
- [ ] Updated documentation if applicable
- [ ] Verified all existing tests still pass

## Questions?

Feel free to open an issue with the `question` label, or start a discussion in the Discussions tab if enabled. There are no silly questions — we're all here to learn and build together.

## Thank You

Every contribution makes this project better. Whether it's your first PR or your hundredth, we appreciate you taking the time to contribute. Thank you! 💙
