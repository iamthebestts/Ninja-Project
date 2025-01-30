## Checklist de Desenvolvimento do Bot Ninja Project RP

**Fase 1: Preparação (Fundamentos)**

- [ ] **Definir Probabilidades de Raridade:**  Estabelecer a porcentagem de chance para cada raridade de carta (N, R, SR, SSR, UR).  *Crucial para o balanceamento do jogo.*  **Requisito: Input do cliente.**
- [ ] **Receber Imagens das Cartas:** Obter as imagens de cada carta do cliente, organizadas por nome e raridade. *Essencial para a exibição do inventário.* **Requisito: Imagens do cliente.**
- [ ] **Receber Perguntas do Quiz:**  Obter a lista de perguntas e respostas do quiz em formato organizado (ex: planilha com Pergunta, Alternativa A, Alternativa B, Alternativa C, Alternativa D, Resposta Correta). *Fundamental para o funcionamento do quiz.* **Requisito: Perguntas do cliente.**
- [ ] **Escolher Método de Armazenamento de Dados:** Decidir como armazenar as informações do bot (ex: arquivo JSON, banco de dados como MongoDB). *Impacta na escalabilidade e performance.*
- [ ] **Configurar Ambiente de Desenvolvimento:** Instalar as bibliotecas necessárias (Discord.py, etc.) e configurar o ambiente para desenvolvimento do bot.

**Fase 2: Cartas Colecionáveis (Core)**

- [ ] **Criar Modelo de Dados para Cartas:** Definir a estrutura de dados para representar uma carta (nome, raridade, imagem, etc.).
- [ ] **Implementar Lógica de Geração de Pacotes:** Criar a função que gera 3 cartas aleatórias considerando as probabilidades de raridade.
- [ ] **Implementar Comando `np.comprar`:**  Permitir que usuários comprem pacotes usando Ryos.  *Funcionalidade principal.*
    - [ ] **Subtarefa:** Deduzir o custo do pacote (40 Ryos) do usuário.
    - [ ] **Subtarefa:** Adicionar as novas cartas ao inventário do usuário.
- [ ] **Criar Modelo de Dados para Usuários:** Definir como armazenar as informações do usuário (Ryos, inventário, etc.).
- [ ] **Implementar Comando `np.invent`:** Exibir o inventário do usuário com suas cartas em formato de grid. *Funcionalidade principal.*
    - [ ] **Subtarefa:** Implementar paginação para inventários grandes.

**Fase 3: Quiz (Funcionalidade Adicional)**

- [ ] **Implementar Comando `np.quiz`:** Iniciar o quiz com perguntas aleatórias. *Funcionalidade secundária.*
    - [ ] **Subtarefa:** Apresentar as perguntas e alternativas de forma clara.
    - [ ] **Subtarefa:** Aguardar a resposta do usuário.
    - [ ] **Subtarefa:** Verificar se a resposta está correta.
- [ ] **Implementar Sistema de Pontuação:** Adicionar 20 Ryos ao usuário por resposta correta.

**Fase 4: Ranking e Interface (Polimento)**

- [ ] **Implementar Comando `np.rank`:** Exibir o ranking de usuários com mais cartas. *Funcionalidade secundária.*
- [ ] **Refinar a Interface do Bot:** Utilizar Embeds do Discord para melhorar a apresentação visual das mensagens do bot.  *Experiência do usuário.*
- [ ] **Criar Comando de Ajuda:**  `np.ajuda` para listar os comandos disponíveis. *Experiência do usuário.*


**Fase 5:  Admin e Finalização (Testes e Deploy)**

- [ ] **Implementar Comando de Admin `np.addcarta`:** Permitir adicionar novas cartas ao sistema. *Manutenção.*
- [ ] **Testes:** Testar exaustivamente todas as funcionalidades em um servidor de teste do Discord. *Garantia de qualidade.*
- [ ] **Deploy:** Publicar o bot em um servidor para que fique online e acessível aos usuários.


**Observação:** Esta lista está organizada por ordem de prioridade e dependência.  Complete as tarefas de cima para baixo para um desenvolvimento mais eficiente.  Marque cada item como concluído à medida que progride.
