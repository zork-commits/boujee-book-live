import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, login, logout, signup } from "@/fn/auth";
import { listPros, getPro, getCategoryCounts } from "@/fn/pros";
import { createBooking, myBookings, cancelBooking, submitReview, proBookings, setBookingStatus } from "@/fn/bookings";
import { myConversations, getMessages, sendMessage } from "@/fn/messages";
import { myFavorites, toggleFavorite } from "@/fn/favorites";
import { proDashboard } from "@/fn/pro-dashboard";

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: () => getMe(), staleTime: 60_000 });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => login({ data }),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) => signup({ data }),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => logout(), onSuccess: () => qc.clear() });
}

export function usePros(filters?: { q?: string; category?: string; sort?: "rating" | "price" | "distance" }) {
  return useQuery({
    queryKey: ["pros", filters ?? {}],
    queryFn: () => listPros({ data: filters }),
    staleTime: 30_000,
  });
}

export function usePro(id: string) {
  return useQuery({ queryKey: ["pro", id], queryFn: () => getPro({ data: { id } }) });
}

export function useCategoryCounts() {
  return useQuery({ queryKey: ["categoryCounts"], queryFn: () => getCategoryCounts(), staleTime: 300_000 });
}

export function useMyBookings() {
  return useQuery({ queryKey: ["bookings"], queryFn: () => myBookings() });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createBooking>[0]["data"]) => createBooking({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelBooking({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookingId: string; rating: number; comment?: string }) => submitReview({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["pros"] });
    },
  });
}

export function useConversations() {
  return useQuery({ queryKey: ["conversations"], queryFn: () => myConversations() });
}

export function useThread(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages({ data: { conversationId: conversationId! } }),
    enabled: conversationId != null,
    refetchInterval: 5_000, // light polling until websockets land
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { body: string; conversationId?: string; proId?: string }) => sendMessage({ data }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      if (res.ok) qc.invalidateQueries({ queryKey: ["messages", res.message.conversationId] });
    },
  });
}

export function useFavorites() {
  return useQuery({ queryKey: ["favorites"], queryFn: () => myFavorites() });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (proId: string) => toggleFavorite({ data: { proId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useProDashboard() {
  return useQuery({ queryKey: ["proDashboard"], queryFn: () => proDashboard() });
}

export function useProBookings(range?: { from: string; to: string }) {
  return useQuery({
    queryKey: ["proBookings", range ?? {}],
    queryFn: () => proBookings({ data: range }),
  });
}

export function useSetBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; status: "confirmed" | "completed" | "cancelled" }) => setBookingStatus({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proDashboard"] });
      qc.invalidateQueries({ queryKey: ["proBookings"] });
    },
  });
}

/** "Today · 4:30 PM", "Fri · 11:00 AM", or "Jun 12" for older dates. */
export function fmtWhen(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(d, now)) return `Today · ${time}`;
  if (sameDay(d, tomorrow)) return `Tomorrow · ${time}`;
  const diffDays = Math.abs(d.getTime() - now.getTime()) / 86400_000;
  if (d > now && diffDays < 7) return `${d.toLocaleDateString("en-US", { weekday: "short" })} · ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function initials(name: string): string {
  return name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}
