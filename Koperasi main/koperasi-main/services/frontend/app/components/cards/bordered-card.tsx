type BorderedCardProps = {
  title: string;
  value: string | number;
};

export default function BorderedCard({ title, value }: BorderedCardProps) {
  return (
    <div className="rounded-md border border-gray-400 border-dashed p-3">
      <h3 className="font-bold text-gray-500">{title}</h3>
      <h4 className="font-medium text-lg">{value}</h4>
    </div>
  );
}
