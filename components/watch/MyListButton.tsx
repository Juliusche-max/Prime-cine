"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2 } from "lucide-react";
import { toggleMyListAction } from "@/lib/supabase/content-actions";
import Button from "@/components/ui/Button";

export default function MyListButton({ titleId, initiallyInList }: { titleId: string; initiallyInList: boolean }) {
  const [inList, setInList] = useState(initiallyInList);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="lg"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleMyListAction(titleId);
          if (result.error) router.push("/login");
          else setInList(result.added);
        })
      }
    >
      {isPending ? <Loader2 size={20} className="animate-spin" /> : inList ? <Check size={20} /> : <Plus size={20} />}
      {inList ? "Dans ma liste" : "Ma Liste"}
    </Button>
  );
}
