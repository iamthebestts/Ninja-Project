import { z } from "zod";

export const cardValidationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  rarity: z.enum(["N", "R", "SR", "SSR", "UR"], {
    errorMap: () => ({ message: "Raridade inválida" }),
  }),
  image: z.string().url("URL da imagem inválida"),
  description: z.string().optional(),
  village: z.enum(["Konoha", "Suna", "Kiri", "Iwa", "Kumo"], {
    errorMap: () => ({ message: "Vila inválida" }),
  }),
  rank: z.enum(["Genin", "Chunin", "Jounin", "ANBU", "Kage"], {
    errorMap: () => ({ message: "Rank inválido" }),
  }),
  clan: z.string().min(1, "Clã é obrigatório"),
  strength: z.number().min(1).max(100),
  speed: z.number().min(1).max(100),
  intelligence: z.number().min(1).max(100),
  chakraControl: z.number().min(1).max(100),
  ninjutsu: z.number().min(1).max(100),
  genjutsu: z.number().min(1).max(100),
  taijutsu: z.number().min(1).max(100),
  price: z.number().min(1),
});

export const cardEditSchema = cardValidationSchema.partial().omit({ 
  name: true,
  rarity: true,
  image: true,
  village: true,
  rank: true,
  clan: true,
});

export type CardCreateInput = z.infer<typeof cardValidationSchema>;
export type CardEditInput = z.infer<typeof cardEditSchema>;
