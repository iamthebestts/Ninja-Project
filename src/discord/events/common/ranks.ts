import { createEvent } from "#base";
import { menus } from "#menus";

// Evento para atualização periódica dos rankings
createEvent({
  name: "Rank updater",
  event: "ready",
  async run(client) {
    // Atualiza imediatamente ao iniciar
    await menus.config.updateRankings(client);

    // Agenda atualizações a cada 5 minutos
    setInterval(async () => {
      await menus.config.updateRankings(client);
    }, 5 * 60 * 1000);
  },
});