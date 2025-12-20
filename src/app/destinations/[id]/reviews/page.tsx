import DestinationReviews from "@/screens/Destinations/DestinationReviews";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <DestinationReviews destinationId={id} />;
}

