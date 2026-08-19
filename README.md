# Vaga Certa Agora

Estou criando um site igual o infojobs



Crie um aplicativo web responsivo (focado em mobile) de vagas de emprego gerais para o mercado de massa e operacional. O design deve ser ultra limpo, moderno, intuitivo e focado em alta acessibilidade para usuários leigos ou com pouca escolaridade. O sistema possui dois fluxos principais: o do Candidato e o da Empresa (RH).

### 1. FLUXO DO CANDIDATO (Acessibilidade Máxima / Mobile)

A página inicial do candidato deve ter botões grandes, ícones claros e o mínimo de texto possível. O cadastro deve ser feito em pouquíssimos passos na mesma tela (Single Page Application com estados):

- Passo 1 (Profissão): Botões grandes com ícones visuais para o usuário clicar na sua área (Ex: 🧹 Limpeza, 🔨 Obras/Pedreiro, 📦 Ajudante/Estoque, 🚗 Motorista/Entregador, 🛎️ Recepção/Portaria).

- Passo 2 (Localização): Um botão grande de destaque "📍 Encontrar vagas perto de mim" que simule a captura da localização via GPS/Navegador para preencher o bairro e a cidade automaticamente (ou um campo simples de CEP/Cidade se falhar).

- Passo 3 (Currículo por Áudio ou Foto - O Core da Acessibilidade): 

  * Opção A: Um botão grande e central com ícone de microfone (estilo gravador do WhatsApp) que permite ao usuário gravar um áudio de até 1 minuto contando suas experiências de trabalho. Adicione um ícone de alto-falante ao lado que "narra" em texto o que ele deve fazer.

  * Opção B: Um botão "📸 Tirar foto do meu currículo de papel" que abre a câmera para ele anexar uma imagem da carteira de trabalho ou currículo antigo.

- Passo Final (Visualização e Upsell B2C): Após o envio do áudio/foto, mostre uma tela simulando o perfil dele processado pela IA (Nome, Telefone e Profissões). Adicione um card de checkout de alta conversão: "Quer baixar seu currículo profissional perfeito em PDF para mandar no WhatsApp ou imprimir? Gerar PDF por R$ 9,90 no Pix" e outro "Furar Fila para o topo das vagas por R$ 4,90".

### 2. FLUXO DA EMPRESA (Dashboard do Recrutador / Desktop)

Um painel administrativo limpo e profissional para as empresas que estão contratando:

- Lista de Candidatos cadastrados. O RH não ouve áudios; ele vê os perfis com as informações já totalmente estruturadas em texto limpo (Nome, Bairro, Cidade, Telefone e Resumo de Experiências Profissionais extraídas do áudio).

- Filtros rápidos por: Bairro/Raio de Distância, Profissão, e Idade.

- Sistema de classificação simples: botões para o RH marcar o candidato como "Aprovado para Entrevista", "Pendente" ou "Recusado".

- Tela para a empresa cadastrar uma nova vaga de emprego preenchendo Título, Salário, Horário e Bairro.

### 3. DESIGN E CORES

- Use uma paleta de cores moderna, amigável e confiável (como tons de azul escuro para o painel profissional e verde/botões coloridos chamativos para o fluxo do celular do candidato).

- Os botões no fluxo do candidato devem parecer elementos de aplicativos familiares (como botões grandes de toque, cantos arredondados, fontes grandes e legíveis).

Gere a estrutura inicial com dados fictícios para que eu possa navegar pelos dois fluxos e testar a usabilidade do aplicativo.





A ideia é ganhar do lado do empregador, me dê ideias também.



Quero que o seo seja absurdo de bom, quero aquela lógica dinâmica igual o pornhub faz, de quando você pesquisa um assunto ele gera pra você mas quando entra não tem nada do que você procurou.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://job-express-facil.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f540e22b-4e9f-464c-a652-5e61aa0a6160).

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
