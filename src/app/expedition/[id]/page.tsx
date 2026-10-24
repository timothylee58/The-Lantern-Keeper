import GameApp from '@/components/GameApp';
import { NEIGHBORS } from '@/data';
export function generateStaticParams() {
  return NEIGHBORS.map((n) => ({ id: n.id }));
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GameApp key={id} view="expedition" expeditionId={id} />;
}
