import CustomerView from '@/components/customer-view';
import { Suspense } from 'react';
import Image from 'next/image';

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const tableId = typeof searchParams.table === 'string' ? searchParams.table : null;
  const isTakeAway = searchParams.mode === 'takeaway' || (!tableId);

  return (
    <Suspense 
      fallback={
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#d4af37]">
          <Image src="https://firebasestorage.googleapis.com/v0/b/grillicious-backend.firebasestorage.app/o/Grillicious-logo.webp?alt=media&token=d67ff384-ece6-4583-8d05-1327121a8b15" alt="Grillicious Logo" width={300} height={75} className="animate-pulse" />
        </div>
      }
    >
      {/* If no tableId is present, the CustomerView will handle the "Welcome" & "Takeaway" logic */}
      <CustomerView tableId={tableId} mode={isTakeAway ? 'takeaway' : 'dine-in'} />
    </Suspense>
  );
}
