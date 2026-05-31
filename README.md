# Vura Astrology
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/css3-%23663399.svg?style=for-the-badge&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Responsive](https://img.shields.io/badge/Responsivo-Sim-green?style=for-the-badge)

> **Vura**: Plataforma web de alta performance voltada ao autoconhecimento por meio da astrologia. O projeto integra um front-end moderno, totalmente responsivo e personalizável,
 com um back-end robusto e escalável. Por meio de APIs especializadas, o sistema automatiza os cálculos necessários para a geração de mapas astrais a partir dos dados de nascimento fornecidos pelo usuário.
O foco central foi baseado no propósito de entregar uma experiência fluida, dinâmica, segura e de fácil acesso, transformando interpretações complexas em textos curtos, permitindo que qualquer pessoa explore
aspectos de sua personalidade, aprofunde seu conhecimento sobre astrologia e descubra mais sobre si mesma ou sobre pessoas especiais.
 ## Visualização do Projeto: 
<img width="1895" height="988" alt="Captura de tela 2026-05-30 161611" src="https://github.com/user-attachments/assets/4c6cb70c-d2b7-4571-b1c3-6bc696e6acc9" />

🔗 **[Acesse o projeto ao vivo aqui](https://vuraastrology.github.io/Vura/)**

---

## Funcionalidades:

* **cadastro e autenticação Segura**: criação de conta com nome, email e senha criptografada, com login protegido e e-mail único por usuário.
* **Geração de Mapa Astral**: Formulário que coleta a  data, horário e local de nascimento e integra com API astrológica externa para gerar a mandala astral personalizada em até 10 segundos.
* **Interpretações Astrológicas**: Exibição organizada das interpretações dos posicionamentos planetários associados ao mapa gerado.
* **Histórico de Consultas e Mapas**: Armazenamento automático  dos mapas gerados, permitindo que o usuário possa visitá-los os mapas gerados, sem a necessidade de reinserir os dados.
* **Catálogos de Signos**: Listagem dos 12 signos do zodíaco com descrições resumidas e página de detalhes sobre cada um.
* **Casas Astrológicas**: Seção com filtros para consulta das casas astrológicas e seus significados em cada signo.
* **Posicionamentos Astrológicos**: Seção de visualização de astros e seus significados em cada signo com filtros para o refinamento da busca.
* **Exclusão de Mapas com Confirmação**:  Exclusão de mapas astrais e conta de usuário protegida por confirmação de senha.
* **Atualização de senha**: Envio de email de atualização de senha caso o usuário solicite a nova senha de acesso via token com 15min válidos para melhor segurança de dados.
* **Design Responsivo e Temático**: Sistema de temas e recursos de acessibilidade que permitem ao usuário personalizar a plataforma de acordo com suas preferências, realizando ajustes visuais  e criando uma experiência mais confortável e alinhada ao seu estilo. 

---

## 👩‍💻 Tecnologias Utilizadas:
### **Front-end:**
* **HTML5 Semântico** -  Estruturação das páginas com foco em organização, acessibilidade e boas práticas de desenvolvimento.
* **CSS3 Moderno** -  Desenvolvimento de uma interface responsiva, sistema de temas personalizáveis e recursos de acessibilidade, utilizando Flexbox, Grid Layout e animações.
* **JavaScript** - Implementação da lógica da aplicação, manipulação do DOM, validação de formulários, consumo de APIs e criação de elementos dinâmicos.
* **JSON**: Armazenamento e manipulação de dados estruturados utilizados pela aplicação.
* **GitHub Pages**: responsavél por deixar o arquivos do front-end online.

### **Back-end:**
* **Node.js** -  Desenvolvimento do ambiente de execução do servidor e gerenciamento das funcionalidades da aplicação.
* **Express.js** - Criação de rotas, gerenciamento de requisições HTTP e integração entre front-end, APIs e banco de dados.
* **bcrypt** - Criptografia e proteção das senhas dos usuários.
* **Nodemailer** - Implementação do sistema de envio de e-mails para recuperação de senha e comunicação com usuários.
* **node-fetch** - Consumo e integração com APIs externas.
* **Crypto** - Geração de tokens seguros para autenticação e recuperação de senha.
* **CORS**- Gerenciamento e controle de acesso entre diferentes origens da aplicação.
* **Render** - Responsavél pelo back-end e enviar os arquivos via nodemailer.

### **Banco de dados**:
* **MySQL**- Armazenamento e gerenciamento das informações dos usuários e dados da plataforma.

### **APIs Integradas**:
* **FreeAstroAPI** -  Responsável pelos cálculos astrológicos e geração das informações utilizadas nos mapas astrais.
* **API de Geolocalização** - Conversão de cidades e localidades em coordenadas geográficas necessárias para os cálculos astrológicos.

* **Railway** - Hospedagem do banco de dados e infraestrutura da aplicação.

---

## Como Executar o projeto
> para executar o projeto Vura localmente siga o passo a passo abaixo:

### Pré-requisitos:
Antes de começar, certifique-se de ter instalado em sua máquina:
* **node.js**
* **npm**
* **MySQL**

1. Clone o Repositório:
   ```bash
   git clone https://github.com/VuraAstrology/Vura.git

2. Instale as Dependências:
   ```bash
   npm install
3.  Configure o banco de dados:
* Crie um banco de dados MySQL e ajuste as credenciais de conexão utilizadas pelo projeto.
4. Configure as Variáveis de Ambiente:
* O Vura utiliza a FreeAstroAPI para realizar os cálculos necessários à geração dos mapas astrais. Para utilizar essa funcionalidade, é necessário criar uma conta na plataforma e gerar uma chave de acesso.
Após obter sua chave, adicione-a às configurações do projeto juntamente com as demais credenciais necessárias.
  * O arquivo .env deve ser criado dentro da pasta:
    ```bash
    /banco/.env
  Exemplo:
    ```bash
    BREVO_API_KEY=suachavedeacesso
    EMAIL_USER=seu_usuario_email
    EMAIL_PASS=sua_senha_email_app
    FREEASTRO_API_KEY=senha_de_acesso_apifreeastroapi

5. Obtenha uma chave da FreeAstroAPI
   * crie uma conta na plataforma e gere sua chave de acesso para hablitar a geração dos mapas astrais.
6. Inicie a Aplicação:
   ```bash
   node server.js
    ou
   npx nodemon server.js
7. Acesse o Projeto
   * Com o servidor em execução, acesse a URL configurada localmente
  
---
## 🚨 Observações:
* O funcionamento completo depende da configuração correta da FreeAstroAPI.
* O banco de dados MySQL deve estar ativo antes da inicialização do servidor.
* O sistema de recuperação de senhas requer credenciais válidas para envio de e-mails.
#### No projeto foram usadas as seguintes plataformas para sua versão online:
  * **Github pages** - responsável pelo front-end.
  * **Railway** - responsável pelo banco de Dados.
  * **Render** - responsavél pelo back-end.

--- 
## Desafios e Aprendizados:

> Durante o desenvolvimento do VURA, enfrentamos desafios técnicos que expandiram nossa base de conhecimento como desenvolvedores:


* **Orquestração de múltiplas APIs:** Integração de várias APIs diferentes — astrológica, de geolocalização e back-end — exigiu coordenar autenticações, tratar erros de cada serviço de forma independente e garantir que os dados fluíssem corretamente entre elas para gerar o mapa astral com precisão.
* **Precisão nos cálculos:** Gerar um mapa astral correto depende de data, horário e local de nascimento. A API de geolocalização foi essencial para converter cidades em coordenadas, mas lidar com fusos horários e variações regionais foi um desafio que nos ensinou a importância da precisão no tratamento de dados sensíveis.
* **Segurança da aplicação:** Implementar criptografia de senhas, validação no front-end, e-mail único por usuário e confirmação de senha para exclusão trouxe aprendizados importantes sobre segurança em aplicações web reais.
* **Modelagem do histórico:** Estruturar o banco de dados para armazenar e recuperar mapas astrais de forma eficiente — sem reinserção de dados — foi um exercício valioso de modelagem relacional e experiência do usuário.
* **Envio de e-mail para verificação e redefinição de senha**:Implementar o fluxo de redefinição de senha exigiu encontrar uma plataforma de envio de e-mail que mantivesse o servidor online de forma estável. Testamos diversas opções até encontrar uma solução confiável — esse processo de tentativa e erro foi um aprendizado valioso sobre infraestrutura de e-mail em aplicações web. 

## 🧑‍🚀 Autores
> Esse projeto foi desenvolvido por:

**[Maria Eduarda Moraes Vieira](https://github.com/DudaVieira7)**

**[Daniel Lincon Bender dos Santos Reis](https://github.com/DanielBenderSantos)**
