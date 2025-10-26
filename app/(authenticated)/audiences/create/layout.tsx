'use client';

import { CreateAudienceProvider } from '../../../../contexts/CreateAudienceContext';

export default function CreateAudienceLayout({ children }: { children: React.ReactNode }) {
  return <CreateAudienceProvider>{children}</CreateAudienceProvider>;
}
