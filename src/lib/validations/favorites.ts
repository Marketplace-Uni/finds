import * as z from "zod";

export const favoriteActionSchema = z.object({
  listingId: z.string().uuid(),
  favorite: z.enum(["true", "false"]),
  returnTo: z.string().max(500),
});

export type FavoriteActionInput = z.infer<typeof favoriteActionSchema>;
