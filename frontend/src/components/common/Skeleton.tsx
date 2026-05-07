export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#363636] rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

export function NoteListSkeleton() {
  return (
    <div className="flex h-full">
      <aside className="w-64 bg-[#242424] border-r border-[#3a3a3a] p-4">
        <Skeleton className="h-8 w-full mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </aside>
      
      <main className="flex-1 p-4">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-[#3a3a3a] p-4">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="rounded-lg border border-[#3a3a3a] p-4">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#3a3a3a] p-4">
        <Skeleton className="h-8 w-32" />
      </div>
      
      <div className="p-4 border-b border-[#3a3a3a]">
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="flex gap-2 p-3 border-b border-[#3a3a3a]">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
      
      <div className="flex-1 p-4">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}

export function GenericSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}