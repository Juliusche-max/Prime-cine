"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Smartphone, CreditCard, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  initiateMomoCheckoutAction,
  initiateOrangeCheckoutAction,
  initiateCardCheckoutAction,
  pollTransactionStatusAction,
  startFreeTrialAction,
} from "@/lib/supabase/payment-actions";
import { cn } from "@/lib/utils";

type Method = "mtn_momo" | "orange_money" | "cinetpay_card";
type Step = "choose" | "phone" | "awaiting" | "success" | "error";

export default function CheckoutModal({
  planId,
  planName,
  priceXaf,
  hasTrial,
  onClose,
}: {
  planId: string;
  planName: string;
  priceXaf: number;
  hasTrial: boolean;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<Method | null>(null);
  const [step, setStep] = useState<Step>("choose");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function startPolling(txId: string) {
    setStep("awaiting");
    pollRef.current = setInterval(async () => {
      const result = await pollTransactionStatusAction(txId);
      if (result.status === "successful") {
        if (pollRef.current) clearInterval(pollRef.current);
        setStep("success");
        router.refresh();
      } else if (result.status === "failed") {
        if (pollRef.current) clearInterval(pollRef.current);
        setError("Le paiement a été refusé ou annulé.");
        setStep("error");
      }
    }, 4000);
  }

  async function handleTrial() {
    setIsPending(true);
    setError(null);
    const result = await startFreeTrialAction(planId);
    setIsPending(false);
    if (result.error) {
      setError(result.error);
      setStep("error");
    } else {
      setStep("success");
      router.refresh();
    }
  }

  async function handleMomoSubmit() {
    if (phone.replace(/\D/g, "").length < 9) {
      setError("Merci d'entrer un numéro valide (9 chiffres).");
      return;
    }
    setIsPending(true);
    setError(null);
    const result = await initiateMomoCheckoutAction(planId, phone);
    setIsPending(false);
    if (result.error) {
      setError(result.error);
      setStep("error");
    } else if (result.transactionId) {
      setTransactionId(result.transactionId);
      startPolling(result.transactionId);
    }
  }

  async function handleOrangeSubmit() {
    setIsPending(true);
    setError(null);
    const result = await initiateOrangeCheckoutAction(planId);
    setIsPending(false);
    if (result.error) {
      setError(result.error);
      setStep("error");
    } else if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  }

  async function handleCardSubmit() {
    setIsPending(true);
    setError(null);
    const result = await initiateCardCheckoutAction(planId);
    setIsPending(false);
    if (result.error) {
      setError(result.error);
      setStep("error");
    } else if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg border border-white/10 bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-bone">{planName}</h2>
            <p className="text-sm text-mist">{priceXaf.toLocaleString("fr-FR")} FCFA / mois</p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="text-mist hover:text-bone">
            <X size={20} />
          </button>
        </div>

        {step === "choose" && (
          <div className="space-y-3">
            {hasTrial && (
              <button
                onClick={handleTrial}
                disabled={isPending}
                className="w-full rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-left text-sm font-semibold text-gold hover:bg-gold/15 disabled:opacity-60"
              >
                {isPending ? "Démarrage..." : "🎉 Démarrer mon essai gratuit"}
              </button>
            )}
            <button
              onClick={() => {
                setMethod("mtn_momo");
                setStep("phone");
              }}
              className="flex w-full items-center gap-3 rounded-md border border-white/15 bg-elevated px-4 py-3 text-left hover:border-prime"
            >
              <Smartphone size={20} className="text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-bone">MTN Mobile Money</p>
                <p className="text-xs text-mist">Paiement par USSD sur votre téléphone</p>
              </div>
            </button>
            <button
              onClick={handleOrangeSubmit}
              disabled={isPending}
              className="flex w-full items-center gap-3 rounded-md border border-white/15 bg-elevated px-4 py-3 text-left hover:border-prime disabled:opacity-60"
            >
              <Smartphone size={20} className="text-orange-400" />
              <div>
                <p className="text-sm font-medium text-bone">Orange Money</p>
                <p className="text-xs text-mist">Vous serez redirigé vers Orange</p>
              </div>
            </button>
            <button
              onClick={handleCardSubmit}
              disabled={isPending}
              className="flex w-full items-center gap-3 rounded-md border border-white/15 bg-elevated px-4 py-3 text-left hover:border-prime disabled:opacity-60"
            >
              <CreditCard size={20} className="text-blue-400" />
              <div>
                <p className="text-sm font-medium text-bone">Carte bancaire</p>
                <p className="text-xs text-mist">Visa, Mastercard via page sécurisée</p>
              </div>
            </button>
            {error && <p role="alert" className="text-sm text-prime-light">{error}</p>}
          </div>
        )}

        {step === "phone" && method === "mtn_momo" && (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-mist">Numéro MTN Mobile Money</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="677 123 456"
                className="w-full rounded-md border border-white/15 bg-elevated px-3 py-2.5 text-sm text-bone placeholder:text-mist/60 focus:border-prime focus:outline-none"
              />
            </label>
            {error && <p role="alert" className="text-sm text-prime-light">{error}</p>}
            <button
              onClick={handleMomoSubmit}
              disabled={isPending}
              className="w-full rounded-md bg-prime px-4 py-2.5 text-sm font-semibold text-white hover:bg-prime-light disabled:opacity-60"
            >
              {isPending ? "Envoi..." : "Recevoir la demande de paiement"}
            </button>
            <button onClick={() => setStep("choose")} className="w-full text-center text-xs text-mist hover:text-bone">
              Retour
            </button>
          </div>
        )}

        {step === "awaiting" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 size={32} className="animate-spin text-prime" />
            <p className="text-sm text-bone">Vérifiez votre téléphone</p>
            <p className="text-xs text-mist max-w-xs">
              Un message MTN Mobile Money vous demande de confirmer le paiement. Cette fenêtre se mettra à jour automatiquement.
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={36} className="text-green-400" />
            <p className="text-sm font-semibold text-bone">Abonnement activé !</p>
            <button onClick={onClose} className="mt-2 rounded-md bg-prime px-4 py-2 text-sm font-semibold text-white hover:bg-prime-light">
              Continuer
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <XCircle size={32} className="text-prime" />
            <p className="text-sm text-bone">{error ?? "Une erreur est survenue."}</p>
            <button
              onClick={() => {
                setStep("choose");
                setError(null);
              }}
              className="mt-2 rounded-md border border-white/15 px-4 py-2 text-sm text-mist hover:text-bone"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
