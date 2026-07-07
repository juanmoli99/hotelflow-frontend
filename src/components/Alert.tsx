type AlertProps = {
  type: 'success' | 'error' | 'info';
  children: React.ReactNode;
};

export function Alert({ type, children }: AlertProps) {
  return <p className={`alert alert-${type}`}>{children}</p>;
}