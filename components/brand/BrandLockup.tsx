interface BrandLockupProps {
  markClassName?: string;
}

export default function BrandLockup({ markClassName = "size-6" }: BrandLockupProps) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`relative block shrink-0 rotate-45 border-2 border-primary transition-transform duration-200 group-hover:rotate-[135deg] motion-reduce:transition-none ${markClassName}`}
      >
        <span className="absolute left-1/2 top-1/2 size-[34%] -translate-x-1/2 -translate-y-1/2 bg-primary" />
      </span>
      <span>
        <span>clevr</span>
        <span className="text-primary">.tools</span>
      </span>
    </>
  );
}
