'use client';

import { CreateAudienceProvider } from '../../../../contexts/CreateAudienceContext';

export default function CreateAudienceLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <CreateAudienceProvider>{children}</CreateAudienceProvider>;
}
