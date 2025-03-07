import { useRoute } from "wouter";

export function useParams(pattern) {
  const [match, params] = useRoute(pattern);
  return params;
}
