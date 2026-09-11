# Campo Inteligente

Crie um aplicativo completo de futebol amador (HELPFUT) mobile-first com tema escuro esportivo (fundo grafite/escuro, detalhes em verde gramado neon e branco) e barra de navegação inferior (Bottom Navigation Bar) com dois módulos principais:

1. Módulo Várzea (Perfil e Gestão do Time):
- Cadastro e edição do perfil do time: Nome, Foto/Escudo, Biografia, Redes sociais (Instagram, WhatsApp) e Contato (E-mail, Telefone).
- Consulta de CEP via API ViaCEP (https://viacep.com.br/ws/{cep}/json/) para preenchimento automático de Rua e Cidade.
- Seleção de dias de jogo disponíveis (dias da semana e períodos) e alternador Mandante / Visitante.
- Galeria / Aba de Troféus com cadastro de conquistas (Título, Ano, Descrição e Foto).

2. Módulo Rachão (Sorteio Inteligente de Times):
- Cadastro de Jogadores com cálculo automático de Score Total = Faixa Etária (< 25: 4pts, 25-39: 3pts, 40-49: 2pts, 50+: 1pt) + Nível Técnico (Café com Leite: 1pt, Mediano: 2pts, Destaque: 3pts, Já jogou base/pro: 4pts) + Fôlego (Pouco: 1pt, Mediano: 2pts, Mito/Inteiro: 3pts), além da Posição (Goleiro, Defesa, Meio-campo, Ataque).
- Lista de presença com checkboxes para marcar quem vai jogar hoje.
- Gerador de Sorteio com algoritmo Snake Draft: separa 1 goleiro por time, ordena os jogadores de linha por score e distribui de forma equilibrada para balancear a pontuação total e a média de idade.
- Visualização dos times sorteados (Time Verde vs Time Colete) com média de pontuação e estatísticas comparativas.

Inclua dados de exemplo (mock data) para teste imediato de ambos os módulos.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://helpfut.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f5c5414f-971a-4577-b903-85cdc18bcdb7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
