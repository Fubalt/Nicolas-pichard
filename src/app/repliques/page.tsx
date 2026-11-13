import { connection } from 'next/server';
import { getRandomQuotes } from '@/data/quotes';
import { RepliquesGame } from '@/features/quotes/RepliquesGame';

export default async function RepliquesPage() {
  // Tirage aléatoire à la requête, côté serveur : pas d'écart d'hydratation.
  await connection();
  return <RepliquesGame initialQuestions={getRandomQuotes(10)} />;
}
