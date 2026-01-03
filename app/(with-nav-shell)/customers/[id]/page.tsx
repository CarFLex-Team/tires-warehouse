export default async function customer({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <div>Customer ID: {id}</div>;
}
