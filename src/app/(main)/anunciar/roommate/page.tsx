import { requireCompleteProfile } from "@/src/lib/auth";
import { fetchCampusOptions } from "@/src/lib/listings";
import { RoommateForm } from "./roommate-form";

export default async function AnunciarRoommatePage() {
  await requireCompleteProfile("/anunciar/roommate");
  const campuses = await fetchCampusOptions();

  return <RoommateForm campuses={campuses} />;
}
