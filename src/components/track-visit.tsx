"use client";

import { useEffect } from "react";
import { pushRecent, cacheBook, markReadToday, type BookStub } from "@/lib/local-store";

/** Records a book visit (recents + cache) and, in the reader, today's read day. */
export function TrackVisit({ stub, markRead = false }: { stub: BookStub; markRead?: boolean }) {
  useEffect(() => {
    cacheBook(stub);
    pushRecent(stub.id);
    if (markRead) markReadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stub.id, stub.title, stub.author, stub.coverUrl, markRead]);
  return null;
}
