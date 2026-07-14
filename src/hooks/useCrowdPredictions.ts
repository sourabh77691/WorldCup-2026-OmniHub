import useSWR from "swr";

export type PredictionData = {
  incidentCount: number;
  hotspots: { location: string; estimatedWaitTime: string; severity: "Medium" | "High" }[];
  recommendations: string[];
};

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
});

export function useCrowdPredictions() {
  const { data, error, isLoading, mutate } = useSWR<PredictionData>(
    "/api/crowd-predictions",
    fetcher,
    {
      refreshInterval: 120000, // 2 minutes
      revalidateOnFocus: true,
    }
  );

  return {
    predictions: data,
    isLoading,
    isError: error,
    mutate,
  };
}
