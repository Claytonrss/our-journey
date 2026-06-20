---
description: Create branch, semantic commits, push, and PR with spec in pt-br
---

You will execute the complete code submission flow following these steps rigorously:

## 1. Check current state

Run and analyze:

```bash
git status
git diff --stat
```

If there are no changes, inform the user and stop.

## 2. Create branch

Ask the user (if not provided in $ARGUMENTS):

- Type: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
- Short description (kebab-case, English, max 50 chars)

Create the branch:

```bash
git checkout -b <type>/<description>
```

Example: `feat/add-spotify-authentication`

## 3. Semantic commits

For each file/logical group of changes:

```bash
git add <files>
git commit -m "<type>(<scope>): <description>"
```

Conventional Commits format (in English):

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation
- `style`: formatting, semicolons, etc
- `refactor`: code change that neither fixes a bug nor adds a feature
- `test`: adding or correcting tests
- `chore`: maintenance (deps, config, etc)

Optional scope: `auth`, `map`, `player`, `ui`, `api`, etc

Examples:

- `feat(auth): add PIN validation with rate limiting`
- `fix(map): correct initial zoom on memories`
- `docs(readme): update deploy instructions`

## 4. Push

```bash
git push -u origin <branch-name>
```

## 5. Create PR with spec in pt-br

Generate the PR using `gh pr create` with the following template:

```bash
gh pr create --title "<type>(<scope>): <title>" --body "
## 📋 Especificação

### O que foi implementado
<descrição detalhada em pt-br do que foi feito>

### Por que foi feito
<contexto e motivação em pt-br>

### Como testar
<passos para testar em pt-br>

### Checklist
- [ ] Testes passing
- [ ] Lint passing
- [ ] Build passing
- [ ] Documentação atualizada (se aplicável)
- [ ] Memory files atualizados (se aplicável)

## 🎯 Tipo de mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação
- [ ] Refatoração
- [ ] Configuração/Chores
"
```

## 6. Confirm success

Inform the user:

- Created PR URL
- Summary of what was done
- Suggested next steps (e.g., wait for CI, request review)

## Important rules

- **NEVER** commit directly to `main`
- **NEVER** force push
- **ALWAYS** use Conventional Commits in English (branch and commits)
- **ALWAYS** write PR description in pt-br
- **ALWAYS** include the "Especificação" section in the PR
- If something fails, stop and report the error — do not try to fix automatically
