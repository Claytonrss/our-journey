---
description: Criar branch, commit semântico, push e PR com spec em pt-br
---

Você vai executar o fluxo completo de submissão de código seguindo rigorosamente estas etapas:

## 1. Verificar estado atual

Execute e analise:

```bash
git status
git diff --stat
```

Se não houver mudanças, informe ao usuário e pare.

## 2. Criar branch

Pergunte ao usuário (se não foi fornecido em $ARGUMENTS):

- Tipo: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
- Descrição curta (kebab-case, inglês, máximo 50 chars)

Crie a branch:

```bash
git checkout -b <tipo>/<descrição>
```

Exemplo: `feat/add-spotify-authentication`

## 3. Commits semânticos

Para cada arquivo/grupo lógico de mudanças:

```bash
git add <arquivos>
git commit -m "<type>(<scope>): <description>"
```

Formato Conventional Commits (em inglês):

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation
- `style`: formatting, semicolons, etc
- `refactor`: code change that neither fixes a bug nor adds a feature
- `test`: adding or correcting tests
- `chore`: maintenance (deps, config, etc)

Scope opcional: `auth`, `map`, `player`, `ui`, `api`, etc

Exemplos:

- `feat(auth): add PIN validation with rate limiting`
- `fix(map): correct initial zoom on memories`
- `docs(readme): update deploy instructions`

## 4. Push

```bash
git push -u origin <nome-da-branch>
```

## 5. Criar PR com spec em pt-br

Gere o PR usando `gh pr create` com o seguinte template:

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

## 6. Confirmar sucesso

Informe ao usuário:

- URL do PR criado
- Resumo do que foi feito
- Próximos passos sugeridos (ex: aguardar CI, pedir review)

## Regras importantes

- **NUNCA** commite direto na `main`
- **NUNCA** force push
- **SEMPRE** use Conventional Commits em inglês (branch e commits)
- **SEMPRE** escreva descrição do PR em pt-br
- **SEMPRE** inclua a seção "Especificação" no PR
- Se algo falhar, pare e informe o erro — não tente corrigir automaticamente
