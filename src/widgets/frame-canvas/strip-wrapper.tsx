interface StripWrapperProps {
  width: number
  height: number
  children: React.ReactNode
}

export const StripWrapper = ({ width, height, children }: StripWrapperProps) => (
  <div style={{ width, height }} className="relative shrink-0">
    {children}
  </div>
)
