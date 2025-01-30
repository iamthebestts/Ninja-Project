import { createInventoryView } from "./inventory.js";
import { createCardsView } from "./view.js";

export const cardsMenus = {
    view: createCardsView,
    inventory: createInventoryView
};