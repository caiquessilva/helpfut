# Área administrativa do HELPFUT

## Objetivo
Criar uma tela exclusiva para administradores acompanharem todas as contas de times e controlarem o acesso delas, sem enfraquecer a privacidade atual.

## O que será entregue
- Área `/admin` acessível somente por contas com função de administrador.
- A conta `7caiquess@gmail.com` será definida como administradora inicial.
- Painel com busca e indicadores de total de times, contas liberadas, bloqueadas e quantidade de jogadores.
- Lista de todos os times com nome, escudo, sede, contatos, agenda confirmada e quantidade de jogadores.
- Detalhe expansível de cada time, mostrando agenda e jogadores cadastrados.
- Controle para liberar ou bloquear cada conta, com confirmação visual do resultado.
- Atalho “Admin” exibido somente para administradores.
- Contas bloqueadas serão impedidas de acessar as áreas privadas e verão uma tela clara de bloqueio com opção de sair.

## Segurança e dados
- Criar uma tabela separada de funções de usuário e outra de status das contas; funções administrativas não serão guardadas no perfil do time.
- Aplicar regras de acesso para que times comuns continuem vendo e alterando somente os próprios dados.
- Toda leitura global e toda ação de bloqueio serão validadas no servidor após confirmar a função de administrador.
- O bloqueio será aplicado na entrada das áreas privadas e também nas operações protegidas do painel.

## Validação
- Confirmar que um administrador abre o painel e consulta os times.
- Confirmar que um usuário comum não acessa `/admin` nem lê dados de outros times.
- Confirmar que bloquear e liberar altera o estado da conta.
- Confirmar que uma conta bloqueada perde o acesso às áreas privadas.
- Verificar a tela em celular e desktop, além do estado final de compilação.
