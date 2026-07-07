import { useState } from 'react';

import type { ReactNode } from 'react';

type CollapsibleFormProps = {
  title: string;
  children: ReactNode;
};

export function CollapsibleForm({ title, children }: CollapsibleFormProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="collapsible-form">
      <button
        type="button"
        className="collapsible-form-button"
        onClick={() => setAbierto(!abierto)}
      >
        {abierto ? '−' : '+'} {title}
      </button>

      {abierto && <div className="collapsible-form-content">{children}</div>}
    </div>
  );
}