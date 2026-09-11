# Administrador global do HELPFUT

## Objetivo
Dar à conta administrativa já definida acesso global seguro para visualizar, modificar e excluir qualquer conteúdo dos times, sem expor a senha nem liberar essas ações a usuários comuns.

## O que será feito
- Manter a identificação administrativa pelo papel `admin` validado no servidor.
- Ampliar as permissões do administrador para alterar ou excluir perfis completos de times, incluindo agenda, jogadores e conquistas.
- Adicionar na tela Admin:
  - edição do perfil e da agenda de qualquer time;
  - edição e exclusão de jogadores;
  - edição e exclusão de conquistas;
  - exclusão da conta/time com confirmação explícita;
  - manutenção dos controles de bloquear e liberar acesso.
- Proteger todas as operações no servidor, impedindo que um usuário comum simule ações administrativas.
- Impedir que o administrador exclua ou bloqueie a própria conta por acidente.

## Detalhes técnicos
- As alterações usarão funções autenticadas e validarão o papel administrativo antes de qualquer leitura ou escrita global.
- A exclusão removerá a conta de autenticação; os dados relacionados serão removidos pela relação existente ou explicitamente quando necessário.
- A senha informada será usada apenas para validar a conta, sem ser gravada no código ou exibida na interface.
- A tela administrativa será adaptada para celular e manterá a identidade visual atual do HELPFUT.

## Validação
- Conferir acesso administrativo com a conta indicada.
- Testar edição de dados, bloqueio/liberação e confirmações de exclusão.
- Confirmar que usuários comuns continuam restritos aos próprios dados.
- Verificar o app em tela móvel e sem erros de execução.
