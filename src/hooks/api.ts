import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Objectifs } from "@shared/domain";
import { api } from "@/lib/api-client";
import { setStoredPassword } from "@/lib/settings-auth";

export function useObjectifs() {
  return useQuery({ queryKey: ["objectifs"], queryFn: api.getObjectifs });
}

export function useSetObjectifs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (objectifs: Objectifs) => api.setObjectifs(objectifs),
    onSuccess: (data) => queryClient.setQueryData(["objectifs"], data),
  });
}

export function usePrompt() {
  return useQuery({ queryKey: ["prompt"], queryFn: api.getPrompt });
}

export function useSetPrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prompt: string) => api.setPrompt(prompt),
    onSuccess: (data) => queryClient.setQueryData(["prompt"], data),
  });
}

export function useEntrainement() {
  return useQuery({ queryKey: ["entrainement"], queryFn: api.getEntrainement });
}

export function useGenerateEntrainement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.generateEntrainement,
    onSuccess: (data) => queryClient.setQueryData(["entrainement"], data),
  });
}

export function useSwimResults() {
  return useQuery({
    queryKey: ["swim-results"],
    queryFn: api.getSwimResults,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVerifyPassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const ok = await api.verifyPassword(password);
      if (ok) setStoredPassword(password);
      return ok;
    },
  });
}
