import { notFound } from "next/navigation";
import { getInvoiceById } from "@/lib/supabase/billing-queries";
import { getCurrentProfile } from "@/lib/supabase/queries";
import InvoicePrintButton from "@/components/billing/InvoicePrintButton";
import { Film } from "lucide-react";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, profile] = await Promise.all([getInvoiceById(id), getCurrentProfile()]);
  if (!invoice) notFound();

  return (
    <div className="min-h-screen bg-white text-black px-6 py-12 print:p-0">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <InvoicePrintButton />
        </div>

        <div className="flex items-start justify-between border-b border-gray-200 pb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-red-600">
              <Film size={18} className="text-white" />
            </div>
            <span className="text-xl font-semibold">
              Prime <span className="text-red-600">Ciné</span>
            </span>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p className="font-semibold text-black">Facture {invoice.invoice_number}</p>
            <p>{new Date(invoice.issued_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-6 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Facturé à</p>
            <p className="font-medium">{profile?.full_name ?? profile?.email}</p>
            <p className="text-gray-500">{profile?.email}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 mb-1">Émis par</p>
            <p className="font-medium">Prime Ciné SARL</p>
            <p className="text-gray-500">Douala, Cameroun</p>
          </div>
        </div>

        <table className="w-full text-sm border-t border-gray-200">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-3">Description</th>
              <th className="py-3 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-100">
              <td className="py-4">{invoice.plan_name}</td>
              <td className="py-4 text-right">{invoice.amount_xaf.toLocaleString("fr-FR")} FCFA</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-800 font-semibold">
              <td className="py-4">Total</td>
              <td className="py-4 text-right">{invoice.amount_xaf.toLocaleString("fr-FR")} FCFA</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 flex items-center gap-2">
          <span
            className={`rounded px-2.5 py-1 text-xs font-medium ${
              invoice.status === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}
          >
            {invoice.status === "paid" ? "Payée" : invoice.status === "void" ? "Annulée" : "Non payée"}
          </span>
        </div>

        <p className="mt-12 text-center text-xs text-gray-400">
          Prime Ciné SARL — Douala, Cameroun. Merci de votre confiance.
        </p>
      </div>
    </div>
  );
}
